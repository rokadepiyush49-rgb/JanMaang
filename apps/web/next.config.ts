import path from "node:path";

import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/**
 * Content Security Policy, "without nonces" variant from the Next.js CSP
 * guide (node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md).
 *
 * Nonces were weighed and rejected for now: they need every page rendered
 * per request (the public home page is static), and a nonce in style-src
 * would block the inline `style={{ width }}` every progress bar here uses.
 * What this still enforces: no third-party script, frame, plugin, font or
 * connection origin; no framing by other sites; no <base> hijack; forms post
 * only to this origin. The app loads nothing from other hosts — Groq and the
 * TTS service are called server-side — so 'self' is the whole allowlist.
 * 'unsafe-eval' is development-only (React's dev error overlay needs it).
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self' data:",
  "media-src 'self' blob:",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Older browsers that ignore frame-ancestors.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  // Geolocation stays available for the officer's on-site check; nothing
  // here uses the camera API (photos go through <input capture>) or the mic.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self), browsing-topics=()",
  },
  // Production only: HSTS on localhost would pin plain-http dev servers to
  // https for a year. No `preload` — that is hard to undo and a DNS decision.
  ...(isDev
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains",
        },
      ]),
];

const config: NextConfig = {
  // Emits a minimal server bundle so the production image stays small.
  output: "standalone",
  reactStrictMode: true,
  // Do not advertise the framework and version to scanners.
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // Workspace packages ship TypeScript source rather than a build step.
  transpilePackages: [
    "@janmaang/ui",
    "@janmaang/tokens",
    "@janmaang/contracts",
  ],
  typedRoutes: true,
  // Pin the workspace root so Turbopack ignores any stray lockfile above it.
  turbopack: { root: path.resolve(__dirname, "../..") },
  // Dev only. Without these, the HMR socket is refused for any origin but
  // `localhost` and the page never finishes hydrating — every button on it is
  // silently inert. That bites whenever the app is opened on a loopback alias
  // or from a phone on the LAN, which is exactly when you are demoing it.
  allowedDevOrigins: ["127.0.0.1", "[::1]", "*.local"],
};

export default config;
