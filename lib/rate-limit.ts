/**
 * Minimal in-memory fixed-window rate limiter.
 *
 * Protects the AI endpoint from abuse and runaway cost without adding external
 * infrastructure. For a single-instance deployment this is sufficient; a
 * multi-instance deployment would swap this for a shared store (e.g. Redis)
 * behind the same interface.
 *
 * Memory is kept bounded: expired windows are pruned opportunistically on each
 * call (amortised O(1)), so the backing map never grows without limit even
 * under a stream of unique client keys.
 */

interface WindowState {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, WindowState>();

/** How often, at most, to sweep the whole map for expired entries. */
const SWEEP_INTERVAL_MS = 60_000;
let lastSweep = 0;

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the window resets, when the limit has been hit. */
  retryAfterSeconds: number;
}

/** Remove expired windows so the map size tracks *active* clients only. */
function sweepExpired(now: number): void {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, state] of buckets) {
    if (now >= state.resetAt) buckets.delete(key);
  }
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
  sweepExpired(now);

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

/** Current number of tracked windows. Exposed for observability/testing. */
export function activeWindowCount(): number {
  return buckets.size;
}

/** Test helper to reset limiter state between cases. */
export function __resetRateLimiter(): void {
  buckets.clear();
  lastSweep = 0;
}
