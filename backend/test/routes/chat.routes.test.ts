import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import router from "../../src/routes/chat.routes";
import { buildTestApp } from "../helpers/app";
import { authCookie } from "../helpers/authCookie";
import { AppError } from "../../src/middleware/error";
import * as chatService from "../../src/services/chat.service";
import * as ws from "../../src/lib/ws";
import { prismaMock } from "../mocks/prisma";

vi.mock("../../src/services/chat.service");
vi.mock("../../src/lib/ws");

const app = buildTestApp("/api/chats", router);

async function loggedInCookie(id = 1) {
  prismaMock.account.findUnique.mockResolvedValue({ deletedAt: null } as never);
  return authCookie({ id, role: "user" });
}

describe("GET /api/chats", () => {
  it("returns 401 without a session", async () => {
    const res = await request(app).get("/api/chats");
    expect(res.status).toBe(401);
  });

  it("returns the paginated chat list", async () => {
    const cookie = await loggedInCookie(5);
    vi.mocked(chatService.getChats).mockResolvedValue({
      data: [{ id: 1 }],
      page: 1,
      limit: 50,
      total: 1,
      totalPages: 1,
    } as never);

    const res = await request(app).get("/api/chats").set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([{ id: 1 }]);
    expect(chatService.getChats).toHaveBeenCalledWith(5, expect.any(Object));
  });

  it("forwards a service error", async () => {
    const cookie = await loggedInCookie();
    vi.mocked(chatService.getChats).mockRejectedValue(new Error("db down"));

    const res = await request(app).get("/api/chats").set("Cookie", cookie);

    expect(res.status).toBe(500);
  });
});

describe("GET /api/chats/search", () => {
  it("returns search results", async () => {
    const cookie = await loggedInCookie();
    vi.mocked(chatService.searchChats).mockResolvedValue([{ id: 1 } as never]);

    const res = await request(app).get("/api/chats/search?query=team").set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 1 }]);
  });

  it("forwards a service error", async () => {
    const cookie = await loggedInCookie();
    vi.mocked(chatService.searchChats).mockRejectedValue(new Error("db down"));

    const res = await request(app).get("/api/chats/search?query=team").set("Cookie", cookie);

    expect(res.status).toBe(500);
  });

  it("defaults to an empty query when none is provided", async () => {
    const cookie = await loggedInCookie();
    vi.mocked(chatService.searchChats).mockResolvedValue([]);

    const res = await request(app).get("/api/chats/search").set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(chatService.searchChats).toHaveBeenCalledWith(1, "");
  });
});

describe("GET /api/chats/:id", () => {
  it("returns 400 for a non-numeric chat id", async () => {
    const cookie = await loggedInCookie();
    const res = await request(app).get("/api/chats/abc").set("Cookie", cookie);
    expect(res.status).toBe(400);
  });

  it("returns the chat on success", async () => {
    const cookie = await loggedInCookie();
    vi.mocked(chatService.getChatById).mockResolvedValue({ id: 7, messages: [] } as never);

    const res = await request(app).get("/api/chats/7").set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 7, messages: [] });
  });

  it("forwards a 404 from the service", async () => {
    const cookie = await loggedInCookie();
    vi.mocked(chatService.getChatById).mockRejectedValue(new AppError(404, "Чат не найден"));

    const res = await request(app).get("/api/chats/7").set("Cookie", cookie);

    expect(res.status).toBe(404);
  });
});

describe("POST /api/chats", () => {
  it("returns 400 when user_id is missing", async () => {
    const cookie = await loggedInCookie();
    const res = await request(app).post("/api/chats").set("Cookie", cookie).send({});
    expect(res.status).toBe(400);
  });

  it("returns 201 when a new chat is created", async () => {
    const cookie = await loggedInCookie();
    vi.mocked(chatService.createPrivateChat).mockResolvedValue({ chat_id: 9 });

    const res = await request(app).post("/api/chats").set("Cookie", cookie).send({ user_id: 2 });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ chat_id: 9 });
  });

  it("forwards a service error", async () => {
    const cookie = await loggedInCookie();
    vi.mocked(chatService.createPrivateChat).mockRejectedValue(new AppError(400, "Нельзя создать чат с самим собой"));

    const res = await request(app).post("/api/chats").set("Cookie", cookie).send({ user_id: 1 });

    expect(res.status).toBe(400);
  });

  it("returns 200 when an existing chat is returned instead of a new one", async () => {
    const cookie = await loggedInCookie();
    vi.mocked(chatService.createPrivateChat).mockResolvedValue({ chat_id: 0 });

    const res = await request(app).post("/api/chats").set("Cookie", cookie).send({ user_id: 2 });

    expect(res.status).toBe(200);
  });
});

describe("PATCH /api/chats/:chat_id/messages/read", () => {
  it("broadcasts to senders with unread messages", async () => {
    const cookie = await loggedInCookie(1);
    vi.mocked(chatService.markMessagesRead).mockResolvedValue({ count: 2, senderIds: [2, 3] });

    const res = await request(app)
      .patch("/api/chats/5/messages/read")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ count: 2 });
    expect(ws.broadcast).toHaveBeenCalledWith([2, 3], "messages_read", { chatId: 5, readerId: 1 });
  });

  it("does not broadcast when there are no unread senders", async () => {
    const cookie = await loggedInCookie(1);
    vi.mocked(chatService.markMessagesRead).mockResolvedValue({ count: 0, senderIds: [] });

    const res = await request(app)
      .patch("/api/chats/5/messages/read")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(ws.broadcast).not.toHaveBeenCalled();
  });

  it("forwards a service error", async () => {
    const cookie = await loggedInCookie();
    vi.mocked(chatService.markMessagesRead).mockRejectedValue(new Error("db down"));

    const res = await request(app).patch("/api/chats/5/messages/read").set("Cookie", cookie);

    expect(res.status).toBe(500);
  });
});
