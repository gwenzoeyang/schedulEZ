---
timestamp: 'Sat Dec 06 2025 23:25:24 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251206_232524.70d0fd42.md]]'
content_id: 06cd36b715ee6a7f07a32a75c2c5eed1807beb3fafc080469d49ff0fa0934caa
---

# file: src/CourseCatalog.ts

```typescript
// courseschedule.ts - MongoDB-backed course catalog

import { Collection, Db, MongoClient } from "npm:mongodb";

// ============================================================================
// Types
// ============================================================================

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
  rmp?: string; // Rate My Professor link
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
  campus?: string; // filter by campus
};

// MongoDB document shape
type CourseDoc = {
  courseID?: string;
  courseId?: string; // alternate field name
  title?: string;
  instructor?: string;
  meeting_times?: string[] | string; // actual field name in MongoDB (snake_case)
  DBmeetingTimes?: string[] | string; // legacy field name support
  location?: string;
  campus?: string;
  rmp?: string; // Rate My Professor link
};

// ============================================================================
// Helper functions
// ============================================================================

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

function departmentOfCourseId(courseId: string): string {
  const m = (courseId || "").trim().match(/^[A-Za-z]+/);
  return (m?.[0] ?? "").toUpperCase();
}

function adaptCourse(dbRow: CourseDoc): Course {
  const courseID: string = dbRow.courseID ?? dbRow.courseId ?? "";

  // Support both meeting_times (actual DB field) and DBmeetingTimes (legacy)
  const rawMeetingTimes = dbRow.meeting_times ?? dbRow.DBmeetingTimes;

  return {
    courseID,
    title: dbRow.title ?? "",
    instructor: dbRow.instructor ?? "",
    DBmeetingTimes: rawMeetingTimes,
    meetingTimes: parseDBTimes(rawMeetingTimes),
    subject: departmentOfCourseId(courseID),
    location: dbRow.location,
    campus: dbRow.campus,
    rmp: dbRow.rmp, // Rate My Professor link
  };
}

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

// ============================================================================
// CourseCatalog - MongoDB-backed
// ============================================================================

export class CourseCatalog {
  private col: Collection<CourseDoc>;
  private client: MongoClient;

  private constructor(client: MongoClient, db: Db, collectionName: string) {
    this.client = client;
    this.col = db.collection<CourseDoc>(collectionName);
  }

  /**
   * Factory method to create a MongoDB-backed catalog
   */
  static async create(opts?: {
    mongoUrl?: string;
    dbName?: string;
    collection?: string;
  }): Promise<CourseCatalog> {
    const mongoUrl = opts?.mongoUrl || (await loadEnv("MONGODB_URL"));
    const dbName = opts?.dbName || (await loadEnv("DB_NAME")) || "schedulEZ";
    const collection = opts?.collection ||
      (await loadEnv("COURSES_COLLECTION")) || "sample10";

    if (!mongoUrl) {
      throw new Error(
        `CourseCatalog.create: MONGODB_URL is required (env or opts.mongoUrl)`,
      );
    }

    const client = new MongoClient(mongoUrl);
    await client.connect();
    const db = client.db(dbName);

    return new CourseCatalog(client, db, collection);
  }

  /**
   * Legacy method for backwards compatibility - loads from pre-fetched rows
   * Deprecated: Use CourseCatalog.create() instead for MongoDB connection
   */
  static fromDbRows(rows: any[]): CourseCatalog {
    throw new Error(
      "CourseCatalog.fromDbRows is deprecated. Use CourseCatalog.create() to connect to MongoDB directly.",
    );
  }

  /**
   * Get a single course by ID
   */
  async getById(courseId: string): Promise<Course> {
    const doc = await this.col.findOne({
      $or: [{ courseID: courseId }, { courseId: courseId }],
    });

    if (!doc) {
      throw new Error(
        `CourseCatalog.getById: courseId "${courseId}" not found`,
      );
    }

    return adaptCourse(doc);
  }

  /**
   * Search courses with query string and filters
   */
  async search(
    query?: string,
    filters: CourseFilters = {},
  ): Promise<Set<Course>> {
    // Build MongoDB query
    const mongoQuery: any = {};
    const conditions: any[] = [];

    // Text search on courseID, title, instructor
    if (query && query.trim()) {
      const tokens = tokenize(query);
      if (tokens.length > 0) {
        const textConditions = tokens.map((token) => ({
          $or: [
            { courseID: { $regex: token, $options: "i" } },
            { courseId: { $regex: token, $options: "i" } },
            { title: { $regex: token, $options: "i" } },
            { instructor: { $regex: token, $options: "i" } },
          ],
        }));
        conditions.push(...textConditions);
      }
    }

    // Instructor filter
    if (filters.instructor) {
      conditions.push({
        instructor: { $regex: filters.instructor, $options: "i" },
      });
    }

    // Campus filter
    if (filters.campus) {
      conditions.push({ campus: filters.campus });
    }

    // Apply all conditions
    if (conditions.length > 0) {
      mongoQuery.$and = conditions;
    }

    // Fetch matching documents
    const cursor = this.col.find(mongoQuery);
    const results = new Set<Course>();

    for await (const doc of cursor) {
      const course = adaptCourse(doc);

      // Post-process filters that require parsed data
      // Subject filter (needs courseID parsing)
      if (filters.subject) {
        const want = filters.subject.trim().toUpperCase();
        if (course.subject !== want) continue;
      }

      // Day filter (needs parsed meeting times)
      if (filters.day) {
        const meetsThatDay = course.meetingTimes?.some((mt) =>
          mt.day === filters.day
        );
        if (!meetsThatDay) continue;
      }

      // Time window filter (needs parsed meeting times)
      if (filters.timeWindow) {
        const { day, start, end } = filters.timeWindow;
        const win = {
          start: toMinutes(start ?? "00:00"),
          end: toMinutes(end ?? "23:59"),
        };
        const overlaps = (course.meetingTimes ?? []).some((mt) => {
          if (day && mt.day !== day) return false;
          const a = toMinutes(mt.start);
          const b = toMinutes(mt.end);
          return intervalsOverlap(a, b, win.start, win.end);
        });
        if (!overlaps) continue;
      }

      results.add(course);
    }

    return results;
  }

  /**
   * Get all courses (use with caution on large collections)
   */
  async getAll(): Promise<Course[]> {
    const cursor = this.col.find({});
    const courses: Course[] = [];

    for await (const doc of cursor) {
      courses.push(adaptCourse(doc));
    }

    return courses;
  }

  /**
   * Close the MongoDB connection
   */
  async close(): Promise<void> {
    await this.client.close();
  }
}

```
