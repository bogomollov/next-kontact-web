import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import router from "../../src/routes/admin.routes";
import { buildTestApp } from "../helpers/app";
import { authCookie } from "../helpers/authCookie";
import * as adminService from "../../src/services/admin.service";
import { prismaMock } from "../mocks/prisma";

vi.mock("../../src/services/admin.service");

const app = buildTestApp("/api/admin", router);

describe("GET /api/admin", () => {
  it("returns 401 without a session", async () => {
    const res = await request(app).get("/api/admin");
    expect(res.status).toBe(401);
  });

  it("returns 403 for a non-admin caller", async () => {
    prismaMock.account.findUnique.mockResolvedValue({ deletedAt: null } as never);
    const cookie = await authCookie({ id: 1, role: "user" });

    const res = await request(app).get("/api/admin").set("Cookie", cookie);

    expect(res.status).toBe(403);
    expect(adminService.getDashboardData).not.toHaveBeenCalled();
  });

  it("returns the dashboard data wrapped in { data } for an admin caller", async () => {
    prismaMock.account.findUnique.mockResolvedValue({ deletedAt: null } as never);
    const cookie = await authCookie({ id: 1, role: "admin" });
    vi.mocked(adminService.getDashboardData).mockResolvedValue({
      users: [],
      accounts: [],
      positions: [],
      departments: [],
    });

    const res = await request(app).get("/api/admin").set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      data: { users: [], accounts: [], positions: [], departments: [] },
    });
  });

  it("forwards a service error", async () => {
    prismaMock.account.findUnique.mockResolvedValue({ deletedAt: null } as never);
    const cookie = await authCookie({ id: 1, role: "admin" });
    vi.mocked(adminService.getDashboardData).mockRejectedValue(new Error("db down"));

    const res = await request(app).get("/api/admin").set("Cookie", cookie);

    expect(res.status).toBe(500);
  });
});
