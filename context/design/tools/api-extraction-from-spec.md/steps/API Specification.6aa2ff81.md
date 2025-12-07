---
timestamp: 'Tue Oct 28 2025 15:36:13 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251028_153613.3ac52ff6.md]]'
content_id: 6aa2ff81a7f5977cfb444469438126318b483903f7edd89d3fc8a3420036abdc
---

# API Specification: Labeling Concept

**Purpose:** Associate and manage labels for various items.

***

## API Endpoints

### POST /api/Labeling/createLabel

**Description:** Creates a new label with the specified name.

**Requirements:**

* A label with the given name does not already exist.

**Effects:**

* A new Label entity is created with the provided name.

**Request Body:**

```json
{
  "name": "String"
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

**Description:** Associates a given label with an item.

**Requirements:**

* The item and label exist.

**Effects:**

* The specified label is associated with the item.

**Request Body:**

```json
{
  "item": "Item",
  "label": "Label"
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

**Description:** Removes an association between a label and an item.

**Requirements:**

* The item and label exist, and the label is currently associated with the item.

**Effects:**

* The specified label is disassociated from the item.

**Request Body:**

```json
{
  "item": "Item",
  "label": "Label"
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
