// src/tests/requirement_tracker_test.ts
import { assert, assertEquals, assertThrows } from "@std/assert";

import type {
  Course,
  Requirement,
} from "/Users/gwen-zoeyang/schedulEZ/src/CourseCatalog.ts";
import {
  type RequirementRulesLike,
  RequirementTracker,
  type User,
} from "/Users/gwen-zoeyang/schedulEZ/src/RequirementTracker.ts";

// Mock rules: 2 groups, 3 total requirements (e.g., [[LAB, WRI], [HSCI]])
const LAB: Requirement = { code: "LAB" };
const WRI: Requirement = { code: "WRI" };
const HSCI: Requirement = { code: "HSCI" };

const C_LAB: Course = {
  courseID: "BIO101",
  title: "Bio Lab",
  instructor: "Marie Curie",
  meetingTimes: [],
  requirements: [[LAB]],
};
const C_WRI: Course = {
  courseID: "ENG101",
  title: "Writing",
  instructor: "Hemingway",
  meetingTimes: [],
  requirements: [[WRI]],
};
const C_NONE: Course = {
  courseID: "MUS101",
  title: "Music",
  instructor: "Bach",
  meetingTimes: [],
  requirements: [[]],
};

class RulesMock implements RequirementRulesLike {
  allRequirementsFor(_owner: User) {
    return [[LAB, WRI], [HSCI]];
  }
  evaluate(_owner: User, courses: Course[], req: Requirement) {
    const fulfilled = courses.some((c) =>
      (c.requirements ?? []).flat().some((r) => r.code === req.code)
    );
    const evidence = fulfilled
      ? courses.filter((c) =>
        (c.requirements ?? []).flat().some((r) => r.code === req.code)
      )
      : [];
    return { fulfilled, evidence };
  }
}

Deno.test("RequirementTracker.recompute populates states & missing reflects unfulfilled", () => {
  const rt = new RequirementTracker(new RulesMock());
  const user = { id: "u1" };

  // Start with no courses
  rt.recompute(user, new Set<Course>([]));
  const missing0 = rt.missing(user);
  // From [[LAB,WRI],[HSCI]] -> all three individual reqs initially missing
  assertEquals(
    new Set([...missing0].map((r) => r.code)),
    new Set(["LAB", "WRI", "HSCI"]),
  );

  // Add a LAB course
  rt.recompute(user, new Set<Course>([C_LAB]));
  const missing1 = rt.missing(user);
  assertEquals(
    new Set([...missing1].map((r) => r.code)),
    new Set(["WRI", "HSCI"]),
  );
});

Deno.test("RequirementTracker.evidenceFor returns evidence set for fulfilled req", () => {
  const rt = new RequirementTracker(new RulesMock());
  const user = { id: "u1" };

  rt.recompute(user, new Set<Course>([C_LAB, C_WRI]));
  const evidence = rt.evidenceFor(user, LAB);
  assertEquals(
    new Set([...evidence].map((c) => c.courseID)),
    new Set(["BIO101"]),
  );
});

Deno.test("RequirementTracker.evidenceFor throws for non-applicable requirement", () => {
  const rt = new RequirementTracker(new RulesMock());
  const user = { id: "u1" };

  rt.recompute(user, new Set<Course>([C_NONE]));
  assertThrows(
    () => rt.evidenceFor(user, { code: "NONEXISTENT" }),
    Error,
    `is not valid for this user`,
  );
});
