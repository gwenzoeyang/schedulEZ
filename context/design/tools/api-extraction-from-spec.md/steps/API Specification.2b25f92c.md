---
timestamp: 'Tue Oct 28 2025 15:47:05 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251028_154705.a9e44bfe.md]]'
content_id: 2b25f92cf9998adf5165aba0ce5483b2a0658f0ec55e6eb794b5264f3380946a
---

# API Specification: CourseCatalog Concept

**Purpose:** maintain a record of courses, their attributes, and their availability across terms

***

## API Endpoints

### POST /api/CourseCatalog/addCourse

**Description:** Adds a new course to the catalog with the given attributes.

**Requirements:**

* course does not exist

**Effects:**

* adds a new course with the given attributes

**Request Body:**

```json
{
  "course": "string",
  "name": "string",
  "description": "string",
  "credits": "number",
  "subject": "string"
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

* course exists and is not offered in any term

**Effects:**

* removes the course

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

### POST /api/CourseCatalog/offerCourse

**Description:** Associates a course with a term, making it available for registration.

**Requirements:**

* course exists and is not already offered in this term

**Effects:**

* associates the course with the term, making it available for registration

**Request Body:**

```json
{
  "course": "string",
  "term": "string"
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

### POST /api/CourseCatalog/unofferCourse

**Description:** Disassociates a course from a term, making it unavailable for registration.

**Requirements:**

* course exists and is offered in this term

**Effects:**

* disassociates the course from the term, making it unavailable for registration

**Request Body:**

```json
{
  "course": "string",
  "term": "string"
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

### POST /api/CourseCatalog/addPrerequisite

**Description:** Adds a prerequisite to the set of prerequisites for a course.

**Requirements:**

* course and prerequisite exist, and prerequisite is not already a prerequisite of course

**Effects:**

* adds prerequisite to the set of prerequisites for course

**Request Body:**

```json
{
  "course": "string",
  "prerequisite": "string"
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

### POST /api/CourseCatalog/removePrerequisite

**Description:** Removes a prerequisite from the set of prerequisites for a course.

**Requirements:**

* course and prerequisite exist, and prerequisite is a prerequisite of course

**Effects:**

* removes prerequisite from the set of prerequisites for course

**Request Body:**

```json
{
  "course": "string",
  "prerequisite": "string"
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

### POST /api/CourseCatalog/\_getCourse

**Description:** Returns the attributes of the specified course.

**Requirements:**

* course exists

**Effects:**

* returns the attributes of the specified course

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
    "name": "string",
    "description": "string",
    "credits": "number",
    "subject": "string",
    "meets": [
      "string"
    ],
    "prerequisites": [
      "string"
    ]
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

### POST /api/CourseCatalog/\_listCourses

**Description:** Returns all courses and their attributes.

**Requirements:**

* true

**Effects:**

* returns all courses and their attributes

**Request Body:**

```json
{}
```

**Success Response Body (Query):**

```json
[
  {
    "courseId": "string",
    "name": "string",
    "description": "string",
    "credits": "number",
    "subject": "string",
    "meets": [
      "string"
    ],
    "prerequisites": [
      "string"
    ]
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

### POST /api/CourseCatalog/\_listOfferedCourses

**Description:** Returns all courses offered in the given term, with name and subject.

**Requirements:**

* term exists

**Effects:**

* returns all courses offered in the given term, with name and subject

**Request Body:**

```json
{
  "term": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "courseId": "string",
    "name": "string",
    "subject": "string"
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
