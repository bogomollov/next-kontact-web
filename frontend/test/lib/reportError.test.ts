import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

describe("reportError", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    process.env.NODE_ENV = "test";
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.unstubAllGlobals();
  });

  it("posts the report to /errors", async () => {
    const { reportError } = await import("../../lib/reportError");

    reportError({ message: "Boom", stack: "Error: Boom", url: "/dashboard" });
    await Promise.resolve();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/api/errors",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Boom", stack: "Error: Boom", url: "/dashboard" }),
      }),
    );
  });

  it("swallows a failed report instead of throwing", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));
    const { reportError } = await import("../../lib/reportError");

    expect(() => reportError({ message: "Boom" })).not.toThrow();
    await Promise.resolve();
  });
});
