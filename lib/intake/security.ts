import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

const hits = new Map<string, { count: number; resetAt: number }>();

export function intakeMode() {
  return process.env.PATIENT_INTAKE_MODE === "live" ? "live" : "staging";
}

export function intakeLiveReady() {
  return Boolean(
    intakeMode() === "live" &&
      process.env.SUPABASE_HIPAA_READY === "true" &&
      process.env.INTAKE_ENCRYPTION_KEY &&
      process.env.INTAKE_SEARCH_KEY &&
      process.env.NPP_VERSION &&
      process.env.OWNER_EMAIL,
  );
}

export function requireSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  return origin === request.nextUrl.origin || origin === process.env.APP_URL;
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
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (
    error ||
    !claims?.sub ||
    String(claims.email || "").toLowerCase() !==
      process.env.OWNER_EMAIL?.toLowerCase()
  )
    return null;
  return { id: claims.sub, email: String(claims.email) };
}
