---
timestamp: 'Sun Dec 07 2025 21:30:19 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251207_213019.8cf92c0a.md]]'
content_id: 0f1324ea6b58bdf393644997c9b1b4ae6b114e30aee4faff726d280eb40b669d
---

# API Specification: Schedule Concept

**Purpose:** Provide students with the ability to manage their course enrollments and maintain their academic schedule, including tracking status and cross-registration.

***

## API Endpoints

### POST /api/Schedule/create

**Description:** Establishes a connection to the MongoDB database and initializes the Schedule concept for operation.

**Requirements:**

* `mongoUrl` is a valid MongoDB connection string.

**Effects:**

* A connection to the specified MongoDB instance and collection is established, initializing the concept for operation.

**Request Body:**

```json
{
  "mongoUrl": "string",
  "dbName": "string",
  "collection": "string"
}
```

**Success Response Body (Action):**

```json
{
  "schedule": "object"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Schedule/addCourse

**Description:** Adds a new course enrollment to a student's schedule.

**Requirements:**

* `studentID` and `courseID` refer to existing entities; `term` is a valid academic term.

**Effects:**

* A new `ScheduleEntry` is created with a unique `entryID`, status "active", `enrolledAt` set to the current time, and other provided details. The new entry is added to the set of `ScheduleEntries`.

**Request Body:**

```json
{
  "studentID": "string",
  "courseID": "string",
  "term": "string",
  "isCrossRegistered": "boolean",
  "sectionID": "string",
  "notes": "string"
}
```

**Success Response Body (Action):**

```json
{
  "scheduleEntry": {
    "entryID": "string",
    "student": "string",
    "course": "string",
    "sectionID": "string",
    "term": "string",
    "isCrossRegistered": "boolean",
    "status": "string",
    "enrolledAt": "string",
    "droppedAt": "string",
    "grade": "string",
    "notes": "string"
  }
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Schedule/updateScheduleEntry

**Description:** Updates specific details of an existing schedule entry.

**Requirements:**

* A `ScheduleEntry` with the given `entryID` exists.

**Effects:**

* The specified `updates` are applied to the `ScheduleEntry`. If the `status` changes to "dropped" and `droppedAt` is not already set, `droppedAt` is set to the current time. If the `status` changes from "dropped", `droppedAt` is cleared.

**Request Body:**

```json
{
  "entryID": "string",
  "updates": {
    "student": "string",
    "course": "string",
    "sectionID": "string",
    "term": "string",
    "isCrossRegistered": "boolean",
    "status": "string",
    "enrolledAt": "string",
    "droppedAt": "string",
    "grade": "string",
    "notes": "string"
  }
}
```

**Success Response Body (Action):**

```json
{
  "scheduleEntry": {
    "entryID": "string",
    "student": "string",
    "course": "string",
    "sectionID": "string",
    "term": "string",
    "isCrossRegistered": "boolean",
    "status": "string",
    "enrolledAt": "string",
    "droppedAt": "string",
    "grade": "string",
    "notes": "string"
  }
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Schedule/close

**Description:** Terminates the connection to the MongoDB database.

**Requirements:**

* The concept is currently connected to the database.

**Effects:**

* The connection to the MongoDB database is terminated.

**Request Body:**

```json
{}
```

**Success Response Body (Action):**

```json
{}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Schedule/getById

**Description:** Retrieves a specific schedule entry by its unique identifier.

**Requirements:**

* A `ScheduleEntry` with the given `entryID` exists.

**Effects:**

* Returns the `ScheduleEntry` object identified by `entryID`.

**Request Body:**

```json
{
  "entryID": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "entryID": "string",
    "student": "string",
    "course": "string",
    "sectionID": "string",
    "term": "string",
    "isCrossRegistered": "boolean",
    "status": "string",
    "enrolledAt": "string",
    "droppedAt": "string",
    "grade": "string",
    "notes": "string"
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Schedule/getSchedule

**Description:** Retrieves a set of schedule entries that match specified filters.

**Requirements:**

* true

**Effects:**

* Returns a set of `ScheduleEntry` objects that match the specified `filters`.

**Request Body:**

```json
{
  "filters": {
    "studentID": "string",
    "courseID": "string",
    "term": "string",
    "status": "string",
    "isCrossRegistered": "boolean"
  }
}
```

**Success Response Body (Query):**

```json
[
  {
    "entryID": "string",
    "student": "string",
    "course": "string",
    "sectionID": "string",
    "term": "string",
    "isCrossRegistered": "boolean",
    "status": "string",
    "enrolledAt": "string",
    "droppedAt": "string",
    "grade": "string",
    "notes": "string"
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```
