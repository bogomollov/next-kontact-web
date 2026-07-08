import { compare, hash } from "bcrypt-ts";
import { prisma } from "../lib/prisma";
import { LoginFormSchema, RegisterFormSchema } from "../lib/validation";
import { AppError } from "../middleware/error";
import { SessionPayload } from "../lib/session";

export async function register(body: unknown): Promise<SessionPayload> {
  const { firstName, lastName, middleName, email, username, password } =
    RegisterFormSchema.parse(body);

  const [emailExists, usernameExists] = await prisma.$transaction([
    prisma.account.findUnique({ where: { email }, select: { email: true } }),
    prisma.account.findUnique({ where: { username }, select: { username: true } }),
  ]);

  if (emailExists)
    throw new AppError(409, "Аккаунт с такой почтой уже существует", "email");
  if (usernameExists)
    throw new AppError(
      409,
      "Пользователь с таким псевдонимом уже существует",
      "username"
    );

  const passwordHash = await hash(password, 12);

  const newUser = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: { firstName, lastName, middleName, department_id: 1, position_id: 1 },
    });

    await tx.account.create({
      data: {
        user_id: createdUser.id,
        username,
        password: passwordHash,
        email,
        role_id: 1,
      },
    });

    const groupChats = await tx.chat.findMany({
      where: { type: "group" },
      select: { id: true },
    });

    if (groupChats.length > 0) {
      await tx.chatMember.createMany({
        data: groupChats.map((chat) => ({
          chat_id: chat.id,
          user_id: createdUser.id,
        })),
      });
    }

    return createdUser;
  });

  return { id: newUser.id, role: "user" };
}

export async function login(
  body: unknown
): Promise<{ sessionPayload: SessionPayload; user: { id: number; username: string; role: string } }> {
  const { email, password } = LoginFormSchema.parse(body);

  const account = await prisma.account.findUnique({
    where: { email, deletedAt: null },
    include: { role: true },
  });

  if (!account?.password)
    throw new AppError(409, "Неправильный логин или пароль");

  if (!(await compare(password, account.password)))
    throw new AppError(409, "Неправильный логин или пароль");

  const role = account.role.name as "user" | "admin";

  return {
    sessionPayload: { id: account.user_id, role },
    user: { id: account.user_id, username: account.username, role },
  };
}
