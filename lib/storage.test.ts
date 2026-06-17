import { beforeEach, describe, expect, it } from "vitest";
import {
  appendHistory,
  clearAllData,
  createId,
  loadGoal,
  loadHistory,
  saveGoal,
  type HistoryEntry,
} from "./storage";
import { DEFAULT_INPUT } from "@/lib/carbon/calculator";

function makeEntry(totalAnnualKg: number): HistoryEntry {
  return {
    id: Math.random().toString(36).slice(2),
    date: new Date().toISOString(),
    totalAnnualKg,
    input: DEFAULT_INPUT,
  };
}

describe("storage", () => {
  beforeEach(() => {
    clearAllData();
    window.localStorage.clear();
  });

  it("returns an empty history when nothing is stored", () => {
    expect(loadHistory()).toEqual([]);
  });

  it("appends and persists history entries", () => {
    appendHistory(makeEntry(5000));
    appendHistory(makeEntry(4000));
    const history = loadHistory();
    expect(history).toHaveLength(2);
    expect(history[1]?.totalAnnualKg).toBe(4000);
  });

  it("round-trips a saved goal", () => {
    saveGoal({ targetAnnualKg: 2300, createdAt: new Date().toISOString() });
    expect(loadGoal()?.targetAnnualKg).toBe(2300);
  });

  it("recovers gracefully from corrupted history data", () => {
    window.localStorage.setItem("ecotrack:history:v1", "{not valid json");
    expect(loadHistory()).toEqual([]);
  });

  it("ignores stored data that fails schema validation", () => {
    window.localStorage.setItem(
      "ecotrack:history:v1",
      JSON.stringify([{ id: "x", date: "today", totalAnnualKg: -5 }]),
    );
    expect(loadHistory()).toEqual([]);
  });

  it("clears all stored data", () => {
    appendHistory(makeEntry(5000));
    saveGoal({ targetAnnualKg: 2300, createdAt: new Date().toISOString() });
    clearAllData();
    expect(loadHistory()).toEqual([]);
    expect(loadGoal()).toBeNull();
  });

  it("generates unique, non-empty ids", () => {
    const a = createId();
    const b = createId();
    expect(a).toBeTruthy();
    expect(typeof a).toBe("string");
    expect(a).not.toBe(b);
  });

  it("caps history to a bounded number of entries", () => {
    for (let i = 0; i < 130; i += 1) {
      appendHistory(makeEntry(1000 + i));
    }
    expect(loadHistory().length).toBeLessThanOrEqual(100);
  });
});
