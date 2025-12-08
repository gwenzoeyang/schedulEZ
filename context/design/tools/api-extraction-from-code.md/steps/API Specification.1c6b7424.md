---
timestamp: 'Sun Dec 07 2025 21:30:19 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251207_213019.8cf92c0a.md]]'
content_id: 1c6b74240348fd719265ac7ae52b7fafbd3ace858a44a4e421f28cda7aa027a6
---

# API Specification: Schedule Concept

**Purpose:** define and manage schedules for various entities like courses or events.

***

## API Endpoints

### POST /api/Schedule/createSchedule

**Description:** Creates a new schedule with specified days, times, and location.

**Requirements:**

* startTime is before endTime and location is not empty

**Effects:**

* creates a new schedule and returns its identifier

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

***

### POST /api/Schedule/updateSchedule

**Description:** Updates the details of an existing schedule.

**Requirements:**

* schedule exists and startTime is before endTime and location is not empty

**Effects:**

* updates the details of the given schedule

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

***

### POST /api/Schedule/deleteSchedule

**Description:** Deletes a schedule.

**Requirements:**

* schedule exists and is not referenced by any other concept

**Effects:**

* removes the schedule

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

***

### POST /api/Schedule/\_getScheduleById

**Description:** Retrieves the full details of a specified schedule.

**Requirements:**

* schedule exists

**Effects:**

* returns the details of the specified schedule

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

***

### POST /api/Schedule/\_findSchedules

**Description:** Finds schedules matching specific criteria.

**Requirements:**

* true

**Effects:**

* returns schedules matching the criteria

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

***
