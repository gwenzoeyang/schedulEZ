deno test -A
Check file:///Users/gwen-zoeyang/schedulEZ/src/CourseCatalog.test.ts
Check file:///Users/gwen-zoeyang/schedulEZ/src/CrossRegTravel.test.ts
Check file:///Users/gwen-zoeyang/schedulEZ/src/RequirementTracker.test.ts
Check file:///Users/gwen-zoeyang/schedulEZ/src/Schedule.test.ts
Check file:///Users/gwen-zoeyang/schedulEZ/src/concepts/LikertSurvey/LikertSurveyConcept.test.ts
running 4 tests from ./src/CourseCatalog.test.ts
CourseCatalog.fromDbRows + getById returns adapted course ... ok (0ms)
CourseCatalog.getById throws for missing ... ok (0ms)
CourseCatalog.search - instructor fuzzy & department filter ... ok (0ms)
CourseCatalog.search - day & timeWindow overlap ... ok (0ms)
running 3 tests from ./src/CrossRegTravel.test.ts
CrossRegTravel.getArrivalTime maps by index across stops ... ok (0ms)
CrossRegTravel.getDepartureTime maps by index across stops ... ok (0ms)
CrossRegTravel throws when time not found at origin/destination ... ok (0ms)
running 3 tests from ./src/RequirementTracker.test.ts
RequirementTracker.recompute populates states & missing reflects unfulfilled ... ok (0ms)
RequirementTracker.evidenceFor returns evidence set for fulfilled req ... ok (0ms)
RequirementTracker.evidenceFor throws for non-applicable requirement ... ok (0ms)
running 5 tests from ./src/Schedule.test.ts
Schedule.addCourse adds and prevents duplicates ... ok (0ms)
Schedule.listSchedule throws when empty ... ok (0ms)
Schedule.suggestCourseAI uses AI adapter fallback if Gemini unavailable ... ok (1ms)
Schedule.updateAfterAddAI throws if prefs missing or course not present ...
Uncaught error from ./src/Schedule.test.ts FAILED
Schedule.updateAfterAddAI throws if prefs missing or course not present ... cancelled (0ms)
Schedule.clear removes all courses ... cancelled (0ms)
running 5 tests from ./src/concepts/LikertSurvey/LikertSurveyConcept.test.ts
Principle: Author creates survey, respondent answers, author views results ... FAILED (30s)
Action: createSurvey requires scaleMin < scaleMax ... FAILED (30s)
Action: addQuestion requires an existing survey ... FAILED (30s)
Action: submitResponse requirements are enforced ... FAILED (30s)
Action: updateResponse successfully updates a response and enforces requirements ... FAILED (30s)

 ERRORS 

./src/Schedule.test.ts (uncaught error)
error: (in promise) Error: Schedule.updateAfterAddAI: aiPreferences not set for this user
      throw new Error(
            ^
    at Schedule.updateAfterAddAI (file:///Users/gwen-zoeyang/schedulEZ/src/Schedule.ts:319:13)
    at file:///Users/gwen-zoeyang/schedulEZ/src/Schedule.test.ts:92:29
    at assertThrows (https://deno.land/std@0.224.0/assert/assert_throws.ts:80:5)
    at file:///Users/gwen-zoeyang/schedulEZ/src/Schedule.test.ts:91:11
    at async file:///Users/gwen-zoeyang/schedulEZ/src/Schedule.test.ts:90:3
This error was not caught from a test and caused the test runner to fail on the referenced module.
It most likely originated from a dangling promise, event/timeout handler or top-level code.

Principle: Author creates survey, respondent answers, author views results => ./src/concepts/LikertSurvey/LikertSurveyConcept.test.ts:10:6
error: Error: MongoDB connection failed: MongoServerSelectionError: received fatal alert: InternalError
    throw new Error("MongoDB connection failed: " + e);
          ^
    at initMongoClient (file:///Users/gwen-zoeyang/schedulEZ/src/utils/database.ts:16:11)
    at eventLoopTick (ext:core/01_core.js:218:9)
    at async init (file:///Users/gwen-zoeyang/schedulEZ/src/utils/database.ts:22:18)
    at async testDb (file:///Users/gwen-zoeyang/schedulEZ/src/utils/database.ts:59:29)
    at async file:///Users/gwen-zoeyang/schedulEZ/src/concepts/LikertSurvey/LikertSurveyConcept.test.ts:11:24

Action: createSurvey requires scaleMin < scaleMax => ./src/concepts/LikertSurvey/LikertSurveyConcept.test.ts:106:6
error: Error: MongoDB connection failed: MongoServerSelectionError: received fatal alert: InternalError
    throw new Error("MongoDB connection failed: " + e);
          ^
    at initMongoClient (file:///Users/gwen-zoeyang/schedulEZ/src/utils/database.ts:16:11)
    at eventLoopTick (ext:core/01_core.js:218:9)
    at async init (file:///Users/gwen-zoeyang/schedulEZ/src/utils/database.ts:22:18)
    at async testDb (file:///Users/gwen-zoeyang/schedulEZ/src/utils/database.ts:59:29)
    at async file:///Users/gwen-zoeyang/schedulEZ/src/concepts/LikertSurvey/LikertSurveyConcept.test.ts:107:24

Action: addQuestion requires an existing survey => ./src/concepts/LikertSurvey/LikertSurveyConcept.test.ts:139:6
error: Error: MongoDB connection failed: MongoServerSelectionError: received fatal alert: InternalError
    throw new Error("MongoDB connection failed: " + e);
          ^
    at initMongoClient (file:///Users/gwen-zoeyang/schedulEZ/src/utils/database.ts:16:11)
    at eventLoopTick (ext:core/01_core.js:218:9)
    at async init (file:///Users/gwen-zoeyang/schedulEZ/src/utils/database.ts:22:18)
    at async testDb (file:///Users/gwen-zoeyang/schedulEZ/src/utils/database.ts:59:29)
    at async file:///Users/gwen-zoeyang/schedulEZ/src/concepts/LikertSurvey/LikertSurveyConcept.test.ts:140:24

Action: submitResponse requirements are enforced => ./src/concepts/LikertSurvey/LikertSurveyConcept.test.ts:159:6
error: Error: MongoDB connection failed: MongoServerSelectionError: received fatal alert: InternalError
    throw new Error("MongoDB connection failed: " + e);
          ^
    at initMongoClient (file:///Users/gwen-zoeyang/schedulEZ/src/utils/database.ts:16:11)
    at eventLoopTick (ext:core/01_core.js:218:9)
    at async init (file:///Users/gwen-zoeyang/schedulEZ/src/utils/database.ts:22:18)
    at async testDb (file:///Users/gwen-zoeyang/schedulEZ/src/utils/database.ts:59:29)
    at async file:///Users/gwen-zoeyang/schedulEZ/src/concepts/LikertSurvey/LikertSurveyConcept.test.ts:160:24

Action: updateResponse successfully updates a response and enforces requirements => ./src/concepts/LikertSurvey/LikertSurveyConcept.test.ts:237:6
error: Error: MongoDB connection failed: MongoServerSelectionError: received fatal alert: InternalError
    throw new Error("MongoDB connection failed: " + e);
          ^
    at initMongoClient (file:///Users/gwen-zoeyang/schedulEZ/src/utils/database.ts:16:11)
    at eventLoopTick (ext:core/01_core.js:218:9)
    at async init (file:///Users/gwen-zoeyang/schedulEZ/src/utils/database.ts:22:18)
    at async testDb (file:///Users/gwen-zoeyang/schedulEZ/src/utils/database.ts:59:29)
    at async file:///Users/gwen-zoeyang/schedulEZ/src/concepts/LikertSurvey/LikertSurveyConcept.test.ts:238:24

 FAILURES 

./src/Schedule.test.ts (uncaught error)
Principle: Author creates survey, respondent answers, author views results => ./src/concepts/LikertSurvey/LikertSurveyConcept.test.ts:10:6
Action: createSurvey requires scaleMin < scaleMax => ./src/concepts/LikertSurvey/LikertSurveyConcept.test.ts:106:6
Action: addQuestion requires an existing survey => ./src/concepts/LikertSurvey/LikertSurveyConcept.test.ts:139:6
Action: submitResponse requirements are enforced => ./src/concepts/LikertSurvey/LikertSurveyConcept.test.ts:159:6
Action: updateResponse successfully updates a response and enforces requirements => ./src/concepts/LikertSurvey/LikertSurveyConcept.test.ts:237:6

FAILED | 13 passed | 8 failed (2m30s)

error: Test failed