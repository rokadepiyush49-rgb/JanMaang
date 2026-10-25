/**
 * Fixed-window rate limiting, in process memory.
 *
 * Enough to stop one account looping the paid AI routes from a script, which
 * is the abuse that actually costs money here. It is per server instance: with
 * N replicas a determined caller gets N times the budget. When the web tier
 * scales out, back this with Redis (already in the stack) using the same
 * `take()` contract — callers do not change.
 */

export interface RateLimitResult {
  ok: boolean;
  /** Requests left in the current window. */
  remaining: number;
  /** Seconds until the window resets; what goes in Retry-After. */
  retryAfter: number;
}

interface Window {
  count: number;
  resetAt: number;
}

export class RateLimiter {
  private readonly windows = new Map<string, Window>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    /** Upper bound on tracked keys, so a flood of identities cannot grow memory without end. */
    private readonly maxKeys = 10_000,
    private readonly now: () => number = Date.now,
  ) {}

  take(key: string): RateLimitResult {
    const now = this.now();
    let window = this.windows.get(key);

    if (!window || window.resetAt <= now) {
      if (!window && this.windows.size >= this.maxKeys) this.evictExpired(now);
      window = { count: 0, resetAt: now + this.windowMs };
      this.windows.set(key, window);
    }

    const retryAfter = Math.max(1, Math.ceil((window.resetAt - now) / 1000));
    if (window.count >= this.limit) {
      return { ok: false, remaining: 0, retryAfter };
    }
    window.count += 1;
    return { ok: true, remaining: this.limit - window.count, retryAfter };
  }

  private evictExpired(now: number): void {
    for (const [key, window] of this.windows) {
      if (window.resetAt <= now) this.windows.delete(key);
    }
    // Still full of live windows: drop the oldest rather than refuse to track.
    if (this.windows.size >= this.maxKeys) {
      const oldest = this.windows.keys().next().value;
      if (oldest !== undefined) this.windows.delete(oldest);
    }
  }
}
