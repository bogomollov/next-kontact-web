import { z } from "zod";

const schema = z
  .object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    DATABASE_URL: z.string().url(),
    REDIS_URL: z.string().url().default("redis://127.0.0.1:6379"),
    ACCESS_SECRET: z.string().min(16),
    // No default here: this is the CORS origin, so an unset value must fail
    // the boot instead of silently falling back to a dev URL in production.
    NEXT_PUBLIC_URL: z.string().url().optional(),
  })
  .refine((data) => data.NODE_ENV !== "production" || !!data.NEXT_PUBLIC_URL, {
    message: "NEXT_PUBLIC_URL is required in production (used as the CORS origin)",
    path: ["NEXT_PUBLIC_URL"],
  });

const result = schema.safeParse(process.env);

if (!result.success) {
  console.error("Invalid environment variables:", result.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  ...result.data,
  // Convenience default for local dev/test only; production must set it explicitly.
  NEXT_PUBLIC_URL: result.data.NEXT_PUBLIC_URL ?? "http://localhost:3000",
};
