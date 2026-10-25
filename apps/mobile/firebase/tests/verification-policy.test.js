// Unit tests for the decisions submitVerification and analyzeReport make.
// The Firestore transactions only gather facts and apply the result; these
// pure functions decide, so testing them tests the security logic itself.

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { consumeQuota } from "../functions/lib/quota.js";
import {
  assertMayClaimKind,
  assertMayVerify,
  nextDemandStatus,
} from "../functions/lib/verificationPolicy.js";

const refusedWith = (code) => (error) => error.code === code;

const facts = (overrides = {}) => ({
  uid: "alice",
  isOfficer: false,
  kind: "citizen",
  demand: { status: "inProgress", reporterId: "alice" },
  isSupporter: false,
  alreadyVerified: false,
  ...overrides,
});

describe("assertMayVerify: who may record a verdict", () => {
  it("lets the reporter verify their own demand", () => {
    assert.doesNotThrow(() => assertMayVerify(facts()));
  });

  it("lets a supporter verify", () => {
    assert.doesNotThrow(() =>
      assertMayVerify(facts({ uid: "bob", isSupporter: true })),
    );
  });

  // The original bug: any signed-in account could close any demand.
  it("refuses a stranger who neither raised nor backed the demand", () => {
    assert.throws(
      () => assertMayVerify(facts({ uid: "mallory" })),
      refusedWith("permission-denied"),
    );
  });

  it("refuses a field verdict without the officer claim", () => {
    assert.throws(
      () => assertMayVerify(facts({ kind: "field" })),
      refusedWith("permission-denied"),
    );
    assert.throws(() => assertMayClaimKind("field", false), refusedWith("permission-denied"));
  });

  it("lets an officer give a field verdict on any demand", () => {
    assert.doesNotThrow(() =>
      assertMayVerify(facts({ uid: "officer-1", kind: "field", isOfficer: true })),
    );
  });

  it("does not let the officer claim stand in for a citizen's right", () => {
    assert.throws(
      () => assertMayVerify(facts({ uid: "officer-1", isOfficer: true })),
      refusedWith("permission-denied"),
    );
  });

  it("refuses a missing demand and one not awaiting verification", () => {
    assert.throws(() => assertMayVerify(facts({ demand: null })), refusedWith("not-found"));
    for (const status of ["reported", "funded", "citizenVerified"]) {
      assert.throws(
        () => assertMayVerify(facts({ demand: { status, reporterId: "alice" } })),
        refusedWith("failed-precondition"),
      );
    }
  });

  it("refuses a second verdict from the same person", () => {
    assert.throws(
      () => assertMayVerify(facts({ alreadyVerified: true })),
      refusedWith("already-exists"),
    );
  });
});

describe("nextDemandStatus: what a verdict does", () => {
  it("closes only on a citizen's 'fixed'", () => {
    assert.equal(nextDemandStatus(true, "citizen"), "citizenVerified");
  });

  it("never closes on an officer's 'fixed' alone", () => {
    assert.equal(nextDemandStatus(true, "field"), null);
  });

  it("reopens on 'still broken' from either side", () => {
    assert.equal(nextDemandStatus(false, "citizen"), "funded");
    assert.equal(nextDemandStatus(false, "field"), "funded");
  });
});

describe("consumeQuota: analyzeReport's hourly budget", () => {
  const HOUR = 60 * 60 * 1000;

  it("starts a window on the first call", () => {
    assert.deepEqual(consumeQuota(undefined, 1_000, 20, HOUR), {
      allowed: true,
      next: { windowStart: 1_000, count: 1 },
    });
  });

  it("refuses the call after the limit and writes nothing", () => {
    let state;
    for (let i = 0; i < 20; i += 1) {
      const result = consumeQuota(state, 1_000 + i, 20, HOUR);
      assert.equal(result.allowed, true);
      state = result.next;
    }
    assert.deepEqual(consumeQuota(state, 2_000, 20, HOUR), { allowed: false });
  });

  it("opens a fresh window once the hour has passed", () => {
    const spent = { windowStart: 1_000, count: 20 };
    assert.deepEqual(consumeQuota(spent, 1_000 + HOUR, 20, HOUR), {
      allowed: true,
      next: { windowStart: 1_000 + HOUR, count: 1 },
    });
  });
});
