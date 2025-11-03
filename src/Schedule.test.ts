// src/tests/schedule_test.ts
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
} from "../src/Schedule.ts";

/** ------- Test preconditions (env + perms) ------- */
const hasMongo = (Deno.env.get("MONGODB_URL") ?? "").length > 0;

function randSuffix() {
  return Math.random().toString(36).slice(2, 9);
}

// Minimal course docs shaped like your Mongo collection expects
const M_C1 = {
  courseID: "CS101",
  title: "Intro CS",
  instructor: "Grace Hopper",
  meetingTimes: [{ day: "M", start: "10:00", end: "11:00" }],
  requirements: [[]],
};

const M_C2 = {
  courseID: "CS102",
  title: "DSA",
  instructor: "Ada Lovelace",
  meetingTimes: [{ day: "T", start: "10:00", end: "11:00" }],
  requirements: [[]],
};

const M_C3 = {
  courseID: "CS103",
  title: "Systems",
  instructor: "Ken Thompson",
  meetingTimes: [{ day: "W", start: "10:00", end: "11:00" }],
  requirements: [[]],
};

/**
 * Utility to set up a temp collection, seed fixtures, and give you:
 * - collectionName (temp)
 * - close() to drop & disconnect
 */
async function setupMongoFixtures() {
  if (!hasMongo) {
    throw new Error("MONGODB_URL env var is required for Mongo tests.");
  }

  const client = new MongoClient(Deno.env.get("MONGODB_URL"));
  await client.connect();
  const db = client.db(Deno.env.get("DB_NAME"));

  const collectionName = `courses_test_${randSuffix()}`;
  const col = db.collection(collectionName);

  await col.insertMany([M_C1, M_C2, M_C3]);

  async function close() {
    try {
      await db.collection(collectionName).drop();
    } catch {
      // ignore if already dropped
    }
    await client.close();
  }

  return { db, collectionName, close };
}

/** ===================== TESTS ===================== **/

Deno.test({
  name:
    "Mongo: Schedule.addCourseById loads from Mongo and prevents duplicates",
  ignore: !hasMongo, // auto-skip if no Mongo URL
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const { collectionName, close } = await setupMongoFixtures();
    try {
      const sch = await createScheduleWithMongo(
        { chooseCourse: () => null },
        { collection: collectionName }, // <-- use the temp collection
      );
      const user = { id: "u1" };

      await sch.addCourseById(user, "CS101");
      assertEquals(sch.listSchedule(user).size, 1);

      assertThrows(
        () =>
          sch.addCourse(user, {
            courseID: "CS101",
            title: "Intro CS",
            instructor: "Grace Hopper",
            meetingTimes: [{ day: "M", start: "10:00", end: "11:00" }],
            requirements: [[]],
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
  fn: async () => {
    // AI stub always picks CS102
    const ai: AIRecommenderLike = {
      chooseCourse: () => ({
        courseID: "CS102",
        title: "DSA",
        instructor: "Ada Lovelace",
        meetingTimes: [{ day: "T", start: "10:00", end: "11:00" }],
        requirements: [[]],
      }),
    };

    const { collectionName, close } = await setupMongoFixtures();
    try {
      const sch = await createScheduleWithMongo(ai, {
        collection: collectionName,
      });
      const user = { id: "u3" };

      sch.setAIPreferences(user, "CS", new Set(["systems"]), new Set());
      const pick = await sch.suggestCourseAI(user);
      assertEquals(pick.courseID, "CS102");
    } finally {
      await close();
    }
  },
});

Deno.test({
  name:
    "Mongo: Schedule.updateAfterAddAI enforces prefs & presence in schedule",
  ignore: !hasMongo,
  fn: async () => {
    const ai: AIRecommenderLike = { chooseCourse: () => M_C1 as any };
    const { collectionName, close } = await setupMongoFixtures();
    try {
      const sch = await createScheduleWithMongo(ai, {
        collection: collectionName,
      });
      const user = { id: "u4" };

      // No prefs set
      await assertRejects(
        () => sch.updateAfterAddAI(user, M_C1 as any),
        Error,
        "aiPreferences not set",
      );

      // Set prefs but course not in schedule
      sch.setAIPreferences(user, "CS", new Set(), new Set());
      await assertRejects(
        () => sch.updateAfterAddAI(user, M_C1 as any),
        Error,
        "is not in the schedule",
      );

      // Now add a course from Mongo and ensure it works end-to-end
      await sch.addCourseById(user, "CS101");
      const next = await sch.updateAfterAddAI(user, M_C1 as any);
      assert(!!next); // some suggestion should come back
    } finally {
      await close();
    }
  },
});

Deno.test({
  name: "Mongo: Schedule.clear removes all courses",
  ignore: !hasMongo,
  fn: async () => {
    const { collectionName, close } = await setupMongoFixtures();
    try {
      const sch = await createScheduleWithMongo(
        { chooseCourse: () => null },
        { collection: collectionName },
      );
      const user = { id: "u5" };

      await sch.addCourseById(user, "CS101");
      await sch.addCourseById(user, "CS102");
      assertEquals(sch.listSchedule(user).size, 2);

      sch.clear(user);
      assertThrows(() => sch.listSchedule(user), Error, "schedule is empty");
    } finally {
      await close();
    }
  },
});
