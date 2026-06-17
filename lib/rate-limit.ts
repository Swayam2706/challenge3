/**
 * Minimal in-memory fixed-window rate limiter.
 *
 * Protects the AI endpoint from abuse and runaway cost without adding external
 * infrastructure. For a single-instance deployment this is sufficient; a
 * multi-instance deployment would swap this for a shared store (e.g. Redis)
 * behind the same interface.
 */

interface WindowState {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, WindowState>();

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the window resets, when the limit has been hit. */
  retryAfterSeconds: number;
}

/**
 * Record a request from `key` and report whether it is within the limit.
 *
 * @param key        Caller identity (e.g. client IP).
 * @param limit      Maximum requests permitted per window.
 * @param windowMs   Window length in milliseconds.
 */
export function rateLimit(
  key: string,
  limit = 20,
  windowMs = 60_000,
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count < limit) {
    existing.count += 1;
    return { allowed: true, retryAfterSeconds: 0 };
  }

  return {
    allowed: false,
    retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
  };
}

/** Test helper to reset limiter state between cases. */
export function __resetRateLimiter(): void {
  buckets.clear();
}
