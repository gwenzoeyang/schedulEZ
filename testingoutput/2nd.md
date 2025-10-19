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
Schedule.updateAfterAddAI throws if prefs missing or course not present ... ok (0ms)
Schedule.clear removes all courses ... ok (0ms)
running 5 tests from ./src/concepts/LikertSurvey/LikertSurveyConcept.test.ts
Principle: Author creates survey, respondent answers, author views results ... ok (934ms)
Action: createSurvey requires scaleMin < scaleMax ... ok (856ms)
Action: addQuestion requires an existing survey ... ok (499ms)
Action: submitResponse requirements are enforced ... ok (1s)
Action: updateResponse successfully updates a response and enforces requirements ... ok (897ms)

ok | 20 passed | 0 failed (4s)