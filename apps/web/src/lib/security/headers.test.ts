// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

async function headersFor(env: "production" | "development") {
  vi.stubEnv("NODE_ENV", env);
  // next.config reads NODE_ENV at import time, so each call needs a fresh copy.
  vi.resetModules();
  const { default: config } = await import("../../../next.config");
  const rules = await config.headers!();
  const all = rules.find((rule) => rule.source === "/:path*");
  return new Map(all?.headers.map((h) => [h.key, h.value]));
}

describe("security headers (next.config.ts)", () => {
  it("sets a CSP that blocks framing, plugins and foreign origins", async () => {
    const csp =
      (await headersFor("production")).get("Content-Security-Policy") ?? "";
    for (const directive of [
      "default-src 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "connect-src 'self'",
    ]) {
      expect(csp).toContain(directive);
    }
  });

  it("never allows eval in production", async () => {
    const csp =
      (await headersFor("production")).get("Content-Security-Policy") ?? "";
    expect(csp).not.toContain("unsafe-eval");
  });

  it("sends HSTS in production only", async () => {
    expect(
      (await headersFor("production")).get("Strict-Transport-Security"),
    ).toMatch(/max-age=\d+/);
    expect(
      (await headersFor("development")).has("Strict-Transport-Security"),
    ).toBe(false);
  });

  it("sets the clickjacking, sniffing and referrer headers", async () => {
    const headers = await headersFor("production");
    expect(headers.get("X-Frame-Options")).toBe("DENY");
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.get("Referrer-Policy")).toBe(
      "strict-origin-when-cross-origin",
    );
  });
});
