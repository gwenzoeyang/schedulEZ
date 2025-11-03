// src/CourseCatalog.test.ts
import { load } from "std/dotenv";
await load({ export: true });

import { assert, assertEquals, assertThrows } from "@std/assert";
import { MongoClient } from "npm:mongodb";
import { Course, CourseCatalog } from "./CourseCatalog.ts";

/** ------- Test preconditions ------- */
const hasMongo = (Deno.env.get("MONGODB_URL") ?? "").length > 0;

/**
 * Connect to actual MongoDB and fetch real courses for testing
 */
async function setupMongoCatalog() {
  if (!hasMongo) {
    throw new Error("MONGODB_URL env var is required for CourseCatalog tests.");
  }

  const client = new MongoClient(Deno.env.get("MONGODB_URL")!);
  await client.connect();
  const db = client.db(Deno.env.get("DB_NAME") || "schedulEZ");
  const collectionName = Deno.env.get("COURSES_COLLECTION") || "sample10";

  const col = db.collection(collectionName);
  const courses = await col.find({}).limit(20).toArray();

  if (courses.length === 0) {
    await client.close();
    throw new Error(
      `No courses found in MongoDB collection "${collectionName}". ` +
        `Please add course data to your database before running tests.`,
    );
  }

  console.log(
    `✓ Found ${courses.length} courses in "${collectionName}" for CourseCatalog tests`,
  );

  async function close() {
    await client.close();
  }

  return { courses, close };
}

/** ===================== TESTS ===================== **/

Deno.test({
  name: "CourseCatalog.fromDbRows + getById returns adapted course",
  ignore: !hasMongo,
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const { courses, close } = await setupMongoCatalog();

    try {
      const catalog = CourseCatalog.fromDbRows(courses as any);

      // Use the first course from your actual database
      const firstCourse = courses[0];
      const c = catalog.getById(firstCourse.courseID);

      assertEquals(c.title, firstCourse.title);
      assertEquals(c.instructor, firstCourse.instructor);

      // The test expects meetingTimes to be parsed
      // Your adaptCourse should parse DBmeetingTimes string array into TimeSlot objects
      // The test expects meetingTimes to be parsed
      // Your adaptCourse should parse DBmeetingTimes string array into TimeSlot objects
      assert(Array.isArray(c.meetingTimes), "meetingTimes should be an array");

      // If the raw DB row had times, we should have >0 parsed; else expect empty array.
      const rawTimes = (firstCourse as any).DBmeetingTimes;
      const hadRawTimes = Array.isArray(rawTimes)
        ? rawTimes.length > 0
        : typeof rawTimes === "string" && rawTimes.length > 0;

      if (hadRawTimes) {
        assert(
          c.meetingTimes!.length > 0,
          "Should have at least one meeting time",
        );
      } else {
        assertEquals(
          c.meetingTimes!.length,
          0,
          "No DBmeetingTimes in DB => meetingTimes should be empty",
        );
      }

      console.log(
        `  ✓ Course ${c.courseID}: ${c.title} has ${c.meetingTimes?.length} meeting times`,
      );
    } finally {
      await close();
    }
  },
});

Deno.test({
  name: "CourseCatalog.getById throws for missing",
  ignore: !hasMongo,
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const { courses, close } = await setupMongoCatalog();

    try {
      const catalog = CourseCatalog.fromDbRows(courses as any);

      assertThrows(
        () => catalog.getById("DEFINITELY-NOT-A-REAL-COURSE-ID-12345"),
        Error,
        `CourseCatalog.getById: courseId "DEFINITELY-NOT-A-REAL-COURSE-ID-12345" not found`,
      );
    } finally {
      await close();
    }
  },
});

Deno.test({
  name: "CourseCatalog.search - instructor fuzzy & subject filter",
  ignore: !hasMongo,
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const { courses, close } = await setupMongoCatalog();

    try {
      const catalog = CourseCatalog.fromDbRows(courses as any);

      // Find a course with an instructor name we can search for
      const sampleCourse = courses[0];
      const instructorName = sampleCourse.instructor;

      // Fuzzy instructor search - use part of the name
      const searchTerm = instructorName.slice(0, 4).toLowerCase();
      let res = catalog.search(undefined, { instructor: searchTerm } as any);

      assert(
        res.size > 0,
        `Should find at least one course with instructor matching "${searchTerm}"`,
      );
      console.log(
        `  ✓ Found ${res.size} course(s) with instructor matching "${searchTerm}"`,
      );

      // Subject filter - derived from courseID
      // Extract subject from first course (e.g., "CS" from "CS-220-01")
      const firstCourseId = courses[0].courseID;
      const subjectMatch = firstCourseId.match(/^[A-Za-z]+/);
      const subject = subjectMatch ? subjectMatch[0].toUpperCase() : null;

      if (subject) {
        res = catalog.search(undefined, { subject } as any);
        assert(res.size > 0, `Should find courses in subject "${subject}"`);

        // Verify all results match the subject
        const allMatch = [...res].every((c) => c.subject === subject);
        assert(allMatch, `All results should have subject "${subject}"`);
        console.log(`  ✓ Found ${res.size} course(s) in subject "${subject}"`);
      }
    } finally {
      await close();
    }
  },
});

Deno.test({
  name: "CourseCatalog.search - day & timeWindow overlap",
  ignore: !hasMongo,
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const { courses, close } = await setupMongoCatalog();

    try {
      const catalog = CourseCatalog.fromDbRows(courses as any);

      // Find a course with meeting times we can test
      const courseWithTimes = courses.find((c) =>
        c.DBmeetingTimes && c.DBmeetingTimes.length > 0
      );

      if (!courseWithTimes) {
        console.log(
          "  ⚠ No courses with meeting times found, skipping day/time tests",
        );
        return;
      }

      // Parse the first meeting time to get a day
      // Format: "MWF - 10:00 - 11:00"
      const firstMeetingStr = courseWithTimes.DBmeetingTimes[0];
      const parts = firstMeetingStr.split(" - ");
      const days = parts[0]; // e.g., "MWF"
      const firstDay = days[0]; // e.g., "M"

      // Day filter
      let res = catalog.search(undefined, { day: firstDay } as any);
      assert(res.size > 0, `Should find courses meeting on day "${firstDay}"`);
      console.log(
        `  ✓ Found ${res.size} course(s) meeting on day "${firstDay}"`,
      );

      // Time window overlap test
      // Use the actual start time from the course
      const startTime = parts[1]; // e.g., "10:00"
      const [startHour, startMin] = startTime.split(":").map(Number);

      // Create a time window that overlaps with this course
      const windowStart = `${String(startHour).padStart(2, "0")}:00`;
      const windowEnd = `${String(startHour + 1).padStart(2, "0")}:00`;

      res = catalog.search(
        undefined,
        {
          timeWindow: {
            day: firstDay,
            start: windowStart,
            end: windowEnd,
          },
        } as any,
      );

      assert(
        res.size > 0,
        `Should find courses in time window ${windowStart}-${windowEnd}`,
      );
      console.log(
        `  ✓ Found ${res.size} course(s) in time window ${windowStart}-${windowEnd}`,
      );
    } finally {
      await close();
    }
  },
});
