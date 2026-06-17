import { describe, expect, it } from "vitest";
import { extractJson } from "./json";

describe("extractJson", () => {
  it("parses a clean JSON object", () => {
    expect(extractJson('{"a":1}')).toEqual({ a: 1 });
  });

  it("extracts JSON from a fenced code block", () => {
    const text = 'Here you go:\n```json\n{"a":2}\n```';
    expect(extractJson(text)).toEqual({ a: 2 });
  });

  it("extracts JSON from a fence without a language tag", () => {
    expect(extractJson("```\n{\"b\":3}\n```")).toEqual({ b: 3 });
  });

  it("ignores prose surrounding a raw object", () => {
    expect(extractJson('Sure! {"c":4} hope that helps')).toEqual({ c: 4 });
  });

  it("throws when no JSON object is present", () => {
    expect(() => extractJson("no json here")).toThrow();
  });

  it("throws on malformed JSON", () => {
    expect(() => extractJson("{not valid}")).toThrow();
  });
});
