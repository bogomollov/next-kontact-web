import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

describe("env", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("allows all variables to be unset", async () => {
    delete process.env.NEXT_PUBLIC_URL;
    delete process.env.NEXT_PUBLIC_API_URL;
    delete process.env.NEXT_PUBLIC_WS_URL;
    delete process.env.INTERNAL_API_URL;

    const { env } = await import("../../lib/env");

    expect(env).toEqual({
      NEXT_PUBLIC_URL: undefined,
      NEXT_PUBLIC_API_URL: undefined,
      NEXT_PUBLIC_WS_URL: undefined,
      INTERNAL_API_URL: undefined,
    });
  });

  it("parses valid URLs", async () => {
    process.env.NEXT_PUBLIC_URL = "https://example.com";
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";
    process.env.NEXT_PUBLIC_WS_URL = "wss://ws.example.com";
    process.env.INTERNAL_API_URL = "http://internal:3001/api";

    const { env } = await import("../../lib/env");

    expect(env.NEXT_PUBLIC_URL).toBe("https://example.com");
    expect(env.NEXT_PUBLIC_API_URL).toBe("https://api.example.com");
    expect(env.NEXT_PUBLIC_WS_URL).toBe("wss://ws.example.com");
    expect(env.INTERNAL_API_URL).toBe("http://internal:3001/api");
  });

  it("throws when a variable is not a valid URL", async () => {
    process.env.NEXT_PUBLIC_URL = "not-a-url";

    await expect(import("../../lib/env")).rejects.toThrow(
      "Invalid environment variables",
    );
  });
});
