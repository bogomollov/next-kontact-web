import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/error";

export async function getAllMessages() {
  return prisma.message.findMany();
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
