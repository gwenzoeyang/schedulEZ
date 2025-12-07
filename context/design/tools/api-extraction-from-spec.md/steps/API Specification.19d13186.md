---
timestamp: 'Mon Nov 03 2025 17:15:21 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251103_171521.ff2e611f.md]]'
content_id: 19d131866bcd5a576b4e6b5fc9c52bcf93bb8e6a7b9c870fb973139bdf8e3f7d
---

# API Specification: Labeling Concept

**Purpose:** Support associating labels with items and retrieving items that match a given label.

***

## API Endpoints

### POST /api/Labeling/createLabel

**Description:** Creates a new label with the specified name.

**Requirements:**

* None explicit.

**Effects:**

* A new `Label` entity is created and associated with the provided `name`.

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

* None explicit.

**Effects:**

* The specified `label` is added to the set of labels for the given `item`.

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

**Description:** Removes a given label from an item.

**Requirements:**

* None explicit.

**Effects:**

* The specified `label` is removed from the set of labels for the given `item`.

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
