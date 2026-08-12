import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { decryptJson, encryptJson, hashSecret } from "@/lib/intake/crypto";
import { defaultIntakeData, type IntakeData } from "@/lib/intake/schema";
import {
  intakeLiveReady,
  rateLimit,
  requireSameOrigin,
} from "@/lib/intake/security";

export const runtime = "nodejs";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/patient-intake",
  maxAge: 60 * 60 * 24 * 7,
};

async function readDraft(request: NextRequest) {
  const id = request.cookies.get("genfinity_intake_id")?.value;
  const secret = request.cookies.get("genfinity_intake_secret")?.value;
  if (!id || !secret || !isSupabaseConfigured() || !intakeLiveReady())
    return null;
  const { data } = await createAdminClient()
    .from("intake_drafts")
    .select(
      "id,secret_hash,ciphertext,iv,auth_tag,current_step,expires_at,updated_at",
    )
    .eq("id", id)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  if (!data || data.secret_hash !== hashSecret(secret)) return null;
  return {
    id: data.id,
    currentStep: data.current_step,
    updatedAt: data.updated_at,
    data: decryptJson<IntakeData>({
      ciphertext: data.ciphertext,
      iv: data.iv,
      tag: data.auth_tag,
    }),
  };
}

export async function GET(request: NextRequest) {
  const limited = rateLimit(request, 60);
  if (limited) return limited;
  if (!isSupabaseConfigured() || !intakeLiveReady())
    return NextResponse.json({
      configured: false,
      hasDraft: false,
      data: defaultIntakeData,
      currentStep: 0,
      updatedAt: null,
    });
  const draft = await readDraft(request);
  return NextResponse.json({
    configured: true,
    hasDraft: Boolean(draft),
    data: draft?.data ?? defaultIntakeData,
    currentStep: draft?.currentStep ?? 0,
    updatedAt: draft?.updatedAt ?? null,
  });
}

export async function PUT(request: NextRequest) {
  if (!requireSameOrigin(request))
    return NextResponse.json(
      { error: "Invalid request origin" },
      { status: 403 },
    );
  const limited = rateLimit(request, 35);
  if (limited) return limited;
  if (!isSupabaseConfigured() || !intakeLiveReady())
    return NextResponse.json({ configured: false, saved: false });
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 250_000)
    return NextResponse.json({ error: "Draft is too large" }, { status: 413 });

  const body = await request.json();
  if (
    !body ||
    typeof body !== "object" ||
    !body.data ||
    typeof body.data !== "object"
  ) {
    return NextResponse.json({ error: "Invalid draft" }, { status: 400 });
  }
  const currentStep = Math.max(0, Math.min(6, Number(body.currentStep) || 0));
  const encrypted = encryptJson(body.data);
  const existing = await readDraft(request);
  const admin = createAdminClient();

  if (existing) {
    const { error } = await admin
      .from("intake_drafts")
      .update({
        ciphertext: encrypted.ciphertext,
        iv: encrypted.iv,
        auth_tag: encrypted.tag,
        current_step: currentStep,
        updated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
      })
      .eq("id", existing.id);
    if (error)
      return NextResponse.json(
        { error: "Unable to save progress" },
        { status: 500 },
      );
    return NextResponse.json({ configured: true, saved: true });
  }

  const secret = randomBytes(32).toString("base64url");
  const { data, error } = await admin
    .from("intake_drafts")
    .insert({
      secret_hash: hashSecret(secret),
      ciphertext: encrypted.ciphertext,
      iv: encrypted.iv,
      auth_tag: encrypted.tag,
      current_step: currentStep,
    })
    .select("id")
    .single();
  if (error || !data)
    return NextResponse.json(
      { error: "Unable to save progress" },
      { status: 500 },
    );
  const response = NextResponse.json({ configured: true, saved: true });
  response.cookies.set("genfinity_intake_id", data.id, cookieOptions);
  response.cookies.set("genfinity_intake_secret", secret, cookieOptions);
  return response;
}
