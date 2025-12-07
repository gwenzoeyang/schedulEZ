[@concept-specifications](../background/concept-specifications.md)
# Concept API extraction

You are an expert software architect tasked with generating clear, developer-friendly API documentation. Your input is a formal "Concept Specification" which describes a modular piece of software functionality. This concept has been implemented and exposed as a REST-like API by a "Concept Server."

Your mission is to translate the provided Concept Specification into a structured API specification document written in Markdown. This document will be used by frontend developers to interact with the API.

Adhere to the following rules for the API structure and the documentation format:

**API Structure Rules:**

1.  **Base URL:** Assume a base URL of `/api`.
2.  **Endpoint Naming:** Each concept action or query maps to an endpoint. The URL structure is: `/{conceptName}/{actionOrQueryName}`.
    *   For a concept named `Labeling` and an action `createLabel`, the endpoint is `/api/Labeling/createLabel`.
3.  **HTTP Method:** All endpoints use the `POST` method.
4.  **Data Format:** All requests and responses use the `application/json` content type.
5.  **Request Body:** The request body is always a single JSON object. The keys of this object correspond to the input arguments defined in the action's signature.
6.  **Response Body:**
    *   **Actions:** A successful call to an action returns a single JSON object. The keys correspond to the results defined in the action's signature. If there are no results, an empty object `{}` is returned.
    *   **Queries:** A successful call to a query (a method name starting with `_`) returns a JSON **array** of objects.
    *   **Errors:** If an action fails to meet its `requires` condition or encounters another error, it returns a single JSON object with a single key: `{ "error": "A descriptive error message." }`.

**Documentation Format Rules:**

Generate the output in Markdown using the following template. For each action and query in the specification, create a dedicated endpoint section.

~~~markdown
# API Specification: {Concept Name} Concept

**Purpose:** {The concept's purpose.}

---

## API Endpoints

### POST /api/{conceptName}/{actionName}

**Description:** {A brief, one-sentence description of what this action does.}

**Requirements:**
- {List each point from the 'requires' section of the specification.}

**Effects:**
- {List each point from the 'effects' section of the specification.}

**Request Body:**
```json
{
  "argument1": "{type}",
  "argument2": "{type}"
}
```

**Success Response Body (Action):**
```json
{
  "result1": "{type}",
  "result2": "{type}"
}
```

**Success Response Body (Query):**
```json
[
  {
    "result1": "{type}",
    "result2": "{type}"
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
*(Repeat for each action and query)*
~~~

# prompt:

Now, analyze the following Concept Specification and generate the API documentation based on these instructions.

Base your API off these files:
[CourseCatalog](../concepts/CourseCatalog.md)
[Schedule](../concepts/Schedule.md)
[CrossRegTravel](../concepts/CrossRegTravel.md)


# response:

Here is the API documentation for the provided Concept Specifications.

---

# API Specification: CourseCatalog Concept

**Purpose:** allow a user to discover courses

---

## API Endpoints

### POST /api/CourseCatalog/addCourse

**Description:** Adds a new course to the catalog with specified details.

**Requirements:**
- true

**Effects:**
- adds a new course to the catalog

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

---

### POST /api/CourseCatalog/updateCourseDetails

**Description:** Updates the details of an existing course in the catalog.

**Requirements:**
- course exists

**Effects:**
- updates the details of the given course

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

---

### POST /api/CourseCatalog/removeCourse

**Description:** Removes a course from the catalog.

**Requirements:**
- course exists and is not referenced by any other course as a prerequisite or corequisite

**Effects:**
- removes the course from the catalog

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

---

### POST /api/CourseCatalog/_getAllCourses

**Description:** Retrieves all courses currently in the catalog.

**Requirements:**
- true

**Effects:**
- returns all courses in the catalog

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

---

### POST /api/CourseCatalog/_getCourseByCode

**Description:** Retrieves a specific course by its unique code.

**Requirements:**
- course with code exists

**Effects:**
- returns the course with the given code

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

---

### POST /api/CourseCatalog/_searchCourses

**Description:** Searches for courses whose name or description match a given query string.

**Requirements:**
- true

**Effects:**
- returns courses whose name or description match the query

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

---

### POST /api/CourseCatalog/_getCoursePrerequisites

**Description:** Retrieves all prerequisites for a given course.

**Requirements:**
- course exists

**Effects:**
- returns all prerequisites for the given course

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

---

### POST /api/CourseCatalog/_getCourseCorequisites

**Description:** Retrieves all corequisites for a given course.

**Requirements:**
- course exists

**Effects:**
- returns all corequisites for the given course

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

---

# API Specification: Schedule Concept

**Purpose:** define and manage schedules for various entities like courses or events.

---

## API Endpoints

### POST /api/Schedule/createSchedule

**Description:** Creates a new schedule with specified days, times, and location.

**Requirements:**
- startTime is before endTime and location is not empty

**Effects:**
- creates a new schedule and returns its identifier

**Request Body:**
```json
{
  "daysOfWeek": "array<string>",
  "startTime": "string",
  "endTime": "string",
  "location": "string"
}
```

**Success Response Body (Action):**
```json
{
  "schedule": "string"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Schedule/updateSchedule

**Description:** Updates the details of an existing schedule.

**Requirements:**
- schedule exists and startTime is before endTime and location is not empty

**Effects:**
- updates the details of the given schedule

**Request Body:**
```json
{
  "schedule": "string",
  "daysOfWeek": "array<string>",
  "startTime": "string",
  "endTime": "string",
  "location": "string"
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

---

### POST /api/Schedule/deleteSchedule

**Description:** Deletes a schedule.

**Requirements:**
- schedule exists and is not referenced by any other concept

**Effects:**
- removes the schedule

**Request Body:**
```json
{
  "schedule": "string"
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

---

### POST /api/Schedule/_getScheduleById

**Description:** Retrieves the full details of a specified schedule.

**Requirements:**
- schedule exists

**Effects:**
- returns the details of the specified schedule

**Request Body:**
```json
{
  "schedule": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "daysOfWeek": "array<string>",
    "startTime": "string",
    "endTime": "string",
    "location": "string"
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

### POST /api/Schedule/_findSchedules

**Description:** Finds schedules matching specific criteria.

**Requirements:**
- true

**Effects:**
- returns schedules matching the criteria

**Request Body:**
```json
{
  "daysOfWeek": "array<string>",
  "startTime": "string",
  "endTime": "string",
  "location": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "schedule": "string"
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

**Purpose:** manage travel arrangements for cross-registered students.

---

## API Endpoints

### POST /api/CrossRegTravel/requestTravel

**Description:** Creates a new travel request for a student attending a cross-registered course.

**Requirements:**
- student and course exist, travelDate is in the future, pickupLocation and dropoffLocation are valid

**Effects:**
- creates a new travel request for the student and course, sets status to 'Pending'

**Request Body:**
```json
{
  "student": "string",
  "course": "string",
  "travelDate": "string",
  "pickupLocation": "string",
  "dropoffLocation": "string"
}
```

**Success Response Body (Action):**
```json
{
  "requestId": "string"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/CrossRegTravel/approveTravel

**Description:** Approves a pending student travel request.

**Requirements:**
- requestId exists, status is 'Pending'

**Effects:**
- updates status to 'Approved'

**Request Body:**
```json
{
  "requestId": "string"
}
```

**Success Response Body (Action):**
```json
{
  "success": "boolean"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/CrossRegTravel/denyTravel

**Description:** Denies a pending student travel request with a reason.

**Requirements:**
- requestId exists, status is 'Pending'

**Effects:**
- updates status to 'Denied', records reason

**Request Body:**
```json
{
  "requestId": "string",
  "reason": "string"
}
```

**Success Response Body (Action):**
```json
{
  "success": "boolean"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/CrossRegTravel/cancelTravel

**Description:** Cancels a student travel request that is pending or approved.

**Requirements:**
- requestId exists, status is 'Pending' or 'Approved'

**Effects:**
- updates status to 'Cancelled'

**Request Body:**
```json
{
  "requestId": "string"
}
```

**Success Response Body (Action):**
```json
{
  "success": "boolean"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/CrossRegTravel/_getTravelRequestStatus

**Description:** Retrieves the status and full details of a specific travel request.

**Requirements:**
- requestId exists

**Effects:**
- returns the status and full details of the travel request

**Request Body:**
```json
{
  "requestId": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "status": "string",
    "student": "string",
    "course": "string",
    "travelDate": "string",
    "pickupLocation": "string",
    "dropoffLocation": "string",
    "reason": "string"
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

### POST /api/CrossRegTravel/_getStudentTravelRequests

**Description:** Retrieves all travel requests associated with a particular student.

**Requirements:**
- student exists

**Effects:**
- returns all travel requests for the given student

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
    "requestId": "string"
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

### POST /api/CrossRegTravel/_getCourseTravelRequests

**Description:** Retrieves all travel requests associated with a particular course.

**Requirements:**
- course exists

**Effects:**
- returns all travel requests for the given course

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
    "requestId": "string"
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