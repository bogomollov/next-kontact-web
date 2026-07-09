import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

describe("apiFetch", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.unstubAllGlobals();
  });

  it("targets the local API outside of production", async () => {
    process.env.NODE_ENV = "test";

    const { apiFetch } = await import("../../lib/apiFetch");
    await apiFetch("/users/me");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/api/users/me",
      expect.any(Object),
    );
  });

  it("targets NEXT_PUBLIC_API_URL in production", async () => {
    process.env.NODE_ENV = "production";
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";

    const { apiFetch } = await import("../../lib/apiFetch");
    await apiFetch("/users/me");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/users/me",
      expect.any(Object),
    );
  });

  it("forwards request options and returns the response", async () => {
    process.env.NODE_ENV = "test";

    const { apiFetch } = await import("../../lib/apiFetch");
    const response = await apiFetch("/chats", {
      method: "POST",
      credentials: "include",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/api/chats",
      expect.objectContaining({ method: "POST", credentials: "include" }),
    );
    expect(response.status).toBe(200);
  });
});
