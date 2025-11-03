// states

/**
 * fetching data
 *
 * const rows = await db.collection("courses").find({}).toArray();
 * const catalog = CourseCatalog.fromDbRows(rows);
 */

export interface TimeSlot {
  // Example: { day: "M", start: "10:00", end: "11:20"}
  day: string;
  start: string; // "HH:MM" 24h
  end: string; // "HH:MM" 24h
}

export interface Course {
  courseID: string; // authoritative ID, e.g., "CS-220-01-FA25"
  title: string; // "Blue on the Move"
  instructor: string; // "Ada Lovelace"
  DBmeetingTimes?: string[] | string; // allow string or string[]
  meetingTimes?: TimeSlot[];
  location?: string; // "SCI 101" or "Zoom"
  subject?: string;
  campus?: string; // "Wellesley", "MIT", etc.
}

export type CourseFilters = {
  instructor?: string; // fuzzy match (case-insensitive)
  subject?: string; // e.g., "CS", "MATH"
  day?: TimeSlot["day"]; // "M" | ... | "F"
  timeWindow?: {
    day: string;
    start?: string; // "HH:MM" 24h
    end?: string; // "HH:MM" 24h
  };
};

// === DB adapter for Mongo documents =======================================

function parseDBTimes(raw?: string[] | string): TimeSlot[] {
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : [raw];

  const out: TimeSlot[] = [];
  for (const s of arr) {
    if (typeof s !== "string") continue;
    const parts = s.split(" - ").map((p) => p.trim());
    if (parts.length !== 3) continue;
    const [days, start, end] = parts;
    if (!days || !start || !end) continue;

    for (const ch of days) {
      if ("MTWRFSU".includes(ch)) {
        out.push({ day: ch, start, end });
      }
    }
  }
  return out;
}

// Convert DB row → app Course
function adaptCourse(dbRow: any): Course {
  const courseID: string = dbRow.courseID ?? dbRow.courseId ?? "";
  return {
    courseID,
    title: dbRow.title ?? "",
    instructor: dbRow.instructor ?? "",
    DBmeetingTimes: dbRow.DBmeetingTimes,
    meetingTimes: parseDBTimes(dbRow.DBmeetingTimes),
    subject: departmentOfCourseId(courseID),
    location: dbRow.location,
    campus: dbRow.campus,
  };
}

//getdepartment helper for database integration
function departmentOfCourseId(courseId: string): string {
  const m = (courseId || "").trim().match(/^[A-Za-z]+/);
  return (m?.[0] ?? "").toUpperCase();
}

// Convenience: transform many DB rows
function adaptMany(rows: any[]): Course[] {
  return rows.map(adaptCourse);
}

/**
 * === CourseCatalog ===========================================================
 */
export class CourseCatalog {
  private byId: Map<string, Course> = new Map();
  private all: Course[] = [];

  static fromDbRows(rows: any[]): CourseCatalog {
    const adapted = adaptMany(rows);
    return new CourseCatalog(adapted);
  }

  constructor(initialCourses: Course[] = []) {
    this.load(initialCourses);
  }

  load(courses: Course[]): void {
    this.byId.clear();
    this.all = [];
    for (const c of courses) {
      this.byId.set(c.courseID, c);
      this.all.push(c);
    }
  }

  getById(courseId: string): Course {
    const found = this.byId.get(courseId);
    if (!found) {
      throw new Error(
        `CourseCatalog.getById: courseId "${courseId}" not found`,
      );
    }
    return found;
  }

  search(query?: string, filters: CourseFilters = {}): Set<Course> {
    const tokens = tokenize(query);
    const results = new Set<Course>();

    for (const c of this.all) {
      const hay = `${c.courseID} ${c.title} ${c.instructor}`.toLowerCase();
      const tokenOk = tokens.length === 0 ||
        tokens.some((t) => hay.includes(t));
      if (!tokenOk) continue;

      if (
        filters.instructor && !fuzzyContains(c.instructor, filters.instructor)
      ) continue;

      if (filters.subject) {
        const want = filters.subject.trim().toUpperCase();
        const have = c.subject;
        if (have !== want) continue;
      }

      if (filters.day) {
        const meetsThatDay = c.meetingTimes?.some((mt) =>
          mt.day === filters.day
        );
        if (!meetsThatDay) continue;
      }

      if (filters.timeWindow) {
        const { day, start, end } = filters.timeWindow;
        const win = {
          start: toMinutes(start ?? "00:00"),
          end: toMinutes(end ?? "23:59"),
        };
        const overlaps = (c.meetingTimes ?? []).some((mt) => {
          if (day && mt.day !== day) return false;
          const a = toMinutes(mt.start);
          const b = toMinutes(mt.end);
          return intervalsOverlap(a, b, win.start, win.end);
        });
        if (!overlaps) continue;
      }

      results.add(c);
    }
    return results;
  }
}

/**
 * === Helpers =================================================================
 */

function tokenize(q?: string): string[] {
  return (q ?? "")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

function fuzzyContains(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

function toMinutes(hhmm?: string): number {
  if (!hhmm || !/^\d{2}:\d{2}$/.test(hhmm)) return NaN;
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function intervalsOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}
