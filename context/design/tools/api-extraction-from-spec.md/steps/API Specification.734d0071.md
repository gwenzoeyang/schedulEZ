---
timestamp: 'Tue Oct 28 2025 15:29:06 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251028_152906.2b334ccc.md]]'
content_id: 734d0071856676e4b5d2cc2fd60dc411a5047a92c7f5c4b8f0af79f64cd9b2c4
---

# API Specification: Labeling Concept

**Purpose:** associate labels with items and then retrieve the items that match a given label.

***

## API Endpoints

### POST /api/Labeling/createLabel

**Description:** Creates a new label with a specified name.

**Requirements:**

* Always

**Effects:**

* A new label is created with the specified name.

**Request Body:**

```json
{
  "name": "string"
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

### POST /api/Labeling/addLabel

**Description:** Associates a given label with a specific item.

**Requirements:**

* Always

**Effects:**

* The specified label is added to the set of labels for the given item.

**Request Body:**

```json
{
  "item": "string",
  "label": "string"
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

### POST /api/Labeling/deleteLabel

**Description:** Removes the association of a given label from a specific item.

**Requirements:**

* Always

**Effects:**

* The specified label is removed from the set of labels for the given item.

**Request Body:**

```json
{
  "item": "string",
  "label": "string"
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
