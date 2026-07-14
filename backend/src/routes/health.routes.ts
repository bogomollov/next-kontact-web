import express, { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { redis } from "../lib/redis";
import { logger } from "../lib/logger";

const router = express.Router();

const CHECK_TIMEOUT_MS = 2000;

// redis's client queues commands and waits during reconnect rather than
// rejecting, so a bare `await redis.ping()` can hang well past a dropped
// connection instead of failing fast — race it against a timeout instead.
function withTimeout<T>(promise: Promise<T>): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Health check timed out")), CHECK_TIMEOUT_MS)
    ),
  ]);
}

router.get("/", async (_req: Request, res: Response) => {
  try {
    await withTimeout(prisma.$queryRaw`SELECT 1`);
    await withTimeout(redis.ping());
    res.status(200).json({ status: "ok" });
  } catch (error) {
    logger.error({ err: error }, "Health check failed");
    res.status(503).json({ status: "error" });
  }
});

export default router;
