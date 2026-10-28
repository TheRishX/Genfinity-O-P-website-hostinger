// Production deployment source module.
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentOwner } from "@/app/shared/auth";
import { SITE_URL } from "@/app/shared/seo";

const hits = new Map<string, { count: number; resetAt: number }>();

export function intakeMode() {
  return process.env.PATIENT_INTAKE_MODE === "live" ? "live" : "staging";
}

export function intakeLiveReady() {
  return Boolean(
    intakeMode() === "live" &&
      process.env.HOSTINGER_PHI_APPROVED === "true" &&
      process.env.INTAKE_ENCRYPTION_KEY &&
      process.env.INTAKE_SEARCH_KEY &&
      process.env.NPP_VERSION &&
      process.env.OWNER_EMAIL,
  );
}

// Behind Hostinger's proxy, request.nextUrl is the internal address, so compare the
// browser's Origin host with the host the request was actually sent to.
export function requireSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  let originHost: string;
  try {
    originHost = new URL(origin).host.toLowerCase();
  } catch {
    return false;
  }
  const allowed = new Set<string>();
  const addHosts = (value: string | null | undefined) => {
    for (const part of (value || "").split(",")) if (part.trim()) allowed.add(part.trim().toLowerCase());
  };
  const addUrl = (value: string | undefined) => {
    try {
      if (value) allowed.add(new URL(value).host.toLowerCase());
    } catch {
      /* ignore malformed APP_URL */
    }
  };
  addHosts(request.headers.get("x-forwarded-host"));
  addHosts(request.headers.get("host"));
  addHosts(request.nextUrl.host);
  addUrl(process.env.APP_URL);
  addUrl(SITE_URL);
  addUrl(SITE_URL.replace("://", "://www."));
  return allowed.has(originHost);
}

// The public site origin for links in emails and tracking. Behind Hostinger's proxy
// request.nextUrl.origin is the internal address (e.g. http://localhost:3000).
export function publicOrigin(request?: NextRequest) {
  try {
    if (process.env.APP_URL) return new URL(process.env.APP_URL).origin;
  } catch {
    /* fall through to the forwarded host */
  }
  const forwarded = request?.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  if (forwarded && /^[a-z0-9.-]+(:\d+)?$/i.test(forwarded)) return `https://${forwarded}`;
  return SITE_URL;
}

export function rateLimit(request: NextRequest, limit = 30, windowMs = 60_000) {
  const client =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const key = `${request.method}:${request.nextUrl.pathname}:${client}`;
  const now = Date.now();
  const current = hits.get(key);
  if (!current || current.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }
  current.count += 1;
  if (current.count > limit)
    return NextResponse.json(
      { error: "Too many requests. Please wait and try again." },
      { status: 429 },
    );
  return null;
}

export async function requireOwner() {
  return getCurrentOwner();
}

// Hostinger deployment source marker.
