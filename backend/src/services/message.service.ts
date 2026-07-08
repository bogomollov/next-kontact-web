import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/error";
import { paginate, PaginationParams } from "../lib/pagination";

export async function getAllMessages(pagination: PaginationParams) {
  const [data, total] = await prisma.$transaction([
    prisma.message.findMany({
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: "desc" },
    }),
    prisma.message.count(),
  ]);

  return paginate(data, total, pagination);
}

export async function createMessage(
  chatId: number,
  senderId: number,
  content: string
) {
  if (!chatId) throw new AppError(400, "Не указан идентификатор чата");
  return prisma.message.create({
    data: { chat_id: chatId, sender_id: senderId, content },
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
  });
}
