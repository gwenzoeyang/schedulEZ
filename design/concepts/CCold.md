# CourseCatalog — Concept Specification

## Purpose
Provide an authoritative, queryable catalog of courses (ID, title, instructor, subject, meeting times, location, campus) for use by students and other concepts (e.g., Schedule) during planning.

## Principle
- Serves as the single source of truth for term course data.  
- Converts raw database rows into a consistent, structured format with normalized meeting times.  
- Ensures searches are predictable, case-insensitive, and robust to incomplete data.

## State
- `byId: Map<string, Course>` — fast lookup by course ID  
- `all: Course[]` — snapshot array for filtering and iteration  

### Course Fields
- `courseID: string` — authoritative ID, e.g., `CS-220-01-FA25`  
- `title: string`  
- `instructor: string`  
- `DBmeetingTimes?: string[] | string` — raw DB form (may be string or array)  
- `meetingTimes?: TimeSlot[]` — parsed array of times (always an array, may be empty)  
- `subject?: string` — derived from leading letters of `courseID`  
- `location?: string`  
- `campus?: string`  

### TimeSlot Fields
- `day: "M" | "T" | "W" | "R" | "F" | "S" | "U"`  
- `start: "HH:MM"`  
- `end: "HH:MM"`

## Actions

### `fromDbRows(rows: any[]): CourseCatalog`
**Requires:** `rows` are raw Mongo course documents.  
**Effects:** Adapts each row into a normalized `Course` and loads them into a new catalog.  
**Notes:**  
- Accepts `DBmeetingTimes` as string, string array, or missing.  
- Parses strings like `"MWF - 10:00 - 11:00"` into multiple `TimeSlot` entries (one per day).  
- Ensures `meetingTimes` is always an array and `subject` is derived from the `courseID`.

---

### `load(courses: Course[]): void`
**Effects:** Replaces the catalog contents and rebuilds `byId` and `all`.  

---

### `getById(courseId: string): Course`
**Requires:** A course with this ID exists.  
**Effects:** Returns that course.  
**Errors:** Throws Error("CourseCatalog.getById: courseId "..." not found") if the course does not exist.

---

### `search(query?: string, filters?: CourseFilters): Set<Course>`
**Effects:** Returns all courses matching the search tokens and filters.  

#### Query
- Case-insensitive search over `courseID`, `title`, and `instructor`.  
- If no query is given, filters alone are used.

#### Filters
- `instructor`: fuzzy substring match.  
- `subject`: must equal the derived `subject` field.  
- `day`: at least one `meetingTimes` entry matches this day.  
- `timeWindow`: overlaps the given start–end range; if a `day` is included in the window, only times on that day are considered.  

**Notes:**  
- Overlap rule: two intervals overlap if `aStart < bEnd && bStart < aEnd`.  
- Malformed or missing time fields are tolerated — they simply won’t match time-based filters.

## Invariants
- Every `Course` has a `meetingTimes` array (never undefined).  
- `subject` is always the uppercase prefix of `courseID`.  
- `byId.size === all.length` and contains every course.

## Errors
- `getById` throws if the course is missing.  
- `search` never throws due to malformed data; invalid rows are skipped.
