import { NextRequest, NextResponse } from "next/server";
import { getSettings } from "@/app/shared/site-settings/store";
import { rateLimit, requireSameOrigin } from "@/app/shared/intake/security";

export const runtime = "nodejs";

const META_GRAPH_VERSION = "v21.0";
const seen = new Map<string, number>();

// Server-side Lead event (Meta CAPI and/or Stape server container).
// Called by trackLead() only after cookie consent. Sends NO names, emails, phones,
// conditions or form text: only the form name, an anonymous lead ID and the
// technical fields Meta requires to match the browser event.
export async function POST(request: NextRequest) {
  if (!requireSameOrigin(request)) return NextResponse.json({ ok: false }, { status: 403 });
  const limited = rateLimit(request, 10, 60_000);
  if (limited) return limited;

  const body = await request.json().catch(() => null);
  const leadId = typeof body?.leadId === "string" ? body.leadId.slice(0, 64) : "";
  const formName = typeof body?.formName === "string" ? body.formName.replace(/[^\w-]/g, "").slice(0, 60) : "lead";
  const pageUrl = typeof body?.pageUrl === "string" ? body.pageUrl.slice(0, 500) : "";
  if (!/^[\w-]{8,64}$/.test(leadId)) return NextResponse.json({ ok: false }, { status: 400 });

  // Drop duplicate lead IDs (refreshes, double clicks) for an hour.
  const now = Date.now();
  for (const [key, at] of seen) if (now - at > 3_600_000) seen.delete(key);
  if (seen.has(leadId)) return NextResponse.json({ ok: true, duplicate: true });
  seen.set(leadId, now);

  const { tracking } = await getSettings();
  const server = tracking.server;
  if (!server.enabled || !server.token) return NextResponse.json({ ok: true, skipped: true });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined;
  const userAgent = request.headers.get("user-agent") || undefined;
  const fbp = request.cookies.get("_fbp")?.value;
  const fbc = request.cookies.get("_fbc")?.value;
  const sourceUrl = safeSameSiteUrl(pageUrl, request);
  const event = {
    event_name: "Lead",
    event_time: Math.floor(now / 1000),
    event_id: leadId,
    action_source: "website",
    event_source_url: sourceUrl,
    user_data: { client_ip_address: ip, client_user_agent: userAgent, fbp, fbc },
    custom_data: { content_name: formName },
  };

  const jobs: Promise<unknown>[] = [];
  if (tracking.metaPixel.id) {
    jobs.push(
      fetch(`https://graph.facebook.com/${META_GRAPH_VERSION}/${encodeURIComponent(tracking.metaPixel.id)}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: [event],
          access_token: server.token,
          ...(server.testEventCode ? { test_event_code: server.testEventCode } : {}),
        }),
        signal: AbortSignal.timeout(5000),
      }).then(async (res) => {
        if (!res.ok) console.error("Meta CAPI rejected the Lead event", res.status, (await res.text()).slice(0, 300));
      }),
    );
  }
  if (server.endpoint) {
    jobs.push(
      fetch(server.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${server.token}` },
        body: JSON.stringify({ event_name: "generate_lead", event_id: leadId, form_name: formName, page_location: sourceUrl, user_agent: userAgent, ip_override: ip }),
        signal: AbortSignal.timeout(5000),
      }).then((res) => {
        if (!res.ok) console.error("Server-side tracking endpoint rejected the lead event", res.status);
      }),
    );
  }
  await Promise.allSettled(jobs);
  return NextResponse.json({ ok: true });
}

function safeSameSiteUrl(value: string, request: NextRequest) {
  try {
    const url = new URL(value);
    if (url.host !== request.nextUrl.host) throw new Error("cross-site");
    // Strip query strings so nothing typed into a form can leak through the URL.
    return `${url.origin}${url.pathname}`;
  } catch {
    return `${request.nextUrl.origin}/contact`;
  }
}
