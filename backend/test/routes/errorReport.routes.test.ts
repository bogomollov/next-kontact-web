import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import router from "../../src/routes/errorReport.routes";
import { buildTestApp } from "../helpers/app";
import { logger } from "../../src/lib/logger";

vi.mock("../../src/lib/logger", () => ({
  logger: { error: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

const app = buildTestApp("/api/errors", router);

describe("POST /api/errors", () => {
  it("logs a valid report and returns 204", async () => {
    const res = await request(app)
      .post("/api/errors")
      .send({ message: "Boom", stack: "Error: Boom\n  at x", url: "/dashboard" });

    expect(res.status).toBe(204);
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "client",
        message: "Boom",
        stack: "Error: Boom\n  at x",
        url: "/dashboard",
      }),
      "Client-side error reported"
    );
  });

  it("returns 400 when message is missing", async () => {
    const res = await request(app).post("/api/errors").send({});

    expect(res.status).toBe(400);
    expect(logger.error).not.toHaveBeenCalled();
  });

  it("returns 400 when message exceeds the length limit", async () => {
    const res = await request(app)
      .post("/api/errors")
      .send({ message: "x".repeat(2001) });

    expect(res.status).toBe(400);
  });
});
