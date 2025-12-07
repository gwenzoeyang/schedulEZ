---
timestamp: 'Tue Oct 28 2025 15:47:05 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251028_154705.a9e44bfe.md]]'
content_id: 348d65c97e9817db422ac5f38e719f17620820d598581bec9a09aca51e4725ce
---

# API Specification: RequirementTracker Concept

**Purpose:** track a student's progress towards fulfilling academic requirements by mapping courses to requirements

***

## API Endpoints

### POST /api/RequirementTracker/recordCourseCompletion

**Description:** Adds a course to a student's completed courses; if any requirement becomes fulfilled by this, it is recorded.

**Requirements:**

* student and course exist; student has not already completed this course

**Effects:**

* adds course to student's completed courses; if any requirement becomes fulfilled by this, it is recorded

**Request Body:**

```json
{
  "student": "string",
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

### POST /api/RequirementTracker/removeCourseCompletion

**Description:** Removes a course from a student's completed courses; if any requirement becomes unfulfilled by this, it is recorded.

**Requirements:**

* student and course exist; student has completed this course

**Effects:**

* removes course from student's completed courses; if any requirement becomes unfulfilled by this, it is recorded

**Request Body:**

```json
{
  "student": "string",
  "course": "string"
}
```

\*\*Success Response Body (Action):

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

### POST /api/RequirementTracker/defineRequirement

**Description:** Defines a new academic requirement with specified courses and credits.

**Requirements:**

* requirement does not exist; all courses in requiredCourses exist

**Effects:**

* defines a new academic requirement with specified courses and credits

**Request Body:**

```json
{
  "requirement": "string",
  "requiredCourses": [
    "string"
  ],
  "requiredCredits": "number"
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

### POST /api/RequirementTracker/updateRequirement

**Description:** Updates an existing academic requirement with new courses and credits.

**Requirements:**

* requirement exists; all courses in requiredCourses exist

**Effects:**

* updates an existing academic requirement with new courses and credits

**Request Body:**

```json
{
  "requirement": "string",
  "requiredCourses": [
    "string"
  ],
  "requiredCredits": "number"
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

### POST /api/RequirementTracker/\_getStudentProgress

**Description:** Returns the courses completed by the student and the requirements they have fulfilled.

**Requirements:**

* student exists

**Effects:**

* returns the courses completed by the student and the requirements they have fulfilled

**Request Body:**

```json
{
  "student": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "completedCourses": [
      "string"
    ],
    "fulfilledRequirements": [
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

### POST /api/RequirementTracker/\_getRequirementDetails

**Description:** Returns the details of a specific requirement.

**Requirements:**

* requirement exists

**Effects:**

* returns the details of a specific requirement

**Request Body:**

```json
{
  "requirement": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "requiredCourses": [
      "string"
    ],
    "requiredCredits": "number"
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
