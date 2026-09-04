import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function anonymousContext(): TrpcContext {
  return { user: undefined, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("TutorFlow access control", () => {
  it("rejects anonymous note updates", async () => {
    const caller = appRouter.createCaller(anonymousContext());
    await expect(caller.sessions.updateNotes({ id: 1, liveNotes: "attempt" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
