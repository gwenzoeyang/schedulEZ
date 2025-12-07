---
timestamp: 'Tue Oct 28 2025 15:47:05 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251028_154705.a9e44bfe.md]]'
content_id: 3352ea2bc505c7890a43432e8fbe8b3df410d3c0bc422e4870f767c58dd37e6a
---

# API Specification: Schedule Concept

**Purpose:** manage the assignment of courses to rooms and time slots, and allow users to view course schedules

***

## API Endpoints

### POST /api/Schedule/assignCourse

**Description:** Assigns the course to the specified room and time slot.

**Requirements:**

* course, room, timeSlot exist; room has sufficient capacity for course (implicitly handled elsewhere or assumed); time slot is not already occupied by another course in that room

**Effects:**

* assigns the course to the specified room and time slot

**Request Body:**

```json
{
  "course": "string",
  "room": "string",
  "timeSlot": "string"
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

### POST /api/Schedule/unassignCourse

**Description:** Removes the assignment of the course from its room and time slot.

**Requirements:**

* course exists and is assigned to a room and time slot

**Effects:**

* removes the assignment of the course from its room and time slot

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

### POST /api/Schedule/addRoom

**Description:** Adds a new room with specified capacity.

**Requirements:**

* room does not exist and capacity is positive

**Effects:**

* adds a new room with specified capacity

**Request Body:**

```json
{
  "room": "string",
  "capacity": "number"
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

### POST /api/Schedule/removeRoom

**Description:** Removes the room.

**Requirements:**

* room exists and is not assigned to any course

**Effects:**

* removes the room

**Request Body:**

```json
{
  "room": "string"
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

### POST /api/Schedule/addTimeSlot

**Description:** Adds a new time slot with specified details.

**Requirements:**

* timeSlot does not exist; startTime is before endTime

**Effects:**

* adds a new time slot with specified details

**Request Body:**

```json
{
  "timeSlot": "string",
  "dayOfWeek": "string",
  "startTime": "string",
  "endTime": "string"
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

### POST /api/Schedule/removeTimeSlot

**Description:** Removes the time slot.

**Requirements:**

* timeSlot exists and is not assigned to any course

**Effects:**

* removes the time slot

**Request Body:**

```json
{
  "timeSlot": "string"
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

### POST /api/Schedule/\_getCourseSchedule

**Description:** Returns the assigned room and time slot details for the course.

**Requirements:**

* course exists and is assigned to a room and time slot

**Effects:**

* returns the assigned room and time slot details for the course

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
    "room": "string",
    "timeSlot": "string",
    "dayOfWeek": "string",
    "startTime": "string",
    "endTime": "string"
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

### POST /api/Schedule/\_getRoomAvailability

**Description:** Returns the set of time slots when the room is not occupied.

**Requirements:**

* room exists

**Effects:**

* returns the set of time slots when the room is not occupied

**Request Body:**

```json
{
  "room": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "availableTimeSlots": [
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

### POST /api/Schedule/\_getTimeSlotDetails

**Description:** Returns the day of week, start time, and end time for the specified time slot.

**Requirements:**

* timeSlot exists

**Effects:**

* returns the day of week, start time, and end time for the specified time slot

**Request Body:**

```json
{
  "timeSlot": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "dayOfWeek": "string",
    "startTime": "string",
    "endTime": "string"
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
