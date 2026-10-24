import path from "node:path";

import type { NextConfig } from "next";

const config: NextConfig = {
  // Emits a minimal server bundle so the production image stays small.
  output: "standalone",
  reactStrictMode: true,
  // Workspace packages ship TypeScript source rather than a build step.
  transpilePackages: ["@janmaang/ui", "@janmaang/tokens", "@janmaang/contracts"],
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
