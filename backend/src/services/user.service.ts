import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/error";

export async function getMe(userId: number) {
  const account = await prisma.account.findUnique({
    where: { user_id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      phone: true,
      role_id: true,
      user: {
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

  if (!account)
    throw new AppError(401, "Ошибка при получении данных пользователя");

  return { ...account, image: `/static/users/${account.id}.png` };
}

export async function getAllUsers() {
  return prisma.user.findMany();
}

export async function updateUser(
  userId: number,
  body: {
    firstName?: string;
    lastName?: string;
    middleName?: string;
    department_id?: string;
    position_id?: string;
  }
) {
  const { firstName, lastName, middleName, department_id, position_id } = body;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, "Пользователь не найден");

  const updateData: Record<string, unknown> = {};
  if (firstName) updateData.firstName = firstName;
  if (lastName) updateData.lastName = lastName;
  if (middleName) updateData.middleName = middleName;
  if (department_id) updateData.department_id = Number(department_id);
  if (position_id) updateData.position_id = Number(position_id);

  return prisma.user.update({ where: { id: userId }, data: updateData });
}

export async function searchUsers(query: string, currentUserId: number) {
  if (!query) return [];

  const selfMatch = await prisma.user.findFirst({
    where: {
      id: currentUserId,
      OR: [
        { firstName: { startsWith: query, mode: "insensitive" } },
        { lastName: { startsWith: query, mode: "insensitive" } },
        { middleName: { startsWith: query, mode: "insensitive" } },
      ],
    },
  });

  if (selfMatch) throw new AppError(400, "Вы не можете искать самого себя");

  const users = await prisma.user.findMany({
    where: {
      id: { not: currentUserId },
      OR: [
        { firstName: { startsWith: query, mode: "insensitive" } },
        { lastName: { startsWith: query, mode: "insensitive" } },
        { middleName: { startsWith: query, mode: "insensitive" } },
      ],
    },
    select: { id: true, firstName: true, lastName: true, middleName: true },
    take: 10,
  });

  const sharedChats = await prisma.chat.findMany({
    where: {
      type: "private",
      members: { some: { user_id: currentUserId } },
      AND: { members: { some: { user_id: { in: users.map((u) => u.id) } } } },
    },
    select: {
      id: true,
      members: {
        where: { user_id: { not: currentUserId } },
        select: { user_id: true },
      },
    },
  });

  const chatByUserId = new Map(
    sharedChats
      .filter((c) => c.members.length > 0)
      .map((c) => [c.members[0].user_id, c.id])
  );

  return users.map((user) => ({
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    image: `/static/users/${user.id}.png`,
    chat_id: chatByUserId.get(user.id) ?? null,
  }));
}
