import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DEMO_PASSWORD,
  authenticate,
  demoAuthEnabled,
  demoUserFor,
} from "./directory";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("demo directory gate", () => {
  it("is on in development", async () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(demoAuthEnabled()).toBe(true);
    expect(
      await authenticate("admin@janmaang.in", DEMO_PASSWORD),
    ).not.toBeNull();
  });

  it("refuses every persona in a production build by default", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DEMO_AUTH", "");
    expect(demoAuthEnabled()).toBe(false);
    // The Super Admin persona with the published password: the exact login
    // that would have taken over a production deploy.
    expect(await authenticate("admin@janmaang.in", DEMO_PASSWORD)).toBeNull();
    expect(demoUserFor("super_admin")).toBeUndefined();
  });

  it("accepts only the exact opt-in value in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DEMO_AUTH", "true");
    expect(demoAuthEnabled()).toBe(false);

    vi.stubEnv("DEMO_AUTH", "enabled");
    expect(demoAuthEnabled()).toBe(true);
    expect(
      await authenticate("admin@janmaang.in", DEMO_PASSWORD),
    ).not.toBeNull();
  });

  it("does not reveal which part of a bad login was wrong", async () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(await authenticate("nobody@janmaang.in", DEMO_PASSWORD)).toBeNull();
    expect(await authenticate("admin@janmaang.in", "wrong")).toBeNull();
  });
});
