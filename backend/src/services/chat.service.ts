import { prisma } from "../lib/prisma";
import { redis } from "../lib/redis";
import { AppError } from "../middleware/error";
import { paginate, PaginationParams } from "../lib/pagination";

const MESSAGE_HISTORY_LIMIT = 100;

export async function getChats(userId: number, pagination: PaginationParams) {
  const where = { members: { some: { user_id: userId } } };

  const [chats, total] = await prisma.$transaction([
    prisma.chat.findMany({
      where,
      include: {
        members: { include: { user: true } },
        messages: { where: { sender_id: { not: userId }, isRead: false } },
      },
      orderBy: { updatedAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.chat.count({ where }),
  ]);

  const data = await Promise.all(
    chats.map(async (chat) => {
      let name: string | null = null;
      let image: string | null = null;
      let is_online: string | null = null;

      if (chat.type === "private") {
        const other = chat.members.find((m) => m.user_id !== userId)?.user;
        name = other ? `${other.firstName} ${other.lastName}` : "Чат удален";
        image = other ? `/static/users/${other.id}.png` : "/static/null.png";
        is_online = await redis.get(`user:${other?.id}:online`);
      } else if (chat.type === "group" && chat.name) {
        name = chat.name;
        image = `/static/chats/${chat.id}/${chat.id}.png`;
      }

      return {
        id: chat.id,
        type: chat.type,
        name,
        image,
        unreadCount: chat.messages.length,
        ...(chat.type === "private" ? { is_online: !!is_online } : undefined),
      };
    })
  );

  return paginate(data, total, pagination);
}

export async function getChatById(chatId: number, userId: number) {
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: {
      members: { include: { user: true } },
      messages: {
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              middleName: true,
              department_id: true,
              position_id: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: MESSAGE_HISTORY_LIMIT,
      },
    },
  });

  if (!chat) throw new AppError(404, "Чат не найден");

  const otherUser = chat.members.find((m) => m.user_id !== userId)?.user;
  const isOnline =
    chat.type === "private"
      ? !!(await redis.get(`user:${otherUser?.id}:online`))
      : undefined;

  return {
    id: chat.id,
    type: chat.type,
    name:
      chat.type === "group"
        ? chat.name
        : `${otherUser?.firstName} ${otherUser?.lastName} ${otherUser?.middleName ?? ""}`.trim(),
    image:
      chat.type === "group"
        ? `/static/chats/${chat.id}/${chat.id}.png`
        : otherUser
          ? `/static/users/${otherUser.id}.png`
          : "/static/null.png",
    membersCount: chat.type === "group" ? chat.members.length : null,
    messages: [...chat.messages].reverse(),
    ...(chat.type === "private" ? { is_online: isOnline } : undefined),
  };
}

export async function createPrivateChat(userId: number, targetUserId: number) {
  if (userId === targetUserId)
    throw new AppError(400, "Нельзя создать чат с самим собой");

  const existing = await prisma.chat.findFirst({
    where: {
      type: "private",
      members: { every: { user_id: { in: [userId, targetUserId] } } },
    },
    include: { members: true },
  });

  if (existing) return { chat_id: existing.id };

  const newChat = await prisma.chat.create({
    data: {
      type: "private",
      members: {
        createMany: { data: [{ user_id: userId }, { user_id: targetUserId }] },
      },
    },
    include: { members: true },
  });

  return { chat_id: newChat.id };
}

export async function searchChats(userId: number, query: string) {
  if (!query) return [];

  const chats = await prisma.chat.findMany({
    where: {
      members: { some: { user_id: userId } },
      OR: [
        { type: "group", name: { startsWith: query, mode: "insensitive" } },
        {
          type: "private",
          members: {
            some: {
              user: {
                OR: [
                  { firstName: { startsWith: query, mode: "insensitive" } },
                  { lastName: { startsWith: query, mode: "insensitive" } },
                ],
              },
              NOT: { user_id: userId },
            },
          },
        },
      ],
    },
    include: {
      members: { include: { user: true } },
      messages: { where: { sender_id: { not: userId }, isRead: false } },
    },
    take: 20,
  });

  return chats.map((chat) => {
    let name: string | null = null;
    let image: string | null = null;

    if (chat.type === "private") {
      const other = chat.members.find((m) => m.user_id !== userId)?.user;
      name = other
        ? `${other.firstName} ${other.lastName}`
        : "Удаленный чат";
      image = other ? `/static/users/${other.id}.png` : "/static/null.png";
    } else if (chat.type === "group" && chat.name) {
      name = chat.name;
      image = `/static/chats/${chat.id}/${chat.id}.png`;
    } else {
      name = "Групповой чат";
    }

    return {
      id: chat.id,
      type: chat.type,
      name,
      image,
      unreadCount: chat.messages.length,
    };
  });
}

export async function getChatMemberIds(chatId: number): Promise<number[]> {
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    select: { members: { select: { user_id: true } } },
  });
  return chat?.members.map((m) => m.user_id) ?? [];
}

export async function markMessagesRead(chatId: number, userId: number) {
  const unread = await prisma.message.findMany({
    where: { chat_id: chatId, NOT: { sender_id: userId }, isRead: false },
    select: { sender_id: true },
  });

  const senderIds = [
    ...new Set(unread.map((m) => m.sender_id).filter((id): id is number => id !== null)),
  ];

  const result = await prisma.message.updateMany({
    where: { chat_id: chatId, NOT: { sender_id: userId }, isRead: false },
    data: { isRead: true },
  });

  return { count: result.count, senderIds };
}
