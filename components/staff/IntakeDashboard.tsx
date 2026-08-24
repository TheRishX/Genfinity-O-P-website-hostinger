"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import {
  AlertCircle, ArrowLeft, CalendarDays, Check, ChevronRight, CircleAlert,
  Download, LayoutDashboard, Loader2, LogOut, Mail, PackageCheck, Plus, Search,
  Send, Settings2, UsersRound, X,
} from "lucide-react";

type Care = {
  patient_id: string; stage: string; priority: "routine" | "urgent";
  next_action: string; next_action_at: string | null; email_updates_enabled: boolean;
  last_visit_at: string | null; next_visit_at: string | null;
};
type Summary = {
  id: string; patient_id: string; reference_number: string; status: string;
  submitted_at: string; record_origin: string; care: Care | null;
  patient: { legalName: string; email: string; mobilePhone: string; city: string; state: string } | null;
  openOrder: { id: string; device_type: string; status: string; priority: string; promised_date: string | null } | null;
  nextVisit: { id: string; visit_type: string; scheduled_at: string } | null;
};
type Template = { id: string; name: string; stage: string; subject: string; body: string; is_urgent: boolean };
type Detail = {
  intake: { id: string; referenceNumber: string; status: string; submittedAt: string; recordOrigin: string; data: {
    medical: { currentProblem: string }; function: { goals: string };
    contacts: { diagnosis: string; referringProvider: string };
    insurance: { company: string; memberId: string };
  }};
  patient: { legalName: string; preferredName: string; email: string; mobilePhone: string; streetAddress: string; city: string; state: string; zip: string };
  care: Care | null;
  visits: Array<{ id: string; visit_type: string; status: string; scheduled_at: string; notes: string }>;
  orders: Array<{ id: string; device_type: string; description: string; status: string; priority: string; ordered_at: string; promised_date: string | null }>;
  messages: Array<{ id: string; subject: string; delivery_status: string; sent_at: string | null; created_at: string }>;
};
type View = "today" | "patients" | "messages";
type Tab = "overview" | "visits" | "devices" | "record";
type Dialog = "patient" | "visit" | "device" | "email" | null;

const STAGES = [
  ["new", "New"], ["evaluation", "Evaluation"], ["paperwork", "Paperwork"],
  ["authorization", "Authorization"], ["fabrication", "Fabrication"],
  ["fitting", "Fitting"], ["delivered", "Delivered"], ["follow-up", "Follow-up"],
  ["on-hold", "On hold"], ["closed", "Closed"],
] as const;
const DEVICES = [
  ["custom-insole", "Custom insole"], ["afo", "AFO brace"], ["kafo", "KAFO brace"],
  ["knee-brace", "Knee brace"], ["spinal-orthosis", "Spinal orthosis"],
  ["upper-limb-orthosis", "Upper-limb orthosis"], ["prosthetic-leg", "Prosthetic leg"],
  ["prosthetic-arm", "Prosthetic arm"], ["prosthetic-component", "Prosthetic component"],
  ["repair", "Repair"], ["other", "Other"],
] as const;
const VISITS = ["consultation", "evaluation", "measurement", "casting", "fitting", "delivery", "adjustment", "follow-up", "repair", "other"];
const control = "mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base font-normal outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100";

function human(value: string) { return value.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function day(value?: string | null) { return value ? new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "Not set"; }
function dateTime(value?: string | null) { return value ? new Date(value).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "Not set"; }
function due(value?: string | null) { const end = new Date(); end.setHours(23, 59, 59, 999); return Boolean(value && new Date(value) <= end); }
function today(value?: string | null) { return Boolean(value && new Date(value).toDateString() === new Date().toDateString()); }
async function json(response: Response) { const text = await response.text(); if (!text) throw new Error(`The server returned no response (${response.status}).`); const data = JSON.parse(text); if (!response.ok) throw new Error(data.error || "Unable to complete the request."); return data; }

function Pill({ value, urgent }: { value: string; urgent?: boolean }) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${urgent ? "bg-red-100 text-red-800" : "bg-teal-50 text-teal-800"}`}>{human(value)}</span>;
}

export function IntakeDashboard() {
  const router = useRouter();
  const [view, setView] = useState<View>("today");
  const [tab, setTab] = useState<Tab>("overview");
  const [records, setRecords] = useState<Summary[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [settings, setSettings] = useState({ automatic_urgent_updates: true, automatic_delivery_updates: true, appointment_reminders: false });
  const [emailConfigured, setEmailConfigured] = useState(false);
  const [careConfigLoaded, setCareConfigLoaded] = useState(false);
  const [configLoading, setConfigLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [detail, setDetail] = useState<Detail | null>(null);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [patient, setPatient] = useState({ legalName: "", mobilePhone: "", email: "", currentProblem: "" });
  const [care, setCare] = useState({ stage: "new", priority: "routine", nextAction: "Review new patient record", nextActionAt: "", emailUpdatesEnabled: true });
  const [visit, setVisit] = useState({ visitType: "evaluation", status: "scheduled", scheduledAt: "", notes: "" });
  const [device, setDevice] = useState({ deviceType: "custom-insole", description: "", status: "ordered", priority: "routine", promisedDate: "" });
  const [message, setMessage] = useState({ templateId: "", subject: "", body: "" });

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/staff/intakes", { cache: "no-store" });
      if (response.status === 401) { router.replace("/staff/login"); return; }
      const data = await json(response);
      setRecords(data.records || []);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to load the dashboard."); }
    finally { setLoading(false); }
  }, [router]);
  // Initial client hydration loads the owner-only operational workspace.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, [load]);

  const loadCareConfig = useCallback(async () => {
    if (careConfigLoaded || configLoading) return;
    setConfigLoading(true);
    try {
      const response = await fetch("/api/staff/care", { cache: "no-store" });
      if (response.status === 401) { router.replace("/staff/login"); return; }
      const data = await json(response);
      setTemplates(data.templates || []);
      setSettings(data.settings);
      setEmailConfigured(Boolean(data.emailConfigured));
      setCareConfigLoaded(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load email settings.");
    } finally {
      setConfigLoading(false);
    }
  }, [careConfigLoaded, configLoading, router]);

  function changeView(next: View) {
    setView(next);
    if (next === "messages") { setStage(""); void loadCareConfig(); }
    if (next !== "patients") { setSelectedId(""); setDetail(null); }
  }

  function openDialog(next: Dialog) {
    if (next === "email") void loadCareConfig();
    setDialog(next);
  }

  async function signOut() {
    await createBrowserSupabase().auth.signOut();
    router.replace("/staff/login");
    router.refresh();
  }

  async function openPatient(id: string) {
    setSelectedId(id); setDetail(null); setView("patients"); setTab("overview"); setError("");
    try {
      const data = await json(await fetch(`/api/staff/intakes/${id}`, { cache: "no-store" })); setDetail(data);
      setCare({ stage: data.care?.stage || "new", priority: data.care?.priority || "routine", nextAction: data.care?.next_action || "", nextActionAt: data.care?.next_action_at?.slice(0, 16) || "", emailUpdatesEnabled: data.care?.email_updates_enabled !== false });
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to open the patient."); }
  }
  async function post(payload: unknown, success: string) {
    setSaving(true); setError(""); setNotice("");
    try {
      const result = await json(await fetch("/api/staff/care", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }));
      setNotice(success + (result.notification?.status === "failed" ? " The change was saved, but the automatic email failed." : "")); setDialog(null);
      await load(); if (selectedId) await openPatient(selectedId); return result;
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to save the change."); return null; }
    finally { setSaving(false); }
  }
  async function createPatient() {
    setSaving(true); setError("");
    try {
      const result = await json(await fetch("/api/staff/intakes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patient) }));
      setPatient({ legalName: "", mobilePhone: "", email: "", currentProblem: "" }); setDialog(null); setNotice("Patient created."); await load(); await openPatient(result.id);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to create the patient."); }
    finally { setSaving(false); }
  }
  function chooseTemplate(id: string) { const item = templates.find((template) => template.id === id); setMessage({ templateId: id, subject: item?.subject || "", body: item?.body || "" }); }
  const patientId = detail?.care?.patient_id || records.find((item) => item.id === selectedId)?.patient_id || "";
  const filtered = useMemo(() => { const q = query.trim().toLowerCase(); return records.filter((record) => (!q || [record.patient?.legalName, record.patient?.email, record.patient?.mobilePhone, record.reference_number].some((value) => value?.toLowerCase().includes(q))) && (!stage || (record.care?.stage || "new") === stage)); }, [query, records, stage]);
  const attention = records.filter((record) => record.care?.priority === "urgent" || due(record.care?.next_action_at));
  const visitsToday = records.filter((record) => today(record.nextVisit?.scheduled_at));
  const deliveries = records.filter((record) => due(record.openOrder?.promised_date ? `${record.openOrder.promised_date}T23:59:59` : null));

  if (loading && !records.length) return <StaffSkeleton />;

  const navigation = [
    ["today", "Overview", LayoutDashboard],
    ["patients", "Patients", UsersRound],
    ["messages", "Messages", Mail],
  ] as const;

  return <div className="min-h-screen bg-[#f6f7f8] text-slate-900 lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
    <aside className="sticky top-0 hidden h-screen flex-col border-r border-slate-200 bg-white px-4 py-5 lg:flex">
      <div className="px-2 py-2"><Image src="/images/brand/genfinity-logo-uploaded.webp" alt="Genfinity O&P" width={1100} height={275} priority className="h-auto w-[190px] object-contain object-left" /></div>
      <button type="button" onClick={() => openDialog("patient")} className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#a71919] px-4 text-sm font-bold text-white shadow-sm hover:bg-[#8f1515]"><Plus className="h-4 w-4" />Add patient</button>
      <nav className="mt-7 space-y-1" aria-label="Patient management">{navigation.map(([key, label, Icon]) => <button key={key} type="button" onClick={() => changeView(key)} className={`flex min-h-12 w-full items-center gap-3 rounded-xl px-4 text-left text-sm font-bold transition ${view === key ? "bg-red-50 text-[#a71919]" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}><Icon className="h-[18px] w-[18px]" />{label}</button>)}</nav>
      <div className="mt-auto border-t border-slate-100 pt-4"><p className="px-3 text-xs font-bold uppercase tracking-[.14em] text-slate-400">Owner workspace</p><button type="button" onClick={signOut} className="mt-2 flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900"><LogOut className="h-4 w-4" />Sign out</button></div>
    </aside>
    <div className="min-w-0 pb-24 lg:pb-0">
      <header className="flex min-h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden"><Image src="/images/brand/genfinity-logo-uploaded.webp" alt="Genfinity O&P" width={1100} height={275} priority className="h-auto w-[150px] object-contain" /><button type="button" onClick={() => openDialog("patient")} className="grid h-11 w-11 place-items-center rounded-xl bg-[#a71919] text-white" aria-label="Add patient"><Plus className="h-5 w-5" /></button></header>
      <div className="mx-auto max-w-[1260px] px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
      {(error || notice) && <div role="status" className={`mb-5 flex items-start gap-3 rounded-2xl border p-4 text-sm font-semibold ${error ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>{error ? <AlertCircle className="h-5 w-5 shrink-0" /> : <Check className="h-5 w-5 shrink-0" />}<span>{error || notice}</span><button type="button" aria-label="Dismiss message" onClick={() => { setError(""); setNotice(""); }} className="ml-auto"><X className="h-5 w-5" /></button></div>}
      {view === "today" && <Today attention={attention} visits={visitsToday} deliveries={deliveries} open={openPatient} all={() => setView("patients")} />}
      {view === "patients" && !selectedId && <PatientList records={filtered} query={query} stage={stage} setQuery={setQuery} setStage={setStage} open={openPatient} />}
      {view === "patients" && selectedId && <Workspace detail={detail} tab={tab} setTab={setTab} care={care} setCare={setCare} saving={saving} back={() => { setSelectedId(""); setDetail(null); }} saveCare={() => post({ action: "profile.update", patientId, ...care }, "Care status saved.")} dialog={openDialog} updateVisit={(id, status) => post({ action: "visit.update", id, status }, "Visit updated.")} updateOrder={(id, status) => post({ action: "order.update", id, status }, "Device status updated.")} />}
      {view === "messages" && (configLoading ? <InlineLoading label="Loading messages…" /> : <Messages records={filtered} templates={templates} recipients={recipients} setRecipients={setRecipients} query={query} setQuery={setQuery} form={message} setForm={setMessage} choose={chooseTemplate} configured={emailConfigured} settings={settings} setSettings={(next) => { setSettings(next); void post({ action: "settings.update", automaticUrgentUpdates: next.automatic_urgent_updates, automaticDeliveryUpdates: next.automatic_delivery_updates, appointmentReminders: next.appointment_reminders }, "Email settings saved."); }} send={() => post({ action: "email.send", patientIds: recipients, templateId: message.templateId || null, subject: message.subject, body: message.body }, "Email request completed.").then((result) => { if (result) setNotice(`${result.sent} sent · ${result.failed} failed · ${result.skipped} skipped`); })} saving={saving} />)}
      </div>
      <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-3 rounded-2xl border border-slate-200 bg-white/95 p-1.5 shadow-xl backdrop-blur lg:hidden" aria-label="Patient management">{navigation.map(([key, label, Icon]) => <button key={key} type="button" onClick={() => changeView(key)} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-bold ${view === key ? "bg-red-50 text-[#a71919]" : "text-slate-500"}`}><Icon className="h-[18px] w-[18px]" />{label}</button>)}</nav>
    </div>
    {dialog && <Modal title={dialog === "patient" ? "Add a patient" : dialog === "visit" ? "Add a visit" : dialog === "device" ? "Add a device" : "Email patient"} close={() => setDialog(null)}>
      {dialog === "patient" && <PatientForm form={patient} setForm={setPatient} save={createPatient} saving={saving} />}
      {dialog === "visit" && detail && <VisitForm form={visit} setForm={setVisit} saving={saving} save={() => post({ action: "visit.create", patientId, intakeId: detail.intake.id, ...visit }, "Visit added.")} />}
      {dialog === "device" && detail && <DeviceForm form={device} setForm={setDevice} saving={saving} save={() => post({ action: "order.create", patientId, intakeId: detail.intake.id, ...device, promisedDate: device.promisedDate || null }, "Device added.")} />}
      {dialog === "email" && detail && <EmailForm templates={templates} form={message} setForm={setMessage} choose={chooseTemplate} configured={emailConfigured} saving={saving} save={() => post({ action: "email.send", patientIds: [patientId], templateId: message.templateId || null, subject: message.subject, body: message.body }, "Email request completed.")} />}
    </Modal>}
  </div>;
}

function StaffSkeleton() {
  return <div className="min-h-screen bg-[#f6f7f8] lg:grid lg:grid-cols-[248px_minmax(0,1fr)]"><aside className="hidden border-r border-slate-200 bg-white p-6 lg:block"><Image src="/images/brand/genfinity-logo-uploaded.webp" alt="Genfinity O&P" width={1100} height={275} priority className="h-auto w-[190px]" /><div className="mt-10 h-12 rounded-xl bg-slate-100" /><div className="mt-7 space-y-2"><div className="h-12 rounded-xl bg-red-50" /><div className="h-12 rounded-xl bg-slate-50" /><div className="h-12 rounded-xl bg-slate-50" /></div></aside><div className="px-4 py-8 sm:px-8"><div className="h-5 w-36 rounded bg-slate-200" /><div className="mt-3 h-9 w-56 rounded bg-slate-200" /><div className="mt-8 grid gap-4 sm:grid-cols-3"><div className="h-32 rounded-3xl bg-white" /><div className="h-32 rounded-3xl bg-white" /><div className="h-32 rounded-3xl bg-white" /></div><div className="mt-6 h-72 rounded-3xl bg-white" /></div></div>;
}

function InlineLoading({ label }: { label: string }) {
  return <div className="grid min-h-72 place-items-center rounded-3xl border border-slate-200 bg-white"><div className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-[#a71919]" /><p className="mt-3 text-sm font-bold text-slate-500">{label}</p></div></div>;
}

function Today({ attention, visits, deliveries, open, all }: { attention: Summary[]; visits: Summary[]; deliveries: Summary[]; open: (id: string) => void; all: () => void }) {
  const queue = [...new Map([...attention, ...visits, ...deliveries].map((item) => [item.id, item])).values()];
  const cards = [["Needs attention", attention.length, CircleAlert, "bg-red-50 text-red-700"], ["Visits today", visits.length, CalendarDays, "bg-blue-50 text-blue-700"], ["Deliveries due", deliveries.length, PackageCheck, "bg-amber-50 text-amber-700"]] as const;
  return <div><p className="text-sm font-bold text-[#a71919]">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p><h2 className="mt-1 text-3xl font-bold">Overview</h2><p className="mt-2 text-slate-600">Everything that needs attention today, in one place.</p>
    <div className="mt-7 grid gap-4 sm:grid-cols-3">{cards.map(([label, count, Icon, color]) => <div key={label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className={`grid h-10 w-10 place-items-center rounded-2xl ${color}`}><Icon className="h-5 w-5" /></div><div className="mt-5 flex items-end justify-between gap-3"><p className="text-3xl font-bold">{count}</p><p className="pb-1 text-sm font-semibold text-slate-500">{label}</p></div></div>)}</div>
    <section className="mt-7 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6"><div><h3 className="text-lg font-bold">Today&apos;s work</h3><p className="mt-1 text-sm text-slate-500">One clear list, sorted by urgency.</p></div><button type="button" onClick={all} className="min-h-11 px-3 text-sm font-bold text-teal-700">All patients</button></div>
      {queue.length ? queue.map((record) => <button key={record.id} type="button" onClick={() => open(record.id)} className="flex min-h-20 w-full items-center gap-4 border-b border-slate-100 px-5 py-4 text-left last:border-0 hover:bg-slate-50 sm:px-6"><div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl font-bold ${record.care?.priority === "urgent" ? "bg-red-100 text-red-800" : "bg-teal-50 text-teal-800"}`}>{(record.patient?.legalName || "?")[0]}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="truncate font-bold">{record.patient?.legalName || "Encrypted patient"}</p>{record.care?.priority === "urgent" && <Pill value="urgent" urgent />}</div><p className="mt-1 truncate text-sm text-slate-500">{record.care?.next_action || (record.nextVisit ? `${human(record.nextVisit.visit_type)} · ${dateTime(record.nextVisit.scheduled_at)}` : "Review patient record")}</p></div><div className="hidden text-right sm:block"><p className="text-sm font-bold">{human(record.care?.stage || "new")}</p><p className="mt-1 text-xs text-slate-500">{day(record.care?.next_action_at)}</p></div><ChevronRight className="h-5 w-5 text-slate-400" /></button>) : <div className="p-10 text-center"><Check className="mx-auto h-9 w-9 text-emerald-600" /><h4 className="mt-3 font-bold">You&apos;re caught up</h4><p className="mt-1 text-sm text-slate-500">No urgent work or due items today.</p></div>}
    </section>
  </div>;
}

function PatientList({ records, query, stage, setQuery, setStage, open }: { records: Summary[]; query: string; stage: string; setQuery: (value: string) => void; setStage: (value: string) => void; open: (id: string) => void }) {
  return <div><div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><h2 className="text-3xl font-bold">Patients</h2><p className="mt-2 text-slate-600">Search every new and legacy patient record.</p></div><div className="flex flex-col gap-3 sm:flex-row"><label className="relative block min-w-[280px]"><span className="sr-only">Search patients</span><Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, email, phone, or ID" className="min-h-12 w-full rounded-2xl border border-slate-300 bg-white pl-12 pr-4 text-base" /></label><select aria-label="Filter by care stage" value={stage} onChange={(event) => setStage(event.target.value)} className="min-h-12 rounded-2xl border border-slate-300 bg-white px-4 text-base font-semibold"><option value="">All stages</option>{STAGES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div></div>
    <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">{records.length ? records.map((record) => <button key={record.id} type="button" onClick={() => open(record.id)} className="grid min-h-24 w-full gap-3 border-b border-slate-100 px-5 py-4 text-left last:border-0 hover:bg-slate-50 sm:grid-cols-[minmax(220px,1.3fr)_minmax(170px,1fr)_minmax(170px,1fr)_auto] sm:items-center sm:px-6"><div className="flex min-w-0 items-center gap-3"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-100 font-bold">{(record.patient?.legalName || "?")[0]}</div><div className="min-w-0"><p className="truncate font-bold">{record.patient?.legalName || "Encrypted patient"}</p><p className="mt-1 truncate text-xs text-slate-500">{record.reference_number}</p></div></div><div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Care stage</p><div className="mt-1"><Pill value={record.care?.stage || "new"} urgent={record.care?.priority === "urgent"} /></div></div><div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Next step</p><p className="mt-1 truncate text-sm font-semibold">{record.care?.next_action || "Review record"}</p><p className="text-xs text-slate-500">{day(record.care?.next_action_at)}</p></div><ChevronRight className="hidden h-5 w-5 text-slate-400 sm:block" /></button>) : <div className="p-12 text-center"><Search className="mx-auto h-8 w-8 text-slate-300" /><h3 className="mt-4 font-bold">No patients found</h3><p className="mt-1 text-sm text-slate-500">Try a different search or remove the filter.</p></div>}</div>
  </div>;
}

function Workspace({ detail, tab, setTab, care, setCare, saving, back, saveCare, dialog, updateVisit, updateOrder }: {
  detail: Detail | null; tab: Tab; setTab: (value: Tab) => void;
  care: { stage: string; priority: string; nextAction: string; nextActionAt: string; emailUpdatesEnabled: boolean };
  setCare: (value: typeof care) => void; saving: boolean; back: () => void; saveCare: () => void;
  dialog: (value: Dialog) => void; updateVisit: (id: string, status: string) => void; updateOrder: (id: string, status: string) => void;
}) {
  if (!detail) return <div className="grid min-h-96 place-items-center"><Loader2 className="h-8 w-8 animate-spin text-teal-700" /></div>;
  const tabs = [["overview", "Overview"], ["visits", "Visits"], ["devices", "Devices"], ["record", "Intake record"]] as const;
  return <div>
    <button type="button" onClick={back} className="inline-flex min-h-11 items-center gap-2 rounded-xl pr-4 text-sm font-bold text-slate-600"><ArrowLeft className="h-4 w-4" />All patients</button>
    <div className="mt-3 flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-4"><div className="grid h-14 w-14 place-items-center rounded-2xl bg-teal-700 text-xl font-bold text-white">{detail.patient.legalName[0]}</div><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-2xl font-bold">{detail.patient.legalName}</h2><Pill value={detail.care?.stage || "new"} urgent={detail.care?.priority === "urgent"} /></div><p className="mt-1 text-sm text-slate-500">{detail.patient.mobilePhone || "No phone"} · {detail.patient.email || "No email"}</p></div></div>
      <div className="grid grid-cols-3 gap-2"><button type="button" onClick={() => dialog("visit")} className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm font-bold">Add visit</button><button type="button" onClick={() => dialog("device")} className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm font-bold">Add device</button><button type="button" onClick={() => dialog("email")} className="min-h-11 rounded-xl bg-teal-700 px-3 text-sm font-bold text-white">Email</button></div>
    </div>
    <div className="mt-5 flex gap-1 overflow-x-auto rounded-2xl bg-slate-200/60 p-1" role="tablist">{tabs.map(([value, label]) => <button key={value} type="button" role="tab" aria-selected={tab === value} onClick={() => setTab(value)} className={`min-h-11 flex-1 whitespace-nowrap rounded-xl px-4 text-sm font-bold ${tab === value ? "bg-white text-teal-800 shadow-sm" : "text-slate-600"}`}>{label}</button>)}</div>
    {tab === "overview" && <div className="mt-5 grid gap-5 xl:grid-cols-[1.3fr_.7fr]">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h3 className="text-lg font-bold">Care status</h3><p className="mt-1 text-sm text-slate-500">Only the next important step appears on the dashboard.</p><div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-bold">Stage<select value={care.stage} onChange={(event) => setCare({ ...care, stage: event.target.value })} className={control}>{STAGES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className="text-sm font-bold">Priority<select value={care.priority} onChange={(event) => setCare({ ...care, priority: event.target.value })} className={control}><option value="routine">Routine</option><option value="urgent">Urgent</option></select></label>
        <label className="text-sm font-bold sm:col-span-2">Next action<input value={care.nextAction} onChange={(event) => setCare({ ...care, nextAction: event.target.value })} placeholder="For example: Call patient to schedule fitting" className={control} /></label>
        <label className="text-sm font-bold">Due date<input type="datetime-local" value={care.nextActionAt} onChange={(event) => setCare({ ...care, nextActionAt: event.target.value })} className={control} /></label>
        <label className="flex min-h-12 items-center gap-3 self-end rounded-xl bg-slate-50 px-4 text-sm font-bold"><input type="checkbox" checked={care.emailUpdatesEnabled} onChange={(event) => setCare({ ...care, emailUpdatesEnabled: event.target.checked })} className="h-5 w-5 accent-teal-700" />Automatic emails allowed</label>
      </div><button type="button" onClick={saveCare} disabled={saving} className="mt-5 min-h-11 rounded-xl bg-teal-700 px-5 text-sm font-bold text-white disabled:opacity-50">{saving ? "Saving…" : "Save care status"}</button></section>
      <div className="space-y-5"><Info title="Contact"><dl className="space-y-3 text-sm"><Row label="Phone" value={detail.patient.mobilePhone} /><Row label="Email" value={detail.patient.email} /><Row label="Address" value={[detail.patient.streetAddress, detail.patient.city, detail.patient.state, detail.patient.zip].filter(Boolean).join(", ")} /></dl></Info><Info title="Care request"><p className="text-sm leading-6 text-slate-600">{detail.intake.data.medical.currentProblem || "No concern recorded."}</p>{detail.intake.data.function.goals && <p className="mt-3 text-sm leading-6"><strong>Goal:</strong> {detail.intake.data.function.goals}</p>}</Info></div>
    </div>}
    {tab === "visits" && <Timeline title="Visit history" empty="No visits have been recorded." add={() => dialog("visit")} addLabel="Add visit" items={detail.visits.map((item) => ({ id: item.id, title: human(item.visit_type), meta: `${dateTime(item.scheduled_at)} · ${human(item.status)}`, note: item.notes, action: item.status === "scheduled" ? <button onClick={() => updateVisit(item.id, "completed")} className="min-h-10 rounded-xl bg-teal-50 px-3 text-xs font-bold text-teal-800">Mark completed</button> : null }))} />}
    {tab === "devices" && <Timeline title="Devices and deliveries" empty="No devices have been ordered." add={() => dialog("device")} addLabel="Add device" items={detail.orders.map((item) => ({ id: item.id, title: human(item.device_type), meta: `${human(item.status)} · Ordered ${day(item.ordered_at)}${item.promised_date ? ` · Due ${day(item.promised_date)}` : ""}`, note: item.description, action: !["delivered", "cancelled"].includes(item.status) ? <select aria-label={`Update ${human(item.device_type)} status`} value={item.status} onChange={(event) => updateOrder(item.id, event.target.value)} className="min-h-10 rounded-xl border border-slate-300 px-3 text-sm font-bold"><option value="ordered">Ordered</option><option value="authorization">Authorization</option><option value="fabrication">Fabrication</option><option value="quality-check">Quality check</option><option value="ready">Ready</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select> : null }))} />}
    {tab === "record" && <div className="mt-5 grid gap-5 lg:grid-cols-2"><Info title="Signed intake record"><p className="text-sm leading-6 text-slate-500">The original encrypted intake remains unchanged. Download the signed PDF for complete clinical, insurance, consent, and history information.</p><dl className="mt-5 space-y-3 text-sm"><Row label="Reference" value={detail.intake.referenceNumber} /><Row label="Added" value={dateTime(detail.intake.submittedAt)} /><Row label="Source" value={detail.intake.recordOrigin === "staff" ? "Staff-created record" : "Patient-submitted intake"} /></dl><a href={`/api/staff/intakes/${detail.intake.id}/pdf`} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-teal-700 px-5 text-sm font-bold text-white"><Download className="h-4 w-4" />Download complete PDF</a></Info><Info title="Clinical summary"><dl className="space-y-4 text-sm"><Row label="Diagnosis" value={detail.intake.data.contacts.diagnosis} /><Row label="Referring provider" value={detail.intake.data.contacts.referringProvider} /><Row label="Insurance" value={detail.intake.data.insurance.company} /><Row label="Messages sent" value={String(detail.messages.filter((item) => item.delivery_status === "sent").length)} /></dl></Info></div>}
  </div>;
}

function Info({ title, children }: { title: string; children: React.ReactNode }) { return <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h3 className="mb-4 text-lg font-bold">{title}</h3>{children}</section>; }
function Row({ label, value }: { label: string; value?: string }) { return <div><dt className="text-slate-400">{label}</dt><dd className="mt-1 break-words font-semibold">{value || "Not provided"}</dd></div>; }

function Timeline({ title, empty, items, add, addLabel }: { title: string; empty: string; items: Array<{ id: string; title: string; meta: string; note: string; action: React.ReactNode }>; add: () => void; addLabel: string }) {
  return <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between"><h3 className="text-lg font-bold">{title}</h3><button type="button" onClick={add} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-teal-700 px-4 text-sm font-bold text-white"><Plus className="h-4 w-4" />{addLabel}</button></div>{items.length ? <div className="mt-5 divide-y divide-slate-100">{items.map((item) => <div key={item.id} className="flex flex-col gap-3 py-5 first:pt-0 sm:flex-row sm:items-center"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-slate-100"><Check className="h-4 w-4 text-teal-700" /></div><div className="min-w-0 flex-1"><p className="font-bold">{item.title}</p><p className="mt-1 text-sm text-slate-500">{item.meta}</p>{item.note && <p className="mt-2 text-sm">{item.note}</p>}</div>{item.action}</div>)}</div> : <p className="mt-8 rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-500">{empty}</p>}</section>;
}

function Messages({ records, templates, recipients, setRecipients, query, setQuery, form, setForm, choose, configured, settings, setSettings, send, saving }: {
  records: Summary[]; templates: Template[]; recipients: string[]; setRecipients: (ids: string[]) => void;
  query: string; setQuery: (value: string) => void; form: { templateId: string; subject: string; body: string };
  setForm: (value: typeof form) => void; choose: (id: string) => void; configured: boolean;
  settings: { automatic_urgent_updates: boolean; automatic_delivery_updates: boolean; appointment_reminders: boolean };
  setSettings: (value: typeof settings) => void; send: () => void; saving: boolean;
}) {
  const eligible = records.filter((record) => record.patient?.email);
  return <div><h2 className="text-3xl font-bold">Messages</h2><p className="mt-2 text-slate-600">Choose patients, pick a template, and send. No complex campaign setup.</p>
    {!configured && <div className="mt-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><AlertCircle className="h-5 w-5 shrink-0" /><p><strong>Email delivery needs setup.</strong> Add the Brevo SMTP environment values before sending.</p></div>}
    <div className="mt-6 grid gap-5 xl:grid-cols-[.75fr_1.25fr]"><section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 p-5"><h3 className="font-bold">1. Choose patients</h3><label className="relative mt-4 block"><Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search patients" className="min-h-12 w-full rounded-xl border border-slate-300 pl-12 pr-4 text-base" /></label><button type="button" onClick={() => setRecipients(recipients.length === eligible.length ? [] : eligible.map((item) => item.patient_id))} className="mt-3 min-h-10 text-sm font-bold text-teal-700">{recipients.length === eligible.length && eligible.length ? "Clear all" : `Select all ${eligible.length}`}</button></div><div className="max-h-[480px] overflow-y-auto">{eligible.map((record) => <label key={record.id} className="flex min-h-16 cursor-pointer items-center gap-3 border-b border-slate-100 px-5 py-3 last:border-0 hover:bg-slate-50"><input type="checkbox" checked={recipients.includes(record.patient_id)} onChange={(event) => setRecipients(event.target.checked ? [...recipients, record.patient_id] : recipients.filter((id) => id !== record.patient_id))} className="h-5 w-5 accent-teal-700" /><div className="min-w-0"><p className="truncate text-sm font-bold">{record.patient?.legalName}</p><p className="truncate text-xs text-slate-500">{record.patient?.email}</p></div></label>)}</div></section>
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h3 className="font-bold">2. Write the email</h3><div className="mt-5 grid gap-4"><label className="text-sm font-bold">Template<select value={form.templateId} onChange={(event) => choose(event.target.value)} className={control}><option value="">Write from scratch</option>{templates.map((item) => <option key={item.id} value={item.id}>{item.name} · {human(item.stage)}</option>)}</select></label><label className="text-sm font-bold">Subject<input value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} className={control} /></label><label className="text-sm font-bold">Message<textarea value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} rows={10} className={`${control} py-3 leading-6`} /></label><p className="text-xs text-slate-500">Fields: {"{{first_name}}"}, {"{{next_action}}"}, {"{{device_type}}"}, {"{{delivery_date}}"}, {"{{appointment_date}}"}</p><button type="button" onClick={send} disabled={saving || !recipients.length || !form.subject.trim() || !form.body.trim() || !configured} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 text-sm font-bold text-white disabled:opacity-40"><Send className="h-4 w-4" />{saving ? "Sending…" : `Send to ${recipients.length} patient${recipients.length === 1 ? "" : "s"}`}</button></div>
        <details className="mt-6 rounded-2xl bg-slate-50 p-4"><summary className="flex cursor-pointer items-center gap-2 font-bold"><Settings2 className="h-4 w-4" />Automatic email settings</summary><div className="mt-4 space-y-3">{([["automatic_urgent_updates", "Send when care becomes urgent"], ["automatic_delivery_updates", "Send when a device is ready or delivered"], ["appointment_reminders", "Send appointment confirmations"]] as const).map(([key, label]) => <label key={key} className="flex min-h-11 items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={settings[key]} onChange={(event) => setSettings({ ...settings, [key]: event.target.checked })} className="h-5 w-5 accent-teal-700" />{label}</label>)}</div></details>
      </section></div>
  </div>;
}

function Modal({ title, close, children }: { title: string; close: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", onKeyDown); };
  }, [close]);
  return <div onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }} className="fixed inset-0 z-[100] grid place-items-end bg-slate-950/45 backdrop-blur-sm sm:place-items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}><div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-xl sm:rounded-3xl sm:p-6"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">{title}</h2><button type="button" onClick={close} className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100" aria-label="Close"><X className="h-5 w-5" /></button></div><div className="mt-6">{children}</div></div></div>;
}

function PatientForm({ form, setForm, save, saving }: { form: { legalName: string; mobilePhone: string; email: string; currentProblem: string }; setForm: (value: typeof form) => void; save: () => void; saving: boolean }) {
  return <div className="grid gap-4"><p className="rounded-2xl bg-teal-50 p-4 text-sm leading-6 text-teal-900">Start with the essentials. More clinical information stays in the signed intake record.</p><label className="text-sm font-bold">Full legal name<input autoFocus value={form.legalName} onChange={(event) => setForm({ ...form, legalName: event.target.value })} className={control} /></label><label className="text-sm font-bold">Phone<input value={form.mobilePhone} onChange={(event) => setForm({ ...form, mobilePhone: event.target.value })} className={control} /></label><label className="text-sm font-bold">Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className={control} /></label><label className="text-sm font-bold">Reason for care<textarea value={form.currentProblem} onChange={(event) => setForm({ ...form, currentProblem: event.target.value })} rows={3} className={`${control} py-3`} /></label><button type="button" onClick={save} disabled={saving || !form.legalName.trim()} className="min-h-12 rounded-xl bg-teal-700 px-5 text-sm font-bold text-white disabled:opacity-40">{saving ? "Creating…" : "Create patient"}</button></div>;
}

function VisitForm({ form, setForm, save, saving }: { form: { visitType: string; status: string; scheduledAt: string; notes: string }; setForm: (value: typeof form) => void; save: () => void; saving: boolean }) {
  return <div className="grid gap-4"><label className="text-sm font-bold">Visit type<select value={form.visitType} onChange={(event) => setForm({ ...form, visitType: event.target.value })} className={control}>{VISITS.map((value) => <option key={value} value={value}>{human(value)}</option>)}</select></label><label className="text-sm font-bold">Date and time<input type="datetime-local" value={form.scheduledAt} onChange={(event) => setForm({ ...form, scheduledAt: event.target.value })} className={control} /></label><label className="text-sm font-bold">Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className={control}><option value="scheduled">Scheduled</option><option value="completed">Already completed</option></select></label><label className="text-sm font-bold">Short note<textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} rows={3} className={`${control} py-3`} /></label><button type="button" onClick={save} disabled={saving || !form.scheduledAt} className="min-h-12 rounded-xl bg-teal-700 px-5 text-sm font-bold text-white disabled:opacity-40">{saving ? "Saving…" : "Add visit"}</button></div>;
}

function DeviceForm({ form, setForm, save, saving }: { form: { deviceType: string; description: string; status: string; priority: string; promisedDate: string }; setForm: (value: typeof form) => void; save: () => void; saving: boolean }) {
  return <div className="grid gap-4"><label className="text-sm font-bold">Device<select value={form.deviceType} onChange={(event) => setForm({ ...form, deviceType: event.target.value })} className={control}>{DEVICES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><div className="grid grid-cols-2 gap-3"><label className="text-sm font-bold">Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className={control}><option value="quoted">Quoted</option><option value="ordered">Ordered</option><option value="authorization">Authorization</option><option value="fabrication">Fabrication</option><option value="quality-check">Quality check</option><option value="ready">Ready</option></select></label><label className="text-sm font-bold">Priority<select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })} className={control}><option value="routine">Routine</option><option value="urgent">Urgent</option></select></label></div><label className="text-sm font-bold">Expected delivery<input type="date" value={form.promisedDate} onChange={(event) => setForm({ ...form, promisedDate: event.target.value })} className={control} /></label><label className="text-sm font-bold">Details<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={3} className={`${control} py-3`} /></label><button type="button" onClick={save} disabled={saving} className="min-h-12 rounded-xl bg-teal-700 px-5 text-sm font-bold text-white disabled:opacity-40">{saving ? "Saving…" : "Add device"}</button></div>;
}

function EmailForm({ templates, form, setForm, choose, configured, save, saving }: { templates: Template[]; form: { templateId: string; subject: string; body: string }; setForm: (value: typeof form) => void; choose: (id: string) => void; configured: boolean; save: () => void; saving: boolean }) {
  return <div className="grid gap-4">{!configured && <p className="rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-900">Patient email delivery is not enabled yet.</p>}<label className="text-sm font-bold">Template<select value={form.templateId} onChange={(event) => choose(event.target.value)} className={control}><option value="">Write from scratch</option>{templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}</select></label><label className="text-sm font-bold">Subject<input value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} className={control} /></label><label className="text-sm font-bold">Message<textarea value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} rows={8} className={`${control} py-3`} /></label><button type="button" onClick={save} disabled={!configured || saving || !form.subject.trim() || !form.body.trim()} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 text-sm font-bold text-white disabled:opacity-40"><Send className="h-4 w-4" />{saving ? "Sending…" : "Send email"}</button></div>;
}
