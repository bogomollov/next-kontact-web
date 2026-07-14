import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import router from "../../src/routes/account.routes";
import { buildTestApp } from "../helpers/app";
import { authCookie } from "../helpers/authCookie";
import { AppError } from "../../src/middleware/error";
import * as accountService from "../../src/services/account.service";
import { prismaMock } from "../mocks/prisma";

vi.mock("../../src/services/account.service");

const app = buildTestApp("/api/accounts", router);

async function loggedInCookie(id = 1, role: "user" | "admin" = "user") {
  prismaMock.account.findUnique.mockResolvedValue({ deletedAt: null } as never);
  return authCookie({ id, role });
}

describe("PATCH /api/accounts/:id", () => {
  it("returns 401 without a session", async () => {
    const res = await request(app).patch("/api/accounts/1").send({ username: "x" });
    expect(res.status).toBe(401);
  });

  it("returns 400 for a non-numeric id", async () => {
    const cookie = await loggedInCookie();
    const res = await request(app)
      .patch("/api/accounts/abc")
      .set("Cookie", cookie)
      .send({ username: "x" });
    expect(res.status).toBe(400);
  });

  it("returns 409 when no updatable field is provided", async () => {
    const cookie = await loggedInCookie();
    const res = await request(app).patch("/api/accounts/1").set("Cookie", cookie).send({});
    expect(res.status).toBe(409);
  });

  it("updates the account and returns it", async () => {
    const cookie = await loggedInCookie(1, "user");
    vi.mocked(accountService.updateAccount).mockResolvedValue({ id: 1, username: "new" } as never);

    const res = await request(app)
      .patch("/api/accounts/1")
      .set("Cookie", cookie)
      .send({ username: "new" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Аккаунт обновлен", account: { id: 1, username: "new" } });
    expect(accountService.updateAccount).toHaveBeenCalledWith(1, 1, "user", {
      username: "new",
      password: undefined,
      newPassword: undefined,
      repeatPassword: undefined,
      email: undefined,
      phone: undefined,
    });
  });

  it("forwards a 403 from the service", async () => {
    const cookie = await loggedInCookie();
    vi.mocked(accountService.updateAccount).mockRejectedValue(new AppError(403, "Доступ запрещен"));

    const res = await request(app)
      .patch("/api/accounts/2")
      .set("Cookie", cookie)
      .send({ username: "x" });

    expect(res.status).toBe(403);
  });
});

describe("DELETE /api/accounts/:id", () => {
  it("returns 401 without a session", async () => {
    const res = await request(app).delete("/api/accounts/1");
    expect(res.status).toBe(401);
  });

  it("returns 400 for a non-numeric id", async () => {
    const cookie = await loggedInCookie();
    const res = await request(app).delete("/api/accounts/abc").set("Cookie", cookie);
    expect(res.status).toBe(400);
  });

  it("clears the session cookie when deleting your own account", async () => {
    const cookie = await loggedInCookie(1, "user");
    vi.mocked(accountService.deleteAccount).mockResolvedValue({ id: 1, user_id: 1 } as never);

    const res = await request(app).delete("/api/accounts/1").set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.headers["set-cookie"]?.[0]).toMatch(/^session=;/);
  });

  it("does not clear the session cookie when an admin deletes someone else's account", async () => {
    const cookie = await loggedInCookie(1, "admin");
    vi.mocked(accountService.deleteAccount).mockResolvedValue({ id: 2, user_id: 2 } as never);

    const res = await request(app).delete("/api/accounts/2").set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.headers["set-cookie"]).toBeUndefined();
  });

  it("forwards a service error", async () => {
    const cookie = await loggedInCookie();
    vi.mocked(accountService.deleteAccount).mockRejectedValue(new AppError(404, "Аккаунт не найден"));

    const res = await request(app).delete("/api/accounts/1").set("Cookie", cookie);

    expect(res.status).toBe(404);
  });
});
