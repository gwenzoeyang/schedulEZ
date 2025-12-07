---
timestamp: 'Tue Oct 28 2025 15:45:07 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251028_154507.dee3b5eb.md]]'
content_id: 81390fb5fe3855c5fa209145d4e4eb19c69f3ab3d83e992f814df327b22353cf
---

# API Specification: Labeling Concept

**Purpose:** associating labels with items and then retrieving the items that match a given label

***

## API Endpoints

### POST /api/Labeling/createLabel

**Description:** Creates a new label with the given name.

**Requirements:**

* true (Inferred)

**Effects:**

* A new Label is created with the specified name. (Inferred)

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

**Description:** Associates a label with a specific item.

**Requirements:**

* item exists and label exists (Inferred)

**Effects:**

* The specified label is added to the item's set of labels. (Inferred)

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

* item exists and label exists and label is associated with item (Inferred)

**Effects:**

* The specified label is removed from the item's set of labels. (Inferred)

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
