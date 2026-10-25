/**
 * Post-login redirect targets.
 *
 * `?next=` arrives from the address bar, so it is attacker-controlled. Anything
 * that is not a plain path on this origin falls back to the role's home page:
 * an open redirect on a government sign-in page is a phishing kit someone else
 * gets to use.
 *
 * `startsWith("/")` alone is not enough. Browsers treat `//evil.example` as
 * protocol-relative and normalise `/\evil.example` to the same thing, so both
 * leave the site. Resolving against a sentinel origin and checking the origin
 * survived catches those and any spelling not thought of here.
 */

const SENTINEL = "http://redirect.invalid";

/** C0 controls and DEL. A loop, because the lint rule rightly flags them in a regex. */
function hasControlCharacter(value: string): boolean {
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (code < 0x20 || code === 0x7f) return true;
  }
  return false;
}

export function safeRedirectPath(value: unknown, fallback: string): string {
  if (typeof value !== "string" || value.length === 0 || value.length > 2048) {
    return fallback;
  }
  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return fallback;
  }
  // Tabs and newlines are stripped by URL parsers, which can turn "/\t/x"
  // into "//x" after this check has passed.
  if (hasControlCharacter(value)) return fallback;

  try {
    const url = new URL(value, SENTINEL);
    if (url.origin !== SENTINEL) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
