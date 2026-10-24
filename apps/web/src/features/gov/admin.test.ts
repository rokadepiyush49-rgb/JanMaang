// @vitest-environment node
// jsdom rewrites import.meta.url to http://, and this test reads from disk.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { ROLES } from "@/lib/auth/roles";
import { DISTRICTS, PERMISSIONS, ROLE_PERMISSIONS, STATE } from "./admin";

/**
 * The Users & Roles screen shows a permission matrix copied from the API.
 * A copy is only safe if something notices when the original moves, so this
 * reads the Python source and compares. Crude regex parsing, on purpose: the
 * file's shape is simple and pulling in a Python parser to read it would cost
 * more than it saves.
 */
const PY = readFileSync(
  fileURLToPath(
    new URL(
      "../../../../../services/api/app/core/permissions.py",
      import.meta.url,
    ),
  ),
  "utf8",
);

/** `PROBLEM_CREATE = "problem:create"` → { PROBLEM_CREATE: "problem:create" } */
const ENUM = Object.fromEntries(
  [...PY.matchAll(/^\s+([A-Z_]+) = "([a-z_:]+)"$/gm)].map((m) => [m[1], m[2]]),
);

function apiPermissionsFor(role: string): string[] {
  if (role === "super_admin") return Object.values(ENUM);
  const block = new RegExp(
    `Role\\.${role.toUpperCase()}: frozenset\\(\\s*\\{([^}]*)\\}`,
    "m",
  ).exec(PY);
  if (!block?.[1]) throw new Error(`No ROLE_PERMISSIONS entry for ${role}`);
  return [...block[1].matchAll(/Permission\.([A-Z_]+)/g)].map(
    (m) => ENUM[m[1] ?? ""] ?? `unknown:${m[1]}`,
  );
}

describe("admin permission matrix", () => {
  it("lists exactly the API's permissions", () => {
    expect([...PERMISSIONS].sort()).toEqual(Object.values(ENUM).sort());
  });

  it.each(ROLES)("matches ROLE_PERMISSIONS for %s", (role) => {
    expect([...ROLE_PERMISSIONS[role]].sort()).toEqual(
      apiPermissionsFor(role).sort(),
    );
  });
});

describe("state fixtures", () => {
  it("has one row per district", () => {
    expect(DISTRICTS).toHaveLength(STATE.districts);
    expect(new Set(DISTRICTS.map((d) => d.name)).size).toBe(STATE.districts);
  });
});
