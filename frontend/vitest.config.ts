import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    env: {
      NODE_ENV: "test",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      include: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}", "features/**/*.{ts,tsx}", "lib/**/*.{ts,tsx}"],
    },
  },
  resolve: {
    alias: [
      {
        find: /^@\/types$/,
        replacement: path.resolve(__dirname, "../packages/shared/src/index.ts"),
      },
      {
        find: /^@\/types\//,
        replacement: path.resolve(__dirname, "../packages/shared/src/") + "/",
      },
      { find: "@", replacement: path.resolve(__dirname, ".") },
    ],
  },
});
