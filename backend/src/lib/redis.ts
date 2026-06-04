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
