import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { getSeoAdmin } from "@/app/shared/seo-admin-auth";
import { requireSameOrigin } from "@/app/shared/intake/security";

/** Returns the admin, or a ready-made error response. */
export async function guard(request: NextRequest) {
  if (request.method !== "GET" && !requireSameOrigin(request))
    return { response: NextResponse.json({ error: "Invalid request origin" }, { status: 403 }) };
  const admin = await getSeoAdmin();
  if (!admin) return { response: NextResponse.json({ error: "Your session has expired. Please sign in again." }, { status: 401 }) };
  return { admin };
}

export const noStore = { "Cache-Control": "private, no-store" };
