import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import router from "../../src/routes/auth.routes";
import { buildTestApp } from "../helpers/app";
import { authCookie } from "../helpers/authCookie";
import { AppError } from "../../src/middleware/error";
import * as authService from "../../src/services/auth.service";
import { redisMock } from "../mocks/redis";

vi.mock("../../src/services/auth.service");

const app = buildTestApp("/api/auth", router);

describe("POST /api/auth/register", () => {
  it("sets a session cookie and returns 201 on success", async () => {
    vi.mocked(authService.register).mockResolvedValue({ id: 1, role: "user" });

    const res = await request(app).post("/api/auth/register").send({ any: "body" });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ message: "Успешная регистрация" });
    expect(res.headers["set-cookie"]?.[0]).toMatch(/^session=/);
  });

  it("forwards service errors to the error handler", async () => {
    vi.mocked(authService.register).mockRejectedValue(
      new AppError(409, "Аккаунт с такой почтой уже существует", "email")
    );

    const res = await request(app).post("/api/auth/register").send({});

    expect(res.status).toBe(409);
    expect(res.body).toEqual({
      message: "Аккаунт с такой почтой уже существует",
      errors: { email: ["Аккаунт с такой почтой уже существует"] },
    });
  });

  it("returns 429 once the register rate limit is exceeded", async () => {
    redisMock.incr.mockResolvedValue(6);

    const res = await request(app).post("/api/auth/register").send({});

    expect(res.status).toBe(429);
    expect(authService.register).not.toHaveBeenCalled();
  });
});

describe("POST /api/auth/login", () => {
  it("sets a session cookie and returns the user on success", async () => {
    vi.mocked(authService.login).mockResolvedValue({
      sessionPayload: { id: 1, role: "user" },
      user: { id: 1, username: "ivan", role: "user" },
    });

    const res = await request(app).post("/api/auth/login").send({ any: "body" });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      message: "Успешная авторизация",
      user: { id: 1, username: "ivan", role: "user" },
    });
    expect(res.headers["set-cookie"]?.[0]).toMatch(/^session=/);
  });

  it("forwards login errors to the error handler", async () => {
    vi.mocked(authService.login).mockRejectedValue(
      new AppError(409, "Неправильный логин или пароль")
    );

    const res = await request(app).post("/api/auth/login").send({});

    expect(res.status).toBe(409);
    expect(res.body).toEqual({ message: "Неправильный логин или пароль" });
  });
});

describe("POST /api/auth/logout", () => {
  it("clears the session cookie", async () => {
    const cookie = await authCookie({ id: 1, role: "user" });

    const res = await request(app).post("/api/auth/logout").set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Сессия завершена" });
    expect(res.headers["set-cookie"]?.[0]).toMatch(/^session=;/);
  });
});
