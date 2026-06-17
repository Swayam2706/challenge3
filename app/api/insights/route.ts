/**
 * POST /api/insights
 *
 * Returns personalized carbon-reduction insights for a validated footprint.
 * Strategy:
 *   1. Reject oversized bodies (defence against memory-exhaustion abuse).
 *   2. Rate-limit by client IP to protect against abuse and cost.
 *   3. Validate the request body with Zod (reject malformed payloads).
 *   4. If a Gemini key is configured, ask the model; on ANY failure, fall back
 *      to the deterministic rule-based engine so the endpoint never errors out.
 *
 * The secret API key is read on the server only and is never returned to the
 * client.
 */

import { NextResponse } from "next/server";
import { insightsRequestSchema } from "@/lib/carbon/schema";
import { generateRuleBasedInsights } from "@/lib/insights/rules";
import { generateAiInsights, isAiConfigured } from "@/lib/insights/ai";
import { rateLimit } from "@/lib/rate-limit";
import type { InsightsResponse } from "@/lib/insights/types";

// The Gemini SDK requires the Node.js runtime (not the Edge runtime).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Maximum accepted request body size (8 KB is ample for this payload). */
const MAX_BODY_BYTES = 8 * 1024;

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request): Promise<NextResponse> {
  // 1. Reject obviously oversized payloads early.
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: "Request body too large." },
      { status: 413 },
    );
  }

  // 2. Rate limiting.
  const { allowed, retryAfterSeconds } = rateLimit(getClientIp(request));
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
    );
  }

  // 3. Parse and validate the body.
  let body: unknown;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: "Request body too large." },
        { status: 413 },
      );
    }
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const parsed = insightsRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { input } = parsed.data;

  // 4. AI with graceful fallback.
  let result: InsightsResponse;
  if (isAiConfigured()) {
    try {
      result = await generateAiInsights(input);
    } catch (error) {
      // Log server-side for observability; never leak details to the client.
      console.error("AI insights failed, falling back to rules:", error);
      result = generateRuleBasedInsights(input);
    }
  } else {
    result = generateRuleBasedInsights(input);
  }

  return NextResponse.json(result, { status: 200 });
}
