import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { decryptJson } from "@/lib/intake/crypto";
import { buildIntakePdf } from "@/lib/intake/pdf";
import type { IntakeData } from "@/lib/intake/schema";
import { requireOwner } from "@/lib/intake/security";

export const runtime = "nodejs";

export async function GET(
  _: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await requireOwner()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = (await context.params).id;
  const admin = createAdminClient();
  const { data: intake } = await admin
    .from("intakes")
    .select("reference_number,ciphertext,iv,auth_tag,submitted_at")
    .eq("id", id)
    .maybeSingle();
  if (!intake)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { data: signature } = await admin
    .from("intake_signatures")
    .select("storage_path")
    .eq("intake_id", id)
    .maybeSingle();
  let signatureBytes: Uint8Array | undefined;
  if (signature?.storage_path) {
    const download = await admin.storage
      .from("intake-signatures")
      .download(signature.storage_path);
    if (download.data)
      signatureBytes = new Uint8Array(await download.data.arrayBuffer());
  }
  const data = decryptJson<IntakeData>({
    ciphertext: intake.ciphertext,
    iv: intake.iv,
    tag: intake.auth_tag,
  });
  const bytes = await buildIntakePdf(
    data,
    intake.reference_number,
    intake.submitted_at,
    signatureBytes,
  );
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="genfinity-intake-${intake.reference_number}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
