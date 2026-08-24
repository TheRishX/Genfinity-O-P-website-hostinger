import { createHash, randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  blindToken,
  buildSearchTokens,
  decryptJson,
  encryptJson,
  normalizeSearch,
} from "@/lib/intake/crypto";
import { defaultIntakeData, type IntakeData } from "@/lib/intake/schema";
import { requireOwner, requireSameOrigin } from "@/lib/intake/security";
import { createServerSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";

const manualPatientSchema = z.object({
  legalName: z.string().trim().min(1).max(160),
  preferredName: z.string().trim().max(100).default(""),
  dateOfBirth: z.string().trim().max(20).default(""),
  sexAtBirth: z
    .enum(["female", "male", "intersex", "other", "prefer-not-to-answer"])
    .default("prefer-not-to-answer"),
  mobilePhone: z.string().trim().max(30).default(""),
  homePhone: z.string().trim().max(30).default(""),
  email: z
    .union([z.literal(""), z.string().trim().toLowerCase().email().max(254)])
    .default(""),
  streetAddress: z.string().trim().max(200).default(""),
  city: z.string().trim().max(100).default(""),
  state: z.string().trim().toUpperCase().max(2).default(""),
  zip: z.string().trim().max(10).default(""),
  primaryLanguage: z.string().trim().max(80).default("English"),
  interpreterNeeded: z.boolean().default(false),
  maritalStatus: z
    .enum([
      "single",
      "married",
      "partnered",
      "divorced",
      "widowed",
      "other",
      "prefer-not-to-answer",
    ])
    .default("prefer-not-to-answer"),
  currentProblem: z.string().trim().max(3000).default(""),
  goals: z.string().trim().max(2000).default(""),
});

export async function GET(request: NextRequest) {
  try {
    const owner = await requireOwner();
    if (!owner)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const rawQuery = request.nextUrl.searchParams.get("q") || "";
    const q = normalizeSearch(rawQuery);
    const status = request.nextUrl.searchParams.get("status") || "";
    const supabase = await createServerSupabase();
    let patientIds: string[] | null = null;

    if (q) {
      const token = blindToken(q);
      const { data: matches, error: searchError } = await supabase
        .from("intake_search_tokens")
        .select("patient_id")
        .eq("token_hash", token)
        .limit(250);
      if (searchError) throw searchError;
      patientIds = [
        ...new Set((matches || []).map((match) => match.patient_id)),
      ];
    }

    let query = supabase
      .from("intakes")
      .select(
        "id,patient_id,reference_number,status,submitted_at,updated_at,record_origin",
      )
      .order("submitted_at", { ascending: false })
      .limit(200);
    if (
      status &&
      ["new", "in-review", "complete", "archived"].includes(status)
    )
      query = query.eq("status", status);
    if (patientIds) {
      if (patientIds.length) query = query.in("patient_id", patientIds);
      else if (!rawQuery.toUpperCase().startsWith("GO-"))
        return NextResponse.json({ records: [] });
    }
    if (rawQuery.toUpperCase().startsWith("GO-"))
      query = query.ilike("reference_number", `%${rawQuery.trim()}%`);
    const { data: intakes, error } = await query;
    if (error) throw error;

    const ids = [...new Set((intakes || []).map((item) => item.patient_id))];
    const [
      { data: patients, error: patientError },
      { data: careProfiles },
      { data: openOrders },
      { data: upcomingVisits },
    ] =
      ids.length
        ? await Promise.all([
            supabase
              .from("patients")
              .select("id,ciphertext,iv,auth_tag")
              .in("id", ids),
            supabase
              .from("patient_care_profiles")
              .select("*")
              .in("patient_id", ids),
            supabase
              .from("device_orders")
              .select("id,patient_id,device_type,status,priority,promised_date")
              .in("patient_id", ids)
              .not("status", "in", '("delivered","cancelled")')
              .order("created_at", { ascending: false }),
            supabase
              .from("patient_visits")
              .select("id,patient_id,visit_type,status,scheduled_at")
              .in("patient_id", ids)
              .eq("status", "scheduled")
              .gte("scheduled_at", new Date(Date.now() - 86_400_000).toISOString())
              .order("scheduled_at", { ascending: true }),
          ])
        : [
            { data: [], error: null },
            { data: [] },
            { data: [] },
            { data: [] },
          ];
    if (patientError) throw patientError;
    const byId = new Map(
      (patients || []).map((patient) => [patient.id, patient]),
    );
    const careById = new Map(
      (careProfiles || []).map((profile) => [profile.patient_id, profile]),
    );
    const orderByPatient = new Map<string, {
      id: string;
      patient_id: string;
      device_type: string;
      status: string;
      priority: string;
      promised_date: string | null;
    }>();
    for (const order of openOrders || [])
      if (!orderByPatient.has(order.patient_id)) orderByPatient.set(order.patient_id, order);
    const visitByPatient = new Map<string, {
      id: string;
      patient_id: string;
      visit_type: string;
      status: string;
      scheduled_at: string;
    }>();
    for (const visit of upcomingVisits || [])
      if (!visitByPatient.has(visit.patient_id)) visitByPatient.set(visit.patient_id, visit);
    const seenPatients = new Set<string>();
    const records = (intakes || []).flatMap((intake) => {
      if (seenPatients.has(intake.patient_id)) return [];
      seenPatients.add(intake.patient_id);
      const patient = byId.get(intake.patient_id);
      const profile = patient
        ? decryptJson<IntakeData["demographics"] & { ssnLastFour?: string }>({
            ciphertext: patient.ciphertext,
            iv: patient.iv,
            tag: patient.auth_tag,
          })
        : null;
      return [{
        ...intake,
        care: careById.get(intake.patient_id) || null,
        openOrder: orderByPatient.get(intake.patient_id) || null,
        nextVisit: visitByPatient.get(intake.patient_id) || null,
        patient: profile
          ? {
              legalName: profile.legalName,
              email: profile.email,
              mobilePhone: profile.mobilePhone,
              city: profile.city,
              state: profile.state,
            }
          : null,
      }];
    });
    return NextResponse.json({ records });
  } catch (error) {
    console.error("Unable to load staff intakes", error);
    return NextResponse.json(
      { error: "Unable to load patient intakes. Please try again." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const owner = await requireOwner();
  if (!owner)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!requireSameOrigin(request))
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const parsed = manualPatientSchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "Enter a legal name and check the patient details." },
      { status: 400 },
    );

  const supabase = await createServerSupabase();
  const { currentProblem, goals, ...profile } = parsed.data;
  const snapshot = structuredClone(defaultIntakeData);
  snapshot.demographics = { ...snapshot.demographics, ...profile };
  snapshot.medical.currentProblem = currentProblem;
  snapshot.function.goals = goals;
  const encryptedProfile = encryptJson(snapshot.demographics);
  const encryptedSnapshot = encryptJson(snapshot);
  const reference = `GO-STAFF-${new Date().getFullYear()}-${randomBytes(3).toString("hex").toUpperCase()}`;
  let patientId = "";
  let intakeId = "";

  try {
    const patientInsert = await supabase
      .from("patients")
      .insert({
        ciphertext: encryptedProfile.ciphertext,
        iv: encryptedProfile.iv,
        auth_tag: encryptedProfile.tag,
      })
      .select("id")
      .single();
    if (patientInsert.error || !patientInsert.data) throw patientInsert.error;
    patientId = patientInsert.data.id;

    const intakeInsert = await supabase
      .from("intakes")
      .insert({
        patient_id: patientId,
        reference_number: reference,
        ciphertext: encryptedSnapshot.ciphertext,
        iv: encryptedSnapshot.iv,
        auth_tag: encryptedSnapshot.tag,
        packet_version: "staff-record-v1",
        signed_snapshot_hash: createHash("sha256")
          .update(JSON.stringify(snapshot))
          .digest("hex"),
        record_origin: "staff",
        created_by: owner.id,
      })
      .select("id")
      .single();
    if (intakeInsert.error || !intakeInsert.data) throw intakeInsert.error;
    intakeId = intakeInsert.data.id;

    const address = `${profile.streetAddress} ${profile.city} ${profile.state} ${profile.zip}`;
    const tokens = buildSearchTokens({
      name: profile.legalName,
      email: profile.email,
      address,
    });
    const operations = await Promise.all([
      supabase
        .from("intake_search_tokens")
        .insert(tokens.map((token) => ({ patient_id: patientId, ...token }))),
      supabase.from("office_checklists").insert({ intake_id: intakeId }),
      supabase.from("patient_care_profiles").insert({
        patient_id: patientId,
        stage: "new",
        next_action: "Review new patient record",
        next_action_at: new Date().toISOString(),
      }),
      supabase.from("intake_audit_events").insert({
        intake_id: intakeId,
        actor_id: owner.id,
        action: "staff_patient_created",
        changed_fields: ["patient_profile"],
      }),
    ]);
    const failed = operations.find((operation) => operation.error);
    if (failed?.error) throw failed.error;
    return NextResponse.json({ ok: true, id: intakeId, reference });
  } catch (error) {
    console.error("Unable to create staff patient", error);
    if (intakeId)
      await supabase.from("intakes").delete().eq("id", intakeId);
    if (patientId)
      await supabase.from("patients").delete().eq("id", patientId);
    return NextResponse.json(
      { error: "Unable to create the patient record." },
      { status: 500 },
    );
  }
}
