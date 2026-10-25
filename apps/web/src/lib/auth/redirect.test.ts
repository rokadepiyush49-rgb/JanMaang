import { describe, expect, it } from "vitest";

import { safeRedirectPath } from "./redirect";

const HOME = "/student";

describe("safeRedirectPath", () => {
  it.each([
    ["/officer/works/W-2041", "/officer/works/W-2041"],
    ["/admin?tab=audit#flags", "/admin?tab=audit#flags"],
    ["/", "/"],
  ])("keeps the same-origin path %s", (input, expected) => {
    expect(safeRedirectPath(input, HOME)).toBe(expected);
  });

  it.each([
    ["protocol-relative", "//evil.example/phish"],
    ["backslash authority", "/\\evil.example"],
    ["mixed slashes", "/\\/evil.example"],
    ["absolute URL", "https://evil.example"],
    ["javascript scheme", "javascript:alert(1)"],
    ["tab smuggled before second slash", "/\t/evil.example"],
    ["newline smuggled", "/\n/evil.example"],
    ["relative path", "admin"],
    ["empty", ""],
    ["over-long", `/${"a".repeat(3000)}`],
  ])("falls back for %s", (_label, input) => {
    expect(safeRedirectPath(input, HOME)).toBe(HOME);
  });

  it("falls back for anything that is not a string", () => {
    expect(safeRedirectPath(null, HOME)).toBe(HOME);
    expect(safeRedirectPath(undefined, HOME)).toBe(HOME);
    expect(safeRedirectPath(42, HOME)).toBe(HOME);
  });
});
