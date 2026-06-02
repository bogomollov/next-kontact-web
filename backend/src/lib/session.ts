import { Request, Response } from "express";
import { JWTPayload, jwtVerify, SignJWT } from "jose";

const key = process.env.ACCESS_SECRET;
const encodedAccessKey = new TextEncoder().encode(key);
const AccessExpiresAt = new Date(Date.now() + 1 * 24 * 60 * 60 * 3000);

export interface SessionPayload extends JWTPayload {
  id: number;
}

export async function encrypt(payload: SessionPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setSubject(`${payload.id}`)
    .setExpirationTime(AccessExpiresAt)
    .sign(encodedAccessKey);
}

export async function decrypt(
  session: string | undefined = ""
): Promise<SessionPayload | null> {
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
  req: Request,
  res: Response,
  payload: SessionPayload
) {
  const session = await encrypt({ id: payload.id });
  res.cookie("session", session, {
    httpOnly: true,
    expires: AccessExpiresAt,
    sameSite: "strict",
    path: "/",
  });
}
