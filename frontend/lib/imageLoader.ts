"use client";

const IMAGE_BASE_URL =
  process.env.NODE_ENV === "production"
    ? (process.env.NEXT_PUBLIC_URL ?? "")
    : "http://localhost:3001";

export default function imageLoader({ src }: { src: string }) {
  return `${IMAGE_BASE_URL}${src}`;
}
