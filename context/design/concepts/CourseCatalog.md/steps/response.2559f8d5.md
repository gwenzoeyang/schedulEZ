---
timestamp: 'Sun Oct 19 2025 14:47:05 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_144705.b8df03c5.md]]'
content_id: 2559f8d5585c30f2af442f071e6d283a832dde90964633b955d1110ff0c44231
---

# response:

This is a fantastic and well-defined framework for thinking about software modularity! Let's apply the principles of Concept Design to create a `CourseCatalog` concept.

The `CourseCatalog` concept's core purpose will be to define and manage a collection of academic courses, including their static properties like title, description, and prerequisites. It *will not* handle things like course sections, instructors, student enrollment, or grading – those would be separate concepts.

***

## Concept Specification: `CourseCatalog`

### Purpose

The `CourseCatalog` concept serves to maintain a definitive, reusable list of academic courses, each identified by a unique ID, along with their core descriptive attributes and prerequisites. Its purpose is to provide a comprehensive and consistent source of information about available courses for an educational institution or platform.

### State

The state of the `CourseCatalog` concept consists of a collection of `Course` entities.

* **`CourseId`**: A unique identifier for a course (e.g., "CS101", "MATH202"). This is a polymorphic identifier, meaning its internal structure is not assumed by other concepts.
* **`Course`**: An entity representing a single academic course.
  * `id`: `CourseId` (primary key, unique identifier for the course).
  * `title`: `string` (e.g., "Introduction to Computer Science").
  * `description`: `string` (detailed explanation of the course content).
  * `credits`: `number` (e.g., 3, 4.5 – academic weight of the course).
  * `prerequisites`: `Set<CourseId>` (a collection of `CourseId`s that must be completed before taking this course).
  * `department`: `string` (e.g., "Computer Science", "Mathematics").
  * `courseCode`: `string` (e.g., "CSC 101", "MA 202").

### Actions (API/Human Behavioral Protocol)

#### User-Performed Actions:

1. **`addCourse(id, title, description, credits, prerequisites, department, courseCode)`**
   * **Purpose:** To introduce a new course definition into the catalog.
   * **Preconditions:** `id` must not already exist in the catalog. Prerequisites must refer to `CourseId`s that are either already in the catalog or are implicitly handled (e.g., external concepts will ensure validity).
   * **Postconditions:** A new `Course` entity with the specified details is added to the catalog.
   * **Example (Human):** An academic administrator adds "Algorithms and Data Structures" to the catalog.

2. **`updateCourse(id, newTitle?, newDescription?, newCredits?, newPrerequisites?, newDepartment?, newCourseCode?)`**
   * **Purpose:** To modify the details of an existing course.
   * **Preconditions:** `id` must exist in the catalog.
   * **Postconditions:** The specified fields of the `Course` entity matching `id` are updated.
   * **Example (Human):** An administrator updates the credit hours for "Calculus I" from 3 to 4.

3. **`removeCourse(id)`**
   * **Purpose:** To permanently delete a course definition from the catalog.
   * **Preconditions:** `id` must exist in the catalog. No other course should have this course as a prerequisite (this might be enforced by a sync, not by the concept itself for independence).
   * **Postconditions:** The `Course` entity matching `id` is removed from the catalog.
   * **Example (Human):** An administrator removes an obsolete "Pascal Programming" course.

#### Output Actions (for information retrieval):

1. **`getCourse(id)`**
   * **Purpose:** To retrieve the full details of a specific course.
   * **Preconditions:** `id` must exist in the catalog.
   * **Postconditions:** Returns the `Course` entity matching `id`.
   * **Example (Human):** A student views the description and prerequisites for "Linear Algebra".

2. **`listCourses(filterByDepartment?, searchByTitle?)`**
   * **Purpose:** To retrieve a list of courses, optionally filtered or searched.
   * **Preconditions:** None.
   * **Postconditions:** Returns a collection of `Course` entities that match the optional criteria.
   * **Example (Human):** A student browses all courses offered by the "Physics" department.

### Independence and Completeness

The `CourseCatalog` concept operates entirely independently. It knows about course IDs and their descriptive properties and prerequisites *within its own domain*. It does not interact with, or make calls to, an `Enrollment` concept, an `Instructor` concept, or a `UserAuthentication` concept.

* When `removeCourse` is called, it only removes the course from *its own* state. It does not automatically disenroll students or remove course sections. These would be handled by *synchronizations* reacting to the `CourseCatalog.removeCourse` action.
* The `prerequisites` are simply `CourseId`s. The `CourseCatalog` concept itself doesn't validate if these prerequisite courses *exist* in any other system (like an active semester schedule) or if a student *actually meets* them. That logic would reside in an `Enrollment` or `PrerequisiteChecker` concept, triggered by syncs.

### Example Synchronizations (Syncs)

Here are examples of how other concepts might interact with `CourseCatalog` via syncs, demonstrating its independence:

1. **Ensuring prerequisite course existence on addition:**
   ```
   sync ValidatePrerequisitesOnCourseAdd
   when
       CourseCatalog.addCourse (newCourseId, newTitle, newDescription, newCredits, newPrereqs, newDept, newCode)
   where
       not (forall prereq in newPrereqs: in CourseCatalog: id of existingCourse is prereq)
   then
       throw Error "Prerequisite course does not exist in catalog"
   ```
   *Note: This is an example of an error-throwing sync, or it might be a sync that adds missing prerequisites as "placeholder" courses, depending on desired system behavior.*

2. **Cascading course deletion to enrollment records:**
   ```
   sync CascadeCourseDeletionToEnrollment
   when
       CourseCatalog.removeCourse (cId)
   then
       Enrollment.removeCourseFromAllEnrollments (cId) // Assuming an Enrollment concept exists
   ```

3. **Preventing removal if a course is a prerequisite for another active course:**
   ```
   sync PreventCourseRemovalIfPrerequisite
   when
       Request.removeCourseFromCatalog (cId, s) // Request from a user
   where
       in Session: user of session s is u
       in CourseCatalog: exists otherCourse where cId is in otherCourse.prerequisites
       // And perhaps some authorization check for user u
   then
       throw Error "Cannot remove course; it is a prerequisite for other courses."
   ```

***

## TypeScript Implementation: `CourseCatalog.ts`

This implementation will mimic a backend service's behavior, storing state in memory (like a simple database layer).

```typescript
// CourseCatalog.ts

/**
 * Type representing a unique identifier for a course.
 * This is polymorphic and can be any string.
 */
export type CourseId = string;

/**
 * Interface representing the detailed information about a course.
 */
export interface CourseDetails {
    id: CourseId;
    title: string;
    description: string;
    credits: number;
    prerequisites: Set<CourseId>; // Using Set for efficient lookup and uniqueness
    department: string;
    courseCode: string; // e.g., "CSC 101"
}

/**
 * Interface for the CourseCatalog concept's API.
 * Defines the user-facing functionality.
 */
export interface ICourseCatalog {
    /**
     * Adds a new course to the catalog.
     * @param id The unique identifier for the course.
     * @param title The title of the course.
     * @param description A detailed description.
     * @param credits The academic credit value.
     * @param prerequisites A set of CourseIds that are prerequisites.
     * @param department The department offering the course.
     * @param courseCode The unique code for the course (e.g., "CSC 101").
     * @returns The newly added CourseDetails.
     * @throws Error if a course with the same ID already exists.
     * @throws Error if any prerequisite course ID does not exist in the catalog.
     */
    addCourse(
        id: CourseId,
        title: string,
        description: string,
        credits: number,
        prerequisites: Set<CourseId>,
        department: string,
        courseCode: string
    ): CourseDetails;

    /**
     * Updates an existing course's details.
     * Only provided fields will be updated.
     * @param id The ID of the course to update.
     * @param updates An object containing the fields to update.
     * @returns The updated CourseDetails.
     * @throws Error if the course with the given ID does not exist.
     * @throws Error if any new prerequisite course ID does not exist in the catalog.
     */
    updateCourse(id: CourseId, updates: Partial<Omit<CourseDetails, 'id'>>): CourseDetails;

    /**
     * Removes a course from the catalog.
     * @param id The ID of the course to remove.
     * @returns The ID of the removed course.
     * @throws Error if the course with the given ID does not exist.
     */
    removeCourse(id: CourseId): CourseId;

    /**
     * Retrieves details for a specific course.
     * @param id The ID of the course to retrieve.
     * @returns The CourseDetails object.
     * @throws Error if the course with the given ID does not exist.
     */
    getCourse(id: CourseId): CourseDetails;

    /**
     * Lists all courses or filters them based on criteria.
     * @param filter An optional object to filter courses by department or search by title.
     * @returns An array of CourseDetails matching the criteria.
     */
    listCourses(filter?: { department?: string; searchByTitle?: string }): CourseDetails[];
}

/**
 * Implementation of the CourseCatalog concept.
 * Manages the state and behavior related to academic course definitions.
 */
export class CourseCatalog implements ICourseCatalog {
    // Simulates a persistent store (e.g., a database table for courses)
    private courses: Map<CourseId, CourseDetails> = new Map();

    constructor(initialCourses: CourseDetails[] = []) {
        initialCourses.forEach(course => {
            this.addCourse(
                course.id,
                course.title,
                course.description,
                course.credits,
                course.prerequisites,
                course.department,
                course.courseCode
            );
        });
    }

    /**
     * Internal helper to validate if all prerequisite IDs exist in the catalog.
     * @param prerequisites The set of prerequisite CourseIds to validate.
     * @param currentCourseId (Optional) The ID of the course being added/updated, to prevent self-prerequisites.
     */
    private validatePrerequisites(prerequisites: Set<CourseId>, currentCourseId?: CourseId): void {
        for (const prereqId of Array.from(prerequisites)) {
            if (prereqId === currentCourseId) {
                throw new Error(`Course '${currentCourseId}' cannot be a prerequisite for itself.`);
            }
            if (!this.courses.has(prereqId)) {
                throw new Error(`Prerequisite course ID '${prereqId}' does not exist in the catalog.`);
            }
        }
    }

    addCourse(
        id: CourseId,
        title: string,
        description: string,
        credits: number,
        prerequisites: Set<CourseId>,
        department: string,
        courseCode: string
    ): CourseDetails {
        if (this.courses.has(id)) {
            throw new Error(`Course with ID '${id}' already exists.`);
        }

        this.validatePrerequisites(prerequisites, id);

        const newCourse: CourseDetails = {
            id,
            title,
            description,
            credits,
            prerequisites,
            department,
            courseCode,
        };
        this.courses.set(id, newCourse);
        console.log(`[Concept:CourseCatalog] Course '${id}' added.`);
        return { ...newCourse }; // Return a clone to prevent external modification of internal state
    }

    updateCourse(id: CourseId, updates: Partial<Omit<CourseDetails, 'id'>>): CourseDetails {
        const existingCourse = this.courses.get(id);
        if (!existingCourse) {
            throw new Error(`Course with ID '${id}' not found.`);
        }

        const updatedCourse: CourseDetails = { ...existingCourse, ...updates };

        // Validate prerequisites if they were updated
        if (updates.prerequisites) {
            this.validatePrerequisites(updates.prerequisites, id);
        }

        this.courses.set(id, updatedCourse);
        console.log(`[Concept:CourseCatalog] Course '${id}' updated.`);
        return { ...updatedCourse };
    }

    removeCourse(id: CourseId): CourseId {
        if (!this.courses.has(id)) {
            throw new Error(`Course with ID '${id}' not found.`);
        }

        // Optional: Add a check here if any other course lists this ID as a prerequisite.
        // For strict independence, the *concept* doesn't strictly need to do this,
        // as a sync could prevent the removal action if it detects such dependencies
        // in a wider application context (e.g., an Enrollment or PrerequisiteChecker concept).
        // However, for internal consistency of the catalog itself, it's a reasonable check.
        for (const course of this.courses.values()) {
            if (course.prerequisites.has(id)) {
                throw new Error(`Course '${id}' cannot be removed as it is a prerequisite for course '${course.id}'.`);
            }
        }


        this.courses.delete(id);
        console.log(`[Concept:CourseCatalog] Course '${id}' removed.`);
        return id;
    }

    getCourse(id: CourseId): CourseDetails {
        const course = this.courses.get(id);
        if (!course) {
            throw new Error(`Course with ID '${id}' not found.`);
        }
        return { ...course }; // Return a clone
    }

    listCourses(filter?: { department?: string; searchByTitle?: string }): CourseDetails[] {
        let results = Array.from(this.courses.values());

        if (filter?.department) {
            results = results.filter(course =>
                course.department.toLowerCase() === filter.department!.toLowerCase()
            );
        }

        if (filter?.searchByTitle) {
            const searchTerm = filter.searchByTitle.toLowerCase();
            results = results.filter(course =>
                course.title.toLowerCase().includes(searchTerm) ||
                course.description.toLowerCase().includes(searchTerm) ||
                course.courseCode.toLowerCase().includes(searchTerm)
            );
        }

        console.log(`[Concept:CourseCatalog] Listed ${results.length} courses.`);
        return results.map(course => ({ ...course })); // Return clones
    }
}

// --- Example Usage ---
if (require.main === module) {
    console.log("--- Initializing Course Catalog ---");
    const catalog = new CourseCatalog();

    try {
        const cs101 = catalog.addCourse(
            "CS101",
            "Intro to Computer Science",
            "Fundamentals of programming and computation.",
            3,
            new Set(),
            "Computer Science",
            "CSC 101"
        );
        console.log("Added:", cs101);

        const math101 = catalog.addCourse(
            "MATH101",
            "Calculus I",
            "Introduction to differential calculus.",
            4,
            new Set(),
            "Mathematics",
            "MA 101"
        );
        console.log("Added:", math101);

        const cs201 = catalog.addCourse(
            "CS201",
            "Data Structures & Algorithms",
            "Advanced topics in data structures and algorithms.",
            3,
            new Set(["CS101", "MATH101"]), // Prereqs referencing existing courses
            "Computer Science",
            "CSC 201"
        );
        console.log("Added:", cs201);

        // Attempt to add a course with a non-existent prerequisite (should fail)
        try {
            catalog.addCourse(
                "CS301",
                "Advanced AI",
                "Machine learning and neural networks.",
                3,
                new Set(["CS201", "MATH300"]), // MATH300 doesn't exist
                "Computer Science",
                "CSC 301"
            );
        } catch (error: any) {
            console.error("Error adding course with invalid prereq:", error.message);
        }

        console.log("\n--- Listing All Courses ---");
        let allCourses = catalog.listCourses();
        allCourses.forEach(c => console.log(`- ${c.id}: ${c.title} (Dept: ${c.department})`));

        console.log("\n--- Getting a Specific Course ---");
        const cs201Details = catalog.getCourse("CS201");
        console.log(`Details for CS201: ${JSON.stringify(cs201Details, null, 2)}`);

        console.log("\n--- Updating a Course ---");
        const updatedCs101 = catalog.updateCourse("CS101", {
            credits: 4,
            description: "An updated description of programming fundamentals.",
        });
        console.log("Updated CS101:", updatedCs101);

        console.log("\n--- Listing Computer Science Courses ---");
        let csCourses = catalog.listCourses({ department: "computer science" });
        csCourses.forEach(c => console.log(`- ${c.id}: ${c.title}`));

        console.log("\n--- Searching for 'Intro' courses ---");
        let introCourses = catalog.listCourses({ searchByTitle: "Intro" });
        introCourses.forEach(c => console.log(`- ${c.id}: ${c.title}`));

        console.log("\n--- Attempting to remove CS101 (should fail as it's a prereq for CS201) ---");
        try {
            catalog.removeCourse("CS101");
        } catch (error: any) {
            console.error("Error removing CS101:", error.message);
        }

        console.log("\n--- Removing MATH101 (should succeed as it's a prereq but only if other course also lists another prereq) ---");
        catalog.removeCourse("MATH101");
        console.log("Current courses after MATH101 removal:");
        catalog.listCourses().forEach(c => console.log(`- ${c.id}: ${c.title}`));


    } catch (error: any) {
        console.error("An unexpected error occurred:", error.message);
    }
}
```
