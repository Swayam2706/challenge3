import "vitest";
import type { AxeMatchers } from "vitest-axe/matchers";

// Augment Vitest's matchers with the axe accessibility matcher.
declare module "vitest" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Assertion extends AxeMatchers {}
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
