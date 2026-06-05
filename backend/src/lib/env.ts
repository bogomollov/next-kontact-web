import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().default("redis://127.0.0.1:6379"),
  ACCESS_SECRET: z.string().min(16),
  NEXT_PUBLIC_URL: z.string().url().default("http://localhost:3000"),
});

const result = schema.safeParse(process.env);

if (!result.success) {
  console.error("Invalid environment variables:", result.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = result.data;
