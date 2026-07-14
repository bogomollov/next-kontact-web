import { createClient } from "redis";
import { env } from "./env";
import { logger } from "./logger";

export const redis = createClient({
  url: env.REDIS_URL,
}).on("error", (error) => logger.error({ err: error }, "Redis client error"));

export async function connectRedis() {
  if (!redis.isOpen) {
    await redis.connect();
  }
}

// Comfortably longer than the WebSocket heartbeat interval (30s) so a live
// connection never lapses into "offline" between heartbeat ticks.
const ONLINE_TTL_SECONDS = 40;

export async function markOnline(userId: number): Promise<void> {
  await redis.set(`user:${userId}:online`, "true", {
    expiration: { type: "EX", value: ONLINE_TTL_SECONDS },
  });
}
