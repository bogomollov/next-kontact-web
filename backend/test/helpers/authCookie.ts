import { encrypt, SessionPayload } from "../../src/lib/session";

export async function authCookie(payload: SessionPayload): Promise<string> {
  const token = await encrypt(payload);
  return `session=${token}`;
}
