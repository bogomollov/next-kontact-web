import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import router from "../../src/routes/general.routes";
import { buildTestApp } from "../helpers/app";
import { authCookie } from "../helpers/authCookie";
import * as userService from "../../src/services/user.service";
import * as accountService from "../../src/services/account.service";
import * as adminService from "../../src/services/admin.service";
import { prismaMock } from "../mocks/prisma";

vi.mock("../../src/services/user.service");
vi.mock("../../src/services/account.service");
vi.mock("../../src/services/admin.service");

const app = buildTestApp("/api", router);

async function loggedInCookie(id = 1) {
  prismaMock.account.findUnique.mockResolvedValue({ deletedAt: null } as never);
  return authCookie({ id, role: "user" });
}

describe("GET /api/me", () => {
  it("returns 401 without a session", async () => {
    const res = await request(app).get("/api/me");
    expect(res.status).toBe(401);
  });

  it("returns the current user on success", async () => {
    const cookie = await loggedInCookie(7);
    vi.mocked(userService.getMe).mockResolvedValue({ id: 7, username: "ivan" } as never);

    const res = await request(app).get("/api/me").set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 7, username: "ivan" });
    expect(userService.getMe).toHaveBeenCalledWith(7);
  });

  it("forwards a service error", async () => {
    const cookie = await loggedInCookie();
    vi.mocked(userService.getMe).mockRejectedValue(new Error("db down"));

    const res = await request(app).get("/api/me").set("Cookie", cookie);

    expect(res.status).toBe(500);
  });
});

describe("GET /api/accounts", () => {
  it("returns the paginated accounts envelope", async () => {
    const cookie = await loggedInCookie();
    vi.mocked(accountService.getAllAccounts).mockResolvedValue({
      data: [],
      page: 1,
      limit: 50,
      total: 0,
      totalPages: 1,
    });

    const res = await request(app).get("/api/accounts").set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it("forwards a service error", async () => {
    const cookie = await loggedInCookie();
    vi.mocked(accountService.getAllAccounts).mockRejectedValue(new Error("db down"));

    const res = await request(app).get("/api/accounts").set("Cookie", cookie);

    expect(res.status).toBe(500);
  });
});

describe("GET /api/users", () => {
  it("returns the paginated users envelope", async () => {
    const cookie = await loggedInCookie();
    vi.mocked(userService.getAllUsers).mockResolvedValue({
      data: [{ id: 1 }],
      page: 1,
      limit: 50,
      total: 1,
      totalPages: 1,
    } as never);

    const res = await request(app).get("/api/users").set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([{ id: 1 }]);
  });

  it("forwards a service error", async () => {
    const cookie = await loggedInCookie();
    vi.mocked(userService.getAllUsers).mockRejectedValue(new Error("db down"));

    const res = await request(app).get("/api/users").set("Cookie", cookie);

    expect(res.status).toBe(500);
  });
});

describe("GET /api/departments", () => {
  it("returns the paginated departments envelope", async () => {
    const cookie = await loggedInCookie();
    vi.mocked(adminService.getDepartments).mockResolvedValue({
      data: [{ id: 1, name: "IT" }],
      page: 1,
      limit: 50,
      total: 1,
      totalPages: 1,
    } as never);

    const res = await request(app).get("/api/departments").set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([{ id: 1, name: "IT" }]);
  });

  it("forwards a service error", async () => {
    const cookie = await loggedInCookie();
    vi.mocked(adminService.getDepartments).mockRejectedValue(new Error("db down"));

    const res = await request(app).get("/api/departments").set("Cookie", cookie);

    expect(res.status).toBe(500);
  });
});

describe("GET /api/positions", () => {
  it("returns the paginated positions envelope", async () => {
    const cookie = await loggedInCookie();
    vi.mocked(adminService.getPositions).mockResolvedValue({
      data: [],
      page: 1,
      limit: 50,
      total: 0,
      totalPages: 1,
    });

    const res = await request(app).get("/api/positions").set("Cookie", cookie);

    expect(res.status).toBe(200);
  });

  it("forwards a service error", async () => {
    const cookie = await loggedInCookie();
    vi.mocked(adminService.getPositions).mockRejectedValue(new Error("db down"));

    const res = await request(app).get("/api/positions").set("Cookie", cookie);

    expect(res.status).toBe(500);
  });
});
