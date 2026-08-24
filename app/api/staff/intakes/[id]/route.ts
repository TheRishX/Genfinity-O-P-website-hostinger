import { NextRequest, NextResponse } from "next/server";
import {
  blindToken,
  buildSearchTokens,
  decryptJson,
  encryptJson,
  normalizeSearch,
} from "@/lib/intake/crypto";
import type { IntakeData } from "@/lib/intake/schema";
import { requireOwner, requireSameOrigin } from "@/lib/intake/security";
import { createServerSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";

async function loadRecord(id: string) {
  const supabase = await createServerSupabase();
  const { data: intake } = await supabase
    .from("intakes")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!intake) return null;
  const [
    { data: patient },
    { data: checklist },
    { data: consents },
    { data: audits },
    { data: amendments },
    { data: care },
    { data: visits },
    { data: orders },
    { data: messages },
  ] = await Promise.all([
    supabase
      .from("patients")
      .select("*")
      .eq("id", intake.patient_id)
      .single(),
    supabase
      .from("office_checklists")
      .select("*")
      .eq("intake_id", id)
      .maybeSingle(),
    supabase
      .from("consent_records")
      .select(
        "consent_type,packet_version,text_hash,accepted_at,signer_relationship,signature_mode",
      )
      .eq("intake_id", id),
    supabase
      .from("intake_audit_events")
      .select("action,changed_fields,created_at")
      .eq("intake_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("intake_amendments")
      .select("id,reason,changed_fields,created_at,ciphertext,iv,auth_tag")
      .eq("intake_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("patient_care_profiles")
      .select("*")
      .eq("patient_id", intake.patient_id)
      .maybeSingle(),
    supabase
      .from("patient_visits")
      .select("*")
      .eq("patient_id", intake.patient_id)
      .order("scheduled_at", { ascending: false }),
    supabase
      .from("device_orders")
      .select("*")
      .eq("patient_id", intake.patient_id)
      .order("created_at", { ascending: false }),
    supabase
      .from("patient_messages")
      .select("id,patient_id,template_id,subject,delivery_status,error_message,sent_at,created_at")
      .eq("patient_id", intake.patient_id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);
  if (!patient) return null;
  return {
    intake: {
      id: intake.id,
      referenceNumber: intake.reference_number,
      status: intake.status,
      packetVersion: intake.packet_version,
      recordOrigin: intake.record_origin,
      submittedAt: intake.submitted_at,
      data: decryptJson<IntakeData>({
        ciphertext: intake.ciphertext,
        iv: intake.iv,
        tag: intake.auth_tag,
      }),
    },
    patient: decryptJson<IntakeData["demographics"] & { ssnLastFour?: string }>(
      { ciphertext: patient.ciphertext, iv: patient.iv, tag: patient.auth_tag },
    ),
    checklist,
    care,
    visits: visits || [],
    orders: orders || [],
    messages: messages || [],
    consents: consents || [],
    audits: audits || [],
    amendments: (amendments || []).map((item) => ({
      id: item.id,
      reason: item.reason,
      changedFields: item.changed_fields,
      createdAt: item.created_at,
      changes: decryptJson<Record<string, string>>({
        ciphertext: item.ciphertext,
        iv: item.iv,
        tag: item.auth_tag,
      }),
    })),
  };
}

export async function GET(
  _: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await requireOwner()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const record = await loadRecord((await context.params).id);
  return record
    ? NextResponse.json(record)
    : NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const owner = await requireOwner();
  if (!owner)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!requireSameOrigin(request))
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const id = (await context.params).id;
  const current = await loadRecord(id);
  if (!current)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await request.json();
  const admin = await createServerSupabase();
  const changed: string[] = [];

  if (
    body.status &&
    ["new", "in-review", "complete", "archived"].includes(body.status) &&
    body.status !== current.intake.status
  ) {
    await admin
      .from("intakes")
      .update({ status: body.status, updated_at: new Date().toISOString() })
      .eq("id", id);
    changed.push("status");
  }
  if (body.checklist && typeof body.checklist === "object") {
    const ssn = String(body.ssnLastFour || "").trim();
    if (ssn && !/^\d{4}$/.test(ssn))
      return NextResponse.json(
        { error: "SSN last four must be four digits" },
        { status: 400 },
      );
    await admin
      .from("office_checklists")
      .update({
        checklist: body.checklist,
        clinician_notes: String(body.clinicianNotes || "").slice(0, 5000),
        ssn_last_four: ssn || null,
        updated_at: new Date().toISOString(),
      })
      .eq("intake_id", id);
    changed.push(
      "office_checklist",
      "clinician_notes",
      ...(ssn ? ["ssn_last_four"] : []),
    );
    if (ssn) {
      const { data: intakeRow } = await admin
        .from("intakes")
        .select("patient_id")
        .eq("id", id)
        .single();
      if (intakeRow) {
        await admin
          .from("intake_search_tokens")
          .delete()
          .eq("patient_id", intakeRow.patient_id)
          .eq("field", "ssn");
        await admin
          .from("intake_search_tokens")
          .insert({
            patient_id: intakeRow.patient_id,
            field: "ssn",
            token_hash: blindToken(normalizeSearch(ssn)),
          });
      }
    }
  }
  const amendment = body.amendment;
  if (
    amendment?.reason &&
    amendment?.changes &&
    typeof amendment.changes === "object"
  ) {
    const allowed = [
      "legalName",
      "preferredName",
      "dateOfBirth",
      "sexAtBirth",
      "mobilePhone",
      "homePhone",
      "email",
      "streetAddress",
      "city",
      "state",
      "zip",
      "primaryLanguage",
      "interpreterNeeded",
      "maritalStatus",
    ];
    const changes = Object.fromEntries(
      Object.entries(amendment.changes)
        .filter(
          ([key, value]) =>
            allowed.includes(key) &&
            (typeof value === "string" || typeof value === "boolean") &&
            value !== current.patient[key as keyof typeof current.patient],
        )
        .map(([key, value]) => [
          key,
          typeof value === "string" ? value.trim() : value,
        ]),
    );
    const fields = Object.keys(changes);
    if (fields.length) {
      const encrypted = encryptJson(changes);
      await admin
        .from("intake_amendments")
        .insert({
          intake_id: id,
          ciphertext: encrypted.ciphertext,
          iv: encrypted.iv,
          auth_tag: encrypted.tag,
          reason: String(amendment.reason).slice(0, 1000),
          changed_fields: fields,
          created_by: owner.id,
        });
      const merged = { ...current.patient, ...changes };
      const profileEncrypted = encryptJson(merged);
      const { data: intakeRow } = await admin
        .from("intakes")
        .select("patient_id")
        .eq("id", id)
        .single();
      if (intakeRow) {
        await admin
          .from("patients")
          .update({
            ciphertext: profileEncrypted.ciphertext,
            iv: profileEncrypted.iv,
            auth_tag: profileEncrypted.tag,
            updated_at: new Date().toISOString(),
          })
          .eq("id", intakeRow.patient_id);
        const address = `${merged.streetAddress} ${merged.city} ${merged.state} ${merged.zip}`;
        await admin
          .from("intake_search_tokens")
          .delete()
          .eq("patient_id", intakeRow.patient_id)
          .in("field", ["name", "email", "address"]);
        await admin
          .from("intake_search_tokens")
          .insert(
            buildSearchTokens({
              name: merged.legalName,
              email: merged.email,
              address,
            }).map((token) => ({
              patient_id: intakeRow.patient_id,
              ...token,
            })),
          );
      }
      changed.push(...fields.map((field) => `amendment.${field}`));
    }
  }
  if (changed.length)
    await admin
      .from("intake_audit_events")
      .insert({
        intake_id: id,
        actor_id: owner.id,
        action: "owner_update",
        changed_fields: changed,
      });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await requireOwner()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!requireSameOrigin(request))
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const id = (await context.params).id;
  const supabase = await createServerSupabase();
  const { data: intake } = await supabase
    .from("intakes")
    .select("id,patient_id,reference_number")
    .eq("id", id)
    .maybeSingle();
  if (!intake)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: signature } = await supabase
    .from("intake_signatures")
    .select("storage_path")
    .eq("intake_id", id)
    .maybeSingle();
  if (signature?.storage_path)
    await supabase.storage
      .from("intake-signatures")
      .remove([signature.storage_path]);

  const deletions = [
    supabase.from("consent_records").delete().eq("intake_id", id),
    supabase.from("intake_signatures").delete().eq("intake_id", id),
    supabase.from("intake_amendments").delete().eq("intake_id", id),
    supabase.from("intake_audit_events").delete().eq("intake_id", id),
    supabase.from("office_checklists").delete().eq("intake_id", id),
  ];
  const results = await Promise.all(deletions);
  if (results.some((result) => result.error))
    return NextResponse.json(
      { error: "Unable to remove related patient records." },
      { status: 500 },
    );
  const intakeDelete = await supabase.from("intakes").delete().eq("id", id);
  if (intakeDelete.error)
    return NextResponse.json(
      { error: "Unable to delete this intake." },
      { status: 500 },
    );

  const { count } = await supabase
    .from("intakes")
    .select("id", { count: "exact", head: true })
    .eq("patient_id", intake.patient_id);
  if (!count) {
    await supabase
      .from("intake_search_tokens")
      .delete()
      .eq("patient_id", intake.patient_id);
    await supabase.from("patients").delete().eq("id", intake.patient_id);
  }
  return NextResponse.json({ ok: true });
}
