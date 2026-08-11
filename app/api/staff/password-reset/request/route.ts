import { createHash, randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { sendBrevoEmail } from "@/lib/email/brevo";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  rateLimit,
  requireSameOrigin,
} from "@/lib/intake/security";

export const runtime = "nodejs";

const genericResponse = {
  ok: true,
  message: "If the owner account exists, a password reset link has been sent.",
};

export async function POST(request: NextRequest) {
  if (!requireSameOrigin(request))
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const limited = rateLimit(request, 3, 15 * 60_000);
  if (limited) return limited;

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const ownerEmail = process.env.OWNER_EMAIL?.toLowerCase();
  if (!ownerEmail || email !== ownerEmail)
    return NextResponse.json(genericResponse);

  const admin = createAdminClient();
  const users = await admin.auth.admin.listUsers({ page: 1, perPage: 100 });
  if (users.error)
    return NextResponse.json({ error: "Unable to start password recovery" }, { status: 500 });
  const owner = users.data.users.find(
    (user) => user.email?.toLowerCase() === ownerEmail,
  );
  if (!owner) return NextResponse.json(genericResponse);

  const now = new Date();
  const active = await admin
    .from("owner_password_resets")
    .select("created_at")
    .eq("user_id", owner.id)
    .is("used_at", null)
    .gt("expires_at", now.toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (
    active.data &&
    Date.now() - new Date(active.data.created_at).getTime() < 60_000
  )
    return NextResponse.json(genericResponse);

  await Promise.all([
    admin.from("owner_password_resets").delete().eq("user_id", owner.id),
    admin
      .from("owner_password_resets")
      .delete()
      .lt("expires_at", now.toISOString()),
  ]);

  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 20 * 60_000).toISOString();
  const inserted = await admin.from("owner_password_resets").insert({
    token_hash: tokenHash,
    user_id: owner.id,
    expires_at: expiresAt,
  });
  if (inserted.error)
    return NextResponse.json({ error: "Unable to start password recovery" }, { status: 500 });

  const resetUrl = `${request.nextUrl.origin}/staff/reset-password?token=${encodeURIComponent(token)}`;
  try {
    await sendBrevoEmail({
      to: ownerEmail,
      subject: "Reset your Genfinity owner portal password",
      text: [
        "A password reset was requested for the Genfinity O&P owner portal.",
        "",
        `Set a new password: ${resetUrl}`,
        "",
        "This single-use link expires in 20 minutes. If you did not request it, no action is needed.",
      ].join("\n"),
    });
  } catch {
    await admin.from("owner_password_resets").delete().eq("token_hash", tokenHash);
    return NextResponse.json({ error: "Unable to send the recovery email" }, { status: 500 });
  }

  return NextResponse.json(genericResponse);
}
