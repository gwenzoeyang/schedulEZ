---
timestamp: 'Sat Dec 06 2025 23:33:11 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251206_233311.686d975b.md]]'
content_id: 0afb81a96cc78ee637c14e65c1a387abd3aae8bb7d2dec9f658009350a1d2112
---

# response:

Here are the concept specifications for `CourseCatalog`, `CrossRegTravel`, and `Schedule` based on the provided TypeScript files and the concept specification structure.

***

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

***

### Concept Specification for `CrossRegTravel`

**concept** CrossRegTravel \[User, CourseID]

**purpose** Facilitate and track the process of students requesting and managing travel arrangements for cross-registered courses on other campuses, ensuring proper approval and communication of status.

**principle** If a student (User) requests travel for a specific cross-registered course (CourseID), then a travel request is created with a pending status. Subsequently, if an authorized administrator approves this request, the student will be notified of the approval, and the travel request's status will reflect the change, allowing the student to proceed with travel plans.

**state**
A collection of `TravelRequest` entities, each comprising:

* `id`: A unique identifier for the request (String)
* `student`: The `User` entity making the request
* `courseID`: The identifier of the cross-registered course (`CourseID`)
* `status`: The current status of the request (enum: "PENDING", "APPROVED", "REJECTED")
* `submittedAt`: Timestamp of when the request was submitted (Date)
* `approvedBy`: The `User` entity who approved the request (`User`, optional)
* `approvedAt`: Timestamp of when the request was approved (Date, optional)
* `rejectedBy`: The `User` entity who rejected the request (`User`, optional)
* `rejectedAt`: Timestamp of when the request was rejected (Date, optional)
* `note`: An optional note for rejection (String, optional)

**actions**

`create(student: User, courseID: CourseID): (request: TravelRequest)`
`requires` The `student` exists. The `courseID` is valid. No `TravelRequest` for this `student` and `courseID` combination currently exists with `PENDING` status.
`effects` A new `TravelRequest` entity is created with a unique `id`, `PENDING` status, `submittedAt` set to the current time, and associated with the `student` and `courseID`. The new `TravelRequest` entity is returned.

`create(student: User, courseID: CourseID): (error: String)`
`requires` A `TravelRequest` for this `student` and `courseID` combination already exists with `PENDING` status.
`effects` Returns an `error` message indicating that a pending request for this student and course already exists.

`approve(id: String, adminUser: User): (request: TravelRequest)`
`requires` A `TravelRequest` with the given `id` exists. Its current `status` is `PENDING`. The `adminUser` is authorized to approve requests.
`effects` The `TravelRequest` with the given `id` has its `status` updated to `APPROVED`. The `approvedBy` field is set to `adminUser`, and `approvedAt` is set to the current time. The updated `TravelRequest` entity is returned.

`approve(id: String, adminUser: User): (error: String)`
`requires` No `TravelRequest` with the given `id` exists OR its `status` is not `PENDING` OR the `adminUser` is not authorized.
`effects` Returns an `error` message indicating the reason for failure (e.g., request not found, already processed, or unauthorized).

`reject(id: String, adminUser: User, note: String?): (request: TravelRequest)`
`requires` A `TravelRequest` with the given `id` exists. Its current `status` is `PENDING`. The `adminUser` is authorized to reject requests.
`effects` The `TravelRequest` with the given `id` has its `status` updated to `REJECTED`. The `rejectedBy` field is set to `adminUser`, `rejectedAt` is set to the current time, and the `note` is stored. The updated `TravelRequest` entity is returned.

`reject(id: String, adminUser: User, note: String?): (error: String)`
`requires` No `TravelRequest` with the given `id` exists OR its `status` is not `PENDING` OR the `adminUser` is not authorized.
`effects` Returns an `error` message indicating the reason for failure (e.g., request not found, already processed, or unauthorized).

`getById(id: String): (request: TravelRequest)`
`requires` A `TravelRequest` with the given `id` exists.
`effects` Returns the `TravelRequest` entity matching the `id`.

`getById(id: String): (error: String)`
`requires` No `TravelRequest` with the given `id` exists.
`effects` Returns an `error` message indicating that the request was not found.

`listByStudent(student: User): (requests: set of TravelRequest)`
`requires` The `student` exists.
`effects` Returns a `set of TravelRequest` entities where the `student` field matches the input `student`.

`listByStatus(status: String): (requests: set of TravelRequest)`
`requires` `status` is a valid `TravelStatus` enum value (e.g., "PENDING", "APPROVED", "REJECTED").
`effects` Returns a `set of TravelRequest` entities whose `status` field matches the input `status`.

`listAll(): (requests: set of TravelRequest)`
`requires` true
`effects` Returns a `set of TravelRequest` entities containing all travel requests currently in the system.

***

### Concept Specification for `Schedule`

**concept** Schedule \[User, CourseID]

**purpose** Enable users to create, maintain, and personalize their academic course schedules, including the ability to add and remove courses, assign custom details, and automatically detect and prevent time conflicts between selected courses.

**principle** If a user (User) creates a personal schedule and attempts to add multiple courses (CourseID) to it, the system will prevent any course from being added if its meeting times conflict with an already scheduled course. If there is no conflict, the course will be successfully added, potentially with custom names or notes, and the user can later retrieve and manage their complete, conflict-free schedule.

**state**
A collection of `Schedule` entities, each comprising:

* `id`: A unique identifier for the schedule (String)
* `user`: The `User` entity who owns this schedule
* `name`: A user-defined name for the schedule (String)
* `courses`: An ordered list of `ScheduleCourse` entities, each comprising:
  * `courseID`: The identifier of the course (`CourseID`)
  * `courseTitle`: The title of the course (String)
  * `instructor`: The instructor of the course (String)
  * `meetingTimes`: A set of `TimeSlot` records, each with `day` (String), `start` (String "HH:MM"), and `end` (String "HH:MM")
  * `location`: The course location (String, optional)
  * `campus`: The campus where the course is offered (String, optional)
  * `rmp`: A link to "Rate My Professor" (String, optional)
  * `customName`: A user-defined alternative name for the course (String, optional)
  * `customNote`: A user-defined note for the course (String, optional)
  * `color`: A user-assigned color for display (String, optional)

**actions**

`createSchedule(user: User, name: String): (schedule: Schedule)`
`requires` The `user` exists. No `Schedule` for the given `user` currently has the provided `name`.
`effects` A new `Schedule` entity is created with a unique `id`, associated with the `user` and `name`, and an empty list of `ScheduleCourse` entries. The new `Schedule` entity is returned.

`createSchedule(user: User, name: String): (error: String)`
`requires` A `Schedule` for the given `user` already exists with the provided `name`.
`effects` Returns an `error` message indicating a schedule with that name already exists for the user.

`getSchedule(id: String): (schedule: Schedule)`
`requires` A `Schedule` with the given `id` exists.
`effects` Returns the `Schedule` entity matching the `id`.

`getSchedule(id: String): (error: String)`
`requires` No `Schedule` with the given `id` exists.
`effects` Returns an `error` message indicating that the schedule was not found.

`listSchedulesByUser(user: User): (schedules: set of Schedule)`
`requires` The `user` exists.
`effects` Returns a `set of Schedule` entities where the `user` field matches the input `user`.

`deleteSchedule(id: String)`
`requires` A `Schedule` with the given `id` exists.
`effects` The `Schedule` entity matching the `id` is removed from the system.

`deleteSchedule(id: String): (error: String)`
`requires` No `Schedule` with the given `id` exists.
`effects` Returns an `error` message indicating that the schedule was not found.

`updateScheduleName(id: String, name: String): (schedule: Schedule)`
`requires` A `Schedule` with the given `id` exists. No other `Schedule` owned by the same `user` currently has the provided `name`.
`effects` The `name` of the `Schedule` entity with the given `id` is updated to the new `name`. The updated `Schedule` entity is returned.

`updateScheduleName(id: String, name: String): (error: String)`
`requires` No `Schedule` with the given `id` exists OR another `Schedule` owned by the same `user` already has the provided `name`.
`effects` Returns an `error` message indicating the reason for failure (e.g., schedule not found or name conflict).

`addCourse(scheduleId: String, course: {courseID: CourseID, title: String, instructor: String, meetingTimes: set of TimeSlot, location: String?, campus: String?, rmp: String?}, customName: String?, customNote: String?, color: String?): (schedule: Schedule)`
`requires` A `Schedule` with `scheduleId` exists. The `course` data is valid. Adding this `course` to the `Schedule` does not create any time conflicts with existing `ScheduleCourse` entities within that `Schedule`.
`effects` The provided `course` data is added as a new `ScheduleCourse` entry to the `Schedule` identified by `scheduleId`, incorporating `customName`, `customNote`, and `color` if provided. The updated `Schedule` entity is returned.

`addCourse(scheduleId: String, course: {courseID: CourseID, title: String, instructor: String, meetingTimes: set of TimeSlot, location: String?, campus: String?, rmp: String?}, customName: String?, customNote: String?, color: String?): (error: String)`
`requires` No `Schedule` with `scheduleId` exists OR the `course` data is invalid OR adding this `course` would create a time conflict with an existing `ScheduleCourse` in the `Schedule`.
`effects` Returns an `error` message indicating the reason for failure (e.g., schedule not found, invalid course, or time conflict).

`removeCourse(scheduleId: String, courseId: CourseID): (schedule: Schedule)`
`requires` A `Schedule` with `scheduleId` exists. The `Schedule` contains a `ScheduleCourse` with the given `courseId`.
`effects` The `ScheduleCourse` entry matching `courseId` is removed from the `Schedule` identified by `scheduleId`. The updated `Schedule` entity is returned.

`removeCourse(scheduleId: String, courseId: CourseID): (error: String)`
`requires` No `Schedule` with `scheduleId` exists OR the `Schedule` does not contain a `ScheduleCourse` with the given `courseId`.
`effects` Returns an `error` message indicating the reason for failure (e.g., schedule not found or course not in schedule).

`updateCourse(scheduleId: String, courseId: CourseID, updates: {customName: String?, customNote: String?, color: String?}?): (schedule: Schedule)`
`requires` A `Schedule` with `scheduleId` exists. The `Schedule` contains a `ScheduleCourse` with the given `courseId`.
`effects` The specified `updates` (e.g., `customName`, `customNote`, `color`) are applied to the `ScheduleCourse` entry matching `courseId` within the `Schedule` identified by `scheduleId`. The updated `Schedule` entity is returned.

`updateCourse(scheduleId: String, courseId: CourseID, updates: {customName: String?, customNote: String?, color: String?}?): (error: String)`
`requires` No `Schedule` with `scheduleId` exists OR the `Schedule` does not contain a `ScheduleCourse` with the given `courseId`.
`effects` Returns an `error` message indicating the reason for failure (e.g., schedule not found or course not in schedule).
