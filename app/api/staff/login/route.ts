import { NextRequest, NextResponse } from "next/server";
import { createDatabaseClient, isDatabaseConfigured } from "@/app/lib/mysql/client";
import { createSession, verifyPassword } from "@/app/lib/auth";
import { requireSameOrigin, rateLimit } from "@/app/lib/intake/security";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!requireSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const limited = rateLimit(request, 8, 15 * 60_000);
  if (limited) return limited;
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!isDatabaseConfigured() || email !== process.env.OWNER_EMAIL?.toLowerCase()) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  const user = await createDatabaseClient().from("staff_users").select("id,email,password_hash,password_reset_required").eq("email", email).maybeSingle();
  if (user.error || !user.data || !(await verifyPassword(password, String(user.data.password_hash || "")))) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  if (user.data.password_reset_required) return NextResponse.json({ error: "Please set your owner password using the reset link." }, { status: 403 });
  await createSession({ id: String(user.data.id), email: String(user.data.email) });
  return NextResponse.json({ ok: true });
}
