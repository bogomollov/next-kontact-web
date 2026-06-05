import { NextFunction, Request, Response } from "express";
import { decrypt, SessionPayload } from "../lib/session";
import { redis } from "../lib/redis";

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

  return payload;
}

async function markOnline(userId: number): Promise<void> {
  await redis.set(`user:${userId}:online`, "true", {
    expiration: { type: "EX", value: 3 },
  });
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
