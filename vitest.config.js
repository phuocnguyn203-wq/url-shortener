import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    env: {
      NODE_ENV: "test",
      DATABASE_URL: "file:./test.db",
      JWT_SECRET: "test-secret",
    },
    setupFiles: ["./tests/setup.js"],
    fileParallelism: false,
  },
});