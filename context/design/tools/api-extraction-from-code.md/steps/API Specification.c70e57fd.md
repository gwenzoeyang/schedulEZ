---
timestamp: 'Sun Dec 07 2025 21:30:19 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251207_213019.8cf92c0a.md]]'
content_id: c70e57fd46967fa7ce12e883f54efb2da0bddb55370b59d0c932f601c8e38174
---

# API Specification: CourseCatalog Concept

**Purpose:** Provide a centralized, searchable catalog of courses to enable users to discover and retrieve course details efficiently based on various filtering criteria.

***

## API Endpoints

### POST /api/CourseCatalog/create

**Description:** Establishes a connection to the MongoDB database and initializes the CourseCatalog concept for operation.

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
  "catalog": "object"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/CourseCatalog/close

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

### POST /api/CourseCatalog/getById

**Description:** Retrieves a single course by its unique identifier.

**Requirements:**

* A `Course` with the given `courseID` exists in the catalog.

**Effects:**

* Returns the `Course` object corresponding to the `courseID`.

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

***

### POST /api/CourseCatalog/search

**Description:** Searches courses based on a query string against courseID, title, and instructor, and filters results by instructor, subject, day, time window, and campus.

**Requirements:**

* true

**Effects:**

* Returns a set of `Course` objects that match the text `query` against courseID, title, and instructor, and satisfy the `filters`.

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

***

### POST /api/CourseCatalog/getAll

**Description:** Retrieves all courses from the catalog.

**Requirements:**

* true

**Effects:**

* Returns a set of all `Course` objects in the catalog.

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

***
