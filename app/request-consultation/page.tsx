"use client";
import { FormEvent, useState } from "react";
import { Phone, Send } from "lucide-react";
export default function Consultation() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(data.entries())),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "We could not send your request.");
      }

      form.reset();
      setSent(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "We could not send your request. Please call us instead.",
      );
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="bg-slate-50 py-16 sm:py-24">
      <div className="mx-auto grid max-w-5xl gap-10 px-4 sm:px-6 lg:grid-cols-5">
        <section className="lg:col-span-2">
          <p className="text-sm font-bold uppercase tracking-[.2em] text-brand-red">
            Start here
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight text-slate-900">
            Start with what hurts.
          </h1>
          <p className="mt-6 leading-relaxed text-slate-600">
            You do not need to choose a device before contacting us. Tell us
            what hurts, what feels unstable, what has changed, or what you want
            to return to doing.
          </p>
          <p className="mt-4 leading-relaxed text-slate-600">
            A team member can help coordinate the appropriate appointment and
            explain what documentation may be useful. For the fastest response,
            call directly.
          </p>
          <a
            href="tel:8885526188"
            className="mt-7 inline-flex items-center gap-2 font-bold text-brand-red"
          >
            <Phone className="w-5 h-5" /> (888) 552-6188
          </a>
        </section>
        <section className="lg:col-span-3 rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-10">
          {sent ? (
            <div className="py-12 text-center">
              <h2 className="text-2xl font-bold text-slate-900">
                Your request has been sent.
              </h2>
              <p className="mt-3 text-slate-600">
                Thank you. A Genfinity team member will contact you soon. For
                immediate scheduling help, call (888) 552-6188.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <div>
                <p className="text-sm font-bold uppercase tracking-[.17em] text-brand-red">
                  No pressure. No obligation.
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                  Tell us what changed.
                </h2>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-semibold">
                  First name
                  <input
                    name="first"
                    required
                    autoComplete="given-name"
                    maxLength={80}
                    className="mt-2 w-full rounded-xl border border-slate-200 p-3 font-normal outline-none focus:border-brand-blue"
                  />
                </label>
                <label className="text-sm font-semibold">
                  Last name
                  <input
                    name="last"
                    required
                    autoComplete="family-name"
                    maxLength={80}
                    className="mt-2 w-full rounded-xl border border-slate-200 p-3 font-normal outline-none focus:border-brand-blue"
                  />
                </label>
              </div>
              <label className="block text-sm font-semibold">
                Best phone number
                <input
                  name="phone"
                  required
                  type="tel"
                  autoComplete="tel"
                  maxLength={40}
                  className="mt-2 w-full rounded-xl border border-slate-200 p-3 font-normal outline-none focus:border-brand-blue"
                />
              </label>
              <label className="block text-sm font-semibold">
                Email
                <input
                  name="email"
                  required
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                  className="mt-2 w-full rounded-xl border border-slate-200 p-3 font-normal outline-none focus:border-brand-blue"
                />
              </label>
              <label className="block text-sm font-semibold">
                What would you like help with?
                <textarea
                  name="message"
                  required
                  rows={5}
                  maxLength={3000}
                  placeholder="For example: heel pain after standing, brace no longer fitting, new prosthetic evaluation, or help understanding a referral."
                  className="mt-2 w-full rounded-xl border border-slate-200 p-3 font-normal outline-none focus:border-brand-blue"
                />
              </label>
              <div className="absolute -left-[10000px]" aria-hidden="true">
                <label>
                  Leave this field empty
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </label>
              </div>
              <p className="text-xs leading-relaxed text-slate-500">
                Please do not send emergency concerns or highly sensitive
                medical information by ordinary email. Call 911 for emergencies.
              </p>
              {error && (
                <p
                  role="alert"
                  className="text-sm font-semibold text-brand-red"
                >
                  {error} Call (888) 552-6188 for immediate help.
                </p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-full bg-brand-red px-6 py-3.5 font-bold text-white transition-opacity disabled:cursor-wait disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
                {submitting ? "Sending…" : "Send my request"}
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
