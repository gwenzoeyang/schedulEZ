# Concept: Schedule [User, Course]

## Purpose
Allow a student to compose a tentative plan of courses for a term.  
The Schedule concept stores each student’s selected courses and optionally uses an AI recommender (Gemini) to suggest additional courses based on the student’s major, interests, and availability.  
Unlike earlier versions, this Schedule **does not prevent overlaps** — it is *conflict-free*, letting students explore multiple possible schedules freely.

---

## Principle
- Each schedule belongs to exactly one student (`User`).  
- Adding or removing courses only affects that student’s schedule.  
- There are **no overlap or travel constraint checks** — this version emphasizes flexibility.  
- The AI feature is optional and integrated minimally: it uses Google Gemini (via `.env` API keys) to recommend one course from the catalog, with graceful fallback to a default or provided AI adapter.  
- The rest of the Schedule’s behavior is identical whether or not AI is available.

---

## State

A mapping:
```
userId → {
  courses: Map<CourseID, Course>,
  aiPreferences?: AIPreferences,
  aiSuggestion?: Course
}
```

Each Schedule entry contains:

- **courses** — the user’s current selected courses.  
- **aiPreferences (optional)** — the user’s declared AI guidance preferences:  
  - `major: String` — user’s field of study.  
  - `interests: Set<String>` — keywords describing their academic/personal interests.  
  - `availability: Set<TimeSlot>` — user’s free time slots.  
- **aiSuggestion (optional)** — the latest course recommended by AI.

---

## Actions

### `addCourse(owner: User, course: Course)`
**Requires:**  
- `course` exists in the authoritative `CourseCatalog`.  
- Course is not already in the student’s schedule.  

**Effects:**  
- Adds the course to the user’s schedule.  
- No overlap or travel validation is performed (conflict-free).

---

### `removeCourse(owner: User, courseID: String)`
**Requires:**  
- The course with that `courseID` exists in the user’s schedule.  

**Effects:**  
- Removes that course from the schedule.

---

### `listSchedule(owner: User): Set<Course>`
**Requires:**  
- The user has at least one course in their schedule.  

**Effects:**  
- Returns all courses currently in the schedule.  
- Throws an error if the schedule is empty.

---

### `clear(owner: User)`
**Effects:**  
- Removes all courses from the user’s schedule.

---

### `setAIPreferences(owner: User, major: String, interests: Set<String>, availability: Set<TimeSlot>)`
**Effects:**  
- Creates or updates the AI preference record for the user.  
- Resets any existing `aiSuggestion`.

---

### `suggestCourseAI(owner: User): Course`
**Requires:**  
- `aiPreferences` must be set.  
- `CourseCatalog` must be accessible.  

**Effects:**  
1. Retrieves a broad set of course candidates from `CourseCatalog`.  
2. Excludes any courses already in the user’s schedule.  
3. Invokes Gemini to pick one course based on the user’s major and interests:
   - Uses `GEMINI_API_KEY` and optional `GEMINI_MODEL` from `.env`.
   - Optionally loads `geminiConfig.json` for fine-tuning.  
4. If Gemini is unavailable, falls back to:
   - Any AI adapter passed into the constructor, or
   - The first available candidate course.  
5. Stores and returns the suggested course as `aiSuggestion`.

---

### `updateAfterAddAI(owner: User, addedCourse: Course): Course`
**Requires:**  
- `aiPreferences` must be set.  
- `addedCourse` must already exist in the user’s schedule.  

**Effects:**  
- Re-runs AI course suggestion with the same preferences but updated schedule.  
- Returns and stores the new suggestion.  
- (No change to `availability` — conflict-free version.)

---

## Invariants
- Each `userId` maps to exactly one schedule record.  
- Within each schedule:
  - Each courseID is unique.  
  - `aiSuggestion`, if set, corresponds to a valid course from `CourseCatalog`.  
- Removing or clearing courses does not affect AI preferences.  
- Failure to load Gemini gracefully degrades to fallback behavior.

---

## Summary
The **Schedule** concept manages each student’s planned courses and integrates seamlessly with the **CourseCatalog** for retrieval and AI-powered recommendations.  
This conflict-free version simplifies exploration: users can freely combine overlapping or cross-campus courses while receiving dynamic recommendations from Gemini or other AI adapters.  

Its design ensures that:
- Core functionality (add/remove/list/clear) remains robust even without AI.  
- The AI augmentation layer is entirely optional, minimally invasive, and environment-based.



# Changes Made

For the Schedule specification, I simplified it quite a bit to reflect how my implementation evolved. The earlier version talked about preventing time conflicts and enforcing travel feasibility, but my current code deliberately allows overlapping courses so students can explore multiple possibilities. I also added the part about AI-powered course recommendations, which now uses Gemini directly inside the same file. I rewrote the spec so it focuses on managing the schedule and on how AI suggestions fit into it — without overcomplicating the core logic. I kept the tone of the purpose and principle sections true to the idea of flexibility, while making sure the AI extension feels optional and non-intrusive, just like in the code.