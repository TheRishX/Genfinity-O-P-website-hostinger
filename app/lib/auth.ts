import "server-only";

import { createHash, createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { createDatabaseClient } from "@/app/lib/mysql/client";

const scrypt = promisify(scryptCallback);
const SESSION_COOKIE = "genfinity_staff_session";
const SESSION_TTL = 8 * 60 * 60 * 1000;

export type Owner = { id: string; email: string };

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${key.toString("hex")}`;
}

export async function verifyPassword(password: string, encoded: string | null) {
  if (!encoded?.startsWith("scrypt:")) return false;
  const [, salt, expected] = encoded.split(":");
  const actual = (await scrypt(password, salt, 64)) as Buffer;
  const expectedBuffer = Buffer.from(expected, "hex");
  return expectedBuffer.length === actual.length && timingSafeEqual(expectedBuffer, actual);
}

export function sessionHash(token: string) {
  const secret = process.env.AUTH_SESSION_SECRET || "development-only-session-secret";
  return createHmac("sha256", secret).update(token).digest("hex");
}

export async function createSession(user: Owner) {
  const token = randomBytes(32).toString("base64url");
  const db = createDatabaseClient();
  await db.from("staff_sessions").insert({ id: sessionHash(token), user_id: user.id, expires_at: new Date(Date.now() + SESSION_TTL).toISOString() });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: SESSION_TTL / 1000 });
}

export async function clearSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await createDatabaseClient().from("staff_sessions").delete().eq("id", sessionHash(token));
  store.delete(SESSION_COOKIE);
}

export async function getCurrentOwner(): Promise<Owner | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const db = createDatabaseClient();
  const session = await db.from("staff_sessions").select("user_id").eq("id", sessionHash(token)).gt("expires_at", new Date().toISOString()).maybeSingle();
  if (session.error || !session.data?.user_id) return null;
  const user = await db.from("staff_users").select("id,email").eq("id", session.data.user_id).maybeSingle();
  if (user.error || !user.data || String(user.data.email).toLowerCase() !== process.env.OWNER_EMAIL?.toLowerCase()) return null;
  return { id: String(user.data.id), email: String(user.data.email) };
}

export { SESSION_COOKIE };

// Hostinger deployment source marker.
