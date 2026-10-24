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
};

export default config;
