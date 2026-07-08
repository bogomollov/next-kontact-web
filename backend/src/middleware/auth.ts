import { NextFunction, Request, Response } from "express";
import { decrypt, SessionPayload } from "../lib/session";
import { markOnline } from "../lib/redis";
import { prisma } from "../lib/prisma";

declare global {
  namespace Express {
    interface Request {
      token?: SessionPayload;
    }
  }
}

async function resolveToken(
  req: Request,
  res: Response
): Promise<SessionPayload | null> {
  const header = req.headers["authorization"]?.split(" ")[1];
  const raw = header || req.cookies.session;

  if (!raw) {
    res.status(401).json({ message: "Требуется авторизация" });
    return null;
  }

  const payload = await decrypt(raw);
  if (!payload) {
    res.status(403).json({ message: "Недействительный токен" });
    return null;
  }

  const account = await prisma.account.findUnique({
    where: { user_id: payload.id },
    select: { deletedAt: true },
  });

  if (!account || account.deletedAt !== null) {
    res.status(403).json({ message: "Аккаунт удален" });
    return null;
  }

  return payload;
}

export async function isAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = await resolveToken(req, res);
    if (!payload) return;

    req.token = payload;
    await markOnline(payload.id);
    next();
  } catch {
    res.status(403).json({ message: "Доступ запрещен: ошибка токена" });
  }
}

export async function isAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = await resolveToken(req, res);
    if (!payload) return;

    if (payload.role !== "admin") {
      res.status(403).json({ message: "Доступ запрещен" });
      return;
    }

    req.token = payload;
    await markOnline(payload.id);
    next();
  } catch {
    res.status(403).json({ message: "Доступ запрещен" });
  }
}
