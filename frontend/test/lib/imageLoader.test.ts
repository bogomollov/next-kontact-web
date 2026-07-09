import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

describe("imageLoader", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("returns the source unchanged when it is not a /static/ path", async () => {
    const { default: imageLoader } = await import("../../lib/imageLoader");

    expect(imageLoader({ src: "https://cdn.example.com/avatar.png" })).toBe(
      "https://cdn.example.com/avatar.png",
    );
  });

  it("prefixes /static/ paths with the local backend URL outside of production", async () => {
    process.env.NODE_ENV = "test";

    const { default: imageLoader } = await import("../../lib/imageLoader");

    expect(imageLoader({ src: "/static/avatar.png" })).toBe(
      "http://localhost:3001/static/avatar.png",
    );
  });

  it("prefixes /static/ paths with NEXT_PUBLIC_URL in production", async () => {
    process.env.NODE_ENV = "production";
    process.env.NEXT_PUBLIC_URL = "https://example.com";

    const { default: imageLoader } = await import("../../lib/imageLoader");

    expect(imageLoader({ src: "/static/avatar.png" })).toBe(
      "https://example.com/static/avatar.png",
    );
  });
});
