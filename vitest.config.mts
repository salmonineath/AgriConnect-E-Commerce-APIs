import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    // One in-memory MongoDB per test file; files run one after another
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 120000,
  },
});
