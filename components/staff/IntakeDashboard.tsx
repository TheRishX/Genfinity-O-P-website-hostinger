"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Download,
  FileClock,
  FileText,
  Loader2,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

type Summary = {
  id: string;
  reference_number: string;
  status: string;
  submitted_at: string;
  record_origin: string;
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

function answer(value: unknown) {
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

function AnswerGrid({
  title,
  items,
}: {
  title: string;
  items: Array<[string, unknown]>;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 p-5">
      <h3 className="font-bold text-brand-ink">{title}</h3>
      <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              {label}
            </dt>
            <dd className="mt-1 break-words text-sm text-slate-700">
              {answer(value)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

async function readApiResponse(response: Response) {
  const body = await response.text();
  if (!body.trim()) {
    throw new Error(
      response.ok
        ? "The server returned an empty response. Please try again."
        : `The server could not complete the request (${response.status}).`,
    );
  }
  try {
    return JSON.parse(body);
  } catch {
    throw new Error(
      `The server returned an invalid response (${response.status}). Please try again.`,
    );
  }
}

export function IntakeDashboard() {
  const router = useRouter();
  const [records, setRecords] = useState<Summary[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<string>("");
  const [detail, setDetail] = useState<Detail>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [office, setOffice] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState("");
  const [ssn, setSsn] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [manualPatient, setManualPatient] = useState({
    legalName: "",
    preferredName: "",
    dateOfBirth: "",
    sexAtBirth: "prefer-not-to-answer",
    mobilePhone: "",
    homePhone: "",
    email: "",
    streetAddress: "",
    city: "",
    state: "",
    zip: "",
    primaryLanguage: "English",
    interpreterNeeded: false,
    maritalStatus: "prefer-not-to-answer",
    currentProblem: "",
    goals: "",
  });
  const [amendment, setAmendment] = useState({
    legalName: "",
    preferredName: "",
    dateOfBirth: "",
    sexAtBirth: "",
    mobilePhone: "",
    homePhone: "",
    email: "",
    streetAddress: "",
    city: "",
    state: "",
    zip: "",
    primaryLanguage: "",
    interpreterNeeded: false,
    maritalStatus: "",
    reason: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15_000);
    try {
      const response = await fetch(
        `/api/staff/intakes?q=${encodeURIComponent(query)}&status=${encodeURIComponent(status)}`,
        { cache: "no-store", signal: controller.signal },
      );
      if (response.status === 401) {
        router.replace("/staff/login");
        return;
      }
      const result = await readApiResponse(response);
      if (!response.ok)
        throw new Error(result.error || "Unable to load patient intakes");
      setRecords(Array.isArray(result.records) ? result.records : []);
    } catch (error) {
      setRecords([]);
      setLoadError(
        error instanceof DOMException && error.name === "AbortError"
          ? "The request took too long. Please try again."
          : error instanceof Error
            ? error.message
            : "Unable to load patient intakes",
      );
    } finally {
      window.clearTimeout(timeout);
      setLoading(false);
    }
  }, [query, router, status]);

  useEffect(() => {
    const timer = window.setTimeout(load, 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function open(id: string) {
    setSelected(id);
    setDetail(null);
    setMessage("");
    setDeleteConfirmation("");
    const response = await fetch(`/api/staff/intakes/${id}`, {
      cache: "no-store",
    });
    if (response.status === 401) return router.push("/staff/login");
    const result = await readApiResponse(response);
    setDetail(result);
    setOffice(result.checklist?.checklist || {});
    setNotes(result.checklist?.clinician_notes || "");
    setSsn(result.checklist?.ssn_last_four || "");
    setAmendment((current) => ({
      ...current,
      legalName: result.patient?.legalName || "",
      preferredName: result.patient?.preferredName || "",
      dateOfBirth: result.patient?.dateOfBirth || "",
      sexAtBirth: result.patient?.sexAtBirth || "prefer-not-to-answer",
      mobilePhone: result.patient?.mobilePhone || "",
      homePhone: result.patient?.homePhone || "",
      email: result.patient?.email || "",
      streetAddress: result.patient?.streetAddress || "",
      city: result.patient?.city || "",
      state: result.patient?.state || "",
      zip: result.patient?.zip || "",
      primaryLanguage: result.patient?.primaryLanguage || "",
      interpreterNeeded: Boolean(result.patient?.interpreterNeeded),
      maritalStatus:
        result.patient?.maritalStatus || "prefer-not-to-answer",
      reason: "",
    }));
  }

  async function createPatient() {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/staff/intakes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(manualPatient),
      });
      const result = await readApiResponse(response);
      if (!response.ok)
        throw new Error(result.error || "Unable to create patient");
      setCreateOpen(false);
      await load();
      await open(result.id);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to create patient",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deletePatient() {
    if (!selected || deleteConfirmation !== "DELETE") return;
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch(`/api/staff/intakes/${selected}`, {
        method: "DELETE",
      });
      const result = await readApiResponse(response);
      if (!response.ok)
        throw new Error(result.error || "Unable to delete patient");
      setSelected("");
      setDetail(null);
      setDeleteConfirmation("");
      await load();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to delete patient",
      );
    } finally {
      setSaving(false);
    }
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
    const result = await readApiResponse(response);
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
    <>
      <div className="mx-auto h-full min-h-0 max-w-[1600px] p-3 sm:p-4 lg:p-5">
      <div className="grid h-full min-h-0 grid-rows-[minmax(220px,0.8fr)_minmax(300px,1.2fr)] gap-3 lg:gap-4 xl:grid-cols-[360px_minmax(0,1fr)] xl:grid-rows-1">
        <aside className="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="shrink-0 space-y-3 border-b border-slate-100 p-4">
            <div className="flex items-center justify-between gap-3 px-1 pb-1">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.18em] text-brand-red">
                  Owner workspace
                </p>
                <h1 className="mt-1 text-lg font-bold text-brand-ink">
                  Patient intakes
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMessage("");
                    setCreateOpen(true);
                  }}
                  className="grid h-9 w-9 place-items-center rounded-full bg-brand-red text-white"
                  title="Create patient"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <span
                  className="grid h-9 w-9 place-items-center rounded-full bg-emerald-50 text-emerald-700"
                  title="Authorized owner session"
                >
                  <ShieldCheck className="h-4 w-4" />
                </span>
              </div>
            </div>
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
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
            {loading ? (
              <Loader2 className="mx-auto my-10 h-6 w-6 animate-spin text-brand-red" />
            ) : loadError ? (
              <div className="px-5 py-10 text-center">
                <AlertCircle className="mx-auto h-7 w-7 text-brand-red" />
                <p className="mt-3 text-sm font-semibold text-brand-ink">
                  Couldn&apos;t load intakes
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  {loadError}
                </p>
                <button
                  type="button"
                  onClick={() => load()}
                  className="mt-4 rounded-full bg-brand-red px-4 py-2 text-xs font-bold text-white"
                >
                  Try again
                </button>
              </div>
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
                  {record.record_origin === "staff" && (
                    <span className="mt-2 inline-block rounded-full bg-slate-100 px-2 py-1 text-[9px] font-bold uppercase text-slate-500">
                      Staff record
                    </span>
                  )}
                  <p className="mt-3 text-xs text-slate-500">
                    {record.patient?.email} ·{" "}
                    {new Date(record.submitted_at).toLocaleDateString()}
                  </p>
                </button>
              ))
            ) : (
              <p className="px-5 py-12 text-center text-sm text-slate-500">
                {query || status
                  ? "No matching intakes."
                  : "No patient intakes have been submitted yet."}
              </p>
            )}
          </div>
        </aside>
        <section className="min-h-0 overflow-y-auto overscroll-contain rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          {!selected ? (
            <div className="flex min-h-full flex-col items-center justify-center py-12 text-center">
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
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmation("confirm")}
                    className="inline-flex items-center gap-2 rounded-full border border-brand-red px-4 py-2 text-sm font-bold text-brand-red"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
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
                className="mt-6 rounded-2xl bg-slate-50 p-4 sm:p-5"
              >
                <summary className="cursor-pointer font-bold text-brand-ink">
                  {detail.intake.recordOrigin === "staff"
                    ? "All staff-entered information"
                    : "All patient-provided information"}
                </summary>
                <div className="mt-5 space-y-4">
                  <AnswerGrid
                    title="Demographics"
                    items={[
                      ["Legal name", detail.intake.data.demographics.legalName],
                      ["Preferred name", detail.intake.data.demographics.preferredName],
                      ["Date of birth", detail.intake.data.demographics.dateOfBirth],
                      ["Sex at birth", detail.intake.data.demographics.sexAtBirth],
                      ["Mobile phone", detail.intake.data.demographics.mobilePhone],
                      ["Home phone", detail.intake.data.demographics.homePhone],
                      ["Email", detail.intake.data.demographics.email],
                      ["Street address", detail.intake.data.demographics.streetAddress],
                      ["City", detail.intake.data.demographics.city],
                      ["State", detail.intake.data.demographics.state],
                      ["ZIP", detail.intake.data.demographics.zip],
                      ["Primary language", detail.intake.data.demographics.primaryLanguage],
                      ["Interpreter needed", detail.intake.data.demographics.interpreterNeeded],
                      ["Marital status", detail.intake.data.demographics.maritalStatus],
                    ]}
                  />
                  <AnswerGrid
                    title="Contacts, referral, and diagnosis"
                    items={[
                      ["Emergency contact", detail.intake.data.contacts.emergencyName],
                      ["Emergency relationship", detail.intake.data.contacts.emergencyRelationship],
                      ["Emergency phone", detail.intake.data.contacts.emergencyPhone],
                      ["Responsible party", detail.intake.data.contacts.responsibleName],
                      ["Responsible relationship", detail.intake.data.contacts.responsibleRelationship],
                      ["Responsible phone", detail.intake.data.contacts.responsiblePhone],
                      ["Referring provider", detail.intake.data.contacts.referringProvider],
                      ["Provider phone", detail.intake.data.contacts.providerPhone],
                      ["Provider NPI", detail.intake.data.contacts.providerNpi],
                      ["Diagnosis / reason", detail.intake.data.contacts.diagnosis],
                      ["Prescription date", detail.intake.data.contacts.prescriptionDate],
                      ["Body part / side", detail.intake.data.contacts.bodySides],
                      ["Contact preferences", detail.intake.data.contacts.contactPreferences],
                      ["Preferred care contact", detail.intake.data.contacts.preferredCareContact],
                    ]}
                  />
                  <AnswerGrid
                    title="Insurance and claim information"
                    items={[
                      ["Coverage type", detail.intake.data.insurance.coverageType],
                      ["Insurance company", detail.intake.data.insurance.company],
                      ["Member ID", detail.intake.data.insurance.memberId],
                      ["Group number", detail.intake.data.insurance.groupNumber],
                      ["Policy holder", detail.intake.data.insurance.policyHolderName],
                      ["Policy holder DOB", detail.intake.data.insurance.policyHolderDob],
                      ["Relationship", detail.intake.data.insurance.relationship],
                      ["Claims address", detail.intake.data.insurance.claimsAddress],
                      ["Phone on card", detail.intake.data.insurance.phoneOnCard],
                      ["Carrier", detail.intake.data.insurance.secondaryCarrier],
                      ["Claim number", detail.intake.data.insurance.claimNumber],
                      ["Adjuster", detail.intake.data.insurance.adjuster],
                      ["Adjuster phone", detail.intake.data.insurance.adjusterPhone],
                      ["Employer / attorney", detail.intake.data.insurance.employerAttorney],
                      ["Injury date", detail.intake.data.insurance.injuryDate],
                    ]}
                  />
                  <AnswerGrid
                    title="Medical history and current concern"
                    items={[
                      ["Current problem", detail.intake.data.medical.currentProblem],
                      ["Symptoms began", detail.intake.data.medical.symptomsDate],
                      ["Pain level", detail.intake.data.medical.painLevel],
                      ["Height (feet)", detail.intake.data.medical.heightFeet],
                      ["Height (inches)", detail.intake.data.medical.heightInches],
                      ["Weight", detail.intake.data.medical.weight],
                      ["Medical history", detail.intake.data.medical.history],
                      ["Other history", detail.intake.data.medical.historyOther],
                      ["Medications", detail.intake.data.medical.medications],
                      ["Allergies", detail.intake.data.medical.allergies],
                    ]}
                  />
                  <AnswerGrid
                    title="Function, goals, skin, and safety"
                    items={[
                      ["Functional status", detail.intake.data.function.statuses],
                      ["Treatment goals", detail.intake.data.function.goals],
                      ["Skin / safety concerns", detail.intake.data.function.skinIssues],
                      ["Other skin concern", detail.intake.data.function.skinOther],
                    ]}
                  />
                  <AnswerGrid
                    title="Privacy and communication"
                    items={[
                      ["NPP choice", detail.intake.data.privacy.nppChoice],
                      ["Communication methods", detail.intake.data.privacy.communicationMethods],
                      ["Do not leave voicemail", detail.intake.data.privacy.doNotLeaveVoicemail],
                      [
                        "Authorized people",
                        detail.intake.data.privacy.authorizedPeople
                          ?.map((person: any) =>
                            [person.name, person.relationship, person.phone]
                              .filter(Boolean)
                              .join(" · "),
                          )
                          .join("; "),
                      ],
                      ["Benefits accepted", detail.intake.data.signature.benefitsAccepted],
                      ["Care policy accepted", detail.intake.data.signature.careAccepted],
                      ["Privacy accepted", detail.intake.data.signature.privacyAccepted],
                      ["Printed signer name", detail.intake.data.signature.printedName],
                      ["Signer relationship", detail.intake.data.signature.relationship],
                      ["Signature method", detail.intake.data.signature.signatureMode],
                    ]}
                  />
                </div>
              </details>
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
                      ["legalName", "Legal name"],
                      ["preferredName", "Preferred name"],
                      ["dateOfBirth", "Date of birth"],
                      ["sexAtBirth", "Sex at birth"],
                      ["mobilePhone", "Phone"],
                      ["homePhone", "Home phone"],
                      ["email", "Email"],
                      ["streetAddress", "Street address"],
                      ["city", "City"],
                      ["state", "State"],
                      ["zip", "ZIP"],
                      ["primaryLanguage", "Primary language"],
                      ["maritalStatus", "Marital status"],
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
                <label className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm font-semibold text-brand-ink">
                  <input
                    type="checkbox"
                    checked={amendment.interpreterNeeded}
                    onChange={(event) =>
                      setAmendment((current) => ({
                        ...current,
                        interpreterNeeded: event.target.checked,
                      }))
                    }
                    className="h-4 w-4 accent-brand-red"
                  />
                  Interpreter needed
                </label>
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
                          legalName: amendment.legalName,
                          preferredName: amendment.preferredName,
                          dateOfBirth: amendment.dateOfBirth,
                          sexAtBirth: amendment.sexAtBirth,
                          mobilePhone: amendment.mobilePhone,
                          homePhone: amendment.homePhone,
                          email: amendment.email,
                          streetAddress: amendment.streetAddress,
                          city: amendment.city,
                          state: amendment.state,
                          zip: amendment.zip,
                          primaryLanguage: amendment.primaryLanguage,
                          interpreterNeeded: amendment.interpreterNeeded,
                          maritalStatus: amendment.maritalStatus,
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
              {deleteConfirmation && (
                <section className="mt-6 rounded-2xl border border-brand-red/25 bg-red-50 p-5">
                  <h3 className="font-bold text-brand-red">
                    Permanently delete this patient?
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    This removes the patient profile, intake, signature,
                    consents, checklist, amendments, and audit history. Type
                    DELETE to confirm.
                  </p>
                  <input
                    value={
                      deleteConfirmation === "confirm"
                        ? ""
                        : deleteConfirmation
                    }
                    onChange={(event) =>
                      setDeleteConfirmation(event.target.value)
                    }
                    placeholder="Type DELETE"
                    className="mt-4 w-full max-w-xs rounded-xl border border-brand-red/25 bg-white px-4 py-3 text-sm"
                  />
                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={deletePatient}
                      disabled={saving || deleteConfirmation !== "DELETE"}
                      className="rounded-full bg-brand-red px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40"
                    >
                      Delete permanently
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmation("")}
                      className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600"
                    >
                      Cancel
                    </button>
                  </div>
                </section>
              )}
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
      {createOpen && (
        <div className="fixed inset-x-0 bottom-0 top-[72px] z-[70] flex items-start justify-center overflow-hidden bg-brand-ink/55 p-3 backdrop-blur-sm sm:p-4 lg:top-[108px]">
          <section className="max-h-[calc(100dvh-96px)] w-full max-w-4xl overflow-y-auto overscroll-contain rounded-3xl bg-white p-4 shadow-2xl sm:max-h-[calc(100dvh-104px)] sm:p-6 lg:max-h-[calc(100dvh-140px)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-brand-red">
                  New staff record
                </p>
                <h2 className="mt-2 text-2xl font-bold text-brand-ink">
                  Create patient
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  This creates an administrative patient record. It is clearly
                  labeled and is not presented as a patient-signed intake.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["legalName", "Legal name", "text"],
                  ["preferredName", "Preferred name", "text"],
                  ["dateOfBirth", "Date of birth", "date"],
                  ["mobilePhone", "Mobile phone", "tel"],
                  ["homePhone", "Home phone", "tel"],
                  ["email", "Email", "email"],
                  ["streetAddress", "Street address", "text"],
                  ["city", "City", "text"],
                  ["state", "State", "text"],
                  ["zip", "ZIP", "text"],
                  ["primaryLanguage", "Primary language", "text"],
                ] as const
              ).map(([key, label, type]) => (
                <label
                  key={key}
                  className="text-sm font-semibold text-brand-ink"
                >
                  {label}
                  <input
                    type={type}
                    value={manualPatient[key] as string}
                    onChange={(event) =>
                      setManualPatient((current) => ({
                        ...current,
                        [key]: event.target.value,
                      }))
                    }
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 font-normal outline-none focus:border-brand-red"
                  />
                </label>
              ))}
              <label className="text-sm font-semibold text-brand-ink">
                Sex at birth
                <select
                  value={manualPatient.sexAtBirth}
                  onChange={(event) =>
                    setManualPatient((current) => ({
                      ...current,
                      sexAtBirth: event.target.value,
                    }))
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 font-normal"
                >
                  <option value="prefer-not-to-answer">Prefer not to answer</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="intersex">Intersex</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label className="text-sm font-semibold text-brand-ink">
                Marital status
                <select
                  value={manualPatient.maritalStatus}
                  onChange={(event) =>
                    setManualPatient((current) => ({
                      ...current,
                      maritalStatus: event.target.value,
                    }))
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 font-normal"
                >
                  {[
                    "single",
                    "married",
                    "partnered",
                    "divorced",
                    "widowed",
                    "other",
                    "prefer-not-to-answer",
                  ].map((option) => (
                    <option key={option} value={option}>
                      {option.replaceAll("-", " ")}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 text-sm font-semibold text-brand-ink sm:col-span-2">
                <input
                  type="checkbox"
                  checked={manualPatient.interpreterNeeded}
                  onChange={(event) =>
                    setManualPatient((current) => ({
                      ...current,
                      interpreterNeeded: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 accent-brand-red"
                />
                Interpreter needed
              </label>
              <label className="text-sm font-semibold text-brand-ink sm:col-span-2">
                Current problem
                <textarea
                  value={manualPatient.currentProblem}
                  onChange={(event) =>
                    setManualPatient((current) => ({
                      ...current,
                      currentProblem: event.target.value,
                    }))
                  }
                  rows={2}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 font-normal"
                />
              </label>
              <label className="text-sm font-semibold text-brand-ink sm:col-span-2">
                Care goals
                <textarea
                  value={manualPatient.goals}
                  onChange={(event) =>
                    setManualPatient((current) => ({
                      ...current,
                      goals: event.target.value,
                    }))
                  }
                  rows={2}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 font-normal"
                />
              </label>
            </div>
            {message && (
              <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm font-semibold text-brand-red">
                {message}
              </p>
            )}
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={createPatient}
                disabled={
                  saving || !manualPatient.legalName.trim()
                }
                className="rounded-full bg-brand-red px-6 py-3 text-sm font-bold text-white disabled:opacity-40"
              >
                {saving ? "Creating…" : "Create patient"}
              </button>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="rounded-full border border-slate-200 px-6 py-3 text-sm font-bold text-slate-600"
              >
                Cancel
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
