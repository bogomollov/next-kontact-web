"use client";

import { env } from "./env";

const IMAGE_BASE_URL =
  process.env.NODE_ENV === "production"
    ? (env.NEXT_PUBLIC_URL ?? "")
    : "http://localhost:3001";

export default function imageLoader({ src }: { src: string }) {
  if (!src.startsWith("/static/")) return src;
  return `${IMAGE_BASE_URL}${src}`;
}
