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