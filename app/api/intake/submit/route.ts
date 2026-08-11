import { createHash, randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import {
  blindToken,
  buildSearchTokens,
  consentHash,
  encryptJson,
  hashSecret,
} from "@/lib/intake/crypto";
import { CONSENTS, INTAKE_PACKET_VERSION } from "@/lib/intake/consents";
import { intakeSchema } from "@/lib/intake/schema";
import {
  intakeLiveReady,
  rateLimit,
  requireSameOrigin,
} from "@/lib/intake/security";

export const runtime = "nodejs";

function referenceNumber() {
  return `GO-${new Date().getFullYear()}-${randomBytes(4).toString("hex").toUpperCase()}`;
}

async function sendReceipts(reference: string, patientEmail: string) {
  if (process.env.INTAKE_SEND_EMAILS !== "true" || !process.env.RESEND_API_KEY)
    return;
  const resend = new Resend(process.env.RESEND_API_KEY);
  const from =
    process.env.CONTACT_FROM_EMAIL ||
    "Genfinity Website <website@genfinityoandp.com>";
  await Promise.allSettled([
    resend.emails.send({
      from,
      to: process.env.CONTACT_TO_EMAIL || "support@genfinityoandp.com",
      subject: `New patient intake received - ${reference}`,
      text: `A new intake was received. Reference: ${reference}. Sign in to the secure Genfinity owner portal to review it. No patient information is included in this email.`,
    }),
    resend.emails.send({
      from,
      to: patientEmail,
      subject: `Genfinity O&P intake confirmation - ${reference}`,
      text: `Your Genfinity O&P intake was received on ${new Date().toLocaleDateString("en-US")}. Reference: ${reference}. Please keep this reference. For questions, call (888) 552-6188. This email does not contain your intake answers.`,
    }),
  ]);
}

export async function POST(request: NextRequest) {
  if (!requireSameOrigin(request))
    return NextResponse.json(
      { error: "Invalid request origin" },
      { status: 403 },
    );
  const limited = rateLimit(request, 5, 10 * 60_000);
  if (limited) return limited;
  if (!isSupabaseConfigured())
    return NextResponse.json(
      { error: "Secure intake storage is not configured yet." },
      { status: 503 },
    );
  if (!intakeLiveReady())
    return NextResponse.json(
      { error: "Live intake compliance prerequisites are incomplete." },
      { status: 503 },
    );

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 900_000)
    return NextResponse.json(
      { error: "Submission is too large" },
      { status: 413 },
    );
  const body = await request.json();
  if (body.website)
    return NextResponse.json({ ok: true, reference: "RECEIVED" });
  const parsed = intakeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please review the highlighted fields.",
        issues: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }
  const intake = parsed.data;
  const base64 = intake.signature.signatureDataUrl.split(",")[1];
  const signatureBytes = Buffer.from(base64, "base64");
  if (signatureBytes.length < 300 || signatureBytes.length > 500_000)
    return NextResponse.json(
      { error: "Please provide a valid signature." },
      { status: 400 },
    );

  const idempotencyKey = request.headers.get("idempotency-key") || "";
  if (!/^[a-zA-Z0-9_-]{16,200}$/.test(idempotencyKey))
    return NextResponse.json(
      { error: "A valid submission key is required." },
      { status: 400 },
    );
  const keyHash = hashSecret(idempotencyKey);
  const admin = createAdminClient();
  const { data: previous } = await admin
    .from("intake_submission_keys")
    .select("reference_number")
    .eq("key_hash", keyHash)
    .maybeSingle();
  if (previous?.reference_number)
    return NextResponse.json({
      ok: true,
      reference: previous.reference_number,
    });
  if (!previous) {
    const reserved = await admin
      .from("intake_submission_keys")
      .insert({ key_hash: keyHash });
    if (reserved.error)
      return NextResponse.json(
        { error: "This submission is already being processed." },
        { status: 409 },
      );
  }

  const reference = referenceNumber();
  const submittedAt = new Date().toISOString();
  const signaturePath = `${reference}/${randomBytes(12).toString("hex")}.png`;
  const snapshot = structuredClone(intake);
  snapshot.signature.signatureDataUrl = "[stored-private-signature]";
  const profile = encryptJson({ ...intake.demographics, ssnLastFour: "" });
  const encryptedIntake = encryptJson(snapshot);
  const signedSnapshotHash = createHash("sha256")
    .update(JSON.stringify(snapshot))
    .update(signatureBytes)
    .digest("hex");
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const ipHash = blindToken(ip);
  const userAgent = (request.headers.get("user-agent") || "unknown").slice(
    0,
    300,
  );

  const upload = await admin.storage
    .from("intake-signatures")
    .upload(signaturePath, signatureBytes, {
      contentType: "image/png",
      upsert: false,
    });
  if (upload.error)
    return NextResponse.json(
      { error: "Unable to store the signature." },
      { status: 500 },
    );

  let patientId = "";
  let intakeId = "";
  try {
    const patientInsert = await admin
      .from("patients")
      .insert({
        ciphertext: profile.ciphertext,
        iv: profile.iv,
        auth_tag: profile.tag,
        synthetic: intake.synthetic,
      })
      .select("id")
      .single();
    if (patientInsert.error || !patientInsert.data)
      throw patientInsert.error || new Error("Patient creation failed");
    patientId = patientInsert.data.id;

    const intakeInsert = await admin
      .from("intakes")
      .insert({
        patient_id: patientId,
        reference_number: reference,
        ciphertext: encryptedIntake.ciphertext,
        iv: encryptedIntake.iv,
        auth_tag: encryptedIntake.tag,
        packet_version: INTAKE_PACKET_VERSION,
        signed_snapshot_hash: signedSnapshotHash,
        submitted_at: submittedAt,
      })
      .select("id")
      .single();
    if (intakeInsert.error || !intakeInsert.data)
      throw intakeInsert.error || new Error("Intake creation failed");
    intakeId = intakeInsert.data.id;

    const address = `${intake.demographics.streetAddress} ${intake.demographics.city} ${intake.demographics.state} ${intake.demographics.zip}`;
    const tokens = buildSearchTokens({
      name: intake.demographics.legalName,
      email: intake.demographics.email,
      address,
    });
    const operations = await Promise.all([
      admin
        .from("intake_search_tokens")
        .insert(tokens.map((token) => ({ patient_id: patientId, ...token }))),
      admin
        .from("intake_signatures")
        .insert({ intake_id: intakeId, storage_path: signaturePath }),
      admin.from("office_checklists").insert({ intake_id: intakeId }),
      admin.from("consent_records").insert(
        Object.entries(CONSENTS).map(([type, consent]) => ({
          intake_id: intakeId,
          consent_type: type,
          packet_version: INTAKE_PACKET_VERSION,
          text_hash: consentHash(consent.text),
          accepted_at: submittedAt,
          signer_relationship: intake.signature.relationship,
          signature_mode: intake.signature.signatureMode,
          ip_hash: ipHash,
          user_agent: userAgent,
        })),
      ),
      admin
        .from("intake_audit_events")
        .insert({ intake_id: intakeId, action: "intake_submitted" }),
    ]);
    const failed = operations.find((operation) => operation.error);
    if (failed?.error) throw failed.error;

    const draftId = request.cookies.get("genfinity_intake_id")?.value;
    const draftSecret = request.cookies.get("genfinity_intake_secret")?.value;
    if (draftId && draftSecret)
      await admin
        .from("intake_drafts")
        .delete()
        .eq("id", draftId)
        .eq("secret_hash", hashSecret(draftSecret));
    await sendReceipts(reference, intake.demographics.email);
    await admin
      .from("intake_submission_keys")
      .update({ reference_number: reference })
      .eq("key_hash", keyHash);

    const response = NextResponse.json({ ok: true, reference });
    response.cookies.delete("genfinity_intake_id");
    response.cookies.delete("genfinity_intake_secret");
    return response;
  } catch {
    if (intakeId) await admin.from("intakes").delete().eq("id", intakeId);
    if (patientId) await admin.from("patients").delete().eq("id", patientId);
    await admin.storage.from("intake-signatures").remove([signaturePath]);
    await admin.from("intake_submission_keys").delete().eq("key_hash", keyHash);
    return NextResponse.json(
      { error: "We could not securely save the intake. Please try again." },
      { status: 500 },
    );
  }
}
