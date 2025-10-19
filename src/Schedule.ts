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
 * (Kept for API stability—even though we no longer use availability/conflicts)
 */
export interface AIPreferences {
  major: string;
  interests: Set<string>;
  availability: Set<TimeSlot>;
}

// Ai stuffs
let _geminiLoaded = false;
let _GoogleGenerativeAI: any = null;

// Try to load @google/generative-ai lazily so the rest of the app doesn't break if it's absent.
try {
  // deno or node with transpile: dynamic import at runtime
  // @ts-ignore: runtime import
  _GoogleGenerativeAI =
    (await import("@google/generative-ai")).GoogleGenerativeAI;
  _geminiLoaded = !!_GoogleGenerativeAI;
} catch {
  _geminiLoaded = false;
}

async function chooseWithGemini(
  owner: User,
  candidates: Course[],
  prefs: AIPreferences,
): Promise<Course | null> {
  const apiKey =
    (typeof Deno !== "undefined"
      ? Deno.env.get("GEMINI_API_KEY")
      : process.env?.GEMINI_API_KEY) ||
    "";
  if (!_geminiLoaded || !apiKey || candidates.length === 0) return null;

  const genAI = new _GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Keep payload lean—IDs + a bit of context
  const slim = candidates.map((c) => ({
    courseID: c.courseID,
    title: c.title,
    instructor: c.instructor,
    // keep meetingTimes/requirements if you want to bias selection more
  }));

  const system =
    `Return ONLY a JSON object: {"courseID":"<exact id from the list>"}.
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

    // No time-overlap or travel checks — conflict-free by design
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
   *   - delegate choice to AI
   */
  async suggestCourseAI(owner: User): Promise<Course> {
    const s = this.ensureState(owner);
    if (!s.aiPreferences) {
      throw new Error(
        `Schedule.suggestCourseAI: aiPreferences not set for this user`,
      );
    }

    const all = [...(this.catalog.search() ?? new Set<Course>())];

    // Only exclude courses already in the schedule
    // inside Schedule.suggestCourseAI (replace only the picking part)
    const candidates = all.filter((c) => !s.courses.has(c.courseID));

    // 1) Try Gemini (least-invasive: no other code changes)
    let pick = await chooseWithGemini(owner, candidates, s.aiPreferences);

    // 2) Fallback to provided AI adapter if present
    if (!pick && (this as any).ai?.chooseCourse) {
      pick = await (this as any).ai.chooseCourse(
        owner,
        candidates,
        s.aiPreferences,
      );
    }

    // 3) Last-resort fallback (still returns something to keep flow intact)
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
   *   - NO availability subtraction (conflict-free)
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
