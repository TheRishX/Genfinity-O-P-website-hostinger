import { NextRequest, NextResponse } from "next/server";
import { createAdminSession, isAdminConfigured, verifyAdminCredentials } from "@/app/shared/seo-admin-auth";
import { rateLimit, requireSameOrigin } from "@/app/shared/intake/security";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!requireSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const limited = rateLimit(request, 6, 15 * 60_000);
  if (limited) return limited;
  if (!(await isAdminConfigured()))
    return NextResponse.json({ error: "The SEO portal password has not been set up on the server yet." }, { status: 503 });
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!email || !password || !(await verifyAdminCredentials(email, password)))
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  await createAdminSession(email);
  return NextResponse.json({ ok: true });
}
