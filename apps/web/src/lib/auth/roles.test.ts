import { describe, expect, it } from "vitest";

import { ROLES, ROLE_HOME, SEGMENT_ROLES, canEnter } from "./roles";

describe("role routing", () => {
  it("gives every role a landing route", () => {
    for (const role of ROLES) {
      expect(ROLE_HOME[role], `${role} has no home route`).toBeTruthy();
    }
  });

  it("lets each role into its own segment", () => {
    expect(canEnter("student", "student")).toBe(true);
    expect(canEnter("department", "department")).toBe(true);
  });

  it("keeps roles out of segments that are not theirs", () => {
    expect(canEnter("admin", "student")).toBe(false);
    expect(canEnter("department", "industry")).toBe(false);
    expect(canEnter("panchayat", "student")).toBe(false);
  });

  it("admits super_admin everywhere", () => {
    for (const segment of Object.keys(SEGMENT_ROLES)) {
      expect(canEnter(segment, "super_admin"), segment).toBe(true);
    }
  });

  it("never routes a citizen into a web dashboard segment", () => {
    for (const segment of Object.keys(SEGMENT_ROLES)) {
      expect(canEnter(segment, "citizen"), segment).toBe(false);
    }
  });

  it("returns false for an unknown segment rather than throwing", () => {
    expect(canEnter("does-not-exist", "super_admin")).toBe(false);
  });
});
