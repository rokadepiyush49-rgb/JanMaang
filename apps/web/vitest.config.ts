import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // Same stub the scripts use: the real package throws outside a bundler,
      // and the security tests need to import server-only modules directly.
      "server-only": fileURLToPath(
        new URL("./scripts/stubs/server-only.ts", import.meta.url),
      ),
    },
  },
});
