---
timestamp: 'Sat Dec 06 2025 23:27:49 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251206_232749.2a5a3fc5.md]]'
content_id: 5719bba5861ae11690e92276f9184a980a81f6f2a83fb9453756d6a46f975703
---

# response:

Here are the concept specifications for the `CourseCatalog` backend, based on the provided `src/CourseCatalog.ts` file.

Since the TypeScript files for `CrossRegTravel` and `Schedule` were not provided, I am unable to create their concept specifications. If you provide those files, I can generate the specifications for them as well.

***

### Concept Specification for `CourseCatalog`

**concept** CourseCatalog

**purpose** enable users to discover available academic courses through searching and filtering by various criteria

**principle** if a user provides a search query and optional filters, then they will receive a list of courses that match all specified criteria

**state**
  a set of Courses, each with:
    courseID: String (unique identifier for the course, e.g., "CS-220-01-FA25")
    title: String (the descriptive name of the course)
    instructor: String (the name of the course instructor)
    meetingTimes: set of TimeSlot
      TimeSlot has day: String ("M", "T", "W", "R", "F", "S", "U"), start: String ("HH:MM"), end: String ("HH:MM")
    location: String? (e.g., "SCI 101" or "Zoom")
    subject: String? (e.g., "CS", "MATH", derived from courseID)
    campus: String? (e.g., "Wellesley", "MIT")
    rmp: String? (Rate My Professor link)

**actions**
  close ()
    **requires** the catalog is connected to the course database
    **effects** the connection to the course database is terminated, and no further operations are possible

**queries**
  getById (courseID: String) : (course: Course)
    **requires** a course with the specified `courseID` exists in the catalog
    **effects** returns the `Course` object corresponding to the given `courseID`

  search (query: String?, filters: {
    instructor?: String?,
    subject?: String?,
    day?: String?,
    timeWindow?: {
      day?: String,
      start?: String,
      end?: String
    }?,
    campus?: String?
  }) : (courses: set of Course)
    **requires** true
    **effects** returns a set of `Course` objects that match all specified criteria:
      - If `query` is provided, courses whose `courseID`, `title`, or `instructor` fuzzy-match (case-insensitive) the query tokens are included.
      - If `filters.instructor` is provided, courses whose `instructor` fuzzy-matches (case-insensitive) the filter value are included.
      - If `filters.subject` is provided, courses whose `subject` exactly matches (case-insensitive) the filter value are included.
      - If `filters.day` is provided, courses that have at least one `meetingTimes` entry on that specific `day` are included.
      - If `filters.timeWindow` is provided, courses that have at least one `meetingTimes` entry that overlaps with the specified `day` (if provided), `start` time, and `end` time window are included.
      - If `filters.campus` is provided, courses whose `campus` exactly matches the filter value are included.

  getAll () : (courses: set of Course)
    **requires** true
    **effects** returns the set of all `Course` objects currently available in the catalog
