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

---
