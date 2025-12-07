---
timestamp: 'Tue Oct 28 2025 15:47:05 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251028_154705.a9e44bfe.md]]'
content_id: 42e53e4a3c15c1bb85779bb975a4c78a23d204892008f7b594701103a6efe0ea
---

# API Specification: CrossRegTravel Concept

**Purpose:** facilitate travel arrangements for students taking courses at other campuses through cross-registration

***

## API Endpoints

### POST /api/CrossRegTravel/enrollInCrossRegCourse

**Description:** Records student's enrollment in a cross-registered course and sets travelRequested to true.

**Requirements:**

* student, homeCampus, hostCampus, course, term exist; student is not already enrolled in this course for this term

**Effects:**

* records student's enrollment in a cross-registered course, sets travelRequested to true

**Request Body:**

```json
{
  "student": "string",
  "homeCampus": "string",
  "hostCampus": "string",
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

### POST /api/CrossRegTravel/approveTravel

**Description:** Sets travelApproved to true and updates travelDetails for an enrolled student's cross-registration.

**Requirements:**

* student is enrolled in the course for the term, travelRequested is true, travelApproved is false

**Effects:**

* sets travelApproved to true and updates travelDetails

**Request Body:**

```json
{
  "student": "string",
  "course": "string",
  "term": "string",
  "details": "string"
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

### POST /api/CrossRegTravel/cancelTravelRequest

**Description:** Cancels a student's travel request for a cross-registered course.

**Requirements:**

* student is enrolled in the course for the term, travelRequested is true

**Effects:**

* sets travelRequested to false, travelApproved to false, and clears travelDetails

**Request Body:**

```json
{
  "student": "string",
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

### POST /api/CrossRegTravel/withdrawFromCrossRegCourse

**Description:** Removes a student's enrollment from a cross-registered course and clears travel related flags.

**Requirements:**

* student is enrolled in the course for the term

**Effects:**

* removes student's enrollment, sets travelRequested to false, travelApproved to false, and clears travelDetails

**Request Body:**

```json
{
  "student": "string",
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

### POST /api/CrossRegTravel/\_getTravelStatus

**Description:** Returns the travel request and approval status, and any approved travel details for a student's course.

**Requirements:**

* student is enrolled in the course for the term

**Effects:**

* returns the travel request and approval status, and any approved travel details

**Request Body:**

```json
{
  "student": "string",
  "course": "string",
  "term": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "travelRequested": "boolean",
    "travelApproved": "boolean",
    "travelDetails": "string"
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

### POST /api/CrossRegTravel/\_listStudentsWithPendingTravel

**Description:** Returns a list of students with cross-registered courses for which travel is requested but not yet approved.

**Requirements:**

* true

**Effects:**

* returns a list of students with cross-registered courses for which travel is requested but not yet approved

**Request Body:**

```json
{}
```

**Success Response Body (Query):**

```json
[
  {
    "studentId": "string",
    "homeCampus": "string",
    "hostCampus": "string",
    "course": "string",
    "term": "string"
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
