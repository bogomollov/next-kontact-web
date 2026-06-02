import { compare, genSaltSync, hashSync } from "bcrypt-ts";
import { prisma } from "../lib/prisma";
import { LoginFormSchema, RegisterFormSchema } from "../lib/validation";
import { AppError } from "../middleware/error";

export async function register(body: unknown) {
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

  const passwordHash = hashSync(password, genSaltSync(12));

  const { newUser, account } = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: { firstName, lastName, middleName, department_id: 1, position_id: 1 },
    });

    const createdAccount = await tx.account.create({
      data: {
        user_id: createdUser.id,
        username,
        password: passwordHash,
        email,
        role_id: 1,
      },
    });

    await tx.chatMember.createMany({
      data: Array.from({ length: 12 }, (_, i) => ({
        chat_id: i + 1,
        user_id: createdUser.id,
      })),
    });

    return { newUser: createdUser, account: createdAccount };
  });

  return { id: newUser.id, username: account.username, email: account.email };
}

export async function login(body: unknown) {
  const { email, password } = LoginFormSchema.parse(body);

  const account = await prisma.account.findUnique({
    where: { email, deletedAt: null },
    include: { role: true, user: true },
  });

  if (!account?.password)
    throw new AppError(409, "Неправильный логин или пароль");

  if (!(await compare(password, account.password)))
    throw new AppError(409, "Неправильный логин или пароль");

  return {
    sessionPayload: {
      id: account.user_id,
      username: account.username,
      role: account.role.name,
      email: account.email,
    },
    user: {
      id: account.user_id,
      username: account.username,
      role: account.role.name,
    },
  };
}
