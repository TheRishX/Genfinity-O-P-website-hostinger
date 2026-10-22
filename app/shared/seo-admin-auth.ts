// SEO admin portal (/seo) authentication.
// Single admin account from the server environment: SEO_ADMIN_EMAIL + SEO_ADMIN_PASSWORD.
// The password lives only in the server environment; it never reaches the browser.
// Sessions are stateless HMAC-signed cookies; changing the password invalidates them.
import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "genfinity_seo_session";
const TTL_SECONDS = 12 * 60 * 60;

export type SeoAdmin = { email: string };

export function adminEmail() {
  return (process.env.SEO_ADMIN_EMAIL || "therishx@gmail.com").trim().toLowerCase();
}

function secret() {
  const value = process.env.AUTH_SESSION_SECRET;
  if (!value && process.env.NODE_ENV === "production") throw new Error("AUTH_SESSION_SECRET is not configured");
  return value || "development-only-session-secret";
}

const adminPassword = () => process.env.SEO_ADMIN_PASSWORD ?? "";

export async function isAdminConfigured() {
  return Boolean(adminPassword());
}

// Ties the session to the current password, so changing it on the server signs everyone out.
// Keyed with the session secret so the cookie reveals nothing about the password.
const passwordVersion = () => createHmac("sha256", secret()).update(`seo-admin-password:${adminPassword()}`).digest("hex").slice(0, 16);
const sign = (payload: string) => createHmac("sha256", secret()).update(`seo-admin:${payload}`).digest("base64url");

function timingSafeStringEqual(a: string, b: string) {
  const left = createHash("sha256").update(a).digest();
  const right = createHash("sha256").update(b).digest();
  return timingSafeEqual(left, right);
}

export async function verifyAdminCredentials(email: string, password: string) {
  const expected = adminPassword();
  const passwordOk = timingSafeStringEqual(password, expected);
  const emailOk = timingSafeStringEqual(email.trim().toLowerCase(), adminEmail());
  return Boolean(expected) && passwordOk && emailOk;
}

export async function createAdminSession(email: string) {
  const payload = Buffer.from(JSON.stringify({ e: email, x: Math.floor(Date.now() / 1000) + TTL_SECONDS, v: passwordVersion() })).toString("base64url");
  const store = await cookies();
  store.set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: TTL_SECONDS,
  });
}

export async function clearAdminSession() {
  (await cookies()).delete(COOKIE);
}

export async function getSeoAdmin(): Promise<SeoAdmin | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw || !adminPassword()) return null;
  const [payload, signature] = raw.split(".");
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { e: string; x: number; v: string };
    if (data.x < Date.now() / 1000 || data.e !== adminEmail()) return null;
    if (data.v !== passwordVersion()) return null;
    return { email: data.e };
  } catch {
    return null;
  }
}
