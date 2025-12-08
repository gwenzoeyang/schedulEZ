---
timestamp: 'Sun Dec 07 2025 21:30:19 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251207_213019.8cf92c0a.md]]'
content_id: e83dacb40754ba5f250d82e7ff3f92c4aa3386a33748ba59e5f2db5160e3f756
---

# API Specification: CrossRegTravel Concept

**Purpose:** Manage the submission, tracking, and administration of travel requests for cross-registered students.

***

## API Endpoints

### POST /api/CrossRegTravel/create

**Description:** Establishes a connection to the MongoDB database and initializes the CrossRegTravel concept for operation.

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
  "crossRegTravel": "object"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/CrossRegTravel/submitRequest

**Description:** Creates a new travel request for a cross-registered student and course.

**Requirements:**

* `studentID` and `courseID` refer to existing entities; `departureTime` and `returnTime` are valid ISO 8601 timestamps, with `departureTime` before `returnTime`.

**Effects:**

* A new `TravelRequest` is created with a unique `requestID`, status "pending", and `submittedAt`/`lastUpdatedAt` set to the current time. The new request is added to the set of `TravelRequests`.

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

***

### POST /api/CrossRegTravel/updateStatus

**Description:** Updates the status of an existing travel request, optionally adding administrator notes.

**Requirements:**

* A `TravelRequest` with the given `requestID` exists. `newStatus` is one of "approved", "rejected", or "canceled".

**Effects:**

* The `status` of the specified `TravelRequest` is updated to `newStatus`, `adminNotes` are applied if provided, and `lastUpdatedAt` is set to the current time.

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

***

### POST /api/CrossRegTravel/close

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

### POST /api/CrossRegTravel/getById

**Description:** Retrieves a specific travel request by its unique identifier.

**Requirements:**

* A `TravelRequest` with the given `requestID` exists.

**Effects:**

* Returns the `TravelRequest` object identified by `requestID`.

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

***

### POST /api/CrossRegTravel/getRequests

**Description:** Retrieves a set of travel requests that match specified filters.

**Requirements:**

* true

**Effects:**

* Returns a set of `TravelRequest` objects that match the specified `filters`.

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

***
