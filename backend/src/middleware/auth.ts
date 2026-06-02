import { NextFunction, Request, Response } from "express";
import { decrypt, SessionPayload } from "../lib/session";
import { redis } from "../lib/redis";
import { prisma } from "../lib/prisma";

declare global {
  namespace Express {
    interface Request {
      token?: SessionPayload;
    }
  }
}

export async function isAuth(req: Request, res: Response, next: NextFunction) {
  const session = req.headers["authorization"]?.split(" ")[1];
  const token = session || req.cookies.session;

  if (!token) {
    res.status(401).json({ message: "Требуется авторизация" });
    return;
  }

  try {
    const payload = (await decrypt(token)) as SessionPayload;

    if (!payload) {
      res.status(403).json({ message: "Недействительный токен" });
      return;
    }

    req.token = payload;

    await redis.set(`user:${payload.id}:online`, "true", {
      expiration: { type: "EX", value: 3 },
    });

    next();
  } catch {
    res.status(403).json({ message: "Доступ запрещен: ошибка токена" });
  }
}

export async function isAdmin(req: Request, res: Response, next: NextFunction) {
  const session = req.headers["authorization"]?.split(" ")[1];
  const token = session || req.cookies.session;

  if (!token) {
    res.status(401).json({ message: "Требуется авторизация" });
    return;
  }

  try {
    const payload = (await decrypt(token)) as SessionPayload;

    if (!payload) {
      res.status(403).json({ message: "Недействительный токен" });
      return;
    }

    const adminAccount = await prisma.account.findFirst({
      where: { user_id: payload.id, role: { name: "admin" } },
    });

    if (!adminAccount) {
      res.status(403).json({ message: "Доступ запрещен" });
      return;
    }

    req.token = payload;

    await redis.set(`user:${payload.id}:online`, "true", {
      expiration: { type: "EX", value: 3 },
    });

    next();
  } catch {
    res.status(403).json({ message: "Доступ запрещен" });
  }
}
