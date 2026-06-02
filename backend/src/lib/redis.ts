import { createClient } from "redis";

export const redis = createClient({
  url: process.env.REDIS_URL || "redis://@127.0.0.1",
}).on("error", (error) => console.error("Redis error:", error));

export async function connectRedis() {
  if (!redis.isOpen) {
    await redis.connect();
  }
}
