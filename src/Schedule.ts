// src/concepts/Schedule.ts

/**
 * === Lightweight domain stubs (swap for your real types) =====================
 */

import type { Course, TimeSlot } from "./CourseCatalog.ts";

export interface User {
  id: string;
  name?: string;
}

/**
 * === External dependencies (assumed implemented elsewhere) ===================
 */
export interface CourseCatalogLike {
  getById(courseID: string): Course; // throws if not found
  search(query?: string, filters?: unknown): Set<Course>; // used broadly to get candidates
}

/** Simple AI chooser that picks ONE course from filtered candidates. */
export interface AIRecommenderLike {
  chooseCourse(
    owner: User,
    candidates: Course[],
    prefs: AIPreferences,
  ): Promise<Course | null> | Course | null;
}

/**
 * === AI preferences container ================================================
 * (Kept for API stability—even though schedule is conflict-free)
 */
export interface AIPreferences {
  major: string;
  interests: Set<string>;
  availability: Set<TimeSlot>;
}

/**
 * --- Gemini minimal inline integration (least-invasive) ----------------------
 *
 * Reads API key/model from .env:
 *   GEMINI_API_KEY=...
 *   GEMINI_MODEL=gemini-2.5-flash   (default used if missing)
 *
 * Optionally reads ../../geminiConfig.json (same folder level your repo uses)
 * for generationConfig. All of this is best-effort; if anything is missing,
 * we gracefully return null so the rest of Schedule keeps working.
 */

type GenAIModel = {
  generateContent(prompt: string, ...rest: unknown[]): Promise<{
    response: { text(): string };
  }>;
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
    const mod = await import("@google/generative-ai");
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
    // Node fallback (in case you run via node)
    // deno-lint-ignore no-explicit-any
    const n = (globalThis as any).process?.env?.[name];
    if (typeof n === "string" && n.length > 0) return n;
  } catch {}
  return "";
}

// Optional: load generationConfig from a JSON file (best-effort).
async function loadGeminiGenerationConfig(): Promise<unknown | undefined> {
  try {
    // Deno supports JSON import via assertions in many setups; if not, we fall back.
    // @ts-ignore: JSON import assertion may need editor/plugin support
    const cfg = await import(
      "/Users/gwen-zoeyang/schedulEZ/geminiConfig.json",
      {
        with: { type: "json" },
      } as any
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
    generationConfig, // optional; undefined if not present
  });

  // Keep payload slim: IDs + a hint — cheaper & more robust
  const slim = candidates.map((c) => ({
    courseID: c.courseID,
    title: c.title,
    instructor: c.instructor,
  }));

  const system =
    `Return ONLY a JSON object exactly like: {"courseID":"<exact id from the list>"}.
No commentary. If nothing fits, return {"courseID":""}.`;

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

/**
 * === Schedule concept (conflict-free) ========================================
 * purpose:
 *   let a student compose a tentative plan; allow overlapping courses so they
 *   can explore different possibilities. Optionally, use AI to recommend a
 *   course, but do not block on time conflicts.
 *
 * principle:
 *   each schedule belongs to one student.
 *   adding a course should NOT block on overlaps or travel constraints.
 *
 * state:
 *   userId -> {
 *     courses: Map<courseID, Course>
 *     aiPreferences?: AIPreferences
 *     aiSuggestion?: Course
 *   }
 */
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

  addCourse(owner: User, course: Course): void {
    // Ensure the course exists in the authoritative catalog
    this.catalog.getById(course.courseID);

    const s = this.ensureState(owner);

    // Prevent exact duplicates in the same schedule
    if (s.courses.has(course.courseID)) {
      throw new Error(
        `Schedule.addCourse: course "${course.courseID}" is already in the schedule`,
      );
    }

    // Conflict-free: no overlap or travel checks
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

  /**
   * setAIPreferences(owner, major, interests, availability)
   * effects: create or update aiPreferences for the owner
   */
  setAIPreferences(
    owner: User,
    major: string,
    interests: Set<string>,
    availability: Set<TimeSlot>,
  ): void {
    const s = this.ensureState(owner);
    s.aiPreferences = { major, interests, availability };
    s.aiSuggestion = undefined;
  }

  /**
   * suggestCourseAI(owner) -> Course
   * effects:
   *   - get candidates from catalog
   *   - drop courses already in schedule
   *   - NO time/availability/travel filtering (conflict-free)
   *   - delegate choice to Gemini (first), then fallback adapter, then first candidate
   */
  async suggestCourseAI(owner: User): Promise<Course> {
    const s = this.ensureState(owner);
    if (!s.aiPreferences) {
      throw new Error(
        `Schedule.suggestCourseAI: aiPreferences not set for this user`,
      );
    }

    // Broad candidate pool
    const all = [...(this.catalog.search() ?? new Set<Course>())];

    // Only exclude courses already in the schedule
    const candidates = all.filter((c) => !s.courses.has(c.courseID));

    // 1) Try Gemini (least-invasive; single-file)
    let pick = await chooseWithGemini(owner, candidates, s.aiPreferences);

    // 2) Fallback to any adapter you may still pass in
    if (!pick && (this as any).ai?.chooseCourse) {
      pick = await (this as any).ai.chooseCourse(
        owner,
        candidates,
        s.aiPreferences,
      );
    }

    // 3) Last-resort fallback so behavior remains stable
    if (!pick) pick = candidates[0] ?? null;

    if (!pick) {
      throw new Error(
        `Schedule.suggestCourseAI: no suitable course found by AI`,
      );
    }

    s.aiSuggestion = pick;
    return pick;
  }

  /**
   * updateAfterAddAI(owner, addedCourse) -> Course
   * effects:
   *   - conflict-free: no availability subtraction
   *   - simply re-run suggestion against the remaining candidates
   */
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

    // Just refresh the AI suggestion with current state
    const next = await this.suggestCourseAI(owner);
    return next;
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
