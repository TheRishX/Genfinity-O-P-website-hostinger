import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSettingsWithMeta, saveSettings } from "@/app/shared/site-settings/store";
import { normalizeSettings, redactSecrets, validateAll } from "@/app/shared/site-settings/schema";
import { guard, noStore } from "../_guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { admin, response } = await guard(request);
  if (!admin) return response;
  const { settings, updatedAt, updatedBy } = await getSettingsWithMeta();
  return NextResponse.json(
    { ...redactSecrets(settings), tokenSet: Boolean(settings.tracking.server.token), updatedAt, updatedBy },
    { headers: noStore },
  );
}

export async function PUT(request: NextRequest) {
  const { admin, response } = await guard(request);
  if (!admin) return response;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const { settings: current } = await getSettingsWithMeta();
  const next = normalizeSettings(body);
  if (body?.clearToken === true) next.tracking.server.token = "";
  // A blank token keeps the saved one.
  else if (!next.tracking.server.token) next.tracking.server.token = current.tracking.server.token;

  const errors = validateAll(next, { tokenAlreadySet: Boolean(next.tracking.server.token) });
  if (Object.keys(errors).length) return NextResponse.json({ error: "Fix the highlighted fields.", errors }, { status: 422, headers: noStore });

  try {
    const result = await saveSettings(next, admin.email);
    revalidateSite();
    return NextResponse.json({ ok: true, ...result, tokenSet: Boolean(next.tracking.server.token) }, { headers: noStore });
  } catch (error) {
    console.error("Saving SEO settings failed", error);
    return NextResponse.json({ error: "Could not save settings. Please try again." }, { status: 500, headers: noStore });
  }
}

function revalidateSite() {
  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");
  revalidatePath("/robots.txt");
}
