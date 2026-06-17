import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
      // The `server-only` guard throws outside a React Server Component build;
      // alias it to an empty module so server utilities can be unit-tested.
      "server-only": fileURLToPath(new URL("./test/empty.ts", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      // Coverage is gated on the core domain logic, which is exhaustively
      // tested. Browser-only (charts, theme) and network/server-SDK modules are
      // excluded as they are better covered by integration/e2e, not unit tests.
      include: [
        "lib/carbon/calculator.ts",
        "lib/carbon/factors.ts",
        "lib/carbon/schema.ts",
        "lib/insights/rules.ts",
        "lib/insights/prompt.ts",
        "lib/insights/json.ts",
        "lib/insights/schema.ts",
        "lib/format.ts",
        "lib/rate-limit.ts",
        "lib/storage.ts",
        "lib/cn.ts",
      ],
      thresholds: {
        lines: 90,
        functions: 85,
        branches: 80,
        statements: 90,
      },
    },
  },
});
