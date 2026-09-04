import { describe, expect, it } from "vitest";
import { hasTimeOverlap, isSessionNotesEditable, isTutorRole, isValidSessionTransition, requireEditableSession, requireTutorRole } from "./routers";

describe("TutorFlow session rules", () => {
  it("allows only sequential state transitions", () => {
    expect(isValidSessionTransition("scheduled", "in_progress")).toBe(true);
    expect(isValidSessionTransition("in_progress", "completed")).toBe(true);
    expect(isValidSessionTransition("completed", "ai_reviewed")).toBe(true);
    expect(isValidSessionTransition("scheduled", "completed")).toBe(false);
    expect(isValidSessionTransition("completed", "scheduled")).toBe(false);
  });

  it("enforces tutor role boundaries and completed-session note locking", () => {
    expect(isTutorRole("tutor")).toBe(true);
    expect(isTutorRole("student")).toBe(false);
    expect(() => requireTutorRole("student")).toThrow("Tutor access required");
    expect(() => requireTutorRole("tutor")).not.toThrow();
    expect(isSessionNotesEditable("scheduled")).toBe(true);
    expect(isSessionNotesEditable("in_progress")).toBe(true);
    expect(isSessionNotesEditable("completed")).toBe(false);
    expect(isSessionNotesEditable("ai_reviewed")).toBe(false);
    expect(() => requireEditableSession("completed")).toThrow("Completed sessions are read-only");
    expect(() => requireEditableSession("ai_reviewed")).toThrow("Completed sessions are read-only");
  });

  it("detects overlapping tutor sessions using strict interval rules", () => {
    const start = new Date("2026-05-14T10:00:00Z");
    const end = new Date("2026-05-14T11:00:00Z");
    expect(hasTimeOverlap(new Date("2026-05-14T10:30:00Z"), new Date("2026-05-14T11:30:00Z"), start, end)).toBe(true);
    expect(hasTimeOverlap(new Date("2026-05-14T11:00:00Z"), new Date("2026-05-14T12:00:00Z"), start, end)).toBe(false);
  });
});
