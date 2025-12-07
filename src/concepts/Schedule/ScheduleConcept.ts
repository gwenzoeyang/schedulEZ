// src/concepts/Schedule/ScheduleConcept.ts

import { createScheduleWithMongo } from "../../Schedule.ts";
import type { User } from "../../Schedule.ts";

export default class ScheduleConcept {
  private schedule: any = null;

  constructor(private db: any) {}

  private async getSchedule() {
    if (!this.schedule) {
      this.schedule = await createScheduleWithMongo();
    }
    return this.schedule;
  }

  // ==================== Query Methods (underscore prefix) ====================

  /**
   * Get a schedule by ID (user's schedule)
   * Frontend calls: scheduleAPI.getScheduleById(schedule)
   */
  async _getScheduleById(params: { schedule: string }) {
    const schedule = await this.getSchedule();
    const user: User = { id: params.schedule };

    try {
      const courses = schedule.listSchedule(user);
      return {
        scheduleId: params.schedule,
        userId: params.schedule,
        courses: Array.from(courses),
        count: courses.size,
      };
    } catch (error) {
      // Schedule is empty or doesn't exist
      return {
        scheduleId: params.schedule,
        userId: params.schedule,
        courses: [],
        count: 0,
      };
    }
  }

  /**
   * Find schedules by criteria
   * Frontend calls: scheduleAPI.findSchedules(criteria)
   */
  async _findSchedules(params: any) {
    // This would need more complex implementation
    // For now, return empty array
    return [];
  }

  // ==================== Mutation Methods ====================

  /**
   * Create a new schedule
   * Frontend calls: scheduleAPI.createSchedule(scheduleData)
   */
  async createSchedule(params: {
    userId: string;
    scheduleName?: string;
    courses?: string[];
  }) {
    const schedule = await this.getSchedule();
    const user: User = { id: params.userId, name: params.scheduleName };

    // Add courses if provided
    if (params.courses && params.courses.length > 0) {
      for (const courseID of params.courses) {
        try {
          await schedule.addCourseById(user, courseID);
        } catch (error) {
          console.error(`Failed to add course ${courseID}:`, error);
        }
      }
    }

    return {
      success: true,
      scheduleId: params.userId,
      message: "Schedule created successfully",
    };
  }

  /**
   * Update a schedule (add/remove courses)
   * Frontend calls: scheduleAPI.updateSchedule(scheduleData)
   */
  async updateSchedule(params: {
    scheduleId: string;
    userId?: string;
    addCourses?: string[];
    removeCourses?: string[];
  }) {
    const schedule = await this.getSchedule();
    const user: User = { id: params.userId || params.scheduleId };

    // Remove courses
    if (params.removeCourses && params.removeCourses.length > 0) {
      for (const courseID of params.removeCourses) {
        try {
          schedule.removeCourse(user, courseID);
        } catch (error) {
          console.error(`Failed to remove course ${courseID}:`, error);
        }
      }
    }

    // Add courses
    if (params.addCourses && params.addCourses.length > 0) {
      for (const courseID of params.addCourses) {
        try {
          await schedule.addCourseById(user, courseID);
        } catch (error) {
          console.error(`Failed to add course ${courseID}:`, error);
        }
      }
    }

    return {
      success: true,
      scheduleId: params.scheduleId,
      message: "Schedule updated successfully",
    };
  }

  /**
   * Delete a schedule (clear all courses)
   * Frontend calls: scheduleAPI.deleteSchedule(schedule)
   */
  async deleteSchedule(params: { schedule: string }) {
    const schedule = await this.getSchedule();
    const user: User = { id: params.schedule };

    try {
      schedule.clear(user);
      return {
        success: true,
        message: "Schedule deleted successfully",
      };
    } catch (error) {
      return {
        success: false,
        error: "Schedule not found or already empty",
      };
    }
  }

  // ==================== Helper Methods for Frontend ====================

  /**
   * Add a single course to schedule
   * Convenience method for frontend
   */
  async addCourse(params: { userId: string; courseID: string }) {
    const schedule = await this.getSchedule();
    const user: User = { id: params.userId };

    await schedule.addCourseById(user, params.courseID);
    return {
      success: true,
      message: `Course ${params.courseID} added to schedule`,
    };
  }

  /**
   * Remove a single course from schedule
   * Convenience method for frontend
   */
  async removeCourse(params: { userId: string; courseID: string }) {
    const schedule = await this.getSchedule();
    const user: User = { id: params.userId };

    schedule.removeCourse(user, params.courseID);
    return {
      success: true,
      message: `Course ${params.courseID} removed from schedule`,
    };
  }

  /**
   * Get user's schedule
   * Convenience method for frontend
   */
  async getUserSchedule(params: { userId: string }) {
    return this._getScheduleById({ schedule: params.userId });
  }

  /**
   * Set AI preferences for course recommendations
   */
  async setAIPreferences(params: {
    userId: string;
    major: string;
    interests: string[];
    availability: string[];
  }) {
    const schedule = await this.getSchedule();
    const user: User = { id: params.userId };

    schedule.setAIPreferences(
      user,
      params.major,
      new Set(params.interests),
      new Set(params.availability),
    );

    return {
      success: true,
      message: "AI preferences set successfully",
    };
  }

  /**
   * Get AI course suggestion
   * @param excludeCourseIds - Array of course IDs to exclude (already in user's schedule)
   */
  async suggestCourse(params: { userId: string; excludeCourseIds?: string[] }) {
    const schedule = await this.getSchedule();
    const user: User = { id: params.userId };

    try {
      // Pass excludeCourseIds to filter out already enrolled courses
      const suggestion = await schedule.suggestCourseAI(
        user,
        params.excludeCourseIds || [],
      );
      return {
        success: true,
        suggestion,
      };
    } catch (error: any) {
      // Check if no courses available
      if (error.message && error.message.includes("no suitable course")) {
        return {
          success: false,
          allCoursesEnrolled: true,
          message: "All available courses have been added to your schedule",
        };
      }
      throw error;
    }
  }
}
