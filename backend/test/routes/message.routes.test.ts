import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import router from "../../src/routes/message.routes";
import { buildTestApp } from "../helpers/app";
import { authCookie } from "../helpers/authCookie";
import { AppError } from "../../src/middleware/error";
import * as messageService from "../../src/services/message.service";
import * as chatService from "../../src/services/chat.service";
import * as ws from "../../src/lib/ws";
import { prismaMock } from "../mocks/prisma";

vi.mock("../../src/services/message.service");
vi.mock("../../src/services/chat.service");
vi.mock("../../src/lib/ws");

const app = buildTestApp("/api/messages", router);

describe("GET /api/messages", () => {
  it("returns 401 without a session", async () => {
    const res = await request(app).get("/api/messages");
    expect(res.status).toBe(401);
  });

  it("returns 403 for a non-admin caller", async () => {
    prismaMock.account.findUnique.mockResolvedValue({ deletedAt: null } as never);
    const cookie = await authCookie({ id: 1, role: "user" });

    const res = await request(app).get("/api/messages").set("Cookie", cookie);

    expect(res.status).toBe(403);
  });

  it("returns the paginated messages envelope for an admin", async () => {
    prismaMock.account.findUnique.mockResolvedValue({ deletedAt: null } as never);
    const cookie = await authCookie({ id: 1, role: "admin" });
    vi.mocked(messageService.getAllMessages).mockResolvedValue({
      data: [{ id: 1 }],
      page: 1,
      limit: 50,
      total: 1,
      totalPages: 1,
    } as never);

    const res = await request(app).get("/api/messages").set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([{ id: 1 }]);
  });

  it("forwards a service error", async () => {
    prismaMock.account.findUnique.mockResolvedValue({ deletedAt: null } as never);
    const cookie = await authCookie({ id: 1, role: "admin" });
    vi.mocked(messageService.getAllMessages).mockRejectedValue(new Error("db down"));

    const res = await request(app).get("/api/messages").set("Cookie", cookie);

    expect(res.status).toBe(500);
  });
});

describe("POST /api/messages", () => {
  it("returns 401 without a session", async () => {
    const res = await request(app).post("/api/messages").send({ chat_id: 1, content: "hi" });
    expect(res.status).toBe(401);
  });

  it("creates the message and broadcasts it to chat members", async () => {
    prismaMock.account.findUnique.mockResolvedValue({ deletedAt: null } as never);
    const cookie = await authCookie({ id: 1, role: "user" });
    vi.mocked(messageService.createMessage).mockResolvedValue({ id: 9, content: "hi" } as never);
    vi.mocked(chatService.getChatMemberIds).mockResolvedValue([1, 2]);

    const res = await request(app)
      .post("/api/messages")
      .set("Cookie", cookie)
      .send({ chat_id: 5, content: "hi" });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 9, content: "hi" });
    expect(messageService.createMessage).toHaveBeenCalledWith(5, 1, "hi");
    expect(ws.broadcast).toHaveBeenCalledWith(
      [1, 2],
      "new_message",
      expect.objectContaining({ chatId: 5 })
    );
  });

  it("forwards a service error", async () => {
    prismaMock.account.findUnique.mockResolvedValue({ deletedAt: null } as never);
    const cookie = await authCookie({ id: 1, role: "user" });
    vi.mocked(messageService.createMessage).mockRejectedValue(new AppError(400, "Не указан идентификатор чата"));

    const res = await request(app)
      .post("/api/messages")
      .set("Cookie", cookie)
      .send({ chat_id: 0, content: "hi" });

    expect(res.status).toBe(400);
  });
});
