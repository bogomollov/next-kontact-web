import { Response } from "express";
import { JWTPayload, jwtVerify, SignJWT } from "jose";
import { env } from "./env";

const encodedAccessKey = new TextEncoder().encode(env.ACCESS_SECRET);
const TOKEN_TTL_MS = 3 * 24 * 60 * 60 * 1000;

export interface SessionPayload extends JWTPayload {
  id: number;
  role: "user" | "admin";
}

export async function encrypt(payload: SessionPayload): Promise<string> {
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setSubject(`${payload.id}`)
    .setExpirationTime(expiresAt)
    .sign(encodedAccessKey);
}

export async function decrypt(session = ""): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(session, encodedAccessKey, {
      algorithms: ["HS256"],
      typ: "JWT",
    });
    return payload as SessionPayload;
  } catch (error) {
    console.log(`Failed to verify session: ${error}`);
    return null;
  }
}

export async function createSession(
  res: Response,
  payload: SessionPayload
): Promise<void> {
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);
  const token = await encrypt(payload);
  res.cookie("session", token, {
    httpOnly: true,
    expires: expiresAt,
    sameSite: "strict",
    path: "/",
  });
}
