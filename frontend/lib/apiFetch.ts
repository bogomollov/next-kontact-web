import { env } from "./env";

const isServer = typeof window === "undefined";

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? env.NEXT_PUBLIC_API_URL
    : isServer
      ? (env.INTERNAL_API_URL ?? "http://localhost:3001/api")
      : "http://localhost:3001/api";

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
  });

  return res;
};
