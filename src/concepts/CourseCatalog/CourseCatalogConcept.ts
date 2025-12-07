// src/concepts/CourseCatalog/CourseCatalogConcept.ts

import {
  type Course,
  CourseCatalog,
  type CourseFilters,
} from "../../CourseCatalog.ts";

export default class CourseCatalogConcept {
  private catalog: CourseCatalog | null = null;

  constructor(private db: any) {
    // db parameter comes from conceptserver, but we use CourseCatalog.create() instead
  }

  private async getCatalog(): Promise<CourseCatalog> {
    if (!this.catalog) {
      this.catalog = await CourseCatalog.create();
    }
    return this.catalog;
  }

  // ==================== Query Methods (underscore prefix) ====================

  /**
   * Get all courses from the catalog
   * Frontend calls: courseCatalogAPI.getAllCourses()
   */
  async _getAllCourses() {
    const catalog = await this.getCatalog();
    const courses = await catalog.getAll();

    // Convert to frontend-friendly format
    return courses.map(this.toFrontendFormat);
  }

  /**
   * Get a course by its code/ID
   * Frontend calls: courseCatalogAPI.getCourseByCode(code)
   */
  async _getCourseByCode(params: { code: string }) {
    const catalog = await this.getCatalog();
    const course = await catalog.getById(params.code);
    return this.toFrontendFormat(course);
  }

  /**
   * Search courses by query and filters
   * Frontend calls: courseCatalogAPI.searchCourses(query)
   */
  async _searchCourses(params: { query?: string; filters?: CourseFilters }) {
    const catalog = await this.getCatalog();
    const results = await catalog.search(params.query, params.filters);

    // Convert Set to Array and map to frontend format
    return Array.from(results).map(this.toFrontendFormat);
  }

  /**
   * Get course prerequisites (placeholder - extend as needed)
   * Frontend calls: courseCatalogAPI.getCoursePrerequisites(course)
   */
  async _getCoursePrerequisites(params: { course: string }) {
    // This would need to be implemented based on your requirements schema
    // For now, return empty array
    return [];
  }

  /**
   * Get course corequisites (placeholder - extend as needed)
   * Frontend calls: courseCatalogAPI.getCourseCorequisites(course)
   */
  async _getCourseCorequisites(params: { course: string }) {
    // This would need to be implemented based on your requirements schema
    // For now, return empty array
    return [];
  }

  // ==================== Mutation Methods ====================

  /**
   * Add a new course to the catalog (admin function)
   * Frontend calls: courseCatalogAPI.addCourse(courseData)
   */
  async addCourse(params: any) {
    // This would require write access to MongoDB
    // For now, return error - implement if you need admin features
    throw new Error(
      "Adding courses is not yet implemented. This requires admin privileges.",
    );
  }

  /**
   * Update course details (admin function)
   * Frontend calls: courseCatalogAPI.updateCourseDetails(courseData)
   */
  async updateCourseDetails(params: any) {
    throw new Error(
      "Updating courses is not yet implemented. This requires admin privileges.",
    );
  }

  /**
   * Remove a course from catalog (admin function)
   * Frontend calls: courseCatalogAPI.removeCourse(course)
   */
  async removeCourse(params: { course: string }) {
    throw new Error(
      "Removing courses is not yet implemented. This requires admin privileges.",
    );
  }

  // ==================== Helper Methods ====================

  /**
   * Convert internal Course format to frontend-friendly format
   */
  private toFrontendFormat(course: Course) {
    return {
      // Match what your CourseCard.vue expects
      course: course.courseID, // Primary identifier
      code: course.courseID, // Alternate identifier
      courseId: course.courseID, // Another alternate (lowercase d)
      courseID: course.courseID, // Another alternate (uppercase D)
      name: course.title, // Course name
      title: course.title, // Alternate name field
      instructor: course.instructor,
      subject: course.subject,
      campus: course.campus,
      location: course.location,

      // Meeting times
      meetingTimes: course.meetingTimes,
      DBmeetingTimes: course.DBmeetingTimes,

      // Format meeting times as human-readable string for display
      schedule:
        course.meetingTimes?.map((mt) => `${mt.day} ${mt.start}-${mt.end}`)
          .join(", ") || "TBA",

      // Add other useful fields
      credits: 1, // Default credits - adjust if you have this data
      creditHours: 1,

      // Description from database (or fallback if not available)
      description: course.description || "",

      // Rate My Professor link
      rmp: course.rmp,

      // Include original course object for reference
      _original: course,
    };
  }
}
