---
timestamp: 'Tue Oct 28 2025 15:25:30 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251028_152530.81e66786.md]]'
content_id: ad5674a772378ac6a6af76869c2a15104e5cafc0830025e8ed057881f7737a29
---

# API Specification: Counter Concept

**Purpose:** count the number of occurrences of something

***

## API Endpoints

### POST /api/Counter/increment

**Description:** Increases the counter's value by one.

**Requirements:**

* Always

**Effects:**

* The concept's `count` state variable is incremented by 1.

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

### POST /api/Counter/decrement

**Description:** Decreases the counter's value by one, if the current count is greater than zero.

**Requirements:**

* The `count` must be greater than 0.

**Effects:**

* The concept's `count` state variable is decremented by 1.

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

### POST /api/Counter/reset

**Description:** Resets the counter's value to zero.

**Requirements:**

* Always

**Effects:**

* The concept's `count` state variable is set to 0.

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
