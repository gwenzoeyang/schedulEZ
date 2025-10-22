---
timestamp: 'Sun Oct 19 2025 15:05:58 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_150558.de3cc2a5.md]]'
content_id: 2b2b23d80930ded83e4790d7659f6c71500e85f4005227d41a91af5b4be38f23
---

# Concept: CourseCatalog \[Course, Requirement]

## Purpose

Provide authoritative course data (times, locations, instructors, and requirements) for searching and planning across the system.\
Other concepts (such as **Schedule**, **RequirementTracker**, and **CrossRegTravel**) depend on it to ensure consistent and reliable course information.

***

## Principle

* The catalog aggregates courses each term.
* It serves as the *single source of truth* for course data.
* Students and other components query the catalog to discover, filter, and retrieve courses.
* The catalog may be loaded from a database (e.g., MongoDB), but its interface remains stable regardless of the data source.

***

## State

A set of **Course** objects, each with:

* `courseID: String` — authoritative identifier (e.g., `"CS-220-01-FA25"`)
* `title: String` — course title
* `instructor: String` — instructor name
* `meetingTimes: List<TimeSlot>` — each containing `{ day, start, end }`
* `location: String (optional)` — physical or online location
* `requirements: List<List<Requirement>>` — requirement codes satisfied by this course
* `campus: String (optional)` — campus name (e.g., `"Wellesley"`, `"MIT"`)

The catalog maintains:

* `byId: Map(courseID → Course)` for fast lookups
* `all: List<Course>` for sequential searches

***

## Actions

### `load(courses: List<Course>): void`

* **Purpose:** Populate or replace the catalog with a new list of courses (e.g., from MongoDB).
* **Effects:** Clears existing entries and reloads internal state.

### `getById(courseID: String): Course`

* **Requires:** The specified course exists in the catalog.
* **Effects:** Returns the matching course.
* **Throws:** Error if `courseID` is not found.

### `search(query?: String, filters?: CourseFilters): Set<Course>`

* **Effects:** Returns all courses matching the given query and filters.
* **Query Behavior:**
  * If `query` is empty, only filters apply.
  * Otherwise, match if **any** token in the query appears (case-insensitive) in `courseID`, `title`, or `instructor`.
* **Filters:**
  * `instructor`: case-insensitive substring match in instructor name
  * `department`: derived from leading letters of `courseID` (e.g., `"CS"`, `"MATH"`)
  * `day`: includes courses meeting on that day (e.g., `"M"`, `"T"`, `"W"`, `"R"`, `"F"`)
  * `timeWindow`: returns courses with **any** meeting time overlapping the given window `{ start, end }`

### `fromDbRows(rows: List<CourseDB>): CourseCatalog`

* **Purpose:** Adapt MongoDB rows into internal `Course` objects.
* **Effects:** Converts DB rows (with string-based meetingTimes) into structured `Course` objects with parsed `TimeSlot`s.

***

## Invariants

* Every `Course` in `byId` also appears in `all`.
* Each `courseID` is unique within the catalog.
* TimeSlot start and end are formatted `"HH:MM"` 24-hour style.
* The catalog’s methods are pure lookups and transformations; they do not mutate underlying course data beyond `load()`.

***

## Summary

The `CourseCatalog` concept provides a unified, queryable representation of all course offerings, equipped with rich filtering and lookup capabilities. Its design cleanly separates storage (e.g., MongoDB) from logic, ensuring that other concepts can rely on it without depending on specific database details.
