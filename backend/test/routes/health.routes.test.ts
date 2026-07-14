import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import router from "../../src/routes/health.routes";
import { buildTestApp } from "../helpers/app";
import { prismaMock } from "../mocks/prisma";
import { redisMock } from "../mocks/redis";

const app = buildTestApp("/health", router);

describe("GET /health", () => {
  it("returns 200 when the database and redis are reachable", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
    expect(prismaMock.$queryRaw).toHaveBeenCalled();
    expect(redisMock.ping).toHaveBeenCalled();
  });

  it("returns 503 when the database is unreachable", async () => {
    vi.mocked(prismaMock.$queryRaw).mockRejectedValueOnce(new Error("connection refused"));

    const res = await request(app).get("/health");

    expect(res.status).toBe(503);
    expect(res.body).toEqual({ status: "error" });
  });

  it("returns 503 when redis is unreachable", async () => {
    redisMock.ping.mockRejectedValueOnce(new Error("connection refused"));

    const res = await request(app).get("/health");

    expect(res.status).toBe(503);
    expect(res.body).toEqual({ status: "error" });
  });
});
