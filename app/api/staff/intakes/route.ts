import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { blindToken, decryptJson, normalizeSearch } from "@/lib/intake/crypto";
import type { IntakeData } from "@/lib/intake/schema";
import { requireOwner } from "@/lib/intake/security";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const owner = await requireOwner();
  if (!owner)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rawQuery = request.nextUrl.searchParams.get("q") || "";
  const q = normalizeSearch(rawQuery);
  const status = request.nextUrl.searchParams.get("status") || "";
  const admin = createAdminClient();
  let patientIds: string[] | null = null;

  if (q) {
    const token = blindToken(q);
    const { data: matches } = await admin
      .from("intake_search_tokens")
      .select("patient_id")
      .eq("token_hash", token)
      .limit(250);
    patientIds = [...new Set((matches || []).map((match) => match.patient_id))];
  }

  let query = admin
    .from("intakes")
    .select("id,patient_id,reference_number,status,submitted_at,updated_at")
    .order("submitted_at", { ascending: false })
    .limit(200);
  if (status && ["new", "in-review", "complete", "archived"].includes(status))
    query = query.eq("status", status);
  if (patientIds) {
    if (patientIds.length) query = query.in("patient_id", patientIds);
    else if (!rawQuery.toUpperCase().startsWith("GO-"))
      return NextResponse.json({ records: [] });
  }
  if (rawQuery.toUpperCase().startsWith("GO-"))
    query = query.ilike("reference_number", `%${rawQuery.trim()}%`);
  const { data: intakes, error } = await query;
  if (error)
    return NextResponse.json(
      { error: "Unable to load intakes" },
      { status: 500 },
    );

  const ids = [...new Set((intakes || []).map((item) => item.patient_id))];
  const { data: patients } = ids.length
    ? await admin
        .from("patients")
        .select("id,ciphertext,iv,auth_tag")
        .in("id", ids)
    : { data: [] as any[] };
  const byId = new Map(
    (patients || []).map((patient) => [patient.id, patient]),
  );
  const records = (intakes || []).map((intake) => {
    const patient = byId.get(intake.patient_id);
    const profile = patient
      ? decryptJson<IntakeData["demographics"] & { ssnLastFour?: string }>({
          ciphertext: patient.ciphertext,
          iv: patient.iv,
          tag: patient.auth_tag,
        })
      : null;
    return {
      ...intake,
      patient: profile
        ? {
            legalName: profile.legalName,
            email: profile.email,
            mobilePhone: profile.mobilePhone,
            city: profile.city,
            state: profile.state,
          }
        : null,
    };
  });
  return NextResponse.json({ records });
}
