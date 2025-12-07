// src/Schedule.ts

import { Course, CourseCatalog } from "./CourseCatalog.ts";

/** ================= Domain types ========================================== */
export interface Requirement {
  code: string; // e.g., "QR", "HSCI", "LAB", "WRI"
}

export interface User {
  id: string;
  name?: string;
}

/** ============== AI interfaces ============================================= */
/** Simple AI chooser that picks ONE course from filtered candidates. */
export interface AIRecommenderLike {
  chooseCourse(
    owner: User,
    candidates: Course[],
    prefs: AIPreferences,
  ): Promise<Course | null> | Course | null;
}

/** ======================= AI prefs ========================================= */
export interface AIPreferences {
  major: string;
  interests: Set<string>;
  availability: Set<string>;
}

/** ============== Gemini Integration ======================================== */
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
    const d = (globalThis as any).Deno?.env?.get?.(name);
    if (typeof d === "string" && d.length > 0) return d;
  } catch {}
  try {
    // Node fallback
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

/** ===================== Factory to create Schedule ========================= */
/**
 * Factory to build a Schedule wired to MongoDB-backed CourseCatalog
 */
export async function createScheduleWithMongo(
  ai: AIRecommenderLike = { chooseCourse: () => null },
  opts?: {
    mongoUrl?: string;
    dbName?: string;
    collection?: string;
  },
): Promise<Schedule> {
  const catalog = await CourseCatalog.create(opts);
  return new Schedule(catalog, ai);
}

/** ======================= Schedule concept ================================= */
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
    private readonly catalog: CourseCatalog,
    private readonly ai: AIRecommenderLike,
  ) {}

  // ------------------------------ core actions -------------------------------

  /** Add a course by ID, loads from MongoDB-backed catalog */
  async addCourseById(owner: User, courseID: string): Promise<void> {
    const course = await this.catalog.getById(courseID);
    this.addCourse(owner, course);
  }

  /** Add a course object directly to the schedule */
  addCourse(owner: User, course: Course): void {
    const s = this.ensureState(owner);
    if (s.courses.has(course.courseID)) {
      throw new Error(
        `Schedule.addCourse: course "${course.courseID}" is already in the schedule`,
      );
    }
    s.courses.set(course.courseID, course);
  }

  /** Remove a course from the schedule */
  removeCourse(owner: User, courseID: string): void {
    const s = this.ensureState(owner);
    if (!s.courses.has(courseID)) {
      throw new Error(
        `Schedule.removeCourse: course "${courseID}" not found in schedule`,
      );
    }
    s.courses.delete(courseID);
  }

  /** List all courses in the schedule */
  listSchedule(owner: User): Set<Course> {
    const s = this.ensureState(owner);
    if (s.courses.size === 0) {
      throw new Error(`Schedule.listSchedule: schedule is empty`);
    }
    return new Set(s.courses.values());
  }

  /** Clear all courses from the schedule */
  clear(owner: User): void {
    const s = this.ensureState(owner);
    s.courses.clear();
  }

  // ------------------------------ AI actions ---------------------------------

  /** Set AI preferences for course recommendations */
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

  /** Get an AI-powered course suggestion
   * @param excludeCourseIds - Array of course IDs to exclude from recommendations (already enrolled)
   */
  async suggestCourseAI(
    owner: User,
    excludeCourseIds: string[] = [],
  ): Promise<Course> {
    const s = this.ensureState(owner);
    if (!s.aiPreferences) {
      throw new Error(
        `Schedule.suggestCourseAI: aiPreferences not set for this user`,
      );
    }

    // Broad candidate pool from catalog
    const all = [...(await this.catalog.search())];

    // Filter out courses that are:
    // 1. Already in the server-side schedule (s.courses)
    // 2. In the excludeCourseIds list (passed from frontend)
    const excludeSet = new Set(
      excludeCourseIds.map((id) => id.trim().toUpperCase()),
    );

    const candidates = all.filter((c) => {
      const courseId = c.courseID.trim().toUpperCase();
      // Exclude if in server-side schedule
      if (s.courses.has(c.courseID)) return false;
      // Exclude if in the frontend exclude list
      if (excludeSet.has(courseId)) return false;
      return true;
    });

    console.log(
      `🤖 AI: ${all.length} total courses, ${excludeCourseIds.length} excluded, ${candidates.length} candidates remaining`,
    );

    // 1) Try Gemini
    let pick = await chooseWithGemini(owner, candidates, s.aiPreferences);
    // 2) Optional adapter fallback
    if (!pick && this.ai?.chooseCourse) {
      pick = await this.ai.chooseCourse(
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

  /** Update AI suggestion after adding a course */
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

  // ------------------------------ cleanup ------------------------------------
  /** Close the underlying catalog connection */
  async close(): Promise<void> {
    await this.catalog.close();
  }
}
