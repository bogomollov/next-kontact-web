import { createClient } from "redis";
import { env } from "./env";

export const redis = createClient({
  url: env.REDIS_URL,
}).on("error", (error) => console.error("Redis error:", error));

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
