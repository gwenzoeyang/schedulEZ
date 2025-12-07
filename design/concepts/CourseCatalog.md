### Concept Specification for `CourseCatalog`

**concept** CourseCatalog

**purpose** Provide comprehensive and searchable access to a collection of academic courses, enabling users to efficiently discover courses based on various criteria.

**principle** If a user searches the catalog for courses taught by a specific instructor on a particular campus within a given time window, then the catalog will return all matching courses, showing their details including meeting times and location, thereby fulfilling the need to find relevant academic offerings.

**state**
A collection of `Course` entities, each comprising:
  * `courseID`: A unique identifier (String)
  * `title`: The course title (String)
  * `instructor`: The course instructor (String)
  * `meetingTimes`: A set of `TimeSlot` records, each with `day` (String, e.g., "M", "T"), `start` (String "HH:MM"), and `end` (String "HH:MM")
  * `location`: The course location (String, optional)
  * `subject`: The academic subject (String, derived from `courseID`, e.g., "CS", "MATH")
  * `campus`: The campus where the course is offered (String, optional, e.g., "Wellesley", "MIT")
  * `rmp`: A link to "Rate My Professor" (String, optional)

**actions**

`initialize(mongoUrl: String, dbName: String, collection: String)`
  `requires` The provided `mongoUrl` is valid and points to an accessible MongoDB instance.
  `effects` Establishes a connection to the specified MongoDB database and collection, preparing the CourseCatalog for operations.

`getById(courseID: String): (course: Course)`
  `requires` A `Course` with the given `courseID` exists within the catalog.
  `effects` Returns the `Course` entity whose `courseID` matches the input.

`getById(courseID: String): (error: String)`
  `requires` No `Course` with the given `courseID` exists within the catalog.
  `effects` Returns an `error` message indicating the course was not found.

`search(query: String?, filters: {instructor: String?, subject: String?, day: String?, timeWindow: {day: String, start: String?, end: String?}?, campus: String?}?): (courses: set of Course)`
  `requires` true
  `effects` Returns a `set of Course` entities that satisfy the `query` (matching `courseID`, `title`, or `instructor` in a case-insensitive, fuzzy manner) and any specified `filters` (matching `instructor`, `subject`, `day` of meeting, `timeWindow` overlap, and `campus`).

`getAll(): (courses: set of Course)`
  `requires` true
  `effects` Returns a `set of Course` entities containing all courses currently stored in the catalog.

`close()`
  `requires` The CourseCatalog has an active connection to the database.
  `effects` The connection to the MongoDB database is closed, releasing resources.

---
