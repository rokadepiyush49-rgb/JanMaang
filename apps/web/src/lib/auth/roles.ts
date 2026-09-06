/**
 * Role and permission definitions.
 *
 * MIRRORS services/api/app/core/permissions.py. Generated into
 * @janmaang/contracts from the API's OpenAPI schema — do not hand-edit the
 * generated copy, and do not let this file drift from the Python one.
 *
 * This is UX only. Authorisation is enforced server-side by the API, always.
 * Hiding a button is not access control.
 */

export const ROLES = [
  "citizen",
  "student",
  "faculty",
  "institute",
  "panchayat",
  "department",
  "officer",
  "industry",
  "gov_admin",
  "super_admin",
] as const;

export type Role = (typeof ROLES)[number];

/** Landing route per role, used after login and by the middleware. */
export const ROLE_HOME: Record<Role, string> = {
  citizen: "/", // citizens use the mobile app; the web landing is public
  student: "/student",
  faculty: "/faculty",
  institute: "/institute",
  panchayat: "/panchayat",
  department: "/department",
  officer: "/officer",
  industry: "/industry",
  gov_admin: "/admin",
  super_admin: "/admin",
};

/** Which roles may enter each route segment under (app). */
export const SEGMENT_ROLES: Record<string, readonly Role[]> = {
  student: ["student", "super_admin"],
  faculty: ["faculty", "institute", "super_admin"],
  institute: ["institute", "super_admin"],
  panchayat: ["panchayat", "gov_admin", "super_admin"],
  department: ["department", "gov_admin", "super_admin"],
  officer: ["officer", "department", "super_admin"],
  industry: ["industry", "super_admin"],
  admin: ["gov_admin", "super_admin"],
};

export function canEnter(segment: string, role: Role): boolean {
  return SEGMENT_ROLES[segment]?.includes(role) ?? false;
}
