import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendBrevoEmail, isBrevoConfigured } from "@/lib/email/brevo";
import { decryptJson, encryptJson } from "@/lib/intake/crypto";
import type { IntakeData } from "@/lib/intake/schema";
import { requireOwner, requireSameOrigin } from "@/lib/intake/security";
import { createServerSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";

const uuid = z.string().uuid();
const stage = z.enum([
  "new",
  "evaluation",
  "paperwork",
  "authorization",
  "fabrication",
  "fitting",
  "delivered",
  "follow-up",
  "on-hold",
  "closed",
]);
const visitType = z.enum([
  "consultation",
  "evaluation",
  "measurement",
  "casting",
  "fitting",
  "delivery",
  "adjustment",
  "follow-up",
  "repair",
  "other",
]);
const deviceType = z.enum([
  "custom-insole",
  "afo",
  "kafo",
  "knee-brace",
  "spinal-orthosis",
  "upper-limb-orthosis",
  "prosthetic-leg",
  "prosthetic-arm",
  "prosthetic-component",
  "repair",
  "other",
]);

const careAction = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("profile.update"),
    patientId: uuid,
    stage,
    priority: z.enum(["routine", "urgent"]),
    nextAction: z.string().trim().max(500),
    nextActionAt: z.string().trim().max(40).nullable(),
    emailUpdatesEnabled: z.boolean(),
  }),
  z.object({
    action: z.literal("visit.create"),
    patientId: uuid,
    intakeId: uuid.nullable().optional(),
    visitType,
    status: z.enum(["scheduled", "completed"]),
    scheduledAt: z.string().trim().min(1).max(40),
    notes: z.string().trim().max(2000),
  }),
  z.object({
    action: z.literal("visit.update"),
    id: uuid,
    status: z.enum(["scheduled", "completed", "cancelled", "no-show"]),
  }),
  z.object({
    action: z.literal("order.create"),
    patientId: uuid,
    intakeId: uuid.nullable().optional(),
    deviceType,
    description: z.string().trim().max(1000),
    status: z.enum([
      "quoted",
      "ordered",
      "authorization",
      "fabrication",
      "quality-check",
      "ready",
      "delivered",
    ]),
    priority: z.enum(["routine", "urgent"]),
    promisedDate: z.string().trim().max(20).nullable(),
  }),
  z.object({
    action: z.literal("order.update"),
    id: uuid,
    status: z.enum([
      "quoted",
      "ordered",
      "authorization",
      "fabrication",
      "quality-check",
      "ready",
      "delivered",
      "cancelled",
    ]),
  }),
  z.object({
    action: z.literal("email.send"),
    patientIds: z.array(uuid).min(1).max(100),
    templateId: z.string().trim().max(80).nullable(),
    subject: z.string().trim().min(1).max(200),
    body: z.string().trim().min(1).max(10000),
  }),
  z.object({
    action: z.literal("settings.update"),
    automaticUrgentUpdates: z.boolean(),
    automaticDeliveryUpdates: z.boolean(),
    appointmentReminders: z.boolean(),
  }),
]);

type PatientProfile = IntakeData["demographics"];
type DbClient = Awaited<ReturnType<typeof createServerSupabase>>;

function patientEmailConfigured() {
  return isBrevoConfigured() && process.env.CARE_EMAILS_ENABLED === "true";
}

function dateOrNull(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function firstName(profile: PatientProfile) {
  return (
    profile.preferredName?.trim() || profile.legalName.trim().split(/\s+/)[0] || "there"
  );
}

function humanize(value: string) {
  return value.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function fillTemplate(text: string, values: Record<string, string>) {
  return text.replace(/{{\s*([a-z_]+)\s*}}/gi, (_, key: string) => values[key] || "");
}

async function getPatient(db: DbClient, patientId: string) {
  const { data } = await db
    .from("patients")
    .select("id,ciphertext,iv,auth_tag")
    .eq("id", patientId)
    .maybeSingle();
  if (!data) return null;
  return decryptJson<PatientProfile>({
    ciphertext: data.ciphertext,
    iv: data.iv,
    tag: data.auth_tag,
  });
}

async function getTemplate(db: DbClient, id: string) {
  const { data } = await db
    .from("email_templates")
    .select("*")
    .eq("id", id)
    .eq("active", true)
    .maybeSingle();
  return data;
}

async function sendPatientMessage({
  db,
  ownerId,
  patientId,
  templateId,
  subject,
  body,
  automatic = false,
}: {
  db: DbClient;
  ownerId: string;
  patientId: string;
  templateId: string | null;
  subject: string;
  body: string;
  automatic?: boolean;
}) {
  const [profile, careResult, orderResult, visitResult] = await Promise.all([
    getPatient(db, patientId),
    db.from("patient_care_profiles").select("*").eq("patient_id", patientId).maybeSingle(),
    db
      .from("device_orders")
      .select("device_type,promised_date")
      .eq("patient_id", patientId)
      .not("status", "in", '("delivered","cancelled")')
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    db
      .from("patient_visits")
      .select("scheduled_at")
      .eq("patient_id", patientId)
      .eq("status", "scheduled")
      .order("scheduled_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);
  if (!profile?.email) return { status: "skipped", reason: "No email address" };
  if (automatic && careResult.data?.email_updates_enabled === false)
    return { status: "skipped", reason: "Automatic email updates are off" };

  const values = {
    first_name: firstName(profile),
    next_action: careResult.data?.next_action || "Please contact our office",
    device_type: orderResult.data?.device_type
      ? humanize(orderResult.data.device_type)
      : "custom device",
    delivery_date: orderResult.data?.promised_date
      ? new Date(`${orderResult.data.promised_date}T12:00:00`).toLocaleDateString()
      : "to be confirmed",
    appointment_date: visitResult.data?.scheduled_at
      ? new Date(visitResult.data.scheduled_at).toLocaleString()
      : "to be confirmed",
  };
  const renderedSubject = fillTemplate(subject, values);
  const renderedBody = fillTemplate(body, values);
  const encrypted = encryptJson({ to: profile.email, body: renderedBody });
  const inserted = await db
    .from("patient_messages")
    .insert({
      patient_id: patientId,
      template_id: templateId,
      subject: renderedSubject,
      ciphertext: encrypted.ciphertext,
      iv: encrypted.iv,
      auth_tag: encrypted.tag,
      delivery_status: "queued",
      created_by: ownerId,
    })
    .select("id")
    .single();
  if (inserted.error || !inserted.data) throw inserted.error;

  try {
    if (!patientEmailConfigured())
      throw new Error("Patient email delivery is not enabled");
    await sendBrevoEmail({
      to: profile.email,
      subject: renderedSubject,
      text: renderedBody,
    });
    await db
      .from("patient_messages")
      .update({ delivery_status: "sent", sent_at: new Date().toISOString() })
      .eq("id", inserted.data.id);
    return { status: "sent" };
  } catch (error) {
    const reason = error instanceof Error ? error.message.slice(0, 500) : "Delivery failed";
    await db
      .from("patient_messages")
      .update({ delivery_status: "failed", error_message: reason })
      .eq("id", inserted.data.id);
    return { status: "failed", reason };
  }
}

async function recordAudit(
  db: DbClient,
  ownerId: string,
  patientId: string,
  action: string,
  changedFields: string[],
) {
  const { data: intake } = await db
    .from("intakes")
    .select("id")
    .eq("patient_id", patientId)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  await db.from("intake_audit_events").insert({
    intake_id: intake?.id || null,
    actor_id: ownerId,
    action,
    changed_fields: changedFields,
  });
}

export async function GET() {
  const owner = await requireOwner();
  if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = await createServerSupabase();
  const [templates, settings] = await Promise.all([
    db.from("email_templates").select("*").eq("active", true).order("sort_order"),
    db
      .from("staff_notification_settings")
      .select("*")
      .eq("user_id", owner.id)
      .maybeSingle(),
  ]);
  if (templates.error) {
    return NextResponse.json(
      { error: "Patient management database migration is not installed." },
      { status: 503 },
    );
  }
  return NextResponse.json({
    templates: templates.data || [],
    emailConfigured: patientEmailConfigured(),
    settings:
      settings.data || {
        automatic_urgent_updates: true,
        automatic_delivery_updates: true,
        appointment_reminders: false,
      },
  });
}

export async function POST(request: NextRequest) {
  const owner = await requireOwner();
  if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!requireSameOrigin(request))
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const parsed = careAction.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json({ error: "Check the information and try again." }, { status: 400 });

  const db = await createServerSupabase();
  const input = parsed.data;
  try {
    if (input.action === "settings.update") {
      const result = await db.from("staff_notification_settings").upsert({
        user_id: owner.id,
        automatic_urgent_updates: input.automaticUrgentUpdates,
        automatic_delivery_updates: input.automaticDeliveryUpdates,
        appointment_reminders: input.appointmentReminders,
        updated_at: new Date().toISOString(),
      });
      if (result.error) throw result.error;
      return NextResponse.json({ ok: true });
    }

    if (input.action === "email.send") {
      const outcomes = await Promise.all(
        input.patientIds.map((patientId) =>
          sendPatientMessage({
            db,
            ownerId: owner.id,
            patientId,
            templateId: input.templateId,
            subject: input.subject,
            body: input.body,
          }),
        ),
      );
      return NextResponse.json({
        ok: true,
        sent: outcomes.filter((item) => item.status === "sent").length,
        failed: outcomes.filter((item) => item.status === "failed").length,
        skipped: outcomes.filter((item) => item.status === "skipped").length,
      });
    }

    if (input.action === "profile.update") {
      const before = await db
        .from("patient_care_profiles")
        .select("priority")
        .eq("patient_id", input.patientId)
        .maybeSingle();
      const result = await db.from("patient_care_profiles").upsert({
        patient_id: input.patientId,
        stage: input.stage,
        priority: input.priority,
        next_action: input.nextAction,
        next_action_at: dateOrNull(input.nextActionAt),
        email_updates_enabled: input.emailUpdatesEnabled,
        updated_at: new Date().toISOString(),
      });
      if (result.error) throw result.error;
      await recordAudit(db, owner.id, input.patientId, "care_status_updated", [
        "stage",
        "priority",
        "next_action",
        "next_action_at",
      ]);
      let notification = null;
      if (input.priority === "urgent" && before.data?.priority !== "urgent") {
        const [{ data: settings }, template] = await Promise.all([
          db
            .from("staff_notification_settings")
            .select("automatic_urgent_updates")
            .eq("user_id", owner.id)
            .maybeSingle(),
          getTemplate(db, "urgent"),
        ]);
        if (settings?.automatic_urgent_updates !== false && template)
          notification = await sendPatientMessage({
            db,
            ownerId: owner.id,
            patientId: input.patientId,
            templateId: template.id,
            subject: template.subject,
            body: template.body,
            automatic: true,
          });
      }
      return NextResponse.json({ ok: true, notification });
    }

    if (input.action === "visit.create") {
      const scheduledAt = dateOrNull(input.scheduledAt);
      if (!scheduledAt)
        return NextResponse.json({ error: "Choose a valid visit date and time." }, { status: 400 });
      const completed = input.status === "completed";
      const insert = await db
        .from("patient_visits")
        .insert({
          patient_id: input.patientId,
          intake_id: input.intakeId || null,
          visit_type: input.visitType,
          status: input.status,
          scheduled_at: scheduledAt,
          completed_at: completed ? new Date().toISOString() : null,
          notes: input.notes,
          created_by: owner.id,
        })
        .select("id")
        .single();
      if (insert.error) throw insert.error;
      await db.from("patient_care_profiles").upsert({
        patient_id: input.patientId,
        ...(completed
          ? { last_visit_at: scheduledAt }
          : { next_visit_at: scheduledAt }),
        updated_at: new Date().toISOString(),
      });
      await recordAudit(db, owner.id, input.patientId, "visit_added", [
        "visit_type",
        "scheduled_at",
        "status",
      ]);
      let notification = null;
      if (!completed) {
        const [{ data: settings }, template] = await Promise.all([
          db
            .from("staff_notification_settings")
            .select("appointment_reminders")
            .eq("user_id", owner.id)
            .maybeSingle(),
          getTemplate(db, "appointment"),
        ]);
        if (settings?.appointment_reminders === true && template)
          notification = await sendPatientMessage({
            db,
            ownerId: owner.id,
            patientId: input.patientId,
            templateId: template.id,
            subject: template.subject,
            body: template.body,
            automatic: true,
          });
      }
      return NextResponse.json({ ok: true, id: insert.data?.id, notification });
    }

    if (input.action === "visit.update") {
      const existing = await db
        .from("patient_visits")
        .select("patient_id,scheduled_at")
        .eq("id", input.id)
        .single();
      if (existing.error) throw existing.error;
      const update = await db
        .from("patient_visits")
        .update({
          status: input.status,
          completed_at: input.status === "completed" ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", input.id);
      if (update.error) throw update.error;
      if (input.status === "completed")
        await db
          .from("patient_care_profiles")
          .update({ last_visit_at: existing.data.scheduled_at, next_visit_at: null })
          .eq("patient_id", existing.data.patient_id);
      await recordAudit(db, owner.id, existing.data.patient_id, "visit_status_updated", ["status"]);
      return NextResponse.json({ ok: true });
    }

    if (input.action === "order.create") {
      const insert = await db
        .from("device_orders")
        .insert({
          patient_id: input.patientId,
          intake_id: input.intakeId || null,
          device_type: input.deviceType,
          description: input.description,
          status: input.status,
          priority: input.priority,
          promised_date: input.promisedDate || null,
          delivered_at: input.status === "delivered" ? new Date().toISOString() : null,
          created_by: owner.id,
        })
        .select("id")
        .single();
      if (insert.error) throw insert.error;
      await recordAudit(db, owner.id, input.patientId, "device_order_added", [
        "device_type",
        "status",
        "promised_date",
      ]);
      return NextResponse.json({ ok: true, id: insert.data?.id });
    }

    const existing = await db
      .from("device_orders")
      .select("patient_id,status")
      .eq("id", input.id)
      .single();
    if (existing.error) throw existing.error;
    const update = await db
      .from("device_orders")
      .update({
        status: input.status,
        delivered_at: input.status === "delivered" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.id);
    if (update.error) throw update.error;
    await recordAudit(db, owner.id, existing.data.patient_id, "device_order_status_updated", ["status"]);

    let notification = null;
    if (["ready", "delivered"].includes(input.status) && input.status !== existing.data.status) {
      const [{ data: settings }, template] = await Promise.all([
        db
          .from("staff_notification_settings")
          .select("automatic_delivery_updates")
          .eq("user_id", owner.id)
          .maybeSingle(),
        getTemplate(db, input.status),
      ]);
      if (settings?.automatic_delivery_updates !== false && template)
        notification = await sendPatientMessage({
          db,
          ownerId: owner.id,
          patientId: existing.data.patient_id,
          templateId: template.id,
          subject: template.subject,
          body: template.body,
          automatic: true,
        });
    }
    return NextResponse.json({ ok: true, notification });
  } catch (error) {
    console.error("Unable to update patient care workflow", error);
    return NextResponse.json(
      { error: "Unable to save this change. Please try again." },
      { status: 500 },
    );
  }
}
