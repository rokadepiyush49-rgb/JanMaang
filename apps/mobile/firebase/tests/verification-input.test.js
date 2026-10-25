// Unit tests for submitVerification's input validation. Imports the compiled
// function code, so `npm test` builds ../functions first.

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  parseChecklist,
  parseDemandId,
  parsePhotoUrls,
} from "../functions/lib/verificationInput.js";

const rejects = (fn) => assert.throws(fn, (error) => error.code === "invalid-argument");

describe("parseDemandId", () => {
  it("accepts a Firestore auto-id", () => {
    assert.equal(parseDemandId("aZ09_-xYz"), "aZ09_-xYz");
  });

  it("rejects path traversal into sub-collections and junk", () => {
    for (const bad of ["d1/supporters/x", "", " ", "a".repeat(129), 42, null]) {
      rejects(() => parseDemandId(bad));
    }
  });
});

describe("parseChecklist", () => {
  it("accepts well-formed items and defaults to empty", () => {
    assert.deepEqual(parseChecklist([{ label: "Water flowing", done: true }]), [
      { label: "Water flowing", done: true },
    ]);
    assert.deepEqual(parseChecklist(undefined), []);
  });

  it("drops unknown keys rather than storing them", () => {
    assert.deepEqual(parseChecklist([{ label: "x", done: false, isAdmin: true }]), [
      { label: "x", done: false },
    ]);
  });

  it("rejects oversized and malformed checklists", () => {
    rejects(() => parseChecklist(Array.from({ length: 21 }, () => ({ label: "x", done: true }))));
    rejects(() => parseChecklist([{ label: "x".repeat(201), done: true }]));
    rejects(() => parseChecklist([{ label: "x", done: "yes" }]));
    rejects(() => parseChecklist("not a list"));
  });
});

describe("parsePhotoUrls", () => {
  it("accepts this project's Storage URLs", () => {
    const url =
      "https://firebasestorage.googleapis.com/v0/b/demo.appspot.com/o/verifications%2Falice%2Fv1%2Fp.jpg";
    assert.deepEqual(parsePhotoUrls([url]), [url]);
  });

  it("rejects script URLs, plain http and foreign hosts", () => {
    for (const bad of [
      "javascript:alert(1)",
      "http://firebasestorage.googleapis.com/x.jpg",
      "https://tracker.example/pixel.gif",
      "https://firebasestorage.googleapis.com.evil.example/x.jpg",
      "not a url",
    ]) {
      rejects(() => parsePhotoUrls([bad]));
    }
  });

  it("rejects more than ten photos", () => {
    const url = "https://storage.googleapis.com/demo/x.jpg";
    rejects(() => parsePhotoUrls(Array.from({ length: 11 }, () => url)));
  });
});
