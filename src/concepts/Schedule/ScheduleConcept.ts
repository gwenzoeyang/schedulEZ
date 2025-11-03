import { Course, createScheduleWithMongo, User } from "../../Schedule.ts";

export default class ScheduleConcept {
  private scheduleInstance: any;

  constructor(private db: any) {
    // DB passed from concept_server but we use MongoDB connection from Schedule
  }

  /**
   * Initialize schedule and return all courses from MongoDB
   * This matches the frontend call: scheduleAPI.createScheduleWithMongo()
   */
  async createSchedulewithMongo(body: any) {
    try {
      console.log("✅ ScheduleConcept: createSchedulewithMongo called");

      // Create schedule with MongoDB connection from .env
      this.scheduleInstance = await createScheduleWithMongo();

      // Get all courses from MongoDB catalog by searching with no query
      const coursesSet = await this.scheduleInstance.catalog.search();

      // CRITICAL: Convert Set to Array for JSON serialization
      const coursesArray = Array.from(coursesSet);

      console.log(
        `✅ ScheduleConcept: Found ${coursesArray.length} courses from MongoDB`,
      );

      // Map MongoDB Course format to frontend format
      const formattedCourses = coursesArray.map((course: Course) => {
        // Extract department from courseID (e.g., "CS-230-01" -> "CS")
        const subject = course.courseID.split("-")[0] || "Unknown";

        // Format meeting times for frontend (e.g., "Monday 9:00-10:00")
        const meets = course.meetingTimes.map((mt) =>
          `${mt.day} ${mt.start}-${mt.end}`
        );

        return {
          courseId: course.courseID,
          name: course.title,
          description: `Instructor: ${course.instructor}${
            course.location ? ` | Location: ${course.location}` : ""
          }`,
          credits: 3, // Default to 3 - you may want to add this field to MongoDB
          subject: subject,
          meets: meets,
          prerequisites: [], // You could extract this from requirements if needed
          instructor: course.instructor,
          location: course.location,
          campus: course.campus,
          requirements: course.requirements,
        };
      });

      console.log(
        `✅ ScheduleConcept: Returning ${formattedCourses.length} formatted courses`,
      );
      return formattedCourses;
    } catch (error) {
      console.error(
        "❌ ScheduleConcept: Error in createSchedulewithMongo:",
        error,
      );
      return { error: error.message || "Failed to load courses from MongoDB" };
    }
  }

  /**
   * Add a course to a user's schedule by courseID
   */
  async addCourseById(body: { userId: string; courseID: string }) {
    try {
      if (!this.scheduleInstance) {
        this.scheduleInstance = await createScheduleWithMongo();
      }

      const user: User = { id: body.userId };
      await this.scheduleInstance.addCourseById(user, body.courseID);

      return { success: true, message: `Added course ${body.courseID}` };
    } catch (error) {
      console.error("❌ ScheduleConcept: Error adding course:", error);
      return { error: error.message };
    }
  }

  /**
   * Remove a course from a user's schedule
   */
  async removeCourse(body: { userId: string; courseID: string }) {
    try {
      if (!this.scheduleInstance) {
        this.scheduleInstance = await createScheduleWithMongo();
      }

      const user: User = { id: body.userId };
      this.scheduleInstance.removeCourse(user, body.courseID);

      return { success: true, message: `Removed course ${body.courseID}` };
    } catch (error) {
      console.error("❌ ScheduleConcept: Error removing course:", error);
      return { error: error.message };
    }
  }

  /**
   * List all courses in a user's schedule
   */
  async listSchedule(body: { userId: string }) {
    try {
      if (!this.scheduleInstance) {
        this.scheduleInstance = await createScheduleWithMongo();
      }

      const user: User = { id: body.userId };
      const coursesSet = this.scheduleInstance.listSchedule(user);

      // Convert Set to Array
      const coursesArray = Array.from(coursesSet);

      // Format for frontend
      const formattedCourses = coursesArray.map((course: Course) => ({
        courseId: course.courseID,
        name: course.title,
        description: `Instructor: ${course.instructor}`,
        credits: 3,
        subject: course.courseID.split("-")[0] || "Unknown",
        meets: course.meetingTimes.map((mt) =>
          `${mt.day} ${mt.start}-${mt.end}`
        ),
        instructor: course.instructor,
        location: course.location,
        campus: course.campus,
      }));

      return formattedCourses;
    } catch (error) {
      console.error("❌ ScheduleConcept: Error listing schedule:", error);
      return { error: error.message };
    }
  }

  /**
   * Clear a user's schedule
   */
  async clearSchedule(body: { userId: string }) {
    try {
      if (!this.scheduleInstance) {
        this.scheduleInstance = await createScheduleWithMongo();
      }

      const user: User = { id: body.userId };
      this.scheduleInstance.clear(user);

      return { success: true, message: "Schedule cleared" };
    } catch (error) {
      console.error("❌ ScheduleConcept: Error clearing schedule:", error);
      return { error: error.message };
    }
  }

  /**
   * Set AI preferences for course recommendations
   */
  async setAIPreferences(
    body: {
      userId: string;
      major: string;
      interests: string[];
      availability: string[];
    },
  ) {
    try {
      if (!this.scheduleInstance) {
        this.scheduleInstance = await createScheduleWithMongo();
      }

      const user: User = { id: body.userId };
      this.scheduleInstance.setAIPreferences(
        user,
        body.major,
        new Set(body.interests),
        new Set(body.availability),
      );

      return { success: true, message: "AI preferences set" };
    } catch (error) {
      console.error("❌ ScheduleConcept: Error setting AI preferences:", error);
      return { error: error.message };
    }
  }

  /**
   * Get AI course suggestion
   */
  async suggestCourseAI(body: { userId: string }) {
    try {
      if (!this.scheduleInstance) {
        this.scheduleInstance = await createScheduleWithMongo();
      }

      const user: User = { id: body.userId };
      const suggestedCourse = await this.scheduleInstance.suggestCourseAI(user);

      // Format for frontend
      return {
        courseId: suggestedCourse.courseID,
        name: suggestedCourse.title,
        description: `Instructor: ${suggestedCourse.instructor}`,
        credits: 3,
        subject: suggestedCourse.courseID.split("-")[0] || "Unknown",
        meets: suggestedCourse.meetingTimes.map((mt) =>
          `${mt.day} ${mt.start}-${mt.end}`
        ),
        instructor: suggestedCourse.instructor,
        location: suggestedCourse.location,
        campus: suggestedCourse.campus,
      };
    } catch (error) {
      console.error("❌ ScheduleConcept: Error suggesting course:", error);
      return { error: error.message };
    }
  }
}
