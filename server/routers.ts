import { z } from "zod";
import { and, eq, gt, lt } from "drizzle-orm";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { findOverlappingTutorSession, getDb, getSessionById, getStudentProgress, getTutorflowProfile, getTutorflowProfileById, listStudentSessions, listTutorSessions, listTutorStudents, listTutorAvailability, upsertTutorAvailability, createInvitationLink, listTutorInvitations, redeemInvitationLink } from "./db";
import { lessonMaterials, sessions, tutorflowProfiles } from "../drizzle/schema";
import { storagePut } from "./storage";

const sessionState = z.enum(["scheduled", "in_progress", "completed", "ai_reviewed"]);
const stateOrder = { scheduled: 0, in_progress: 1, completed: 2, ai_reviewed: 3 } as const;
export function isValidSessionTransition(current: keyof typeof stateOrder, next: keyof typeof stateOrder) { return stateOrder[next] === stateOrder[current] + 1; }
export function hasTimeOverlap(newStart: Date, newEnd: Date, existingStart: Date, existingEnd: Date) { return newStart < existingEnd && newEnd > existingStart; }
export function isTutorRole(role: string | undefined) { return role === "tutor"; }
export function requireTutorRole(role: string | undefined) { if (!isTutorRole(role)) throw new Error("Tutor access required"); return true; }
export function isSessionNotesEditable(state: keyof typeof stateOrder) { return state === "scheduled" || state === "in_progress"; }
export function requireEditableSession(state: keyof typeof stateOrder) { if (!isSessionNotesEditable(state)) throw new Error("Completed sessions are read-only"); return true; }
async function ensureTutor(userId: number) { const profile = await getTutorflowProfile(userId); if (profile) requireTutorRole(profile.role); return profile; }

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  profile: router({
    me: protectedProcedure.query(async ({ ctx }) => getTutorflowProfile(ctx.user.id)),
    save: protectedProcedure.input(z.object({ role: z.enum(["tutor", "student"]), fullName: z.string().min(2), email: z.string().email().optional(), avatarUrl: z.string().optional(), address: z.string().optional(), classGrade: z.string().optional(), schoolCollege: z.string().optional(), learningGoals: z.string().optional() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { ...input, userId: ctx.user.id };
      const existing = await db.select({ id: tutorflowProfiles.id }).from(tutorflowProfiles).where(eq(tutorflowProfiles.userId, ctx.user.id)).limit(1);
      if (existing[0]) {
        await db.update(tutorflowProfiles).set(input).where(eq(tutorflowProfiles.userId, ctx.user.id));
        return { ...input, userId: ctx.user.id };
      }
      await db.insert(tutorflowProfiles).values({ ...input, userId: ctx.user.id });
      return { ...input, userId: ctx.user.id };
    }),
    uploadAvatar: protectedProcedure.input(z.object({ base64: z.string().min(20), mimeType: z.enum(["image/png", "image/jpeg", "image/webp"]) })).mutation(async ({ ctx, input }) => {
      const raw = input.base64.replace(/^data:[^;]+;base64,/, "");
      const { url, key } = await storagePut(`profiles/${ctx.user.id}/avatar`, Buffer.from(raw, "base64"), input.mimeType);
      return { url, key };
    }),
  }),
  sessions: router({
    list: protectedProcedure.query(async ({ ctx }) => { await ensureTutor(ctx.user.id); return listTutorSessions(ctx.user.id); }),
    students: protectedProcedure.query(async ({ ctx }) => { await ensureTutor(ctx.user.id); return listTutorStudents(ctx.user.id); }),
    student: protectedProcedure.input(z.object({ id: z.number().int() })).query(async ({ ctx, input }) => { await ensureTutor(ctx.user.id); return getTutorflowProfileById(input.id); }),
    get: protectedProcedure.input(z.object({ id: z.number().int() })).query(async ({ ctx, input }) => { const profile = await ensureTutor(ctx.user.id); const session = await getSessionById(input.id); if (!session || session.tutorId !== ctx.user.id) throw new Error("Session not found"); return session; }),
    mine: protectedProcedure.query(async ({ ctx }) => { const profile = await getTutorflowProfile(ctx.user.id); if (profile && profile.role !== "student") throw new Error("Student access required"); return listStudentSessions(ctx.user.id); }),
    schedule: protectedProcedure.input(z.object({ studentId: z.number().int(), startTime: z.date(), endTime: z.date(), topic: z.string().min(2) })).mutation(async ({ ctx, input }) => {
      await ensureTutor(ctx.user.id);
      if (input.endTime <= input.startTime) throw new Error("End time must be after start time");
      const db = await getDb();
      if (!db) return { ...input, tutorId: ctx.user.id, state: "scheduled" as const };
      const overlap = await findOverlappingTutorSession(ctx.user.id, input.startTime, input.endTime);
      if (overlap) throw new Error("This tutor already has an overlapping session");
      const result = await db.insert(sessions).values({ ...input, tutorId: ctx.user.id }).returning({ id: sessions.id });
      return { id: result[0]?.id ?? 0, ...input, tutorId: ctx.user.id, state: "scheduled" as const };
    }),
    transition: protectedProcedure.input(z.object({ id: z.number().int(), nextState: sessionState })).mutation(async ({ ctx, input }) => {
      await ensureTutor(ctx.user.id);
      const db = await getDb();
      if (!db) return { id: input.id, state: input.nextState };
      const rows = await db.select().from(sessions).where(and(eq(sessions.id, input.id), eq(sessions.tutorId, ctx.user.id))).limit(1);
      const current = rows[0];
      if (!current) throw new Error("Session not found");
      if (!isValidSessionTransition(current.state, input.nextState)) throw new Error("Session states must advance sequentially");
      await db.update(sessions).set({ state: input.nextState }).where(eq(sessions.id, input.id));
      return { id: input.id, state: input.nextState };
    }),
    updateNotes: protectedProcedure.input(z.object({ id: z.number().int(), liveNotes: z.string(), homework: z.string().optional() })).mutation(async ({ ctx, input }) => {
      await ensureTutor(ctx.user.id);
      const db = await getDb();
      if (!db) return input;
      const rows = await db.select({ state: sessions.state }).from(sessions).where(and(eq(sessions.id, input.id), eq(sessions.tutorId, ctx.user.id))).limit(1);
      if (!rows[0]) throw new Error("Session not found");
      requireEditableSession(rows[0].state);
      await db.update(sessions).set({ liveNotes: input.liveNotes, homework: input.homework }).where(eq(sessions.id, input.id));
      return input;
    }),
    aiPlan: protectedProcedure.input(z.object({ topic: z.string(), goals: z.string(), grade: z.string(), recentSummaries: z.string().optional() })).mutation(async ({ input }) => {
      const response = await invokeLLM({ messages: [{ role: "system", content: "You are an expert 1-on-1 tutor planner. Return a practical lesson plan as JSON." }, { role: "user", content: JSON.stringify(input) }], response_format: { type: "json_schema", json_schema: { name: "lesson_plan", strict: true, schema: { type: "object", properties: { warmUp: { type: "string" }, keyConcepts: { type: "array", items: { type: "string" } }, discussionPrompts: { type: "array", items: { type: "string" } }, practiceQuestions: { type: "array", items: { type: "string" } } }, required: ["warmUp", "keyConcepts", "discussionPrompts", "practiceQuestions"], additionalProperties: false } } } });
      return JSON.parse(String(response.choices?.[0]?.message?.content ?? "{}"));
    }),
    aiReview: protectedProcedure.input(z.object({ notes: z.string(), plan: z.string().optional(), studentBackground: z.string() })).mutation(async ({ input }) => {
      const response = await invokeLLM({ messages: [{ role: "system", content: "You are an expert tutor reviewer. Return a concise structured lesson review as JSON." }, { role: "user", content: JSON.stringify(input) }], response_format: { type: "json_schema", json_schema: { name: "lesson_review", strict: true, schema: { type: "object", properties: { summary: { type: "string" }, keyTakeaways: { type: "array", items: { type: "string" } }, homework: { type: "array", items: { type: "string" } } }, required: ["summary", "keyTakeaways", "homework"], additionalProperties: false } } } });
      return JSON.parse(String(response.choices?.[0]?.message?.content ?? "{}"));
    }),
  }),
  materials: router({
    create: protectedProcedure.input(z.object({ sessionId: z.number().int(), title: z.string().min(2), body: z.string().min(2) })).mutation(async ({ ctx, input }) => { await ensureTutor(ctx.user.id); const db = await getDb(); if (!db) return { ...input, tutorId: ctx.user.id }; await db.insert(lessonMaterials).values({ ...input, tutorId: ctx.user.id }); return { ...input, tutorId: ctx.user.id }; }),
  }),
  progress: router({
    /** Student queries their own progress. */
    student: protectedProcedure.query(async ({ ctx }) => {
      return getStudentProgress(ctx.user.id);
    }),
    /** Tutor queries a specific student's progress. */
    forStudent: protectedProcedure.input(z.object({ studentId: z.number().int() })).query(async ({ ctx, input }) => {
      await ensureTutor(ctx.user.id);
      return getStudentProgress(input.studentId);
    }),
  }),
  availability: router({
    /** Get the logged-in tutor's availability slots. */
    get: protectedProcedure.query(async ({ ctx }) => {
      await ensureTutor(ctx.user.id);
      return listTutorAvailability(ctx.user.id);
    }),
    /** Replace all availability slots for the tutor. */
    set: protectedProcedure.input(z.object({ slots: z.array(z.object({ dayOfWeek: z.number().int().min(0).max(6), startTime: z.string().regex(/^\d{2}:\d{2}$/), endTime: z.string().regex(/^\d{2}:\d{2}$/) })) })).mutation(async ({ ctx, input }) => {
      await ensureTutor(ctx.user.id);
      return upsertTutorAvailability(ctx.user.id, input.slots);
    }),
    /** Public: anyone can view a tutor's availability. */
    public: publicProcedure.input(z.object({ tutorId: z.number().int() })).query(async ({ input }) => {
      return listTutorAvailability(input.tutorId);
    }),
  }),
  invitations: router({
    /** Tutor generates a new invitation link. */
    create: protectedProcedure.input(z.object({ label: z.string().optional() })).mutation(async ({ ctx, input }) => {
      await ensureTutor(ctx.user.id);
      return createInvitationLink(ctx.user.id, input.label);
    }),
    /** Tutor lists all their invitation links. */
    list: protectedProcedure.query(async ({ ctx }) => {
      await ensureTutor(ctx.user.id);
      return listTutorInvitations(ctx.user.id);
    }),
    /** Student redeems an invitation code. */
    redeem: protectedProcedure.input(z.object({ code: z.string().min(1) })).mutation(async ({ ctx, input }) => {
      return redeemInvitationLink(input.code, ctx.user.id);
    }),
  }),
});
export type AppRouter = typeof appRouter;
