import { and, eq, gt, lt, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';
import { nanoid } from "nanoid";

import { sessions, tutorflowProfiles, tutorAvailability, invitationLinks } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL);
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getTutorflowProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(tutorflowProfiles).where(eq(tutorflowProfiles.userId, userId)).limit(1);
  return rows[0];
}

export async function listTutorSessions(tutorId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sessions).where(eq(sessions.tutorId, tutorId));
}

export async function findOverlappingTutorSession(tutorId: number, startTime: Date, endTime: Date) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select({ id: sessions.id }).from(sessions).where(and(eq(sessions.tutorId, tutorId), lt(sessions.startTime, endTime), gt(sessions.endTime, startTime))).limit(1);
  return rows[0];
}

export async function listStudentSessions(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sessions).where(eq(sessions.studentId, studentId));
}

export async function listTutorStudents(tutorId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tutorflowProfiles).where(eq(tutorflowProfiles.role, "student"));
}

export async function getTutorflowProfileById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tutorflowProfiles).where(eq(tutorflowProfiles.id, id)).limit(1);
  return result[0];
}

export async function getSessionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
  return result[0];
}

// ---------------------------------------------------------------------------
// Student progress aggregation
// ---------------------------------------------------------------------------

export async function getStudentProgress(studentId: number) {
  const db = await getDb();
  if (!db) return { completedLessons: 0, reviewedLessons: 0, topicsCovered: [] as string[], improvementPct: 0 };
  const rows = await db.select().from(sessions).where(eq(sessions.studentId, studentId));
  const completed = rows.filter(r => r.state === "completed" || r.state === "ai_reviewed");
  const reviewed = rows.filter(r => r.state === "ai_reviewed");

  // Unique topics from completed sessions
  const topicsCovered = Array.from(new Set(completed.map(s => s.topic)));

  // Simple improvement metric: ratio of reviewed vs total (× 100)
  const improvementPct = rows.length > 0 ? Math.round((reviewed.length / rows.length) * 100) : 0;

  return { completedLessons: completed.length, reviewedLessons: reviewed.length, topicsCovered, improvementPct };
}

// ---------------------------------------------------------------------------
// Tutor availability CRUD
// ---------------------------------------------------------------------------

export async function listTutorAvailability(tutorId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tutorAvailability).where(eq(tutorAvailability.tutorId, tutorId));
}

export async function upsertTutorAvailability(tutorId: number, slots: { dayOfWeek: number; startTime: string; endTime: string }[]) {
  const db = await getDb();
  if (!db) return slots;
  // Replace all existing slots with the new set
  await db.delete(tutorAvailability).where(eq(tutorAvailability.tutorId, tutorId));
  if (slots.length > 0) {
    await db.insert(tutorAvailability).values(slots.map(s => ({ ...s, tutorId })));
  }
  return slots;
}

// ---------------------------------------------------------------------------
// Invitation link lifecycle
// ---------------------------------------------------------------------------

const INVITATION_EXPIRY_DAYS = 7;

export async function createInvitationLink(tutorId: number, label?: string) {
  const db = await getDb();
  const code = nanoid();
  const expiresAt = new Date(Date.now() + INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  if (!db) return { code, label: label ?? null, tutorId, expiresAt, usedByStudentId: null };
  await db.insert(invitationLinks).values({ tutorId, code, label: label ?? null, expiresAt });
  return { code, label: label ?? null, tutorId, expiresAt, usedByStudentId: null };
}

export async function redeemInvitationLink(code: string, studentUserId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const rows = await db.select().from(invitationLinks).where(eq(invitationLinks.code, code)).limit(1);
  const link = rows[0];
  if (!link) throw new Error("Invitation link not found");
  if (link.usedByStudentId) throw new Error("Invitation link already used");
  if (link.expiresAt < new Date()) throw new Error("Invitation link expired");
  await db.update(invitationLinks).set({ usedByStudentId: studentUserId }).where(eq(invitationLinks.id, link.id));
  return { tutorId: link.tutorId };
}

export async function listTutorInvitations(tutorId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(invitationLinks).where(eq(invitationLinks.tutorId, tutorId));
}

