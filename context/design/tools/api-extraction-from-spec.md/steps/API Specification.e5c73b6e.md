---
timestamp: 'Tue Oct 28 2025 15:36:13 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251028_153613.3ac52ff6.md]]'
content_id: e5c73b6ea8966916e71dc9849de7e0cf54cddc7f9fb6d4820999e5a9768cf466
---

# API Specification: UserProfile Concept

**Purpose:** Store and retrieve profile-specific attributes for users.

***

## API Endpoints

### POST /api/UserProfile/\_getUsername

**Description:** Retrieves the username associated with a given user.

**Requirements:**

* user exists

**Effects:**

* returns username of user

**Request Body:**

```json
{
  "user": "User"
}
```

**Success Response Body (Query):**

```json
[
  {
    "username": "String"
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

### POST /api/UserProfile/\_getPassword

**Description:** Retrieves the password associated with a given user.

**Requirements:**

* user exists

**Effects:**

* returns password of user

**Request Body:**

```json
{
  "user": "User"
}
```

**Success Response Body (Query):**

```json
[
  {
    "password": "String"
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
