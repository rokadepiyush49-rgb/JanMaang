import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Role } from "@/lib/auth/roles";
import type { Session } from "@/lib/auth/session";

// Only the cookie read is faked; every check in the guard runs for real.
const getSession = vi.fn<() => Promise<Session | null>>();
vi.mock("@/lib/auth/session.server", () => ({
  getSession: () => getSession(),
}));

const { guardCouncilRequest, readJsonBody } = await import("./guard");

let userCounter = 0;
function sessionFor(role: Role): Session {
  userCounter += 1;
  return {
    userId: `u-${role}-${userCounter}`,
    name: "Test User",
    role,
    affiliation: "Test",
    issuedAt: 0,
    expiresAt: 9_999_999_999,
  };
}

function post(body = "{}", headers: Record<string, string> = {}) {
  return new Request("https://janmaang.in/api/council/turn", {
    method: "POST",
    body,
    headers: { "content-type": "application/json", ...headers },
  });
}

async function statusOf(
  request: Request,
  route: "turn" | "verdict" | "speech" = "turn",
) {
  const result = await guardCouncilRequest(request, route);
  return "response" in result ? result.response.status : 200;
}

beforeEach(() => {
  getSession.mockReset();
});

describe("council guard", () => {
  it("rejects anonymous callers (the routes were open before)", async () => {
    getSession.mockResolvedValue(null);
    expect(await statusOf(post())).toBe(401);
  });

  it.each<Role>(["officer", "industry", "panchayat", "gov_admin"])(
    "rejects %s — the council belongs to the student hub",
    async (role) => {
      getSession.mockResolvedValue(sessionFor(role));
      expect(await statusOf(post())).toBe(403);
    },
  );

  it.each<Role>(["student", "super_admin"])("admits %s", async (role) => {
    getSession.mockResolvedValue(sessionFor(role));
    expect(await statusOf(post())).toBe(200);
  });

  it("rejects a cross-site request before reading the session", async () => {
    getSession.mockResolvedValue(sessionFor("student"));
    expect(await statusOf(post("{}", { origin: "https://evil.example" }))).toBe(
      403,
    );
    expect(getSession).not.toHaveBeenCalled();
  });

  it("accepts a same-origin Origin header", async () => {
    getSession.mockResolvedValue(sessionFor("student"));
    expect(await statusOf(post("{}", { origin: "https://janmaang.in" }))).toBe(
      200,
    );
  });

  it("rejects an oversized body by Content-Length", async () => {
    getSession.mockResolvedValue(sessionFor("student"));
    expect(
      await statusOf(
        post("{}", { "content-length": String(50_000) }),
        "speech",
      ),
    ).toBe(413);
  });

  it("rate-limits one user without touching another", async () => {
    const heavy = sessionFor("student");
    getSession.mockResolvedValue(heavy);
    const statuses: number[] = [];
    for (let i = 0; i < 5; i += 1)
      statuses.push(await statusOf(post(), "verdict"));
    expect(statuses).toEqual([200, 200, 200, 200, 429]);

    getSession.mockResolvedValue(sessionFor("student"));
    expect(await statusOf(post(), "verdict")).toBe(200);
  });

  it("sends Retry-After with a 429", async () => {
    getSession.mockResolvedValue(sessionFor("student"));
    let result = await guardCouncilRequest(post(), "verdict");
    for (let i = 0; i < 4; i += 1)
      result = await guardCouncilRequest(post(), "verdict");
    expect(
      "response" in result && result.response.headers.get("retry-after"),
    ).toMatch(/^\d+$/);
  });
});

describe("readJsonBody", () => {
  it("returns null for a body over the ceiling even without Content-Length", async () => {
    const big = JSON.stringify({ text: "x".repeat(20_000) });
    expect(await readJsonBody(post(big), "speech")).toBeNull();
  });

  it("returns null for malformed JSON and for non-object JSON", async () => {
    expect(await readJsonBody(post("{not json"), "turn")).toBeNull();
    expect(await readJsonBody(post("[1,2,3]"), "turn")).toBeNull();
  });

  it("parses a normal body", async () => {
    expect(
      await readJsonBody(post('{"agentId":"a","text":"hi"}'), "speech"),
    ).toEqual({
      agentId: "a",
      text: "hi",
    });
  });
});
