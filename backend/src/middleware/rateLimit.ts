import { NextFunction, Request, Response } from "express";
import { redis } from "../lib/redis";

export function rateLimit(prefix: string, maxRequests: number, windowSeconds: number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip ?? req.socket.remoteAddress ?? "unknown";
    const key = `ratelimit:${prefix}:${ip}`;

    try {
      const count = await redis.incr(key);
      if (count === 1) await redis.expire(key, windowSeconds);

      if (count > maxRequests) {
        res.status(429).json({ message: "Слишком много запросов. Попробуйте позже." });
        return;
      }
    } catch (err) {
      console.error("Rate limit check failed:", err);
    }

    next();
  };
}
