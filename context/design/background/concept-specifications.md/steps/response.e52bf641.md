---
timestamp: 'Sun Dec 07 2025 00:56:17 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251207_005617.47f12851.md]]'
content_id: e52bf641ad18caea7e2ac6aa729ab499700abf53df48fb13f9b91062f22a346b
---

# response:

Here are the complete concept specifications for `CourseCatalog`, `CrossRegTravel`, and `Schedule` based on the provided TypeScript files and the specified concept structure.

***

## Concept Specification: CourseCatalog

**concept** CourseCatalog

**purpose** Provide a centralized, searchable catalog of courses to enable users to discover and retrieve course details efficiently based on various filtering criteria.

**principle** If a user searches for "CS" courses taught by "A. Lovelace" that meet on "Mondays", then the catalog will return all matching courses with their full details.

**state**
  a set of Courses with
    courseID: String (unique identifier)
    title: String
    instructor: String
    DBmeetingTimes: String | set of String (raw format from DB)
    meetingTimes: set of TimeSlot (parsed format)
    location: String?
    subject: String
    campus: String?
    rmp: String? (Rate My Professor link)
    description: String?
  TimeSlot with
    day: String ("M", "T", "W", "R", "F", "S", "U")
    start: String (HH:MM)
    end: String (HH:MM)
  
**actions**
  **system** create (mongoUrl: String, dbName: String?, collection: String?): (catalog: CourseCatalog)
    **requires** `mongoUrl` is a valid MongoDB connection string.
    **effects** A connection to the specified MongoDB instance and collection is established, initializing the concept for operation.

  **system** close ()
    **requires** The concept is currently connected to the database.
    **effects** The connection to the MongoDB database is terminated.

**queries**
  getById (courseID: String): (course: Course)
    **requires** A `Course` with the given `courseID` exists in the catalog.
    **effects** Returns the `Course` object corresponding to the `courseID`.

  search (query: String?, filters: CourseFilters): (courses: set of Course)
    **requires** true
    **effects** Returns a set of `Course` objects that match the text `query` against courseID, title, and instructor, and satisfy the `filters`.
  CourseFilters with
    instructor: String?
    subject: String?
    day: String?
    timeWindow: { day: String, start: String?, end: String? }?
    campus: String?

  getAll (): (courses: set of Course)
    **requires** true
    **effects** Returns a set of all `Course` objects in the catalog.

***

## Concept Specification: CrossRegTravel

**concept** CrossRegTravel \[Student, Course]

**purpose** Manage the submission, tracking, and administration of travel requests for cross-registered students.

**principle** If a student submits a travel request for a cross-registered course, then an administrator can review it and either approve or reject it, changing its status accordingly.

**state**
  a set of TravelRequests with
    requestID: String (unique identifier)
    student: Student (reference to an external student entity)
    course: Course (reference to an external course entity)
    departureTime: String (ISO 8601 timestamp)
    returnTime: String (ISO 8601 timestamp)
    status: String ("pending", "approved", "rejected", "canceled")
    reason: String? (optional reason for request or rejection)
    adminNotes: String? (notes from an administrator)
    submittedAt: String (ISO 8601 timestamp of submission)
    lastUpdatedAt: String (ISO 8601 timestamp of last update)

**actions**
  **system** create (mongoUrl: String, dbName: String?, collection: String?): (crossRegTravel: CrossRegTravel)
    **requires** `mongoUrl` is a valid MongoDB connection string.
    **effects** A connection to the specified MongoDB instance and collection is established, initializing the concept for operation.

  submitRequest (studentID: String, courseID: String, departureTime: String, returnTime: String, reason: String?): (travelRequest: TravelRequest)
    **requires** `studentID` and `courseID` refer to existing entities; `departureTime` and `returnTime` are valid ISO 8601 timestamps, with `departureTime` before `returnTime`.
    **effects** A new `TravelRequest` is created with a unique `requestID`, status "pending", and `submittedAt`/`lastUpdatedAt` set to the current time. The new request is added to the set of `TravelRequests`.

  updateStatus (requestID: String, newStatus: String, adminNotes: String?): (travelRequest: TravelRequest)
    **requires** A `TravelRequest` with the given `requestID` exists. `newStatus` is one of "approved", "rejected", or "canceled".
    **effects** The `status` of the specified `TravelRequest` is updated to `newStatus`, `adminNotes` are applied if provided, and `lastUpdatedAt` is set to the current time.

  **system** close ()
    **requires** The concept is currently connected to the database.
    **effects** The connection to the MongoDB database is terminated.

**queries**
  getById (requestID: String): (travelRequest: TravelRequest)
    **requires** A `TravelRequest` with the given `requestID` exists.
    **effects** Returns the `TravelRequest` object identified by `requestID`.

  getRequests (filters: TravelRequestFilters): (travelRequests: set of TravelRequest)
    **requires** true
    **effects** Returns a set of `TravelRequest` objects that match the specified `filters`.
  TravelRequestFilters with
    studentID: String?
    courseID: String?
    status: String?
    departureDate: String? (YYYY-MM-DD)
    returnDate: String? (YYYY-MM-DD)

***

## Concept Specification: Schedule

**concept** Schedule \[Student, Course]

**purpose** Provide students with the ability to manage their course enrollments and maintain their academic schedule, including tracking status and cross-registration.

**principle** If a student adds a course to their schedule, then the course appears in their active schedule, and if they later drop it, its status changes accordingly, reflecting their enrollment history.

**state**
  a set of ScheduleEntries with
    entryID: String (unique identifier for this specific enrollment)
    student: Student (reference to an external student entity)
    course: Course (reference to an external course entity)
    sectionID: String? (optional, for specific course sections)
    term: String (e.g., "FA25")
    isCrossRegistered: Boolean
    status: String ("active", "dropped", "waitlisted")
    enrolledAt: String (ISO 8601 timestamp)
    droppedAt: String? (ISO 8601 timestamp, if dropped)
    grade: String? (optional: "A", "B+", "P", etc.)
    notes: String? (optional student notes)

**actions**
  **system** create (mongoUrl: String, dbName: String?, collection: String?): (schedule: Schedule)
    **requires** `mongoUrl` is a valid MongoDB connection string.
    **effects** A connection to the specified MongoDB instance and collection is established, initializing the concept for operation.

  addCourse (studentID: String, courseID: String, term: String, isCrossRegistered: Boolean, sectionID: String?, notes: String?): (scheduleEntry: ScheduleEntry)
    **requires** `studentID` and `courseID` refer to existing entities; `term` is a valid academic term.
    **effects** A new `ScheduleEntry` is created with a unique `entryID`, status "active", `enrolledAt` set to the current time, and other provided details. The new entry is added to the set of `ScheduleEntries`.

  updateScheduleEntry (entryID: String, updates: Partial<ScheduleEntry>): (scheduleEntry: ScheduleEntry)
    **requires** A `ScheduleEntry` with the given `entryID` exists.
    **effects** The specified `updates` are applied to the `ScheduleEntry`. If the `status` changes to "dropped" and `droppedAt` is not already set, `droppedAt` is set to the current time. If the `status` changes from "dropped", `droppedAt` is cleared.

  **system** close ()
    **requires** The concept is currently connected to the database.
    **effects** The connection to the MongoDB database is terminated.

**queries**
  getById (entryID: String): (scheduleEntry: ScheduleEntry)
    **requires** A `ScheduleEntry` with the given `entryID` exists.
    **effects** Returns the `ScheduleEntry` object identified by `entryID`.

  getSchedule (filters: ScheduleFilters): (scheduleEntries: set of ScheduleEntry)
    **requires** true
    **effects** Returns a set of `ScheduleEntry` objects that match the specified `filters`.
  ScheduleFilters with
    studentID: String?
    courseID: String?
    term: String?
    status: String?
    isCrossRegistered: Boolean?

***
