import { serial, integer, pgEnum, pgTable, text, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const profileRoleEnum = pgEnum("profile_role", ["tutor", "student"]);
export const sessionStateEnum = pgEnum("session_state", ["scheduled", "in_progress", "completed", "ai_reviewed"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("open_id", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("login_method", { length: 64 }),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in", { withTimezone: true }).defaultNow().notNull(),
});
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const tutorflowProfiles = pgTable("tutorflow_profiles", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").notNull().unique(),
  role: profileRoleEnum("role").default("student").notNull(),
  fullName: varchar("full_name", { length: 240 }).notNull(),
  email: varchar("email", { length: 320 }),
  avatarUrl: text("avatar_url"),
  address: text("address"),
  classGrade: varchar("class_grade", { length: 120 }),
  schoolCollege: varchar("school_college", { length: 240 }),
  learningGoals: text("learning_goals"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  tutorId: serial("tutor_id").notNull(),
  studentId: serial("student_id").notNull(),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }).notNull(),
  state: sessionStateEnum("state").default("scheduled").notNull(),
  topic: varchar("topic", { length: 240 }).notNull(),
  liveNotes: text("live_notes"),
  homework: text("homework"),
  aiPlan: jsonb("ai_plan"),
  aiSummary: jsonb("ai_summary"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const lessonMaterials = pgTable("lesson_materials", {
  id: serial("id").primaryKey(),
  sessionId: serial("session_id").notNull(),
  tutorId: serial("tutor_id").notNull(),
  title: varchar("title", { length: 240 }).notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/** Weekly recurring availability slots for a tutor (day 0 = Sunday). */
export const tutorAvailability = pgTable("tutor_availability", {
  id: serial("id").primaryKey(),
  tutorId: integer("tutor_id").notNull(),
  dayOfWeek: integer("day_of_week").notNull(),          // 0-6, Sunday=0
  startTime: varchar("start_time", { length: 5 }).notNull(), // "HH:MM"
  endTime: varchar("end_time", { length: 5 }).notNull(),     // "HH:MM"
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/** One-time invitation links a tutor generates for students to join their roster. */
export const invitationLinks = pgTable("invitation_links", {
  id: serial("id").primaryKey(),
  tutorId: integer("tutor_id").notNull(),
  code: varchar("code", { length: 21 }).notNull().unique(),
  label: text("label"),
  usedByStudentId: integer("used_by_student_id"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type TutorflowProfile = typeof tutorflowProfiles.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type LessonMaterial = typeof lessonMaterials.$inferSelect;
export type TutorAvailability = typeof tutorAvailability.$inferSelect;
export type InvitationLink = typeof invitationLinks.$inferSelect;
