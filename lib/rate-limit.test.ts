import { beforeEach, describe, expect, it } from "vitest";
import { __resetRateLimiter, rateLimit } from "./rate-limit";

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
});
