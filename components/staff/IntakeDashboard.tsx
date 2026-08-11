"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  FileClock,
  FileText,
  Loader2,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";

type Summary = {
  id: string;
  reference_number: string;
  status: string;
  submitted_at: string;
  patient: {
    legalName: string;
    email: string;
    mobilePhone: string;
    city: string;
    state: string;
  } | null;
};
type Detail = any;
const checklistOptions = [
  "Photo ID",
  "Insurance card(s)",
  "Prescription/referral",
  "Medical notes",
  "Diagnosis confirmed",
  "Provider NPI verified",
  "Benefits checked",
  "Prior authorization needed",
  "Prior authorization submitted",
  "ABN / waiver if needed",
  "Estimate given",
  "Device ordered",
  "Custom fabrication started",
  "Delivery scheduled",
  "Claim submitted",
];

export function IntakeDashboard() {
  const router = useRouter();
  const [records, setRecords] = useState<Summary[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<string>("");
  const [detail, setDetail] = useState<Detail>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [office, setOffice] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState("");
  const [ssn, setSsn] = useState("");
  const [amendment, setAmendment] = useState({
    mobilePhone: "",
    email: "",
    streetAddress: "",
    city: "",
    state: "",
    zip: "",
    reason: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    const response = await fetch(
      `/api/staff/intakes?q=${encodeURIComponent(query)}&status=${encodeURIComponent(status)}`,
      { cache: "no-store" },
    );
    if (response.status === 401) return router.push("/staff/login");
    const result = await response.json();
    setRecords(result.records || []);
    setLoading(false);
  }, [query, router, status]);

  useEffect(() => {
    const timer = window.setTimeout(load, 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function open(id: string) {
    setSelected(id);
    setDetail(null);
    setMessage("");
    const response = await fetch(`/api/staff/intakes/${id}`, {
      cache: "no-store",
    });
    if (response.status === 401) return router.push("/staff/login");
    const result = await response.json();
    setDetail(result);
    setOffice(result.checklist?.checklist || {});
    setNotes(result.checklist?.clinician_notes || "");
    setSsn(result.checklist?.ssn_last_four || "");
    setAmendment((current) => ({
      ...current,
      mobilePhone: result.patient?.mobilePhone || "",
      email: result.patient?.email || "",
      streetAddress: result.patient?.streetAddress || "",
      city: result.patient?.city || "",
      state: result.patient?.state || "",
      zip: result.patient?.zip || "",
      reason: "",
    }));
  }

  async function patch(payload: unknown) {
    if (!selected) return;
    setSaving(true);
    setMessage("");
    const response = await fetch(`/api/staff/intakes/${selected}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    setMessage(
      response.ok
        ? "Changes saved with an audit entry."
        : result.error || "Unable to save",
    );
    setSaving(false);
    if (response.ok) {
      await open(selected);
      await load();
    }
  }

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-brand-red">
            Restricted owner workspace
          </p>
          <h1 className="mt-2 text-3xl font-bold text-brand-ink sm:text-4xl">
            Patient intakes
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Search, review, amend, and complete internal intake work without
            changing signed originals.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800">
          <ShieldCheck className="h-4 w-4" />
          MFA-protected session
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[390px_minmax(0,1fr)]">
        <aside className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="space-y-3 border-b border-slate-100 p-4">
            <label className="relative block">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Name, email, address, SSN last 4…"
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-brand-red"
              />
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"
            >
              <option value="">All statuses</option>
              <option value="new">New</option>
              <option value="in-review">In review</option>
              <option value="complete">Complete</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="max-h-[72vh] overflow-y-auto p-2">
            {loading ? (
              <Loader2 className="mx-auto my-10 h-6 w-6 animate-spin text-brand-red" />
            ) : records.length ? (
              records.map((record) => (
                <button
                  key={record.id}
                  onClick={() => open(record.id)}
                  className={`mb-2 w-full rounded-2xl border p-4 text-left transition ${selected === record.id ? "border-brand-red bg-red-50" : "border-transparent hover:bg-slate-50"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-brand-ink">
                        {record.patient?.legalName || "Encrypted record"}
                      </p>
                      <p className="mt-1 font-mono text-xs text-slate-500">
                        {record.reference_number}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${record.status === "new" ? "bg-brand-red text-white" : "bg-slate-100 text-slate-600"}`}
                    >
                      {record.status}
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">
                    {record.patient?.email} ·{" "}
                    {new Date(record.submitted_at).toLocaleDateString()}
                  </p>
                </button>
              ))
            ) : (
              <p className="px-5 py-12 text-center text-sm text-slate-500">
                No matching intakes.
              </p>
            )}
          </div>
        </aside>
        <section className="min-h-[650px] rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          {!selected ? (
            <div className="flex min-h-[570px] flex-col items-center justify-center text-center">
              <UserRound className="h-12 w-12 text-slate-300" />
              <h2 className="mt-5 text-xl font-bold text-brand-ink">
                Select an intake
              </h2>
              <p className="mt-2 max-w-sm text-sm text-slate-500">
                Choose a patient record to review the signed snapshot and office
                workflow.
              </p>
            </div>
          ) : !detail ? (
            <Loader2 className="mx-auto mt-40 h-8 w-8 animate-spin text-brand-red" />
          ) : (
            <div>
              <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-start">
                <div>
                  <p className="font-mono text-xs text-brand-red">
                    {detail.intake.referenceNumber}
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-brand-ink">
                    {detail.patient.legalName}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Submitted{" "}
                    {new Date(detail.intake.submittedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <select
                    value={detail.intake.status}
                    onChange={(e) => patch({ status: e.target.value })}
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold"
                  >
                    <option value="new">New</option>
                    <option value="in-review">In review</option>
                    <option value="complete">Complete</option>
                    <option value="archived">Archived</option>
                  </select>
                  <a
                    href={`/api/staff/intakes/${selected}/pdf`}
                    className="inline-flex items-center gap-2 rounded-full bg-brand-red px-4 py-2 text-sm font-bold text-white"
                  >
                    <Download className="h-4 w-4" />
                    PDF
                  </a>
                </div>
              </div>
              <div className="mt-7 grid gap-5 lg:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-5">
                  <h3 className="font-bold text-brand-ink">Patient contact</h3>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div>
                      <dt className="text-xs font-bold uppercase text-slate-400">
                        Email
                      </dt>
                      <dd className="mt-1 text-slate-700">
                        {detail.patient.email}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold uppercase text-slate-400">
                        Phone
                      </dt>
                      <dd className="mt-1 text-slate-700">
                        {detail.patient.mobilePhone}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold uppercase text-slate-400">
                        Address
                      </dt>
                      <dd className="mt-1 text-slate-700">
                        {detail.patient.streetAddress}, {detail.patient.city},{" "}
                        {detail.patient.state} {detail.patient.zip}
                      </dd>
                    </div>
                  </dl>
                </div>
                <div className="rounded-2xl bg-slate-50 p-5">
                  <h3 className="font-bold text-brand-ink">Care request</h3>
                  <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                    {detail.intake.data.medical.currentProblem}
                  </p>
                  <p className="mt-4 text-sm text-slate-600">
                    <strong>Goals:</strong> {detail.intake.data.function.goals}
                  </p>
                </div>
              </div>
              <details
                open
                className="mt-6 rounded-2xl border border-slate-200 p-5"
              >
                <summary className="cursor-pointer font-bold text-brand-ink">
                  Office intake checklist
                </summary>
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  {checklistOptions.map((item) => (
                    <label
                      key={item}
                      className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(office[item])}
                        onChange={(e) =>
                          setOffice((current) => ({
                            ...current,
                            [item]: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 accent-brand-red"
                      />
                      {item}
                    </label>
                  ))}
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-semibold text-brand-ink">
                    SSN last four
                    <input
                      value={ssn}
                      onChange={(e) =>
                        setSsn(e.target.value.replace(/\D/g, "").slice(0, 4))
                      }
                      inputMode="numeric"
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
                    />
                  </label>
                </div>
                <label className="mt-4 block text-sm font-semibold text-brand-ink">
                  Clinician / administrative notes
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={5}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal"
                  />
                </label>
                <button
                  onClick={() =>
                    patch({
                      checklist: office,
                      clinicianNotes: notes,
                      ssnLastFour: ssn,
                    })
                  }
                  disabled={saving}
                  className="mt-4 rounded-full bg-brand-ink px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                >
                  Save office work
                </button>
              </details>
              <details className="mt-6 rounded-2xl border border-slate-200 p-5">
                <summary className="cursor-pointer font-bold text-brand-ink">
                  Create a patient-information amendment
                </summary>
                <p className="mt-3 text-sm text-slate-500">
                  The signed intake stays unchanged. This creates a timestamped
                  correction and updates searchable patient contact details.
                </p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {(
                    [
                      ["mobilePhone", "Phone"],
                      ["email", "Email"],
                      ["streetAddress", "Street address"],
                      ["city", "City"],
                      ["state", "State"],
                      ["zip", "ZIP"],
                    ] as const
                  ).map(([key, label]) => (
                    <label
                      key={key}
                      className="text-sm font-semibold text-brand-ink"
                    >
                      {label}
                      <input
                        value={amendment[key]}
                        onChange={(e) =>
                          setAmendment((current) => ({
                            ...current,
                            [key]: e.target.value,
                          }))
                        }
                        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal"
                      />
                    </label>
                  ))}
                </div>
                <label className="mt-4 block text-sm font-semibold text-brand-ink">
                  Reason for correction
                  <textarea
                    required
                    value={amendment.reason}
                    onChange={(e) =>
                      setAmendment((current) => ({
                        ...current,
                        reason: e.target.value,
                      }))
                    }
                    rows={3}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal"
                  />
                </label>
                <button
                  onClick={() =>
                    patch({
                      amendment: {
                        reason: amendment.reason,
                        changes: {
                          mobilePhone: amendment.mobilePhone,
                          email: amendment.email,
                          streetAddress: amendment.streetAddress,
                          city: amendment.city,
                          state: amendment.state,
                          zip: amendment.zip,
                        },
                      },
                    })
                  }
                  disabled={saving || !amendment.reason.trim()}
                  className="mt-4 rounded-full border border-brand-red px-5 py-2.5 text-sm font-bold text-brand-red disabled:opacity-40"
                >
                  Record amendment
                </button>
              </details>
              <details className="mt-6 rounded-2xl border border-slate-200 p-5">
                <summary className="cursor-pointer font-bold text-brand-ink">
                  Consent and audit evidence
                </summary>
                <div className="mt-5 space-y-3">
                  {detail.consents.map((consent: any) => (
                    <div
                      key={consent.consent_type}
                      className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-3 text-sm"
                    >
                      <span className="font-semibold capitalize text-brand-ink">
                        {consent.consent_type}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(consent.accepted_at).toLocaleString()} ·{" "}
                        {consent.signature_mode}
                      </span>
                    </div>
                  ))}
                  {detail.audits.map((audit: any, index: number) => (
                    <div
                      key={index}
                      className="flex gap-3 text-xs text-slate-500"
                    >
                      <FileClock className="h-4 w-4 shrink-0" />
                      <span>
                        {audit.action} ·{" "}
                        {audit.changed_fields?.join(", ") || "record created"} ·{" "}
                        {new Date(audit.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </details>
              {message && (
                <p className="mt-5 rounded-xl bg-slate-50 p-3 text-sm font-semibold text-brand-ink">
                  {message}
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
