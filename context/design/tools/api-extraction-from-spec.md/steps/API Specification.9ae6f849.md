---
timestamp: 'Mon Nov 03 2025 17:18:58 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251103_171858.aa49cf90.md]]'
content_id: 9ae6f8493040dde973ea31a054f487931db599a4c7a5b69c79caa233ef513eef
---

# API Specification: CourseCatalog Concept

**Purpose:** allow a user to discover courses

***

## API Endpoints

### POST /api/CourseCatalog/addCourse

**Description:** Adds a new course to the catalog with specified details.

**Requirements:**

* true

**Effects:**

* adds a new course to the catalog

**Request Body:**

```json
{
  "name": "string",
  "code": "string",
  "description": "string",
  "creditHours": "number",
  "campus": "string",
  "schedule": "string",
  "prerequisites": "array<string>",
  "corequisites": "array<string>"
}
```

**Success Response Body (Action):**

```json
{
  "course": "string"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/CourseCatalog/updateCourseDetails

**Description:** Updates the details of an existing course in the catalog.

**Requirements:**

* course exists

**Effects:**

* updates the details of the given course

**Request Body:**

```json
{
  "course": "string",
  "name": "string",
  "code": "string",
  "description": "string",
  "creditHours": "number",
  "campus": "string",
  "schedule": "string",
  "prerequisites": "array<string>",
  "corequisites": "array<string>"
}
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

### POST /api/CourseCatalog/removeCourse

**Description:** Removes a course from the catalog.

**Requirements:**

* course exists and is not referenced by any other course as a prerequisite or corequisite

**Effects:**

* removes the course from the catalog

**Request Body:**

```json
{
  "course": "string"
}
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

### POST /api/CourseCatalog/\_getAllCourses

**Description:** Retrieves all courses currently in the catalog.

**Requirements:**

* true

**Effects:**

* returns all courses in the catalog

**Request Body:**

```json
{}
```

**Success Response Body (Query):**

```json
[
  {
    "course": "string"
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

### POST /api/CourseCatalog/\_getCourseByCode

**Description:** Retrieves a specific course by its unique code.

**Requirements:**

* course with code exists

**Effects:**

* returns the course with the given code

**Request Body:**

```json
{
  "code": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "course": "string"
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

### POST /api/CourseCatalog/\_searchCourses

**Description:** Searches for courses whose name or description match a given query string.

**Requirements:**

* true

**Effects:**

* returns courses whose name or description match the query

**Request Body:**

```json
{
  "query": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "course": "string"
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

### POST /api/CourseCatalog/\_getCoursePrerequisites

**Description:** Retrieves all prerequisites for a given course.

**Requirements:**

* course exists

**Effects:**

* returns all prerequisites for the given course

**Request Body:**

```json
{
  "course": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "prerequisite": "string"
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

### POST /api/CourseCatalog/\_getCourseCorequisites

**Description:** Retrieves all corequisites for a given course.

**Requirements:**

* course exists

**Effects:**

* returns all corequisites for the given course

**Request Body:**

```json
{
  "course": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "corequisite": "string"
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
