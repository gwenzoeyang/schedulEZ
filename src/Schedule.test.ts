// src/Schedule.test.ts
// Mongo-backed integration tests for Schedule.ts

import { load } from "std/dotenv";
await load({ export: true });

import "jsr:@std/dotenv/load"; // loads .env into Deno.env.* for this test run

import { assert, assertEquals, assertRejects, assertThrows } from "@std/assert";

import { MongoClient } from "npm:mongodb";
import {
  type AIRecommenderLike,
  createScheduleWithMongo,
  Schedule,
} from "./Schedule.ts";

/** ------- Test preconditions (env + perms) ------- */
const hasMongo = (Deno.env.get("MONGODB_URL") ?? "").length > 0;

/**
 * Utility to connect to your actual MongoDB database and validate courses exist.
 * Uses the COURSES_COLLECTION from your .env file (e.g., "sample10")
 * Returns the collection name and courses for testing.
 */
async function setupMongoFixtures() {
  if (!hasMongo) {
    throw new Error("MONGODB_URL env var is required for Mongo tests.");
  }

  const client = new MongoClient(Deno.env.get("MONGODB_URL")!);
  await client.connect();
  const db = client.db(Deno.env.get("DB_NAME") || "schedulEZ");
  const collectionName = Deno.env.get("COURSES_COLLECTION") || "sample10";

  // Fetch actual courses from your MongoDB collection
  const col = db.collection(collectionName);
  const courses = await col.find({}).limit(10).toArray();

  if (courses.length === 0) {
    await client.close();
    throw new Error(
      `No courses found in MongoDB collection "${collectionName}". ` +
        `Please add course data to your database before running tests. ` +
        `You can add courses via MongoDB Atlas UI or create a seed script.`,
    );
  }

  console.log(
    `✓ Found ${courses.length} courses in "${collectionName}" for testing`,
  );

  async function close() {
    await client.close();
  }

  return {
    db,
    collectionName,
    client,
    close,
    courses, // Return the actual courses from DB
  };
}

/** ===================== TESTS ===================== **/

Deno.test({
  name:
    "Mongo: Schedule.addCourseById loads from Mongo and prevents duplicates",
  ignore: !hasMongo, // auto-skip if no Mongo URL
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const { collectionName, courses, close } = await setupMongoFixtures();
    try {
      const sch = await createScheduleWithMongo(
        { chooseCourse: () => null },
        { collection: collectionName },
      );
      const user = { id: "u1" };

      // Use first course from your actual MongoDB data
      const firstCourse = courses[0];
      await sch.addCourseById(user, firstCourse.courseID);
      assertEquals(sch.listSchedule(user).size, 1);

      // Try to add duplicate - should throw
      assertThrows(
        () =>
          sch.addCourse(user, {
            courseID: firstCourse.courseID,
            title: firstCourse.title,
            instructor: firstCourse.instructor,
            meetingTimes: firstCourse.meetingTimes || [],
            requirements: firstCourse.requirements || [[]],
          }),
        Error,
        "already in the schedule",
      );
    } finally {
      await close();
    }
  },
});

Deno.test({
  name: "Mongo: Schedule.listSchedule throws when user has no courses",
  ignore: !hasMongo,
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const { collectionName, close } = await setupMongoFixtures();
    try {
      const sch = await createScheduleWithMongo(
        { chooseCourse: () => null },
        { collection: collectionName },
      );
      const user = { id: "u2" };
      assertThrows(() => sch.listSchedule(user), Error, "schedule is empty");
    } finally {
      await close();
    }
  },
});

Deno.test({
  name:
    "Mongo: Schedule.suggestCourseAI uses catalog from Mongo when Gemini unavailable",
  ignore: !hasMongo,
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const { collectionName, courses, close } = await setupMongoFixtures();

    // Ensure we have at least 2 courses for testing
    if (courses.length < 2) {
      await close();
      throw new Error("Need at least 2 courses in database for this test");
    }

    // AI stub picks the second course from your actual data
    const secondCourse = courses[1];
    const ai: AIRecommenderLike = {
      chooseCourse: () => ({
        courseID: secondCourse.courseID,
        title: secondCourse.title,
        instructor: secondCourse.instructor,
        meetingTimes: secondCourse.meetingTimes || [],
        requirements: secondCourse.requirements || [[]],
      }),
    };

    try {
      const sch = await createScheduleWithMongo(ai, {
        collection: collectionName,
      });
      const user = { id: "u3" };

      sch.setAIPreferences(user, "CS", new Set(["systems"]), new Set());
      const pick = await sch.suggestCourseAI(user);

      // The AI should pick from your actual courses
      // Just verify we got a valid course back
      assert(pick.courseID, "Should return a course with courseID");
      console.log(`  AI suggested: ${pick.courseID} - ${pick.title}`);
    } finally {
      await close();
    }
  },
});

Deno.test({
  name:
    "Mongo: Schedule.updateAfterAddAI enforces prefs & presence in schedule",
  ignore: !hasMongo,
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const { collectionName, courses, close } = await setupMongoFixtures();

    const firstCourse = courses[0];
    const ai: AIRecommenderLike = {
      chooseCourse: () => ({
        courseID: firstCourse.courseID,
        title: firstCourse.title,
        instructor: firstCourse.instructor,
        meetingTimes: firstCourse.meetingTimes || [],
        requirements: firstCourse.requirements || [[]],
      }),
    };

    try {
      const sch = await createScheduleWithMongo(ai, {
        collection: collectionName,
      });
      const user = { id: "u4" };

      // No prefs set
      await assertRejects(
        () =>
          sch.updateAfterAddAI(user, {
            courseID: firstCourse.courseID,
            title: firstCourse.title,
            instructor: firstCourse.instructor,
            meetingTimes: firstCourse.meetingTimes || [],
            requirements: firstCourse.requirements || [[]],
          }),
        Error,
        "aiPreferences not set",
      );

      // Set prefs but course not in schedule
      sch.setAIPreferences(user, "CS", new Set(), new Set());
      await assertRejects(
        () =>
          sch.updateAfterAddAI(user, {
            courseID: firstCourse.courseID,
            title: firstCourse.title,
            instructor: firstCourse.instructor,
            meetingTimes: firstCourse.meetingTimes || [],
            requirements: firstCourse.requirements || [[]],
          }),
        Error,
        "is not in the schedule",
      );

      // Now add a course from Mongo and ensure it works end-to-end
      await sch.addCourseById(user, firstCourse.courseID);
      const next = await sch.updateAfterAddAI(user, {
        courseID: firstCourse.courseID,
        title: firstCourse.title,
        instructor: firstCourse.instructor,
        meetingTimes: firstCourse.meetingTimes || [],
        requirements: firstCourse.requirements || [[]],
      });
      assert(!!next); // some suggestion should come back
    } finally {
      await close();
    }
  },
});

Deno.test({
  name: "Mongo: Schedule.clear removes all courses",
  ignore: !hasMongo,
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const { collectionName, courses, close } = await setupMongoFixtures();

    // Ensure we have at least 2 courses for this test
    if (courses.length < 2) {
      await close();
      throw new Error("Need at least 2 courses in database for this test");
    }

    try {
      const sch = await createScheduleWithMongo(
        { chooseCourse: () => null },
        { collection: collectionName },
      );
      const user = { id: "u5" };

      // Add first two courses from your actual data
      await sch.addCourseById(user, courses[0].courseID);
      await sch.addCourseById(user, courses[1].courseID);
      assertEquals(sch.listSchedule(user).size, 2);

      sch.clear(user);
      assertThrows(() => sch.listSchedule(user), Error, "schedule is empty");
    } finally {
      await close();
    }
  },
});
