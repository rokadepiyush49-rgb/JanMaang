import { describe, expect, it } from "vitest";

import {
  newSession,
  SESSION_TTL_SECONDS,
  signSession,
  verifySession,
  type Session,
} from "./session";

const SECRET = "test-secret-at-least-sixteen-chars";
const OTHER_SECRET = "a-completely-different-secret-key";

const student = (): Session =>
  newSession({
    userId: "u-student-1",
    name: "Aisha Patel",
    role: "student",
    affiliation: "Ranchi University",
  });

describe("session tokens", () => {
  it("round-trips a session it signed", async () => {
    const session = student();
    const token = await signSession(session, SECRET);

    expect(await verifySession(token, SECRET)).toEqual(session);
  });

  it("expires the session after the TTL", async () => {
    const session = student();
    expect(session.expiresAt - session.issuedAt).toBe(SESSION_TTL_SECONDS);
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await signSession(student(), OTHER_SECRET);

    expect(await verifySession(token, SECRET)).toBeNull();
  });

  // The whole point of signing: a visitor must not be able to promote
  // themselves by editing the role out of a cookie they can plainly read.
  it("rejects a payload edited to a higher role", async () => {
    const token = await signSession(student(), SECRET);
    const [payload, signature] = token.split(".");
    const decoded = JSON.parse(atob(payload!.replace(/-/g, "+").replace(/_/g, "/")));

    expect(decoded.role).toBe("student");
    decoded.role = "super_admin";
    const forged = btoa(JSON.stringify(decoded))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    expect(await verifySession(`${forged}.${signature}`, SECRET)).toBeNull();
  });

  it("rejects an already-expired token even though the signature is good", async () => {
    const expired: Session = {
      ...student(),
      issuedAt: 1_000,
      expiresAt: 2_000, // long past
    };
    const token = await signSession(expired, SECRET);

    expect(await verifySession(token, SECRET)).toBeNull();
  });

  it("rejects a role that is no longer in ROLES", async () => {
    const token = await signSession(
      { ...student(), role: "wizard" as never },
      SECRET,
    );

    expect(await verifySession(token, SECRET)).toBeNull();
  });

  it("returns null for junk rather than throwing", async () => {
    for (const token of [undefined, "", "no-dot", "a.b", "....", "%%%.%%%"]) {
      expect(await verifySession(token, SECRET), token).toBeNull();
    }
  });
});
