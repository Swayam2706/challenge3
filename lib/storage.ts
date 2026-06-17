/**
 * Privacy-first persistence layer.
 *
 * All user data lives in the browser's localStorage and never leaves the
 * device. This keeps the app private by default (a security/privacy win) and
 * removes the need for accounts or a database.
 *
 * Reads are defensive: stored JSON is validated with Zod, so corrupted or
 * tampered data degrades gracefully to empty state instead of crashing.
 */

import { z } from "zod";
import { calculatorInputSchema } from "@/lib/carbon/schema";

const HISTORY_KEY = "ecotrack:history:v1";
const GOAL_KEY = "ecotrack:goal:v1";

/** A saved footprint calculation, used to chart progress over time. */
export const historyEntrySchema = z.object({
  id: z.string(),
  /** ISO-8601 timestamp of when the entry was recorded. */
  date: z.string(),
  totalAnnualKg: z.number().finite().nonnegative(),
  input: calculatorInputSchema,
});

export type HistoryEntry = z.infer<typeof historyEntrySchema>;

const historySchema = z.array(historyEntrySchema);

/** A user-defined reduction goal, expressed as a target annual footprint. */
export const goalSchema = z.object({
  targetAnnualKg: z.number().finite().positive(),
  createdAt: z.string(),
});

export type Goal = z.infer<typeof goalSchema>;

/** True only in a browser environment; guards against SSR access. */
function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function readJson<T>(key: string, schema: z.ZodType<T>, fallback: T): T {
  if (!hasStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = schema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : fallback;
  } catch {
    // Malformed JSON or storage access error — fail safe.
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage may be full or disabled (e.g. private mode); ignore silently.
  }
}

/** Load the full calculation history, newest entries last. */
export function loadHistory(): HistoryEntry[] {
  return readJson(HISTORY_KEY, historySchema, []);
}

/**
 * Append a history entry and persist it. Returns the updated list. Older
 * entries are capped to keep storage bounded.
 */
export function appendHistory(entry: HistoryEntry): HistoryEntry[] {
  const MAX_ENTRIES = 100;
  const next = [...loadHistory(), entry].slice(-MAX_ENTRIES);
  writeJson(HISTORY_KEY, next);
  return next;
}

/** Load the user's reduction goal, if one has been set. */
export function loadGoal(): Goal | null {
  return readJson<Goal | null>(GOAL_KEY, goalSchema.nullable(), null);
}

/** Persist a reduction goal. */
export function saveGoal(goal: Goal): void {
  writeJson(GOAL_KEY, goal);
}

/** Remove all stored EcoTrack data from the device. */
export function clearAllData(): void {
  if (!hasStorage()) return;
  window.localStorage.removeItem(HISTORY_KEY);
  window.localStorage.removeItem(GOAL_KEY);
}

/** Generate a reasonably unique id without pulling in a dependency. */
export function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
