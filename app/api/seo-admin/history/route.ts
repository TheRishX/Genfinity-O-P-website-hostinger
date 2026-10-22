import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getHistoryValue, getSettings, listHistory, saveSettings } from "@/app/shared/site-settings/store";
import { validateAll } from "@/app/shared/site-settings/schema";
import { guard, noStore } from "../_guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { admin, response } = await guard(request);
  if (!admin) return response;
  return NextResponse.json({ history: await listHistory() }, { headers: noStore });
}

// Restore a previous revision. The saved access token is always kept.
export async function POST(request: NextRequest) {
  const { admin, response } = await guard(request);
  if (!admin) return response;
  const body = await request.json().catch(() => null);
  const id = Number(body?.id);
  if (!Number.isInteger(id) || id < 1) return NextResponse.json({ error: "Invalid revision" }, { status: 400 });
  const revision = await getHistoryValue(id);
  if (!revision) return NextResponse.json({ error: "Revision not found" }, { status: 404 });
  revision.tracking.server.token = (await getSettings()).tracking.server.token;
  const errors = validateAll(revision, { tokenAlreadySet: Boolean(revision.tracking.server.token) });
  if (Object.keys(errors).length) return NextResponse.json({ error: "That revision is no longer valid.", errors }, { status: 422 });
  await saveSettings(revision, admin.email);
  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");
  revalidatePath("/robots.txt");
  return NextResponse.json({ ok: true }, { headers: noStore });
}
