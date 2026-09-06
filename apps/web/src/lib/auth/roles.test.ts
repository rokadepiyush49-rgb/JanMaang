import { describe, expect, it } from "vitest";

import {
  ROLES,
  ROLE_HOME,
  ROLE_LABEL,
  SEGMENT_ROLES,
  canEnter,
  segmentsFor,
} from "./roles";

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

  it("labels every role for the account menu", () => {
    for (const role of ROLES) {
      expect(ROLE_LABEL[role], `${role} has no label`).toBeTruthy();
    }
  });
});

describe("segmentsFor", () => {
  it("gives a single-segment role exactly its own segment", () => {
    expect(segmentsFor("student")).toEqual(["student"]);
    expect(segmentsFor("industry")).toEqual(["industry"]);
  });

  // These overlaps are the reason the switcher exists at all.
  it("gives an overlapping role every segment it may enter", () => {
    expect(segmentsFor("institute")).toEqual(["faculty", "institute"]);
    expect(segmentsFor("department")).toEqual(["department", "officer"]);
  });

  it("gives super_admin every segment", () => {
    expect(segmentsFor("super_admin")).toEqual(Object.keys(SEGMENT_ROLES));
  });

  it("gives a citizen none, so the switcher never renders for them", () => {
    expect(segmentsFor("citizen")).toEqual([]);
  });

  it("agrees with canEnter for every role and segment", () => {
    for (const role of ROLES) {
      const allowed = new Set(segmentsFor(role));
      for (const segment of Object.keys(SEGMENT_ROLES)) {
        expect(allowed.has(segment), `${role} / ${segment}`).toBe(
          canEnter(segment, role),
        );
      }
    }
  });
});
