// Security tests for firestore.rules and storage.rules.
//
// Run with `npm test` from this folder: it starts the Firestore and Storage
// emulators under the offline `demo-` project id, so no real project, login or
// credentials are touched. Every "fails" case below was allowed before the
// rules were tightened.

import { readFileSync } from "node:fs";
import { after, before, beforeEach, describe, it } from "node:test";

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { deleteObject, ref, uploadBytes } from "firebase/storage";

const rules = (file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");

let env;

before(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-janmaang",
    firestore: { rules: rules("firestore.rules") },
    storage: { rules: rules("storage.rules") },
  });
});

after(async () => {
  await env?.cleanup();
});

// Wipe both emulators before EVERY test. This must be registered inside each
// describe: node:test runs a top-level beforeEach once per suite, not once
// per test, which let state leak between tests and made some "refuses"
// cases hit a leftover document instead of the rule under test.
async function reset() {
  await env.clearFirestore();
  await env.clearStorage();
}

const as = (uid, claims = {}) => env.authenticatedContext(uid, claims);
const anon = () => env.unauthenticatedContext();

const newDemand = (reporterId, extra = {}) => ({
  reporterId,
  status: "reported",
  title: "Handpump platform collapsed",
  description: "Near the primary school",
  ...extra,
});

async function seed(path, data) {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), path), data);
  });
}

describe("firestore: demands", () => {
  beforeEach(reset);

  it("lets a signed-in citizen file a well-formed demand", async () => {
    await assertSucceeds(
      setDoc(doc(as("alice").firestore(), "demands/d1"), newDemand("alice")),
    );
  });

  for (const field of [
    "supporterCount",
    "scoreBreakdown",
    "totalRanked",
    "code",
    "rank",
    "priorityScore",
    "clusterId",
  ]) {
    it(`refuses a new demand that sets server-only ${field}`, async () => {
      await assertFails(
        setDoc(
          doc(as("alice").firestore(), "demands/d1"),
          newDemand("alice", { [field]: 5000 }),
        ),
      );
    });
  }

  it("refuses a demand filed in someone else's name", async () => {
    await assertFails(
      setDoc(doc(as("mallory").firestore(), "demands/d1"), newDemand("alice")),
    );
  });

  it("refuses a demand that starts past 'reported'", async () => {
    await assertFails(
      setDoc(
        doc(as("alice").firestore(), "demands/d1"),
        newDemand("alice", { status: "citizenVerified" }),
      ),
    );
  });

  it("lets the reporter correct the description", async () => {
    await seed("demands/d1", newDemand("alice"));
    await assertSucceeds(
      updateDoc(doc(as("alice").firestore(), "demands/d1"), {
        description: "Next to the Anganwadi",
      }),
    );
  });

  it("refuses the reporter handing the demand to another account", async () => {
    await seed("demands/d1", newDemand("alice"));
    await assertFails(
      updateDoc(doc(as("alice").firestore(), "demands/d1"), { reporterId: "bob" }),
    );
  });

  it("refuses the reporter moving their own status or rank", async () => {
    await seed("demands/d1", newDemand("alice"));
    const demand = doc(as("alice").firestore(), "demands/d1");
    await assertFails(updateDoc(demand, { status: "citizenVerified" }));
    await assertFails(updateDoc(demand, { priorityScore: 99 }));
  });

  it("refuses edits by anyone but the reporter", async () => {
    await seed("demands/d1", newDemand("alice"));
    await assertFails(
      updateDoc(doc(as("mallory").firestore(), "demands/d1"), { description: "x" }),
    );
  });

  it("keeps demands publicly readable (the queue is a public record)", async () => {
    await seed("demands/d1", newDemand("alice"));
    await assertSucceeds(getDoc(doc(anon().firestore(), "demands/d1")));
  });
});

describe("firestore: supporters", () => {
  beforeEach(reset);

  it("lets a citizen back an existing demand as themselves", async () => {
    await seed("demands/d1", newDemand("alice"));
    await assertSucceeds(
      setDoc(doc(as("bob").firestore(), "demands/d1/supporters/bob"), { at: 1 }),
    );
  });

  it("refuses backing a demand that does not exist", async () => {
    await assertFails(
      setDoc(doc(as("bob").firestore(), "demands/ghost/supporters/bob"), { at: 1 }),
    );
  });

  it("refuses adding someone else as a supporter", async () => {
    await seed("demands/d1", newDemand("alice"));
    await assertFails(
      setDoc(doc(as("bob").firestore(), "demands/d1/supporters/carol"), { at: 1 }),
    );
  });
});

describe("firestore: server-only collections", () => {
  beforeEach(reset);

  for (const path of [
    "verifications/v1",
    "clusters/c1",
    "ledgerEntries/l1",
    "allocations/a1",
    "rateLimits/analyzeReport_alice",
  ]) {
    it(`refuses client writes to ${path}`, async () => {
      await assertFails(setDoc(doc(as("alice", { officer: true }).firestore(), path), { x: 1 }));
    });
  }

  it("hides the quota counters from the user they count", async () => {
    await seed("rateLimits/analyzeReport_alice", { count: 1, windowStart: 0 });
    await assertFails(getDoc(doc(as("alice").firestore(), "rateLimits/analyzeReport_alice")));
  });
});

describe("firestore: users", () => {
  beforeEach(reset);

  it("refuses self-granting the field-officer flag or trust level", async () => {
    const db = as("alice").firestore();
    await assertFails(setDoc(doc(db, "users/alice"), { uid: "alice", isFieldOfficer: true }));
    await assertFails(setDoc(doc(db, "users/alice"), { uid: "alice", trustLevel: 9 }));
  });

  it("hides one citizen's profile from another", async () => {
    await seed("users/alice", { uid: "alice", phone: "redacted" });
    await assertFails(getDoc(doc(as("bob").firestore(), "users/alice")));
  });
});

const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 4]);
const jpeg = { contentType: "image/jpeg" };

async function seedFile(path) {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await uploadBytes(ref(ctx.storage(), path), JPEG, jpeg);
  });
}

describe("storage: evidence photos", () => {
  beforeEach(reset);

  it("lets a citizen upload a photo to their own report folder", async () => {
    await assertSucceeds(uploadBytes(ref(as("alice").storage(), "reports/alice/d1/a.jpg"), JPEG, jpeg));
  });

  it("refuses uploads into another citizen's folder", async () => {
    await assertFails(uploadBytes(ref(as("bob").storage(), "reports/alice/d1/a.jpg"), JPEG, jpeg));
  });

  it("refuses SVG (script-capable, served publicly)", async () => {
    await assertFails(
      uploadBytes(ref(as("alice").storage(), "reports/alice/d1/a.svg"), JPEG, {
        contentType: "image/svg+xml",
      }),
    );
  });

  it("refuses empty and oversized files", async () => {
    const storage = as("alice").storage();
    await assertFails(uploadBytes(ref(storage, "reports/alice/d1/empty.jpg"), new Uint8Array(0), jpeg));
    await assertFails(
      uploadBytes(ref(storage, "reports/alice/d1/big.jpg"), new Uint8Array(9 * 1024 * 1024), jpeg),
    );
  });

  it("refuses overwriting existing evidence, even by its owner", async () => {
    await seedFile("reports/alice/d1/a.jpg");
    await assertFails(uploadBytes(ref(as("alice").storage(), "reports/alice/d1/a.jpg"), JPEG, jpeg));
  });

  it("refuses anonymous uploads", async () => {
    await assertFails(uploadBytes(ref(anon().storage(), "reports/alice/d1/a.jpg"), JPEG, jpeg));
  });

  it("refuses overwriting or deleting another person's verification photo", async () => {
    await seedFile("verifications/alice/v1/p.jpg");
    const bob = as("bob").storage();
    await assertFails(uploadBytes(ref(bob, "verifications/alice/v1/p.jpg"), JPEG, jpeg));
    await assertFails(deleteObject(ref(bob, "verifications/alice/v1/p.jpg")));
    await assertFails(uploadBytes(ref(bob, "verifications/alice/v1/new.jpg"), JPEG, jpeg));
  });

  it("lets the owner add and delete their own verification photo", async () => {
    const alice = as("alice").storage();
    await assertSucceeds(uploadBytes(ref(alice, "verifications/alice/v1/p.jpg"), JPEG, jpeg));
    await assertSucceeds(deleteObject(ref(alice, "verifications/alice/v1/p.jpg")));
  });
});
