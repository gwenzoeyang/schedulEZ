---
timestamp: 'Sun Dec 07 2025 21:30:19 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251207_213019.8cf92c0a.md]]'
content_id: 1889f80793bebb887e7d703745bc4d3dcbd5b0ee86d283d4e54987d7427e18b7
---

# API Specification: CrossRegTravel Concept

**Purpose:** manage travel arrangements for cross-registered students.

***

## API Endpoints

### POST /api/CrossRegTravel/requestTravel

**Description:** Creates a new travel request for a student attending a cross-registered course.

**Requirements:**

* student and course exist, travelDate is in the future, pickupLocation and dropoffLocation are valid

**Effects:**

* creates a new travel request for the student and course, sets status to 'Pending'

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

***

### POST /api/CrossRegTravel/approveTravel

**Description:** Approves a pending student travel request.

**Requirements:**

* requestId exists, status is 'Pending'

**Effects:**

* updates status to 'Approved'

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

***

### POST /api/CrossRegTravel/denyTravel

**Description:** Denies a pending student travel request with a reason.

**Requirements:**

* requestId exists, status is 'Pending'

**Effects:**

* updates status to 'Denied', records reason

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

***

### POST /api/CrossRegTravel/cancelTravel

**Description:** Cancels a student travel request that is pending or approved.

**Requirements:**

* requestId exists, status is 'Pending' or 'Approved'

**Effects:**

* updates status to 'Cancelled'

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

***

### POST /api/CrossRegTravel/\_getTravelRequestStatus

**Description:** Retrieves the status and full details of a specific travel request.

**Requirements:**

* requestId exists

**Effects:**

* returns the status and full details of the travel request

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

***

### POST /api/CrossRegTravel/\_getStudentTravelRequests

**Description:** Retrieves all travel requests associated with a particular student.

**Requirements:**

* student exists

**Effects:**

* returns all travel requests for the given student

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

***

### POST /api/CrossRegTravel/\_getCourseTravelRequests

**Description:** Retrieves all travel requests associated with a particular course.

**Requirements:**

* course exists

**Effects:**

* returns all travel requests for the given course

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

***
