import { describe, expect, it } from "vitest";

import { RateLimiter } from "./rate-limit";

function clock(start = 0) {
  let t = start;
  return { now: () => t, advance: (ms: number) => (t += ms) };
}

describe("RateLimiter", () => {
  it("allows up to the limit, then refuses with a Retry-After", () => {
    const c = clock();
    const limiter = new RateLimiter(3, 60_000, 100, c.now);
    expect([1, 2, 3].map(() => limiter.take("u1").ok)).toEqual([
      true,
      true,
      true,
    ]);

    const refused = limiter.take("u1");
    expect(refused.ok).toBe(false);
    expect(refused.retryAfter).toBe(60);
  });

  it("keeps each key's budget separate", () => {
    const limiter = new RateLimiter(1, 60_000);
    expect(limiter.take("a").ok).toBe(true);
    expect(limiter.take("b").ok).toBe(true);
    expect(limiter.take("a").ok).toBe(false);
  });

  it("opens a fresh window once the old one expires", () => {
    const c = clock();
    const limiter = new RateLimiter(1, 1_000, 100, c.now);
    expect(limiter.take("u").ok).toBe(true);
    expect(limiter.take("u").ok).toBe(false);
    c.advance(1_000);
    expect(limiter.take("u").ok).toBe(true);
  });

  it("stays bounded when flooded with new identities", () => {
    const limiter = new RateLimiter(1, 60_000, 10);
    for (let i = 0; i < 1_000; i += 1) limiter.take(`id-${i}`);
    // The newest key is still tracked and limited.
    expect(limiter.take("id-999").ok).toBe(false);
  });
});
