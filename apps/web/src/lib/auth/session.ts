/**
 * Session tokens: sign and verify.
 *
 * Web Crypto only, no Node built-ins, because this runs in three places with
 * three different runtimes — the proxy (Edge), route handlers (Node) and
 * server components. `crypto.subtle` is the one API all three share.
 *
 * The token is `base64url(payload).base64url(hmac)`. It is signed, NOT
 * encrypted: anyone holding it can read the role out of it. That is fine —
 * the point of the signature is that they cannot *change* it. Never put
 * anything in here you would not show the user.
 *
 * This still is not authorisation. A valid token gets you a rendered shell;
 * the API decides what data goes in it. See docs ADR 0004.
 */

import { ROLES, type Role } from "./roles";

export interface Session {
  userId: string;
  name: string;
  role: Role;
  /** Free-text affiliation shown in the shell — college, department, firm. */
  affiliation: string;
  /** Seconds since epoch. */
  issuedAt: number;
  expiresAt: number;
}

export const SESSION_COOKIE = "jm_session";

/** Eight hours. Long enough for a working day, short enough to matter. */
export const SESSION_TTL_SECONDS = 8 * 60 * 60;

const encoder = new TextEncoder();

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array<ArrayBuffer> {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, "="));
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

/**
 * The secret is server-only — it has no NEXT_PUBLIC_ prefix, so Next will not
 * inline it into the browser bundle. Missing in production is fatal on purpose:
 * falling back to a default would silently make every session forgeable.
 */
export function sessionSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (secret && secret.length >= 16) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "AUTH_SECRET is unset or too short. Generate one with: openssl rand -hex 32",
    );
  }
  return "dev-only-not-a-real-secret-change-me";
}

export async function signSession(
  session: Session,
  secret = sessionSecret(),
): Promise<string> {
  const payload = base64UrlEncode(encoder.encode(JSON.stringify(session)));
  const signature = await crypto.subtle.sign(
    "HMAC",
    await importKey(secret),
    encoder.encode(payload),
  );
  return `${payload}.${base64UrlEncode(new Uint8Array(signature))}`;
}

function isSession(value: unknown): value is Session {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.userId === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.affiliation === "string" &&
    typeof candidate.issuedAt === "number" &&
    typeof candidate.expiresAt === "number" &&
    ROLES.includes(candidate.role as Role)
  );
}

/**
 * Returns null for anything not provably ours and unexpired — a bad signature,
 * a truncated cookie, a role we have since removed, a token past its expiry.
 * Callers treat null as signed out; there is no partial trust.
 */
export async function verifySession(
  token: string | undefined,
  secret = sessionSecret(),
): Promise<Session | null> {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  let valid: boolean;
  try {
    // subtle.verify is constant-time; never compare signatures with ===.
    valid = await crypto.subtle.verify(
      "HMAC",
      await importKey(secret),
      base64UrlDecode(signature),
      encoder.encode(payload),
    );
  } catch {
    return null;
  }
  if (!valid) return null;

  try {
    const parsed: unknown = JSON.parse(
      new TextDecoder().decode(base64UrlDecode(payload)),
    );
    if (!isSession(parsed)) return null;
    if (parsed.expiresAt <= Math.floor(Date.now() / 1000)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function newSession(
  user: Pick<Session, "userId" | "name" | "role" | "affiliation">,
): Session {
  const issuedAt = Math.floor(Date.now() / 1000);
  return { ...user, issuedAt, expiresAt: issuedAt + SESSION_TTL_SECONDS };
}
