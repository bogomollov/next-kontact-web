import { compare, hash } from "bcrypt-ts";
import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/error";
import { paginate, PaginationParams } from "../lib/pagination";

export async function getAllAccounts(pagination: PaginationParams) {
  const [data, total] = await prisma.$transaction([
    prisma.account.findMany({
      omit: { password: true },
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.account.count(),
  ]);

  return paginate(data, total, pagination);
}

export async function updateAccount(
  accountId: number,
  callerId: number,
  callerRole: "user" | "admin",
  body: {
    username?: string;
    password?: string;
    newPassword?: string;
    repeatPassword?: string;
    email?: string;
    phone?: string;
  }
) {
  const { username, password, newPassword, repeatPassword, email, phone } = body;

  const account = await prisma.account.findUnique({
    where: { id: accountId },
    select: { password: true, user_id: true },
  });

  if (!account) throw new AppError(404, "Аккаунт не найден");

  if (callerRole !== "admin" && account.user_id !== callerId)
    throw new AppError(403, "Доступ запрещен");

  if (password && account.password) {
    if (!(await compare(password, account.password)))
      throw new AppError(409, "Неверный текущий пароль");
  }

  if (newPassword && repeatPassword && newPassword !== repeatPassword)
    throw new AppError(409, "Пароли не совпадают");

  const updateData: Record<string, unknown> = {};
  if (username) updateData.username = username;
  if (password && newPassword && repeatPassword)
    updateData.password = await hash(newPassword, 12);
  if (email) updateData.email = email;
  if (phone) updateData.phone = phone;

  return prisma.account.update({ where: { id: accountId }, data: updateData, omit: { password: true } });
}

export async function deleteAccount(
  accountId: number,
  callerId: number,
  callerRole: "user" | "admin"
) {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    select: { user_id: true },
  });

  if (!account) throw new AppError(404, "Аккаунт не найден");

  if (callerRole !== "admin" && account.user_id !== callerId)
    throw new AppError(403, "Доступ запрещен");

  return prisma.account.update({
    where: { id: accountId },
    data: { deletedAt: new Date() },
  });
}
