/**
 * Tolerant JSON extraction for untrusted LLM output.
 *
 * Pure and dependency-free so it can be unit-tested in isolation. Gemini
 * usually returns clean JSON when asked, but may occasionally wrap it in
 * markdown fences or add stray prose; this isolates the first JSON object.
 * The extracted value is still validated by a Zod schema before use, so this
 * function never needs to trust the content — only locate it.
 */
export function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1] ?? text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("No JSON object found in AI response");
  }
  return JSON.parse(candidate.slice(start, end + 1));
}
