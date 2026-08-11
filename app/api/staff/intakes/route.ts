import { NextRequest, NextResponse } from "next/server";
import { blindToken, decryptJson, normalizeSearch } from "@/lib/intake/crypto";
import type { IntakeData } from "@/lib/intake/schema";
import { requireOwner } from "@/lib/intake/security";
import { createServerSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";

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
      .select("id,patient_id,reference_number,status,submitted_at,updated_at")
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
    const { data: patients, error: patientError } = ids.length
      ? await supabase
          .from("patients")
          .select("id,ciphertext,iv,auth_tag")
          .in("id", ids)
      : { data: [] as any[], error: null };
    if (patientError) throw patientError;
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
  } catch (error) {
    console.error("Unable to load staff intakes", error);
    return NextResponse.json(
      { error: "Unable to load patient intakes. Please try again." },
      { status: 500 },
    );
  }
}
