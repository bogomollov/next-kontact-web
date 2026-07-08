import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_URL: z.string().url().optional(),
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
  NEXT_PUBLIC_WS_URL: z.string().url().optional(),
  INTERNAL_API_URL: z.string().url().optional(),
});

const result = schema.safeParse({
  NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  INTERNAL_API_URL: process.env.INTERNAL_API_URL,
});

if (!result.success) {
  throw new Error(
    `Invalid environment variables: ${JSON.stringify(result.error.flatten().fieldErrors)}`,
  );
}

export const env = result.data;
