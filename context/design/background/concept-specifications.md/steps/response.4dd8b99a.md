---
timestamp: 'Sat Dec 06 2025 23:25:42 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251206_232542.58c47a42.md]]'
content_id: 4dd8b99a825bf01e1b997b2bb685957d7305a9a3759190630d3c4bece993b241
---

# response:

Here are the concept specifications for the `CourseCatalog` backend, based on the provided `src/CourseCatalog.ts` file.

Since only `src/CourseCatalog.ts` was provided, I am unable to create concept specifications for `CrossRegTravel` and `Schedule`. To generate those, their respective TypeScript source files would be needed.

***

### Concept Specification for `CourseCatalog`

**concept** CourseCatalog

**purpose** enable users to discover available academic courses through searching and filtering by various criteria

**principle** if a user provides a search query and optional filters, then they will receive a list of courses that match all specified criteria

**state**
a set of Courses, each with:
courseID: String (unique identifier)
title: String
instructor: String
meetingTimes: set of TimeSlot
TimeSlot has day: String, start: String, end: String
location: String?
subject: String?
campus: String?
rmp: String?

**actions**
close ()
**requires** the catalog is connected to the course database
**effects** the connection to the course database is terminated, and no further operations are possible

**queries**
getById (courseID: String) : (course: Course)
**requires** a course with `courseID` exists in the catalog
**effects** returns the `Course` object corresponding to `courseID`

search (query: String?, filters: {
instructor?: String?,
subject?: String?,
day?: String?,
timeWindow?: {
day: String,
start?: String,
end?: String
}?,
campus?: String?
}?) : (courses: set of Course)
**requires** true
**effects** returns a set of `Course` objects where:
\- `query` (if provided) is fuzzy-matched against `courseID`, `title`, and `instructor`
\- `filters.instructor` (if provided) is fuzzy-matched against `instructor`
\- `filters.subject` (if provided) matches `subject`
\- `filters.day` (if provided) matches any `meetingTimes.day`
\- `filters.timeWindow` (if provided) matches any `meetingTimes` that fall within the specified `day`, `start`, and `end` times
\- `filters.campus` (if provided) matches `campus`

getAll () : (courses: set of Course)
**requires** true
**effects** returns the set of all `Course` objects currently available in the catalog
