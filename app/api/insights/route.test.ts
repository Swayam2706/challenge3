import { beforeEach, describe, expect, it, vi } from "vitest";

// The route imports the server-only AI module. We mock it so tests never load
// `server-only` or make a network call, and so we can drive each code path.
vi.mock("@/lib/insights/ai", () => ({
  isAiConfigured: vi.fn(() => false),
  generateAiInsights: vi.fn(),
}));

import { POST } from "./route";
import { isAiConfigured, generateAiInsights } from "@/lib/insights/ai";
import { __resetRateLimiter } from "@/lib/rate-limit";
import { DEFAULT_INPUT } from "@/lib/carbon/calculator";

function makeRequest(
  body: unknown,
  { ip = "10.0.0.1", rawBody }: { ip?: string; rawBody?: string } = {},
): Request {
  return new Request("http://localhost/api/insights", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": ip,
    },
    body: rawBody ?? JSON.stringify(body),
  });
}

const validBody = { input: DEFAULT_INPUT };

describe("POST /api/insights", () => {
  beforeEach(() => {
    __resetRateLimiter();
    vi.mocked(isAiConfigured).mockReturnValue(false);
    vi.mocked(generateAiInsights).mockReset();
  });

  it("returns 200 with rule-based insights when AI is not configured", async () => {
    const res = await POST(makeRequest(validBody, { ip: "10.0.0.2" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.source).toBe("rules");
    expect(Array.isArray(json.insights)).toBe(true);
  });

  it("rejects malformed JSON with 400", async () => {
    const res = await POST(
      makeRequest(null, { ip: "10.0.0.3", rawBody: "{not json" }),
    );
    expect(res.status).toBe(400);
  });

  it("rejects input that fails schema validation with 400", async () => {
    const res = await POST(
      makeRequest({ input: { diet: { type: "banana" } } }, { ip: "10.0.0.4" }),
    );
    expect(res.status).toBe(400);
  });

  it("rejects an oversized body with 413", async () => {
    const huge = "x".repeat(9000);
    const res = await POST(
      makeRequest(null, { ip: "10.0.0.5", rawBody: huge }),
    );
    expect(res.status).toBe(413);
  });

  it("uses the AI result when configured", async () => {
    vi.mocked(isAiConfigured).mockReturnValue(true);
    vi.mocked(generateAiInsights).mockResolvedValue({
      source: "ai",
      summary: "AI summary",
      insights: [
        {
          id: "ai-0",
          category: "transport",
          title: "Test",
          description: "desc",
          estimatedAnnualSavingKg: 100,
          difficulty: "easy",
        },
      ],
    });
    const res = await POST(makeRequest(validBody, { ip: "10.0.0.6" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.source).toBe("ai");
  });

  it("falls back to rules when the AI call throws", async () => {
    vi.mocked(isAiConfigured).mockReturnValue(true);
    vi.mocked(generateAiInsights).mockRejectedValue(new Error("AI down"));
    const res = await POST(makeRequest(validBody, { ip: "10.0.0.7" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.source).toBe("rules");
  });

  it("rate-limits repeated requests from the same IP", async () => {
    const ip = "10.0.0.99";
    let lastStatus = 200;
    for (let i = 0; i < 25; i += 1) {
      const res = await POST(makeRequest(validBody, { ip }));
      lastStatus = res.status;
    }
    expect(lastStatus).toBe(429);
  });
});
