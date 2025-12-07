import { CourseCatalog } from "./src/coursecatalog.ts";

async function testCatalog() {
  console.log("🔍 Testing MongoDB Course Catalog Connection...\n");

  try {
    // Create catalog connection
    const catalog = await CourseCatalog.create({
      // Uses env vars or pass explicitly:
      // mongoUrl: "mongodb://localhost:27017",
      // dbName: "schedulEZ",
      // collection: "sample10"
    });

    console.log("✅ Connected to MongoDB successfully!\n");

    // Test 1: Get all courses
    console.log("📚 Test 1: Fetching all courses...");
    const allCourses = await catalog.getAll();
    console.log(`   Found ${allCourses.length} courses total\n`);

    // Test 2: Show first 3 courses
    console.log("📋 Test 2: First 3 courses:");
    allCourses.slice(0, 3).forEach((course, idx) => {
      console.log(`   ${idx + 1}. ${course.courseID} - ${course.title}`);
      console.log(`      Instructor: ${course.instructor}`);
      console.log(`      Subject: ${course.subject}`);
      console.log(`      Campus: ${course.campus || "N/A"}`);
      if (course.meetingTimes && course.meetingTimes.length > 0) {
        console.log(`      Times: ${JSON.stringify(course.meetingTimes[0])}`);
      }
      console.log("");
    });

    // Test 3: Search by query
    console.log("🔎 Test 3: Search for 'computer' or 'CS'...");
    const searchResults = await catalog.search("computer");
    console.log(`   Found ${searchResults.size} matching courses\n`);

    // Test 4: Filter by subject
    console.log("🎯 Test 4: Filter by subject 'CS'...");
    const csResults = await catalog.search(undefined, { subject: "CS" });
    console.log(`   Found ${csResults.size} CS courses`);
    [...csResults].slice(0, 3).forEach((course) => {
      console.log(`   - ${course.courseID}: ${course.title}`);
    });
    console.log("");

    // Test 5: Get course by ID
    if (allCourses.length > 0) {
      const testID = allCourses[0].courseID;
      console.log(`🎓 Test 5: Get course by ID (${testID})...`);
      const course = await catalog.getById(testID);
      console.log(`   ✅ Retrieved: ${course.title}\n`);
    }

    // Test 6: Filter by day
    console.log("📅 Test 6: Filter by day 'M' (Monday)...");
    const mondayCourses = await catalog.search(undefined, { day: "M" });
    console.log(`   Found ${mondayCourses.size} courses on Monday`);
    [...mondayCourses].slice(0, 3).forEach((course) => {
      console.log(`   - ${course.courseID}: ${course.title}`);
    });
    console.log("");

    // Clean up
    await catalog.close();
    console.log("✅ All tests passed! Database connection working correctly.");
  } catch (error) {
    console.error("❌ Error:", error);
    Deno.exit(1);
  }
}

testCatalog();
