import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createDatabaseClient } from "@/app/shared/mysql/client";
import { hashPassword } from "@/app/shared/auth";
import {
  rateLimit,
  requireSameOrigin,
} from "@/app/shared/intake/security";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!requireSameOrigin(request))
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const limited = rateLimit(request, 6, 15 * 60_000);
  if (limited) return limited;

  const body = await request.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!/^[A-Za-z0-9_-]{40,100}$/.test(token))
    return NextResponse.json({ error: "This reset link is invalid." }, { status: 400 });
  if (
    password.length < 12 ||
    password.length > 128 ||
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/\d/.test(password) ||
    !/[^A-Za-z0-9]/.test(password)
  )
    return NextResponse.json(
      { error: "Use 12–128 characters with uppercase, lowercase, a number, and a symbol." },
      { status: 400 },
    );

  const admin = createDatabaseClient();
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const claimed = await admin
    .from("owner_password_resets")
    .update({ used_at: new Date().toISOString() })
    .eq("token_hash", tokenHash)
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .select("user_id")
    .maybeSingle();
  if (claimed.error || !claimed.data)
    return NextResponse.json(
      { error: "This reset link is invalid or has expired." },
      { status: 400 },
    );

  const updated = await admin.from("staff_users").update({ password_hash: await hashPassword(password), password_reset_required: false, updated_at: new Date().toISOString() }).eq("id", claimed.data.user_id);
  if (updated.error) {
    await admin
      .from("owner_password_resets")
      .update({ used_at: null })
      .eq("token_hash", tokenHash);
    return NextResponse.json({ error: "Unable to update the password" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
