[@api-extraction-from-spec](api-extraction-from-spec.md)

# Extracting from code

The following is an explanation of how concepts are implemented, for the purposes of understanding how to extract an API.

[@implementing-concepts](../background/implementing-concepts.md)

# prompt: 

Now, analyze the following Concept Implementation and generate the API documentation based on these instructions.
# response:

Here is the API documentation for the `CourseCatalog`, `CrossRegTravel`, and `Schedule` concepts, based on the provided concept specifications and API documentation rules.

---

# API Specification: CourseCatalog Concept

**Purpose:** Provide a centralized, searchable catalog of courses to enable users to discover and retrieve course details efficiently based on various filtering criteria.

---

## API Endpoints

### POST /api/CourseCatalog/create

**Description:** Establishes a connection to the MongoDB database and initializes the CourseCatalog concept for operation.

**Requirements:**
- `mongoUrl` is a valid MongoDB connection string.

**Effects:**
- A connection to the specified MongoDB instance and collection is established, initializing the concept for operation.

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
  "catalog": "object"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---
### POST /api/CourseCatalog/close

**Description:** Terminates the connection to the MongoDB database.

**Requirements:**
- The concept is currently connected to the database.

**Effects:**
- The connection to the MongoDB database is terminated.

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

---
### POST /api/CourseCatalog/getById

**Description:** Retrieves a single course by its unique identifier.

**Requirements:**
- A `Course` with the given `courseID` exists in the catalog.

**Effects:**
- Returns the `Course` object corresponding to the `courseID`.

**Request Body:**
```json
{
  "courseID": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "courseID": "string",
    "title": "string",
    "instructor": "string",
    "DBmeetingTimes": "string | array<string>",
    "meetingTimes": [
      {
        "day": "string",
        "start": "string",
        "end": "string"
      }
    ],
    "location": "string",
    "subject": "string",
    "campus": "string",
    "rmp": "string",
    "description": "string"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---
### POST /api/CourseCatalog/search

**Description:** Searches courses based on a query string against courseID, title, and instructor, and filters results by instructor, subject, day, time window, and campus.

**Requirements:**
- true

**Effects:**
- Returns a set of `Course` objects that match the text `query` against courseID, title, and instructor, and satisfy the `filters`.

**Request Body:**
```json
{
  "query": "string",
  "filters": {
    "instructor": "string",
    "subject": "string",
    "day": "string",
    "timeWindow": {
      "day": "string",
      "start": "string",
      "end": "string"
    },
    "campus": "string"
  }
}
```

**Success Response Body (Query):**
```json
[
  {
    "courseID": "string",
    "title": "string",
    "instructor": "string",
    "DBmeetingTimes": "string | array<string>",
    "meetingTimes": [
      {
        "day": "string",
        "start": "string",
        "end": "string"
      }
    ],
    "location": "string",
    "subject": "string",
    "campus": "string",
    "rmp": "string",
    "description": "string"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---
### POST /api/CourseCatalog/getAll

**Description:** Retrieves all courses from the catalog.

**Requirements:**
- true

**Effects:**
- Returns a set of all `Course` objects in the catalog.

**Request Body:**
```json
{}
```

**Success Response Body (Query):**
```json
[
  {
    "courseID": "string",
    "title": "string",
    "instructor": "string",
    "DBmeetingTimes": "string | array<string>",
    "meetingTimes": [
      {
        "day": "string",
        "start": "string",
        "end": "string"
      }
    ],
    "location": "string",
    "subject": "string",
    "campus": "string",
    "rmp": "string",
    "description": "string"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

# API Specification: CrossRegTravel Concept

**Purpose:** Manage the submission, tracking, and administration of travel requests for cross-registered students.

---

## API Endpoints

### POST /api/CrossRegTravel/create

**Description:** Establishes a connection to the MongoDB database and initializes the CrossRegTravel concept for operation.

**Requirements:**
- `mongoUrl` is a valid MongoDB connection string.

**Effects:**
- A connection to the specified MongoDB instance and collection is established, initializing the concept for operation.

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
  "crossRegTravel": "object"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---
### POST /api/CrossRegTravel/submitRequest

**Description:** Creates a new travel request for a cross-registered student and course.

**Requirements:**
- `studentID` and `courseID` refer to existing entities; `departureTime` and `returnTime` are valid ISO 8601 timestamps, with `departureTime` before `returnTime`.

**Effects:**
- A new `TravelRequest` is created with a unique `requestID`, status "pending", and `submittedAt`/`lastUpdatedAt` set to the current time. The new request is added to the set of `TravelRequests`.

**Request Body:**
```json
{
  "studentID": "string",
  "courseID": "string",
  "departureTime": "string",
  "returnTime": "string",
  "reason": "string"
}
```

**Success Response Body (Action):**
```json
{
  "travelRequest": {
    "requestID": "string",
    "student": "string",
    "course": "string",
    "departureTime": "string",
    "returnTime": "string",
    "status": "string",
    "reason": "string",
    "adminNotes": "string",
    "submittedAt": "string",
    "lastUpdatedAt": "string"
  }
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---
### POST /api/CrossRegTravel/updateStatus

**Description:** Updates the status of an existing travel request, optionally adding administrator notes.

**Requirements:**
- A `TravelRequest` with the given `requestID` exists. `newStatus` is one of "approved", "rejected", or "canceled".

**Effects:**
- The `status` of the specified `TravelRequest` is updated to `newStatus`, `adminNotes` are applied if provided, and `lastUpdatedAt` is set to the current time.

**Request Body:**
```json
{
  "requestID": "string",
  "newStatus": "string",
  "adminNotes": "string"
}
```

**Success Response Body (Action):**
```json
{
  "travelRequest": {
    "requestID": "string",
    "student": "string",
    "course": "string",
    "departureTime": "string",
    "returnTime": "string",
    "status": "string",
    "reason": "string",
    "adminNotes": "string",
    "submittedAt": "string",
    "lastUpdatedAt": "string"
  }
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---
### POST /api/CrossRegTravel/close

**Description:** Terminates the connection to the MongoDB database.

**Requirements:**
- The concept is currently connected to the database.

**Effects:**
- The connection to the MongoDB database is terminated.

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

---
### POST /api/CrossRegTravel/getById

**Description:** Retrieves a specific travel request by its unique identifier.

**Requirements:**
- A `TravelRequest` with the given `requestID` exists.

**Effects:**
- Returns the `TravelRequest` object identified by `requestID`.

**Request Body:**
```json
{
  "requestID": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "requestID": "string",
    "student": "string",
    "course": "string",
    "departureTime": "string",
    "returnTime": "string",
    "status": "string",
    "reason": "string",
    "adminNotes": "string",
    "submittedAt": "string",
    "lastUpdatedAt": "string"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---
### POST /api/CrossRegTravel/getRequests

**Description:** Retrieves a set of travel requests that match specified filters.

**Requirements:**
- true

**Effects:**
- Returns a set of `TravelRequest` objects that match the specified `filters`.

**Request Body:**
```json
{
  "filters": {
    "studentID": "string",
    "courseID": "string",
    "status": "string",
    "departureDate": "string",
    "returnDate": "string"
  }
}
```

**Success Response Body (Query):**
```json
[
  {
    "requestID": "string",
    "student": "string",
    "course": "string",
    "departureTime": "string",
    "returnTime": "string",
    "status": "string",
    "reason": "string",
    "adminNotes": "string",
    "submittedAt": "string",
    "lastUpdatedAt": "string"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

# API Specification: Schedule Concept

**Purpose:** Provide students with the ability to manage their course enrollments and maintain their academic schedule, including tracking status and cross-registration.

---

## API Endpoints

### POST /api/Schedule/create

**Description:** Establishes a connection to the MongoDB database and initializes the Schedule concept for operation.

**Requirements:**
- `mongoUrl` is a valid MongoDB connection string.

**Effects:**
- A connection to the specified MongoDB instance and collection is established, initializing the concept for operation.

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

---
### POST /api/Schedule/addCourse

**Description:** Adds a new course enrollment to a student's schedule.

**Requirements:**
- `studentID` and `courseID` refer to existing entities; `term` is a valid academic term.

**Effects:**
- A new `ScheduleEntry` is created with a unique `entryID`, status "active", `enrolledAt` set to the current time, and other provided details. The new entry is added to the set of `ScheduleEntries`.

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

---
### POST /api/Schedule/updateScheduleEntry

**Description:** Updates specific details of an existing schedule entry.

**Requirements:**
- A `ScheduleEntry` with the given `entryID` exists.

**Effects:**
- The specified `updates` are applied to the `ScheduleEntry`. If the `status` changes to "dropped" and `droppedAt` is not already set, `droppedAt` is set to the current time. If the `status` changes from "dropped", `droppedAt` is cleared.

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

---
### POST /api/Schedule/close

**Description:** Terminates the connection to the MongoDB database.

**Requirements:**
- The concept is currently connected to the database.

**Effects:**
- The connection to the MongoDB database is terminated.

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

---
### POST /api/Schedule/getById

**Description:** Retrieves a specific schedule entry by its unique identifier.

**Requirements:**
- A `ScheduleEntry` with the given `entryID` exists.

**Effects:**
- Returns the `ScheduleEntry` object identified by `entryID`.

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

---
### POST /api/Schedule/getSchedule

**Description:** Retrieves a set of schedule entries that match specified filters.

**Requirements:**
- true

**Effects:**
- Returns a set of `ScheduleEntry` objects that match the specified `filters`.

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