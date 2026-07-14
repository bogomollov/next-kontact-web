import { afterEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import fs from "fs/promises";
import path from "path";
import router from "../../src/routes/user.routes";
import { buildTestApp } from "../helpers/app";
import { authCookie } from "../helpers/authCookie";
import { AppError } from "../../src/middleware/error";
import * as userService from "../../src/services/user.service";
import { prismaMock } from "../mocks/prisma";

vi.mock("../../src/services/user.service");

const app = buildTestApp("/api/users", router);
const STATIC_USERS_DIR = path.join(__dirname, "../../static/users");

async function loggedInCookie(id = 1) {
  prismaMock.account.findUnique.mockResolvedValue({ deletedAt: null } as never);
  return authCookie({ id, role: "user" });
}

describe("PATCH /api/users/:id", () => {
  it("returns 401 without a session", async () => {
    const res = await request(app).patch("/api/users/1").field("firstName", "Ivan");
    expect(res.status).toBe(401);
  });

  it("returns 409 when neither fields nor an image are provided", async () => {
    const cookie = await loggedInCookie();
    const res = await request(app).patch("/api/users/1").set("Cookie", cookie);
    expect(res.status).toBe(409);
  });

  it("updates text fields and returns the updated user", async () => {
    const cookie = await loggedInCookie(3);
    vi.mocked(userService.updateUser).mockResolvedValue({ id: 3, firstName: "New" } as never);

    const res = await request(app)
      .patch("/api/users/3")
      .set("Cookie", cookie)
      .field("firstName", "New");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: "Профиль обновлен",
      user: { id: 3, firstName: "New" },
    });
    expect(userService.updateUser).toHaveBeenCalledWith(3, expect.objectContaining({ firstName: "New" }));
  });

  it("forwards a service error", async () => {
    const cookie = await loggedInCookie();
    vi.mocked(userService.updateUser).mockRejectedValue(new AppError(404, "Пользователь не найден"));

    const res = await request(app)
      .patch("/api/users/1")
      .set("Cookie", cookie)
      .field("firstName", "New");

    expect(res.status).toBe(404);
  });

  it("rejects a disallowed file type", async () => {
    const cookie = await loggedInCookie();

    const res = await request(app)
      .patch("/api/users/1")
      .set("Cookie", cookie)
      .attach("image", Buffer.from("not an image"), { filename: "a.txt", contentType: "text/plain" });

    expect(res.status).toBe(415);
  });

  it("processes an uploaded avatar image with sharp and cleans up the temp file", async () => {
    const cookie = await loggedInCookie(999999);
    vi.mocked(userService.updateUser).mockResolvedValue({ id: 999999 } as never);
    const fixture = await fs.readFile(path.join(STATIC_USERS_DIR, "../null.png"));

    const res = await request(app)
      .patch("/api/users/999999")
      .set("Cookie", cookie)
      .attach("image", fixture, { filename: "avatar.png", contentType: "image/png" });

    expect(res.status).toBe(200);

    const outputStat = await fs.stat(path.join(STATIC_USERS_DIR, "999999.png"));
    expect(outputStat.isFile()).toBe(true);

    await expect(
      fs.stat(path.join(STATIC_USERS_DIR, "999999_tmp.png"))
    ).rejects.toThrow();
  });

  afterEach(async () => {
    await fs.rm(path.join(STATIC_USERS_DIR, "999999.png"), { force: true });
  });
});

describe("GET /api/users/search", () => {
  it("returns 401 without a session", async () => {
    const res = await request(app).get("/api/users/search?query=ivan");
    expect(res.status).toBe(401);
  });

  it("returns search results for the given query", async () => {
    const cookie = await loggedInCookie();
    vi.mocked(userService.searchUsers).mockResolvedValue([
      { id: 2, name: "Petr Petrov", image: "/static/users/2.png", chat_id: null },
    ]);

    const res = await request(app)
      .get("/api/users/search?query=Petr")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { id: 2, name: "Petr Petrov", image: "/static/users/2.png", chat_id: null },
    ]);
    expect(userService.searchUsers).toHaveBeenCalledWith("Petr", 1);
  });

  it("forwards a service error", async () => {
    const cookie = await loggedInCookie();
    vi.mocked(userService.searchUsers).mockRejectedValue(new AppError(400, "Вы не можете искать самого себя"));

    const res = await request(app).get("/api/users/search?query=me").set("Cookie", cookie);

    expect(res.status).toBe(400);
  });

  it("defaults to an empty query when none is provided", async () => {
    const cookie = await loggedInCookie();
    vi.mocked(userService.searchUsers).mockResolvedValue([]);

    const res = await request(app).get("/api/users/search").set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(userService.searchUsers).toHaveBeenCalledWith("", 1);
  });
});
