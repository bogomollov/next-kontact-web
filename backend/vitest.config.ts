import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    env: {
      NODE_ENV: "test",
      DATABASE_URL: "postgresql://test:test@localhost:5432/test",
      REDIS_URL: "redis://127.0.0.1:6379",
      ACCESS_SECRET: "test_access_secret_do_not_use_in_production",
      NEXT_PUBLIC_URL: "http://localhost:3000",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      include: ["src/**/*.ts"],
      exclude: ["src/lib/prisma.ts"],
    },
  },
});
