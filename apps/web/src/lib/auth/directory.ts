/**
 * THE SEAM. This file is the only thing standing in for real authentication,
 * and it is meant to be deleted.
 *
 * services/api/app/modules/auth is a stub today (`# TODO(auth): endpoints`),
 * so there is nothing to call yet. Every screen behind a role still needs a way
 * in, so this resolves credentials against a fixed list of demo personas —
 * one per role — and hands back the same shape the API will.
 *
 * Replacing it is one function: make `authenticate` POST to
 * `${NEXT_PUBLIC_API_URL}/auth/login` and return the user from the response.
 * Nothing else in the app imports the demo list, so nothing else has to change.
 *
 * Because it is credential-shaped, be blunt about what it is not: the password
 * below is a constant, it is in the repository, and it authenticates nobody.
 * Never deploy this to anything reachable from the internet.
 */

import type { Role } from "./roles";

export interface DirectoryUser {
  userId: string;
  name: string;
  email: string;
  role: Role;
  affiliation: string;
}

/** Shared by every demo persona. Not a secret; not pretending to be one. */
export const DEMO_PASSWORD = "janmaang";

export const DEMO_USERS: readonly DirectoryUser[] = [
  {
    userId: "u-student-1",
    name: "Aisha Patel",
    email: "aisha@student.janmaang.in",
    role: "student",
    affiliation: "Ranchi University · B.Tech CSE, 3rd year",
  },
  {
    userId: "u-faculty-1",
    name: "Dr. Rakesh Mahto",
    email: "rakesh@faculty.janmaang.in",
    role: "faculty",
    affiliation: "Ranchi University · Civil Engineering",
  },
  {
    userId: "u-institute-1",
    name: "Vinoba Bhave University",
    email: "office@institute.janmaang.in",
    role: "institute",
    affiliation: "Hazaribagh · Institute administration",
  },
  {
    userId: "u-panchayat-1",
    name: "Sunita Devi",
    email: "sunita@panchayat.janmaang.in",
    role: "panchayat",
    affiliation: "Angara Block · Gram Panchayat",
  },
  {
    userId: "u-department-1",
    name: "Jharkhand PHED",
    email: "phed@dept.janmaang.in",
    role: "department",
    affiliation: "Public Health Engineering Department",
  },
  {
    userId: "u-officer-1",
    name: "Anand Kumar",
    email: "anand@officer.janmaang.in",
    role: "officer",
    affiliation: "PHED · Ranchi district",
  },
  {
    userId: "u-industry-1",
    name: "Tata Steel Foundation",
    email: "csr@industry.janmaang.in",
    role: "industry",
    affiliation: "CSR partner · Jamshedpur",
  },
  {
    userId: "u-gov-admin-1",
    name: "Meera Singh",
    email: "meera@gov.janmaang.in",
    role: "gov_admin",
    affiliation: "Department of Planning · Government of Jharkhand",
  },
  {
    userId: "u-super-admin-1",
    name: "Platform Admin",
    email: "admin@janmaang.in",
    role: "super_admin",
    affiliation: "JanMaang platform operations",
  },
];

export function demoUserFor(role: Role): DirectoryUser | undefined {
  return DEMO_USERS.find((user) => user.role === role);
}

/**
 * Async and Promise-returning on purpose: the real implementation is a network
 * call, and callers should already be written to await it.
 */
export async function authenticate(
  email: string,
  password: string,
): Promise<DirectoryUser | null> {
  const match = DEMO_USERS.find(
    (user) => user.email.toLowerCase() === email.trim().toLowerCase(),
  );
  if (!match || password !== DEMO_PASSWORD) return null;
  return match;
}
