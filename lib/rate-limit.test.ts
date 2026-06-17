import { beforeEach, describe, expect, it, vi } from "vitest";
import { __resetRateLimiter, activeWindowCount, rateLimit } from "./rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    __resetRateLimiter();
  });

  it("allows requests up to the limit", () => {
    for (let i = 0; i < 3; i += 1) {
      expect(rateLimit("ip-a", 3, 1000).allowed).toBe(true);
    }
  });

  it("blocks requests once the limit is exceeded", () => {
    rateLimit("ip-b", 2, 1000);
    rateLimit("ip-b", 2, 1000);
    const result = rateLimit("ip-b", 2, 1000);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("tracks separate callers independently", () => {
    rateLimit("ip-c", 1, 1000);
    expect(rateLimit("ip-c", 1, 1000).allowed).toBe(false);
    expect(rateLimit("ip-d", 1, 1000).allowed).toBe(true);
  });

  it("prunes expired windows so the map stays bounded", () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(0);
      __resetRateLimiter();
      rateLimit("a", 5, 1000);
      rateLimit("b", 5, 1000);
      expect(activeWindowCount()).toBe(2);

      // Jump past both the window and the sweep interval, then make a call
      // that should trigger pruning of the two now-expired entries.
      vi.setSystemTime(70_000);
      rateLimit("c", 5, 1000);
      expect(activeWindowCount()).toBe(1);
    } finally {
      vi.useRealTimers();
    }
  });
});
