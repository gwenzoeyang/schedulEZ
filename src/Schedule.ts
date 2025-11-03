// src/Schedule.ts

/** ================= Domain types (kept from your file) ===================== */
export interface Requirement {
  code: string; // e.g., "QR", "HSCI", "LAB", "WRI"
}

export interface TimeSlot {
  // Example: { day: "Mon", start: "10:00", end: "11:20"}
  day: string;
  start: string; // "HH:MM" 24h
  end: string; // "HH:MM" 24h
}

export interface Course {
  courseID: string; // authoritative ID, e.g., "CS-220-01-FA25"
  title: string; // "Blue on the Move"
  instructor: string; // "Ada Lovelace"
  meetingTimes: TimeSlot[];
  location?: string; // "SCI 101" or "Zoom"
  requirements: Requirement[][];
  campus?: string; // "Wellesley", "MIT", etc.
}

export interface User {
  id: string;
  name?: string;
}

/** ============== Catalog & AI interfaces (make async for Mongo) ============ */
export interface CourseCatalogLike {
  getById(courseID: string): Promise<Course>; // now async
  search(query?: string, filters?: unknown): Promise<Set<Course>>; // now async
}

/** Simple AI chooser that picks ONE course from filtered candidates. */
export interface AIRecommenderLike {
  chooseCourse(
    owner: User,
    candidates: Course[],
    prefs: AIPreferences,
  ): Promise<Course | null> | Course | null;
}

/** ======================= AI prefs (unchanged) ============================= */
export interface AIPreferences {
  major: string;
  interests: Set<string>;
  availability: Set<string>;
}

/** ============== Gemini (unchanged except types are explicit) ============== */
// (same lightweight integration you already had)

type GenAIModel = {
  generateContent(
    prompt: string,
    ...rest: unknown[]
  ): Promise<{ response: { text(): string } }>;
};
type GenAIClient = {
  getGenerativeModel(args: {
    model: string;
    generationConfig?: unknown;
  }): GenAIModel;
};

let _GeminiCtor: (new (apiKey: string) => GenAIClient) | null = null;
let _geminiInitTried = false;

async function loadGeminiCtor(): Promise<void> {
  if (_geminiInitTried) return;
  _geminiInitTried = true;
  try {
    const mod = await import("npm:@google/generative-ai");
    _GeminiCtor = (mod as any).GoogleGenerativeAI ?? null;
  } catch {
    _GeminiCtor = null;
  }
}

async function loadEnv(name: string): Promise<string> {
  try {
    // Deno first
    // deno-lint-ignore no-explicit-any
    const d = (globalThis as any).Deno?.env?.get?.(name);
    if (typeof d === "string" && d.length > 0) return d;
  } catch {}
  try {
    // Node fallback
    // deno-lint-ignore no-explicit-any
    const n = (globalThis as any).process?.env?.[name];
    if (typeof n === "string" && n.length > 0) return n;
  } catch {}
  return "";
}

// Optional: load generationConfig from JSON; if not found, ok.
async function loadGeminiGenerationConfig(): Promise<unknown> {
  try {
    // Edit path if you move this file
    // @ts-ignore JSON assertion
    const cfg = await import(
      "../geminiConfig.json",
      { with: { type: "json" } } as any
    );
    return (cfg as any)?.default ?? (cfg as any);
  } catch {
    return undefined;
  }
}

async function chooseWithGemini(
  owner: User,
  candidates: Course[],
  prefs: AIPreferences,
): Promise<Course | null> {
  if (candidates.length === 0) return null;
  await loadGeminiCtor();
  const apiKey = await loadEnv("GEMINI_API_KEY");
  if (!_GeminiCtor || !apiKey) return null;

  const modelName = (await loadEnv("GEMINI_MODEL")) || "gemini-2.5-flash";
  const generationConfig = await loadGeminiGenerationConfig();
  const genAI = new _GeminiCtor(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig,
  });

  // Keep payload slim
  const slim = candidates.map((c) => ({
    courseID: c.courseID,
    title: c.title,
    instructor: c.instructor,
  }));

  const system = `Return ONLY a JSON object exactly like: {"courseID":""}.\n` +
    `No commentary.\nIf nothing fits, return {"courseID":""}.`;

  const prompt = `${system}\n` +
    `USER=${
      JSON.stringify({
        id: owner.id,
        major: prefs.major,
        interests: [...prefs.interests],
      })
    }\n` +
    `CANDIDATES=${JSON.stringify(slim)}`;

  const res = await model.generateContent(prompt);
  const text = res.response.text().trim().replace(/```json|```/g, "").trim();

  let picked = "";
  try {
    const obj = JSON.parse(text);
    picked = typeof obj?.courseID === "string" ? obj.courseID : "";
  } catch {
    const m = text.match(/"courseID"\s*:\s*"([^"]+)"/);
    picked = m?.[1] ?? "";
  }
  if (!picked) return null;
  return candidates.find((c) => c.courseID === picked) ?? null;
}

/** ===================== Mongo-backed catalog =============================== */
/**
 * Mongo collection shape. If your actual field names differ, map them below.
 */
type CourseDoc = {
  courseID: string;
  title: string;
  instructor: string;
  meetingTimes: { day: string; start: string; end: string }[];
  location?: string;
  requirements?: { code: string }[][]; // allow missing; we’ll default later
  campus?: string;
};

import { Collection, Db, MongoClient } from "npm:mongodb";

class MongoCourseCatalog implements CourseCatalogLike {
  private col: Collection<CourseDoc>;

  constructor(db: Db, collectionName = "courses") {
    this.col = db.collection<CourseDoc>(collectionName);
  }

  /** Get a single course by ID (throws if not found) */
  async getById(courseID: string): Promise<Course> {
    const doc = await this.col.findOne({ courseID });
    if (!doc) {
      throw new Error(`CourseCatalog.getById: "${courseID}" not found`);
    }
    return this.docToCourse(doc);
  }

  /**
   * Broad search:
   * - if no query/filters: return ALL courses (be careful with very large catalogs)
   * - if query provided: fuzzy-ish regex on title/instructor/courseID
   * - extend filters as needed (department, days, etc.)
   */
  async search(query?: string, _filters?: unknown): Promise<Set<Course>> {
    let cursor;
    if (query && query.trim()) {
      const q = query.trim();
      cursor = this.col.find({
        $or: [
          { title: { $regex: q, $options: "i" } },
          { instructor: { $regex: q, $options: "i" } },
          { courseID: { $regex: q, $options: "i" } },
        ],
      });
    } else {
      cursor = this.col.find({});
    }
    const out: Course[] = [];
    for await (const doc of cursor) {
      out.push(this.docToCourse(doc));
    }
    return new Set(out);
  }

  /** Map Mongo doc -> your Course interface */
  private docToCourse(doc: CourseDoc): Course {
    return {
      courseID: doc.courseID,
      title: doc.title,
      instructor: doc.instructor,
      meetingTimes: (doc.meetingTimes ?? []).map((mt) => ({
        day: mt.day,
        start: mt.start,
        end: mt.end,
      })),
      location: doc.location,
      requirements: (doc.requirements as Requirement[][] | undefined) ?? [],
      campus: doc.campus,
    };
  }
}

/** Factory to build a Schedule wired to Mongo */
export async function createScheduleWithMongo(
  ai: AIRecommenderLike = { chooseCourse: () => null },
  opts?: {
    mongoUrl?: string;
    dbName?: string;
    collection?: string;
  },
): Promise<Schedule> {
  const mongoUrl = opts?.mongoUrl || (await loadEnv("MONGODB_URL"));
  const dbName = opts?.dbName || (await loadEnv("DB_NAME")) || "schedulEZ";
  const collection = opts?.collection ||
    (await loadEnv("COURSES_COLLECTION")) || "sample10";

  if (!mongoUrl) {
    throw new Error(
      `createScheduleWithMongo: MONGODB_URL is required (env or opts.mongoUrl)`,
    );
  }
  const client = new MongoClient(mongoUrl);
  await client.connect();
  const db = client.db(dbName);

  const catalog = new MongoCourseCatalog(db, collection);
  return new Schedule(catalog, ai);
}

/** ======================= Schedule concept (async catalog) ================== */
export class Schedule {
  private schedules: Map<
    string,
    {
      courses: Map<string, Course>;
      aiPreferences?: AIPreferences;
      aiSuggestion?: Course;
    }
  > = new Map();

  constructor(
    private readonly catalog: CourseCatalogLike,
    private readonly ai: AIRecommenderLike,
  ) {}

  // ------------------------------ core actions -------------------------------

  /** New helper: add by ID, loads from Mongo-backed catalog */
  async addCourseById(owner: User, courseID: string): Promise<void> {
    const course = await this.catalog.getById(courseID); // may be Mongo-backed
    this.addCourse(owner, course); // <- sync
  }

  addCourse(owner: User, course: Course): void {
    const s = this.ensureState(owner);
    if (s.courses.has(course.courseID)) {
      throw new Error(
        `Schedule.addCourse: course "${course.courseID}" is already in the schedule`,
      );
    }
    s.courses.set(course.courseID, course);
  }

  removeCourse(owner: User, courseID: string): void {
    const s = this.ensureState(owner);
    if (!s.courses.has(courseID)) {
      throw new Error(
        `Schedule.removeCourse: course "${courseID}" not found in schedule`,
      );
    }
    s.courses.delete(courseID);
  }

  listSchedule(owner: User): Set<Course> {
    const s = this.ensureState(owner);
    if (s.courses.size === 0) {
      throw new Error(`Schedule.listSchedule: schedule is empty`);
    }
    return new Set(s.courses.values());
  }

  clear(owner: User): void {
    const s = this.ensureState(owner);
    s.courses.clear();
  }

  // ------------------------------ AI actions ---------------------------------

  setAIPreferences(
    owner: User,
    major: string,
    interests: Set<string>,
    availability: Set<string>,
  ): void {
    const s = this.ensureState(owner);
    s.aiPreferences = { major, interests, availability };
    s.aiSuggestion = undefined;
  }

  async suggestCourseAI(owner: User): Promise<Course> {
    const s = this.ensureState(owner);
    if (!s.aiPreferences) {
      throw new Error(
        `Schedule.suggestCourseAI: aiPreferences not set for this user`,
      );
    }

    // Broad candidate pool from Mongo catalog
    const all = [...(await this.catalog.search())];
    const candidates = all.filter((c) => !s.courses.has(c.courseID));

    // 1) Try Gemini
    let pick = await chooseWithGemini(owner, candidates, s.aiPreferences);
    // 2) Optional adapter fallback
    if (!pick && (this as any).ai?.chooseCourse) {
      pick = await (this as any).ai.chooseCourse(
        owner,
        candidates,
        s.aiPreferences,
      );
    }
    // 3) Last resort
    if (!pick) pick = candidates[0] ?? null;
    if (!pick) {
      throw new Error(
        `Schedule.suggestCourseAI: no suitable course found by AI`,
      );
    }
    s.aiSuggestion = pick;
    return pick;
  }

  async updateAfterAddAI(owner: User, addedCourse: Course): Promise<Course> {
    const s = this.ensureState(owner);
    if (!s.aiPreferences) {
      throw new Error(
        `Schedule.updateAfterAddAI: aiPreferences not set for this user`,
      );
    }
    if (!s.courses.has(addedCourse.courseID)) {
      throw new Error(
        `Schedule.updateAfterAddAI: added course "${addedCourse.courseID}" is not in the schedule`,
      );
    }
    return await this.suggestCourseAI(owner);
  }

  // ------------------------------ internals ----------------------------------
  private ensureState(owner: User) {
    let state = this.schedules.get(owner.id);
    if (!state) {
      state = { courses: new Map<string, Course>() };
      this.schedules.set(owner.id, state);
    }
    return state;
  }
}
