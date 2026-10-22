"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  Clipboard,
  Cookie,
  ExternalLink,
  FileText,
  History,
  KeyRound,
  LayoutDashboard,
  Loader2,
  LogOut,
  Map as MapIcon,
  RotateCcw,
  Search,
  Server,
  Share2,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import {
  ROBOTS,
  SCHEMA_TYPES,
  TWITTER_CARDS,
  buildLocalBusinessJsonLd,
  validateAll,
  type Errors,
  type PageOverride,
  type SeoSettings,
  type SiteSettings,
  type TrackingSettings,
} from "@/app/shared/site-settings/schema";
import { Card, ChipInput, Field, Pill, SecretInput, Toggle, cx, inputClass } from "./ui";
import { CookiePreview, SerpPreview, SocialPreview } from "./previews";

type PageInfo = { path: string; title: string; description: string };
type HistoryEntry = { id: number; savedAt: string; savedBy: string; summary: string };
type SectionId = "overview" | "search" | "social" | "pages" | "local" | "sitemap" | "tracking" | "cookies" | "history" | "account";

const NAV: { id: SectionId; label: string; icon: typeof Search; group: string }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, group: "Dashboard" },
  { id: "search", label: "Search appearance", icon: Search, group: "SEO" },
  { id: "social", label: "Social sharing", icon: Share2, group: "SEO" },
  { id: "pages", label: "Page SEO", icon: FileText, group: "SEO" },
  { id: "local", label: "Local business", icon: Building2, group: "SEO" },
  { id: "sitemap", label: "Sitemap & robots", icon: MapIcon, group: "SEO" },
  { id: "tracking", label: "Tracking / Marketing", icon: BarChart3, group: "Marketing" },
  { id: "cookies", label: "Cookie consent", icon: Cookie, group: "Marketing" },
  { id: "history", label: "Change history", icon: History, group: "Settings" },
  { id: "account", label: "Account & security", icon: KeyRound, group: "Settings" },
];

function sectionOf(key: string): SectionId {
  if (key.startsWith("page:")) return "pages";
  if (key.startsWith("schema_")) return "local";
  if (key.startsWith("og") || key.startsWith("twitter")) return "social";
  if (["gtm", "ga4", "metaPixel", "googleAds", "googleAdsLabel", "stape", "serverEndpoint", "serverToken", "serverTestCode"].includes(key)) return "tracking";
  return "search";
}

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }) : "Never";

export function SeoPortal({
  initial,
  initialTokenSet,
  updatedAt: initialUpdatedAt,
  updatedBy: initialUpdatedBy,
  adminEmail,
  storage,
  pages,
}: {
  initial: SiteSettings;
  initialTokenSet: boolean;
  updatedAt: string | null;
  updatedBy: string | null;
  adminEmail: string;
  storage: "mysql" | "file";
  pages: PageInfo[];
}) {
  const [s, setS] = useState<SiteSettings>(initial);
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial));
  const [tokenSet, setTokenSet] = useState(initialTokenSet);
  const [clearToken, setClearToken] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [section, setSection] = useState<SectionId>("overview");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [meta, setMeta] = useState({ updatedAt: initialUpdatedAt, updatedBy: initialUpdatedBy });

  const dirty = JSON.stringify(s) !== baseline || clearToken;
  const seo = s.seo;
  const t = s.tracking;

  const setSeo = (patch: Partial<SeoSettings>) => setS((prev) => ({ ...prev, seo: { ...prev.seo, ...patch } }));
  const setSchema = (patch: Partial<SeoSettings["schema"]>) => setS((prev) => ({ ...prev, seo: { ...prev.seo, schema: { ...prev.seo.schema, ...patch } } }));
  const setTrack = <K extends keyof TrackingSettings>(group: K, patch: Partial<TrackingSettings[K]>) =>
    setS((prev) => ({ ...prev, tracking: { ...prev.tracking, [group]: { ...prev.tracking[group], ...patch } } }));
  const setPage = (path: string, patch: Partial<PageOverride>) =>
    setS((prev) => {
      const current = prev.seo.pages[path] ?? { title: "", description: "", noindex: false };
      const next = { ...current, ...patch };
      const pagesNext = { ...prev.seo.pages };
      if (!next.title && !next.description && !next.noindex) delete pagesNext[path];
      else pagesNext[path] = next;
      return { ...prev, seo: { ...prev.seo, pages: pagesNext } };
    });

  const notify = useCallback((tone: "ok" | "error", text: string) => {
    setToast({ tone, text });
    window.setTimeout(() => setToast(null), 4500);
  }, []);

  const save = useCallback(async () => {
    if (saving) return;
    const clientErrors = validateAll(s, { tokenAlreadySet: tokenSet && !clearToken });
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) {
      setSection(sectionOf(Object.keys(clientErrors)[0]));
      notify("error", `Fix ${Object.keys(clientErrors).length} highlighted field${Object.keys(clientErrors).length > 1 ? "s" : ""} before saving.`);
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/seo-admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...s, clearToken }),
      });
      const result = await response.json().catch(() => ({}));
      if (response.status === 401) {
        notify("error", "Your session expired. Sign in again; your edits are still on this page.");
        return;
      }
      if (!response.ok) {
        setErrors(result.errors || {});
        if (result.errors) setSection(sectionOf(Object.keys(result.errors)[0]));
        notify("error", result.error || "Could not save.");
        return;
      }
      const next = { ...s, tracking: { ...s.tracking, server: { ...s.tracking.server, token: "" } } };
      setS(next);
      setBaseline(JSON.stringify(next));
      setTokenSet(Boolean(result.tokenSet));
      setClearToken(false);
      setMeta({ updatedAt: result.savedAt, updatedBy: adminEmail });
      notify("ok", "Saved. Changes are live on the website.");
    } catch {
      notify("error", "Network error. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }, [adminEmail, clearToken, notify, s, saving, tokenSet]);

  // Cmd/Ctrl+S saves; leaving with unsaved edits asks first.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        if (dirty) void save();
      }
    };
    const onLeave = (event: BeforeUnloadEvent) => {
      if (dirty) event.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("beforeunload", onLeave);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("beforeunload", onLeave);
    };
  }, [dirty, save]);

  const discard = () => {
    setS(JSON.parse(baseline));
    setClearToken(false);
    setErrors({});
  };

  const errorCount = useMemo(() => {
    const counts: Partial<Record<SectionId, number>> = {};
    for (const key of Object.keys(errors)) counts[sectionOf(key)] = (counts[sectionOf(key)] ?? 0) + 1;
    return counts;
  }, [errors]);

  const health = useMemo(() => buildHealth(s, tokenSet), [s, tokenSet]);
  const base = seo.canonicalBase || "https://genfinityoandp.com";

  async function signOut() {
    if (dirty && !window.confirm("You have unsaved changes. Sign out anyway?")) return;
    await fetch("/api/seo-admin/logout", { method: "POST" });
    window.location.reload();
  }

  const go = (id: SectionId) => {
    setSection(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const current = NAV.find((item) => item.id === section)!;

  return (
    <div className="min-h-screen bg-[#f5f7f9] text-slate-800">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-slate-100 px-5">
          <Image src="/images/brand/genfinity-logo-uploaded.webp" alt="Genfinity O&P" width={1100} height={275} className="h-8 w-auto object-contain object-left" />
          <span className="ml-auto rounded-md bg-brand-blue/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-blue">SEO</span>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {["Dashboard", "SEO", "Marketing", "Settings"].map((group) => (
            <div key={group} className="mb-4">
              <p className="mb-1.5 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">{group}</p>
              {NAV.filter((item) => item.group === group).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => go(item.id)}
                  className={cx(
                    "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] font-medium transition",
                    section === item.id ? "bg-brand-ink text-white shadow-md shadow-slate-900/10" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  )}
                >
                  <item.icon className={cx("h-[18px] w-[18px]", section === item.id ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
                  {item.label}
                  {errorCount[item.id] ? (
                    <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white">{errorCount[item.id]}</span>
                  ) : item.id === "overview" ? (
                    <span className={cx("ml-auto text-xs font-bold tabular-nums", section === item.id ? "text-white/80" : scoreText(health.score))}>{health.score}</span>
                  ) : null}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-red text-sm font-bold uppercase text-white">{adminEmail[0]}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">{adminEmail}</p>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>
            <button type="button" onClick={signOut} title="Sign out" className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[260px]">
        {/* Top bar */}
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-8">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{current.group}</p>
              <h1 className="truncate text-lg font-bold text-slate-900">{current.label}</h1>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden text-xs text-slate-400 md:inline">
                {dirty ? <span className="font-semibold text-amber-600">Unsaved changes</span> : <>Last saved {fmtDate(meta.updatedAt)}</>}
              </span>
              <a href="/" target="_blank" rel="noreferrer" className="hidden items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:inline-flex">
                View site <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <button
                type="button"
                onClick={save}
                disabled={!dirty || saving}
                className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl bg-brand-red px-4 py-2 text-sm font-bold text-white shadow-sm shadow-brand-red/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {saving ? "Saving…" : <><span className="sm:hidden">Save</span><span className="hidden sm:inline">Save changes</span></>}
              </button>
              <button type="button" onClick={signOut} title="Sign out" className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
          {/* Mobile nav */}
          <nav className="flex gap-1.5 overflow-x-auto px-4 pb-3 lg:hidden">
            {NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => go(item.id)}
                className={cx("flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold", section === item.id ? "bg-brand-ink text-white" : "bg-slate-100 text-slate-600")}
              >
                {item.label}
                {errorCount[item.id] ? <span className="h-2 w-2 rounded-full bg-red-500" /> : null}
              </button>
            ))}
          </nav>
        </header>

        <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 pb-32 sm:px-8 sm:py-8">
          {storage === "file" && (
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              MySQL is not configured, so settings are saved to a local file. Use this only for development.
            </div>
          )}

          {section === "overview" && <Overview s={s} health={health} tokenSet={tokenSet} base={base} meta={meta} go={go} />}

          {section === "search" && (
            <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
              <div className="space-y-6">
                <Card title="Titles & description" description="Site-wide defaults. Pages without their own values use these." icon={<Search className="h-4 w-4" />}>
                  <div className="grid gap-5">
                    <Field label="Site title (SEO)" error={errors.siteTitle} counter={{ value: seo.siteTitle.length, ideal: [30, 60], max: 70 }} hint="Shown as the home page title in Google. Aim for 50–60 characters.">
                      {(id, invalid) => <input id={id} aria-invalid={invalid} className={inputClass} value={seo.siteTitle} onChange={(e) => setSeo({ siteTitle: e.target.value })} placeholder="Genfinity O&P | Move with more comfort and confidence" />}
                    </Field>
                    <Field label="Title template" error={errors.titleTemplate} hint={<>%s is replaced by the page title, e.g. <em>{(seo.titleTemplate || "%s").replace("%s", "Custom Orthotics")}</em></>}>
                      {(id, invalid) => <input id={id} aria-invalid={invalid} className={cx(inputClass, "font-mono text-sm")} value={seo.titleTemplate} onChange={(e) => setSeo({ titleTemplate: e.target.value })} placeholder="%s | Genfinity O&P" />}
                    </Field>
                    <Field label="Default meta description" error={errors.metaDescription} counter={{ value: seo.metaDescription.length, ideal: [120, 160], max: 160 }}>
                      {(id, invalid) => <textarea id={id} aria-invalid={invalid} rows={3} className={inputClass} value={seo.metaDescription} onChange={(e) => setSeo({ metaDescription: e.target.value })} placeholder="Expert orthotics and prosthetics care in Tarzana, CA with personalized solutions and ongoing support." />}
                    </Field>
                    <Field label="Keywords" optional hint="Press Enter or comma to add. Google ignores this tag, but other tools still read it.">
                      {(id) => <ChipInput id={id} value={seo.keywords} onChange={(keywords) => setSeo({ keywords })} placeholder="orthotics and prosthetics, orthotics Tarzana…" />}
                    </Field>
                  </div>
                </Card>
                <Card title="Indexing" description="Controls how search engines crawl and index the site." icon={<Activity className="h-4 w-4" />}>
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Canonical base URL" error={errors.canonicalBase} hint="https, no trailing slash">
                      {(id, invalid) => <input id={id} aria-invalid={invalid} className={inputClass} value={seo.canonicalBase} onChange={(e) => setSeo({ canonicalBase: e.target.value.trim() })} placeholder="https://genfinityoandp.com" />}
                    </Field>
                    <Field label="Robots directive" error={errors.robots}>
                      {(id) => (
                        <select id={id} className={inputClass} value={seo.robots} onChange={(e) => setSeo({ robots: e.target.value as SeoSettings["robots"] })}>
                          {ROBOTS.map((r) => <option key={r}>{r}</option>)}
                        </select>
                      )}
                    </Field>
                  </div>
                  {seo.robots !== "index, follow" && (
                    <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>
                        <strong>{seo.robots}</strong> tells search engines to {seo.robots.startsWith("noindex") ? "remove the whole site from results" : "ignore links on the site"}. Only use this on a staging site.
                      </span>
                    </div>
                  )}
                </Card>
                <Card title="Search engine verification" description="Paste only the content value from the meta tag." icon={<ShieldCheck className="h-4 w-4" />}>
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Google Search Console" error={errors.gscVerification} optional>
                      {(id, invalid) => <input id={id} aria-invalid={invalid} className={cx(inputClass, "font-mono text-sm")} value={seo.gscVerification} onChange={(e) => setSeo({ gscVerification: extractContent(e.target.value) })} placeholder="google-site-verification content value" />}
                    </Field>
                    <Field label="Bing Webmaster" error={errors.bingVerification} optional>
                      {(id, invalid) => <input id={id} aria-invalid={invalid} className={cx(inputClass, "font-mono text-sm")} value={seo.bingVerification} onChange={(e) => setSeo({ bingVerification: extractContent(e.target.value) })} placeholder="msvalidate.01 content value" />}
                    </Field>
                  </div>
                </Card>
              </div>
              <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
                <SerpPreview title={seo.siteTitle} description={seo.metaDescription} url={base} siteName={seo.ogSiteName} />
                <SerpPreview title={(seo.titleTemplate || "%s").replace("%s", "Custom Orthotics")} description={pages.find((p) => p.path === "/services/orthotics")?.description ?? ""} url={`${base}/services/orthotics`} siteName={seo.ogSiteName} />
                <p className="px-1 text-xs leading-relaxed text-slate-400">Previews are approximate. Google may rewrite titles and descriptions.</p>
              </div>
            </div>
          )}

          {section === "social" && (
            <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
              <Card title="Open Graph & X (Twitter)" description="How links to the site look when shared on Facebook, LinkedIn, iMessage, Slack and X." icon={<Share2 className="h-4 w-4" />}>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="OG title" optional hint="Defaults to the site title">
                    {(id) => <input id={id} className={inputClass} value={seo.ogTitle} onChange={(e) => setSeo({ ogTitle: e.target.value })} placeholder={seo.siteTitle || "Defaults to SEO title"} />}
                  </Field>
                  <Field label="OG site name">
                    {(id) => <input id={id} className={inputClass} value={seo.ogSiteName} onChange={(e) => setSeo({ ogSiteName: e.target.value })} placeholder="Genfinity O&P" />}
                  </Field>
                  <Field label="OG description" optional error={errors.ogDescription} className="md:col-span-2" counter={{ value: seo.ogDescription.length, ideal: [60, 200], max: 300 }}>
                    {(id, invalid) => <textarea id={id} aria-invalid={invalid} rows={2} className={inputClass} value={seo.ogDescription} onChange={(e) => setSeo({ ogDescription: e.target.value })} placeholder={seo.metaDescription || "Defaults to meta description"} />}
                  </Field>
                  <Field label="OG image URL" optional error={errors.ogImage} className="md:col-span-2" hint="https, 1200 × 630 px (1.91:1), JPG or WebP under 300 KB. Leave blank to use the default hero photo.">
                    {(id, invalid) => <input id={id} aria-invalid={invalid} className={inputClass} value={seo.ogImage} onChange={(e) => setSeo({ ogImage: e.target.value.trim() })} placeholder="https://genfinityoandp.com/images/…" />}
                  </Field>
                  <Field label="Twitter card">
                    {(id) => (
                      <select id={id} className={inputClass} value={seo.twitterCard} onChange={(e) => setSeo({ twitterCard: e.target.value as SeoSettings["twitterCard"] })}>
                        {TWITTER_CARDS.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    )}
                  </Field>
                  <Field label="X / Twitter handle" optional error={errors.twitterHandle}>
                    {(id, invalid) => <input id={id} aria-invalid={invalid} className={inputClass} value={seo.twitterHandle} onChange={(e) => setSeo({ twitterHandle: e.target.value.trim() })} placeholder="@genfinityoandp" />}
                  </Field>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <ToolLink href={`https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(base)}`}>Facebook Sharing Debugger</ToolLink>
                  <ToolLink href={`https://www.linkedin.com/post-inspector/inspect/${encodeURIComponent(base)}`}>LinkedIn Post Inspector</ToolLink>
                </div>
              </Card>
              <div className="xl:sticky xl:top-24 xl:self-start">
                <SocialPreview title={seo.ogTitle || seo.siteTitle} description={seo.ogDescription || seo.metaDescription} image={seo.ogImage} url={base} siteName={seo.ogSiteName} />
              </div>
            </div>
          )}

          {section === "pages" && <PagesSection pages={pages} seo={seo} errors={errors} setPage={setPage} base={base} />}

          {section === "local" && (
            <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
              <Card
                title="Local business schema (JSON-LD)"
                description="Helps Google show your address, phone and hours for Tarzana / Los Angeles searches. Name, address and phone must match your Google Business Profile exactly."
                icon={<Building2 className="h-4 w-4" />}
              >
                <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                  <Toggle checked={seo.schema.enabled} onChange={(enabled) => setSchema({ enabled })} label="Enable Local Business schema" description="Adds structured data to every page." />
                </div>
                <fieldset disabled={!seo.schema.enabled} className={cx("grid gap-5 md:grid-cols-2", !seo.schema.enabled && "opacity-50")}>
                  <Field label="Business name" error={errors.schema_name}>
                    {(id, invalid) => <input id={id} aria-invalid={invalid} className={inputClass} value={seo.schema.name} onChange={(e) => setSchema({ name: e.target.value })} placeholder="Genfinity O&P" />}
                  </Field>
                  <Field label="Business type">
                    {(id) => (
                      <select id={id} className={inputClass} value={seo.schema.type} onChange={(e) => setSchema({ type: e.target.value as SeoSettings["schema"]["type"] })}>
                        {SCHEMA_TYPES.map((x) => <option key={x}>{x}</option>)}
                      </select>
                    )}
                  </Field>
                  <Field label="Legal name" optional>
                    {(id) => <input id={id} className={inputClass} value={seo.schema.legalName} onChange={(e) => setSchema({ legalName: e.target.value })} placeholder="GENFINITY O&P LLC" />}
                  </Field>
                  <Field label="Logo URL" error={errors.schema_logo}>
                    {(id, invalid) => <input id={id} aria-invalid={invalid} className={inputClass} value={seo.schema.logo} onChange={(e) => setSchema({ logo: e.target.value.trim() })} placeholder="https://genfinityoandp.com/images/brand/…" />}
                  </Field>
                  <Field label="Phone" error={errors.schema_phone}>
                    {(id, invalid) => <input id={id} aria-invalid={invalid} className={inputClass} value={seo.schema.phone} onChange={(e) => setSchema({ phone: e.target.value })} placeholder="+1-888-552-6188" />}
                  </Field>
                  <Field label="Email" optional error={errors.schema_email}>
                    {(id, invalid) => <input id={id} aria-invalid={invalid} type="email" className={inputClass} value={seo.schema.email} onChange={(e) => setSchema({ email: e.target.value })} placeholder="support@genfinityoandp.com" />}
                  </Field>
                  <Field label="Street address" error={errors.schema_street} className="md:col-span-2">
                    {(id, invalid) => <input id={id} aria-invalid={invalid} className={inputClass} value={seo.schema.street} onChange={(e) => setSchema({ street: e.target.value })} placeholder="18401 Burbank Blvd, Suite 215" />}
                  </Field>
                  <div className="grid gap-5 sm:grid-cols-[1.4fr_.7fr_1fr] md:col-span-2">
                    <Field label="City" error={errors.schema_city}>
                      {(id, invalid) => <input id={id} aria-invalid={invalid} className={inputClass} value={seo.schema.city} onChange={(e) => setSchema({ city: e.target.value })} placeholder="Tarzana" />}
                    </Field>
                    <Field label="State" error={errors.schema_state}>
                      {(id, invalid) => <input id={id} aria-invalid={invalid} className={inputClass} value={seo.schema.state} onChange={(e) => setSchema({ state: e.target.value })} placeholder="CA" />}
                    </Field>
                    <Field label="ZIP code" error={errors.schema_zip}>
                      {(id, invalid) => <input id={id} aria-invalid={invalid} inputMode="numeric" className={inputClass} value={seo.schema.zip} onChange={(e) => setSchema({ zip: e.target.value })} placeholder="91356" />}
                    </Field>
                  </div>
                  <Field label="Opening hours" optional hint="schema.org format. Separate several with commas: Mo-Fr 10:00-18:00, Sa 10:00-14:00">
                    {(id) => <input id={id} className={cx(inputClass, "font-mono text-sm")} value={seo.schema.hours} onChange={(e) => setSchema({ hours: e.target.value })} placeholder="Mo-Fr 10:00-18:00" />}
                  </Field>
                  <Field label="Areas served" optional hint="Comma separated">
                    {(id) => <input id={id} className={inputClass} value={seo.schema.areaServed} onChange={(e) => setSchema({ areaServed: e.target.value })} placeholder="Tarzana, Los Angeles, San Fernando Valley" />}
                  </Field>
                  <Field label="Facebook URL" optional error={errors.schema_facebook}>
                    {(id, invalid) => <input id={id} aria-invalid={invalid} className={inputClass} value={seo.schema.facebook} onChange={(e) => setSchema({ facebook: e.target.value.trim() })} placeholder="https://facebook.com/…" />}
                  </Field>
                  <Field label="Instagram URL" optional error={errors.schema_instagram}>
                    {(id, invalid) => <input id={id} aria-invalid={invalid} className={inputClass} value={seo.schema.instagram} onChange={(e) => setSchema({ instagram: e.target.value.trim() })} placeholder="https://instagram.com/…" />}
                  </Field>
                  <Field label="YouTube URL" optional error={errors.schema_youtube}>
                    {(id, invalid) => <input id={id} aria-invalid={invalid} className={inputClass} value={seo.schema.youtube} onChange={(e) => setSchema({ youtube: e.target.value.trim() })} placeholder="https://youtube.com/…" />}
                  </Field>
                </fieldset>
              </Card>
              <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
                <CodePreview title="JSON-LD output" code={seo.schema.enabled ? JSON.stringify(buildLocalBusinessJsonLd(seo), null, 2) : "// Local business schema is turned off"} />
                <ToolLink href={`https://search.google.com/test/rich-results?url=${encodeURIComponent(base)}`}>Test in Google Rich Results</ToolLink>
              </div>
            </div>
          )}

          {section === "sitemap" && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card title="sitemap.xml" description="Generated automatically from the site's pages and every blog post." icon={<MapIcon className="h-4 w-4" />}>
                <Toggle checked={seo.sitemapEnabled} onChange={(sitemapEnabled) => setSeo({ sitemapEnabled })} label="Enable sitemap.xml generation" description="Includes home, services, patient resources, locations and blog posts. Pages set to noindex in Page SEO are left out." />
                <div className="mt-5 flex flex-wrap gap-2">
                  <ToolLink href="/sitemap.xml">Open sitemap.xml</ToolLink>
                  <ToolLink href="https://search.google.com/search-console/sitemaps">Submit in Search Console</ToolLink>
                </div>
              </Card>
              <Card title="robots.txt" description="Generated from the robots directive and the sitemap setting." icon={<FileText className="h-4 w-4" />}>
                <CodePreview code={robotsPreview(seo)} />
                <div className="mt-4">
                  <ToolLink href="/robots.txt">Open robots.txt</ToolLink>
                </div>
              </Card>
            </div>
          )}

          {section === "tracking" && <TrackingSection t={t} errors={errors} setTrack={setTrack} tokenSet={tokenSet} clearToken={clearToken} setClearToken={setClearToken} />}

          {section === "cookies" && (
            <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
              <Card title="Cookie consent banner" description="Marketing tags load only after a visitor clicks Accept. Visitors with Global Privacy Control turned on are opted out automatically (CCPA / CPRA)." icon={<Cookie className="h-4 w-4" />}>
                <Field label="Banner text" optional hint="Shown in the storefront cookie consent banner. Leave empty to use the default message." counter={{ value: seo.cookieText.length, ideal: [0, 300], max: 1000 }}>
                  {(id) => <textarea id={id} rows={5} className={inputClass} value={seo.cookieText} onChange={(e) => setSeo({ cookieText: e.target.value })} placeholder="Cookie consent banner text shown on the storefront" />}
                </Field>
                <ul className="mt-5 space-y-2 text-[13px] text-slate-600">
                  {[
                    "Accept stores consent in the visitor's browser and loads GTM, GA4, Meta Pixel and Google Ads.",
                    "Decline loads nothing. Visitors can change their choice from “Cookie Preferences” in the footer.",
                    "Patient intake, staff and admin pages never load marketing tags.",
                  ].map((line) => (
                    <li key={line} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> {line}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-slate-400">Have your legal or compliance advisor review the final wording. This is not legal advice.</p>
              </Card>
              <div className="lg:sticky lg:top-24 lg:self-start">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Live preview</p>
                <CookiePreview text={seo.cookieText} />
              </div>
            </div>
          )}

          {section === "history" && <HistorySection dirty={dirty} notify={notify} />}
          {section === "account" && <AccountSection email={adminEmail} storage={storage} signOut={signOut} />}
        </div>
      </div>

      {/* Unsaved changes bar */}
      <div className={cx("fixed inset-x-0 bottom-0 z-40 transition-transform duration-300 lg:left-[260px]", dirty ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0")}>
        <div className="mx-auto mb-4 flex max-w-3xl items-center gap-3 rounded-2xl bg-brand-ink px-4 py-3 text-white shadow-2xl shadow-slate-900/30 sm:mx-6 lg:mx-auto">
          <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
          <span className="text-sm font-medium">You have unsaved changes</span>
          <span className="ml-1 hidden text-xs text-white/50 sm:inline">⌘S to save</span>
          <button type="button" onClick={discard} className="ml-auto rounded-lg px-3 py-1.5 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white">
            Discard
          </button>
          <button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-1.5 text-sm font-bold text-brand-ink hover:bg-slate-100 disabled:opacity-60">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save
          </button>
        </div>
      </div>

      {toast && (
        <div role="status" className={cx("fixed right-4 top-4 z-50 flex max-w-sm items-start gap-2.5 rounded-xl px-4 py-3 text-sm font-medium shadow-xl", toast.tone === "ok" ? "bg-emerald-600 text-white" : "bg-red-600 text-white")}>
          {toast.tone === "ok" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0" />}
          {toast.text}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------- Overview ---------------------------------- */

type HealthCheck = { id: string; label: string; ok: boolean; level: "critical" | "important" | "nice"; section: SectionId; tip: string };

function buildHealth(s: SiteSettings, tokenSet: boolean) {
  const { seo, tracking: t } = s;
  const checks: HealthCheck[] = [
    { id: "title", label: "Site title is 30–60 characters", ok: seo.siteTitle.length >= 30 && seo.siteTitle.length <= 60, level: "critical", section: "search", tip: `Currently ${seo.siteTitle.length} characters` },
    { id: "desc", label: "Meta description is 120–160 characters", ok: seo.metaDescription.length >= 120 && seo.metaDescription.length <= 160, level: "critical", section: "search", tip: `Currently ${seo.metaDescription.length} characters` },
    { id: "robots", label: "Site is open to search engines", ok: seo.robots === "index, follow", level: "critical", section: "search", tip: `Robots: ${seo.robots}` },
    { id: "canonical", label: "Canonical base URL uses https", ok: seo.canonicalBase.startsWith("https://"), level: "critical", section: "search", tip: "Set the live domain" },
    { id: "gsc", label: "Google Search Console verified", ok: Boolean(seo.gscVerification), level: "important", section: "search", tip: "Add the verification token" },
    { id: "sitemap", label: "sitemap.xml is enabled", ok: seo.sitemapEnabled, level: "important", section: "sitemap", tip: "Turn on sitemap generation" },
    { id: "schema", label: "Local business schema is on", ok: seo.schema.enabled, level: "important", section: "local", tip: "Important for local search" },
    { id: "og", label: "Custom 1200×630 social image", ok: Boolean(seo.ogImage), level: "nice", section: "social", tip: "Using the default hero photo" },
    { id: "ogt", label: "Social title and description set", ok: Boolean(seo.ogTitle && seo.ogDescription), level: "nice", section: "social", tip: "Falls back to SEO title" },
    { id: "analytics", label: "Analytics is collecting data (GA4 or GTM)", ok: (t.ga4.enabled && Boolean(t.ga4.id)) || (t.gtm.enabled && Boolean(t.gtm.id)), level: "important", section: "tracking", tip: "Turn on GA4 or GTM" },
    { id: "conv", label: "Lead conversions tracked in Google Ads", ok: t.googleAds.enabled && Boolean(t.googleAds.conversionLabel), level: "important", section: "tracking", tip: "Add the Lead conversion label" },
    { id: "bing", label: "Bing Webmaster verified", ok: Boolean(seo.bingVerification), level: "nice", section: "search", tip: "Optional" },
    { id: "capi", label: "Server-side lead tracking (CAPI)", ok: t.server.enabled && tokenSet, level: "nice", section: "tracking", tip: "Improves ad attribution" },
  ];
  const weight = { critical: 3, important: 2, nice: 1 } as const;
  const total = checks.reduce((sum, c) => sum + weight[c.level], 0);
  const earned = checks.reduce((sum, c) => sum + (c.ok ? weight[c.level] : 0), 0);
  return { checks, score: Math.round((earned / total) * 100) };
}

const scoreText = (score: number) => (score >= 85 ? "text-emerald-600" : score >= 60 ? "text-amber-600" : "text-red-600");

function ScoreRing({ score }: { score: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const color = score >= 85 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative h-36 w-36">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#eef2f6" strokeWidth="10" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (score / 100) * c} className="transition-all duration-700" />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-4xl font-bold tabular-nums text-slate-900">{score}</div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">SEO health</div>
        </div>
      </div>
    </div>
  );
}

function Overview({ s, health, tokenSet, base, meta, go }: { s: SiteSettings; health: ReturnType<typeof buildHealth>; tokenSet: boolean; base: string; meta: { updatedAt: string | null; updatedBy: string | null }; go: (id: SectionId) => void }) {
  const t = s.tracking;
  const services = [
    { name: "Google Tag Manager", on: t.gtm.enabled, id: t.gtm.id },
    { name: "GA4", on: t.ga4.enabled, id: t.ga4.id },
    { name: "Meta Pixel", on: t.metaPixel.enabled, id: t.metaPixel.id },
    { name: "Google Ads", on: t.googleAds.enabled, id: t.googleAds.id },
    { name: "Stape loader", on: t.stape.enabled, id: t.stape.url.replace(/^https?:\/\//, "") },
    { name: "Server-side / CAPI", on: t.server.enabled, id: tokenSet ? "Token saved" : "" },
  ];
  const failing = health.checks.filter((c) => !c.ok);
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <Card className="flex flex-col items-center justify-center text-center">
          <ScoreRing score={health.score} />
          <p className="mt-4 text-sm font-semibold text-slate-800">
            {health.score >= 85 ? "Looking great" : health.score >= 60 ? "Good, with room to grow" : "Needs attention"}
          </p>
          <p className="mt-1 text-[13px] text-slate-500">
            {health.checks.length - failing.length} of {health.checks.length} checks passing
          </p>
          <p className="mt-4 text-xs text-slate-400">
            Last saved {fmtDate(meta.updatedAt)}
            {meta.updatedBy ? ` by ${meta.updatedBy}` : ""}
          </p>
        </Card>
        <Card title="Recommendations" description="Ranked by impact on search visibility and lead tracking." icon={<Activity className="h-4 w-4" />}>
          {failing.length === 0 ? (
            <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
              <CheckCircle2 className="h-5 w-5" /> Every check passes.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {failing
                .sort((a, b) => ["critical", "important", "nice"].indexOf(a.level) - ["critical", "important", "nice"].indexOf(b.level))
                .map((check) => (
                  <li key={check.id}>
                    <button type="button" onClick={() => go(check.section)} className="group flex w-full items-center gap-3 py-3 text-left">
                      <span className={cx("h-2 w-2 shrink-0 rounded-full", check.level === "critical" ? "bg-red-500" : check.level === "important" ? "bg-amber-400" : "bg-slate-300")} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-slate-800">{check.label}</span>
                        <span className="block text-xs text-slate-500">{check.tip}</span>
                      </span>
                      <span className="text-xs font-semibold text-brand-blue opacity-0 transition group-hover:opacity-100">Fix</span>
                      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-brand-blue" />
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </Card>
      </div>

      <Card title="Tracking status" description="What loads on the website after a visitor accepts cookies." icon={<BarChart3 className="h-4 w-4" />} actions={<button type="button" onClick={() => go("tracking")} className="text-sm font-semibold text-brand-blue hover:underline">Manage</button>}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((svc) => (
            <div key={svc.name} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-slate-800">{svc.name}</span>
                {svc.on && svc.id ? <Pill tone="green">Live</Pill> : svc.on ? <Pill tone="amber">Missing ID</Pill> : <Pill tone="slate">Off</Pill>}
              </div>
              <p className="mt-1.5 truncate font-mono text-xs text-slate-500">{svc.id || "—"}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Quick tools" icon={<ExternalLink className="h-4 w-4" />}>
        <div className="flex flex-wrap gap-2">
          <ToolLink href="https://search.google.com/search-console">Search Console</ToolLink>
          <ToolLink href={`https://search.google.com/test/rich-results?url=${encodeURIComponent(base)}`}>Rich Results Test</ToolLink>
          <ToolLink href={`https://pagespeed.web.dev/analysis?url=${encodeURIComponent(base)}`}>PageSpeed Insights</ToolLink>
          <ToolLink href="https://tagassistant.google.com/">Google Tag Assistant</ToolLink>
          <ToolLink href="https://business.facebook.com/events_manager2">Meta Events Manager</ToolLink>
          <ToolLink href="https://www.bing.com/webmasters">Bing Webmaster</ToolLink>
          <ToolLink href="/sitemap.xml">sitemap.xml</ToolLink>
          <ToolLink href="/robots.txt">robots.txt</ToolLink>
        </div>
      </Card>
    </div>
  );
}

/* ---------------------------------- Page SEO ---------------------------------- */

function PagesSection({ pages, seo, errors, setPage, base }: { pages: PageInfo[]; seo: SeoSettings; errors: Errors; setPage: (path: string, patch: Partial<PageOverride>) => void; base: string }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const filtered = pages.filter((p) => `${p.path} ${p.title}`.toLowerCase().includes(query.toLowerCase()));
  const customized = Object.keys(seo.pages).length;
  return (
    <Card
      title="Page-level SEO"
      description="Override the title and description for individual pages, or hide a page from search. Empty fields use the built-in page defaults. The home page uses Search appearance."
      icon={<FileText className="h-4 w-4" />}
      actions={<Pill tone={customized ? "blue" : "slate"}>{customized} customized</Pill>}
    >
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input className={cx(inputClass, "pl-10")} placeholder="Search pages…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
        {filtered.map((page) => {
          const o = seo.pages[page.path];
          const isOpen = open === page.path;
          const hasError = Object.keys(errors).some((k) => k.startsWith(`page:${page.path}:`));
          return (
            <li key={page.path}>
              <button type="button" onClick={() => setOpen(isOpen ? null : page.path)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50">
                <ChevronRight className={cx("h-4 w-4 shrink-0 text-slate-400 transition", (isOpen || hasError) && "rotate-90")} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-mono text-[13px] text-slate-500">{page.path}</span>
                  <span className="block truncate text-sm font-semibold text-slate-800">{o?.title || page.title}</span>
                </span>
                {o?.noindex && <Pill tone="red">noindex</Pill>}
                {(o?.title || o?.description) && <Pill tone="blue">Custom</Pill>}
                {hasError && <Pill tone="red">Error</Pill>}
              </button>
              {(isOpen || hasError) && (
                <div className="grid gap-5 border-t border-slate-100 bg-slate-50/50 px-4 py-5 lg:grid-cols-[1fr_360px]">
                  <div className="space-y-4">
                    <Field label="SEO title" optional error={errors[`page:${page.path}:title`]} counter={{ value: (o?.title || "").length, ideal: [30, 60], max: 70 }}>
                      {(id, invalid) => <input id={id} aria-invalid={invalid} className={inputClass} value={o?.title ?? ""} placeholder={page.title} onChange={(e) => setPage(page.path, { title: e.target.value })} />}
                    </Field>
                    <Field label="Meta description" optional error={errors[`page:${page.path}:description`]} counter={{ value: (o?.description || "").length, ideal: [120, 160], max: 160 }}>
                      {(id, invalid) => <textarea id={id} aria-invalid={invalid} rows={3} className={inputClass} value={o?.description ?? ""} placeholder={page.description} onChange={(e) => setPage(page.path, { description: e.target.value })} />}
                    </Field>
                    <Toggle checked={Boolean(o?.noindex)} onChange={(noindex) => setPage(page.path, { noindex })} label="Hide from search engines (noindex)" description="Also removes the page from sitemap.xml." />
                    {(o?.title || o?.description || o?.noindex) && (
                      <button type="button" onClick={() => setPage(page.path, { title: "", description: "", noindex: false })} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800">
                        <RotateCcw className="h-3.5 w-3.5" /> Reset to defaults
                      </button>
                    )}
                  </div>
                  <SerpPreview title={o?.title || page.title} description={o?.description || page.description} url={`${base}${page.path}`} siteName={seo.ogSiteName} />
                </div>
              )}
            </li>
          );
        })}
        {!filtered.length && <li className="px-4 py-8 text-center text-sm text-slate-500">No pages match “{query}”.</li>}
      </ul>
    </Card>
  );
}

/* ---------------------------------- Tracking ---------------------------------- */

function Service({ title, description, enabled, onToggle, status, children, icon }: { title: string; description: string; enabled: boolean; onToggle: (v: boolean) => void; status: ReactNode; children: ReactNode; icon: ReactNode }) {
  return (
    <div className={cx("rounded-2xl border bg-white p-5 transition", enabled ? "border-brand-blue/30 shadow-sm shadow-brand-blue/5" : "border-slate-200")}>
      <div className="flex items-start gap-3">
        <span className={cx("grid h-10 w-10 shrink-0 place-items-center rounded-xl", enabled ? "bg-brand-blue text-white" : "bg-slate-100 text-slate-500")}>{icon}</span>
        <div className="min-w-0 flex-1">
          <Toggle checked={enabled} onChange={onToggle} label={title} description={description} />
        </div>
        <div className="shrink-0">{status}</div>
      </div>
      {enabled && <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 md:grid-cols-2">{children}</div>}
    </div>
  );
}

const status = (on: boolean, value: string, error?: string) => (error ? <Pill tone="red">Error</Pill> : on && value ? <Pill tone="green">Live</Pill> : on ? <Pill tone="amber">Incomplete</Pill> : <Pill tone="slate">Off</Pill>);

function TrackingSection({
  t,
  errors,
  setTrack,
  tokenSet,
  clearToken,
  setClearToken,
}: {
  t: TrackingSettings;
  errors: Errors;
  setTrack: <K extends keyof TrackingSettings>(group: K, patch: Partial<TrackingSettings[K]>) => void;
  tokenSet: boolean;
  clearToken: boolean;
  setClearToken: (v: boolean) => void;
}) {
  const mono = cx(inputClass, "font-mono text-sm");
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-2xl border border-brand-blue/20 bg-brand-blue/5 p-4 text-sm leading-relaxed text-slate-700">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-blue" />
        <p>
          Browser-safe IDs are sent to the storefront. Access tokens stay on the server and are never exposed publicly. Marketing scripts only load after cookie consent.
          <span className="mt-1 block text-[13px] text-slate-500">Healthcare site: only the form name and an anonymous lead ID are ever sent. No names, phone numbers, emails or conditions.</span>
        </p>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-2">
        <Service icon={<span className="text-xs font-black">GTM</span>} title="Enable Google Tag Manager" description="Loads your GTM container. Configure tags for generate_lead and click_to_call there." enabled={t.gtm.enabled} onToggle={(enabled) => setTrack("gtm", { enabled })} status={status(t.gtm.enabled, t.gtm.id, errors.gtm)}>
          <Field label="GTM container ID" error={errors.gtm} className="md:col-span-2">
            {(id, invalid) => <input id={id} aria-invalid={invalid} className={mono} value={t.gtm.id} onChange={(e) => setTrack("gtm", { id: e.target.value.trim().toUpperCase() })} placeholder="GTM-XXXXXXX" />}
          </Field>
        </Service>

        <Service icon={<span className="text-xs font-black">GA4</span>} title="Enable GA4 (browser)" description="Direct gtag.js install. If GA4 is already set up inside GTM, leave this off to avoid double counting." enabled={t.ga4.enabled} onToggle={(enabled) => setTrack("ga4", { enabled })} status={status(t.ga4.enabled, t.ga4.id, errors.ga4)}>
          <Field label="GA4 measurement ID" error={errors.ga4} className="md:col-span-2">
            {(id, invalid) => <input id={id} aria-invalid={invalid} className={mono} value={t.ga4.id} onChange={(e) => setTrack("ga4", { id: e.target.value.trim().toUpperCase() })} placeholder="G-XXXXXXXXXX" />}
          </Field>
        </Service>

        <Service icon={<span className="text-sm font-black">f</span>} title="Enable Meta Pixel" description="PageView on every page and a Lead event on successful consultation requests." enabled={t.metaPixel.enabled} onToggle={(enabled) => setTrack("metaPixel", { enabled })} status={status(t.metaPixel.enabled, t.metaPixel.id, errors.metaPixel)}>
          <Field label="Meta Pixel ID" error={errors.metaPixel} className="md:col-span-2">
            {(id, invalid) => <input id={id} aria-invalid={invalid} inputMode="numeric" className={mono} value={t.metaPixel.id} onChange={(e) => setTrack("metaPixel", { id: e.target.value.replace(/\s/g, "") })} placeholder="123456789012345" />}
          </Field>
        </Service>

        <Service icon={<span className="text-xs font-black">Ads</span>} title="Enable Google Ads" description="Fires the lead conversion once per successful form submission." enabled={t.googleAds.enabled} onToggle={(enabled) => setTrack("googleAds", { enabled })} status={status(t.googleAds.enabled, t.googleAds.id && t.googleAds.conversionLabel, errors.googleAds || errors.googleAdsLabel)}>
          <Field label="Google Ads ID" error={errors.googleAds}>
            {(id, invalid) => <input id={id} aria-invalid={invalid} className={mono} value={t.googleAds.id} onChange={(e) => setTrack("googleAds", { id: e.target.value.trim().toUpperCase() })} placeholder="AW-XXXXXXXXXX" />}
          </Field>
          <Field label="Lead conversion label" error={errors.googleAdsLabel} hint={<>From Google Ads → Goals → Conversions → your Lead / Call / Form tag (<code className="text-brand-red">AW-ID/label</code>). Public; not a secret.</>}>
            {(id, invalid) => <input id={id} aria-invalid={invalid} className={mono} value={t.googleAds.conversionLabel} onChange={(e) => setTrack("googleAds", { conversionLabel: e.target.value.trim().split("/").pop() ?? "" })} placeholder="AbC-dEfGhIjKlMnOp" />}
          </Field>
        </Service>

        <Service icon={<Server className="h-4 w-4" />} title="Enable Stape / server GTM loader" description="Serves gtm.js from your own first-party domain for better data quality." enabled={t.stape.enabled} onToggle={(enabled) => setTrack("stape", { enabled })} status={status(t.stape.enabled, t.stape.url, errors.stape)}>
          <Field label="Stape container URL (public)" error={errors.stape} className="md:col-span-2" hint="Browser-safe custom loader domain. Leave blank to use googletagmanager.com.">
            {(id, invalid) => <input id={id} aria-invalid={invalid} className={inputClass} value={t.stape.url} onChange={(e) => setTrack("stape", { url: e.target.value.trim() })} placeholder="https://load.yourdomain.com" />}
          </Field>
        </Service>

        <Service icon={<ShieldCheck className="h-4 w-4" />} title="Enable server-side tracking (Meta CAPI / Stape)" description="Sends the Lead event from the server, deduplicated with the browser Pixel by lead ID." enabled={t.server.enabled} onToggle={(enabled) => setTrack("server", { enabled })} status={status(t.server.enabled, tokenSet && !clearToken ? "set" : t.server.token, errors.serverToken || errors.serverEndpoint)}>
          <Field label="Stape server URL (backend only)" optional error={errors.serverEndpoint} hint="Leave blank to send straight to the Meta Conversions API.">
            {(id, invalid) => <input id={id} aria-invalid={invalid} className={inputClass} value={t.server.endpoint} onChange={(e) => setTrack("server", { endpoint: e.target.value.trim() })} placeholder="https://server.yourdomain.com/data" />}
          </Field>
          <Field label="Meta CAPI test event code" optional error={errors.serverTestCode} hint="Only while testing in Events Manager. Clear it afterwards.">
            {(id, invalid) => <input id={id} aria-invalid={invalid} className={mono} value={t.server.testEventCode} onChange={(e) => setTrack("server", { testEventCode: e.target.value.trim() })} placeholder="TEST12345" />}
          </Field>
          <Field
            label="Meta CAPI access token (secret)"
            error={errors.serverToken}
            className="md:col-span-2"
            hint={tokenSet && !clearToken ? "A token is saved. Never returned to the storefront. Leave blank to keep the existing token." : "Never returned to the storefront or this page after saving."}
          >
            {(id, invalid) => (
              <div className="space-y-2">
                <SecretInput id={id} invalid={invalid} value={t.server.token} onChange={(token) => { setTrack("server", { token }); if (token) setClearToken(false); }} placeholder={tokenSet && !clearToken ? "•••••••••••••••• (saved)" : "Paste access token"} />
                {tokenSet && (
                  <label className="inline-flex items-center gap-2 text-[13px] text-slate-600">
                    <input type="checkbox" checked={clearToken} onChange={(e) => { setClearToken(e.target.checked); if (e.target.checked) setTrack("server", { token: "" }); }} className="h-4 w-4 rounded border-slate-300 accent-brand-red" />
                    Remove the saved token on save
                  </label>
                )}
              </div>
            )}
          </Field>
        </Service>
      </div>

      <Card title="Lead events sent to dataLayer" description="Service website: e-commerce events are not used." icon={<Activity className="h-4 w-4" />}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="pb-2 font-semibold">Event</th>
                <th className="pb-2 font-semibold">When it fires</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                ["page_view", "Every page view (GTM / GA4 default)"],
                ["view_service", "A service page opens (orthotics, prosthetics, custom insoles)"],
                ["click_to_call", "Any tel: link is tapped: header, footer, sticky call bar"],
                ["begin_consultation", "Visitor starts typing in the consultation form"],
                ["generate_lead", "Consultation form submitted. Also fires the Google Ads conversion, Meta Lead and CAPI, once per lead."],
              ].map(([name, when]) => (
                <tr key={name}>
                  <td className="py-2.5 pr-4 font-mono text-[13px] font-semibold text-brand-blue">{name}</td>
                  <td className="py-2.5 text-slate-600">{when}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ---------------------------------- History ---------------------------------- */

function HistorySection({ dirty, notify }: { dirty: boolean; notify: (tone: "ok" | "error", text: string) => void }) {
  const [items, setItems] = useState<HistoryEntry[] | null>(null);
  const [busy, setBusy] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/seo-admin/history")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setItems(d.history))
      .catch(() => setItems([]));
  }, []);

  async function restore(id: number) {
    if (dirty && !window.confirm("Restoring discards your unsaved changes. Continue?")) return;
    if (!window.confirm("Restore this version? It goes live on the website immediately. The saved access token is kept.")) return;
    setBusy(id);
    const response = await fetch("/api/seo-admin/history", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      notify("error", result.error || "Could not restore.");
      setBusy(null);
      return;
    }
    window.location.reload();
  }

  return (
    <Card title="Change history" description="The last 25 saves. Secrets are never stored in history." icon={<History className="h-4 w-4" />}>
      {items === null ? (
        <div className="flex items-center gap-2 py-6 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : items.length === 0 ? (
        <p className="py-6 text-sm text-slate-500">No saved versions yet. The site is using the built-in defaults.</p>
      ) : (
        <ol className="relative space-y-1 border-l border-slate-200 pl-6">
          {items.map((item, index) => (
            <li key={item.id} className="relative rounded-xl p-3 hover:bg-slate-50">
              <span className={cx("absolute -left-[31px] top-4 h-3 w-3 rounded-full ring-4 ring-white", index === 0 ? "bg-emerald-500" : "bg-slate-300")} />
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-slate-800">{fmtDate(item.savedAt)}</span>
                {index === 0 && <Pill tone="green">Current</Pill>}
                <span className="text-xs text-slate-400">by {item.savedBy || "unknown"}</span>
                {index > 0 && (
                  <button type="button" disabled={busy !== null} onClick={() => restore(item.id)} className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50">
                    {busy === item.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" />} Restore
                  </button>
                )}
              </div>
              <p className="mt-1 break-words font-mono text-xs text-slate-500">{item.summary}</p>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}

/* ---------------------------------- Account ---------------------------------- */

function AccountSection({ email, storage, signOut }: { email: string; storage: string; signOut: () => void }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card title="Password" description="The password is set on the server, not in this portal." icon={<KeyRound className="h-4 w-4" />}>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-600">
          <li>Open Hostinger → Websites → your site → Node.js → Environment variables.</li>
          <li>
            Change <code className="rounded bg-slate-100 px-1 font-mono text-[13px] text-brand-red">SEO_ADMIN_PASSWORD</code>.
          </li>
          <li>Save and restart / redeploy the app. Every open session is signed out.</li>
        </ol>
      </Card>
      <Card title="Session" icon={<ShieldCheck className="h-4 w-4" />}>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4"><dt className="text-slate-500">Signed in as</dt><dd className="font-semibold text-slate-800">{email}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-slate-500">Session length</dt><dd className="font-semibold text-slate-800">12 hours</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-slate-500">Settings storage</dt><dd className="font-semibold text-slate-800">{storage === "mysql" ? "Hostinger MySQL" : "Local file (dev)"}</dd></div>
        </dl>
        <button type="button" onClick={signOut} className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </Card>
    </div>
  );
}

/* ---------------------------------- Helpers ---------------------------------- */

function ToolLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[13px] font-semibold text-slate-700 transition hover:border-brand-blue/40 hover:text-brand-blue">
      {children} <ExternalLink className="h-3 w-3" />
    </a>
  );
}

function CodePreview({ title, code }: { title?: string; code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0b1220]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{title ?? "Preview"}</span>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard?.writeText(code);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
          }}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Clipboard className="h-3.5 w-3.5" />} {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="max-h-[480px] overflow-auto p-4 font-mono text-[12px] leading-relaxed text-emerald-200">{code}</pre>
    </div>
  );
}

function robotsPreview(seo: SeoSettings) {
  const base = seo.canonicalBase || "https://genfinityoandp.com";
  const lines = ["User-Agent: *"];
  if (seo.robots === "noindex, nofollow") lines.push("Disallow: /");
  else lines.push("Allow: /", ...["/api/", "/staff/", "/seo", "/patient-intake/", "/patient-intake"].map((p) => `Disallow: ${p}`));
  lines.push("", `Host: ${base}`);
  if (seo.sitemapEnabled) lines.push(`Sitemap: ${base}/sitemap.xml`);
  return lines.join("\n");
}

/** Accepts either the bare token or a pasted <meta … content="…"> tag. */
function extractContent(value: string) {
  const match = value.match(/content=["']([^"']+)["']/i);
  return (match ? match[1] : value).trim();
}
