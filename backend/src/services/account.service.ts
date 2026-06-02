import { compare, genSaltSync, hashSync } from "bcrypt-ts";
import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/error";

export async function getAllAccounts() {
  return prisma.account.findMany();
}

export async function updateAccount(
  accountId: number,
  body: {
    username?: string;
    password?: string;
    newPassword?: string;
    repeatPassword?: string;
    email?: string;
    phone?: string;
    role_id?: number;
    user_id?: number;
  }
) {
  const { username, password, newPassword, repeatPassword, email, phone, role_id, user_id } =
    body;

  const account = await prisma.account.findUnique({
    where: { id: accountId },
    select: { password: true },
  });

  if (!account) throw new AppError(404, "Аккаунт не найден");

  if (password && account.password) {
    if (!(await compare(password, account.password)))
      throw new AppError(409, "Неверный текущий пароль");
  }

  if (newPassword && repeatPassword && newPassword !== repeatPassword)
    throw new AppError(409, "Пароли не совпадают");

  const updateData: Record<string, unknown> = {};
  if (username) updateData.username = username;
  if (password && newPassword && repeatPassword)
    updateData.password = hashSync(newPassword, genSaltSync(12));
  if (email) updateData.email = email;
  if (phone) updateData.phone = phone;
  if (role_id) updateData.role_id = role_id;
  if (user_id) updateData.user_id = user_id;

  return prisma.account.update({ where: { id: accountId }, data: updateData });
}

export async function deleteAccount(accountId: number) {
  const account = await prisma.account.update({
    where: { id: accountId },
    data: { deletedAt: new Date() },
  });
  if (!account) throw new AppError(404, "Аккаунт не найден");
  return account;
}
