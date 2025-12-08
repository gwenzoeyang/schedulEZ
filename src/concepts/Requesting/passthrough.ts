/**
 * The Requesting concept exposes passthrough routes by default,
 * which allow POSTs to the route:
 *
 * /{REQUESTING_BASE_URL}/{Concept name}/{action or query}
 *
 * to passthrough directly to the concept action or query.
 * This is a convenient and natural way to expose concepts to
 * the world, but should only be done intentionally for public
 * actions and queries.
 *
 * This file allows you to explicitly set inclusions and exclusions
 * for passthrough routes:
 * - inclusions: those that you can justify their inclusion
 * - exclusions: those to exclude, using Requesting routes instead
 */

/**
 * INCLUSIONS
 *
 * Each inclusion must include a justification for why you think
 * the passthrough is appropriate (e.g. public query).
 *
 * inclusions = {"route": "justification"}
 */

export const inclusions: Record<string, string> = {
  // CourseCatalog - Public read-only queries (anyone can browse courses)
  "/api/CourseCatalog/_getAllCourses":
    "public query - anyone can view available courses",
  "/api/CourseCatalog/_getCourseByCode":
    "public query - anyone can view course details",
  "/api/CourseCatalog/_searchCourses":
    "public query - anyone can search courses",
  "/api/CourseCatalog/_getCoursePrerequisites":
    "public query - prerequisite info is public",
  "/api/CourseCatalog/_getCourseCorequisites":
    "public query - corequisite info is public",

  // CrossRegTravel - Public read-only queries (bus schedule is public info)
  "/api/CrossRegTravel/_getBusSchedule":
    "public query - bus schedule is public information",
  "/api/CrossRegTravel/_calculateTravelTime":
    "public query - travel time calculation is public",
  "/api/CrossRegTravel/_findDepartureTime":
    "public query - departure times are public",
  "/api/CrossRegTravel/_getTravelRequestStatus":
    "public query - allows checking request status",
  "/api/CrossRegTravel/_getStudentTravelRequests":
    "public query - view travel requests",
  "/api/CrossRegTravel/_getCourseTravelRequests":
    "public query - view course travel requests",

  // Schedule - Read-only queries
  "/api/Schedule/_getScheduleById": "public query - allows viewing a schedule",
  "/api/Schedule/_findSchedules": "public query - allows searching schedules",
  "/api/Schedule/getUserSchedule":
    "public query - allows viewing user's schedule",
  "/api/Schedule/setAIPreferences": "allow users to set AI preferences",
  "/api/Schedule/suggestCourse": "allow users to get AI course suggestions",
};

/**
 * EXCLUSIONS
 *
 * Excluded routes fall back to the Requesting concept, and will
 * instead trigger the normal Requesting.request action. As this
 * is the intended behavior, no justification is necessary.
 *
 * exclusions = ["route"]
 */

export const exclusions: Array<string> = [
  // CourseCatalog - Internal methods (should not be exposed)
  "/api/CourseCatalog/getCatalog",
  "/api/CourseCatalog/toFrontendFormat",

  // CourseCatalog - Admin-only actions (require authentication)
  "/api/CourseCatalog/addCourse",
  "/api/CourseCatalog/updateCourseDetails",
  "/api/CourseCatalog/removeCourse",

  // CrossRegTravel - User/Admin actions (modify data)
  "/api/CrossRegTravel/requestTravel",
  "/api/CrossRegTravel/approveTravel",
  "/api/CrossRegTravel/denyTravel",
  "/api/CrossRegTravel/cancelTravel",

  // Schedule - Actions that modify user data
  "/api/Schedule/getSchedule",
  "/api/Schedule/createSchedule",
  "/api/Schedule/updateSchedule",
  "/api/Schedule/deleteSchedule",
  "/api/Schedule/addCourse",
  "/api/Schedule/removeCourse",
];
