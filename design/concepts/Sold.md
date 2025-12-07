# Schedule — Concept Specification

## Purpose
Maintain a student’s term schedule, supporting actions like adding, listing, clearing, and AI-assisted course suggestions, while enforcing consistency and user preferences.

## Principle
- Each student has an authoritative, deduplicated record of enrolled courses.  
- The schedule interacts safely with the CourseCatalog for lookup and validation.  
- AI-based suggestions must respect user preferences and validation rules.

## State
- Persistent Mongo-backed storage keyed by user ID.  
- Transient in-memory `CourseCatalog` for lookup and AI suggestions.

## Actions

### `addCourseById(userId: string, courseId: string): Promise<void>`
**Requires:** `courseId` exists in `CourseCatalog`.  
**Effects:** Adds that course to the user’s schedule.  
**Notes:** Duplicate adds are ignored (no error, no duplicate row).

---

### `listSchedule(userId: string): Promise<Course[]>`
**Effects:** Returns the list of all courses for that user.  
**Errors:** Throws a descriptive error when the user has no courses.

---

### `suggestCourseAI(userId: string, prefs: object): Promise<Course>`
**Effects:** Produces an AI-suggested course.  
**Notes:**  
- Uses Gemini if available; otherwise falls back to deterministic selection from `CourseCatalog`.  
- Does not modify the schedule until the user explicitly adds the suggestion.

---

### `updateAfterAddAI(userId: string, prefs: object, courseId: string): Promise<void>`
**Requires:** The course was added to the schedule.  
**Effects:** Validates that the course is consistent with preferences and schedule state.  
**Errors:** Throws if the course is missing or violates constraints.

---

### `clear(userId: string): Promise<void>`
**Effects:** Removes all scheduled courses for the user.  

## Invariants
- Each schedule contains unique course IDs per user.  
- `listSchedule` always reflects the current persistent state.  
- AI-suggested courses are validated before being finalized.

## Errors
- `addCourseById` throws when the course doesn’t exist.  
- `listSchedule` throws when empty.  
- `updateAfterAddAI` throws when preference checks fail or course not found.
