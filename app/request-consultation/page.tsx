"use client";
import { FormEvent, useState } from "react";
import { Phone, Send } from "lucide-react";
export default function Consultation() {
  const [sent, setSent] = useState(false);
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const body = [
      `Name: ${data.get("first")} ${data.get("last")}`,
      `Phone: ${data.get("phone")}`,
      `Email: ${data.get("email")}`,
      "",
      `Care request: ${data.get("message")}`,
    ].join("\n");
    window.location.href = `mailto:support@genfinityoandp.com?subject=${encodeURIComponent("Consultation Request")}&body=${encodeURIComponent(body)}`;
    setSent(true);
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
                Your email draft is ready.
              </h2>
              <p className="mt-3 text-slate-600">
                Review and send it from your email app so our team can respond.
                For immediate scheduling help, call (888) 552-6188.
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
                    className="mt-2 w-full rounded-xl border border-slate-200 p-3 font-normal outline-none focus:border-brand-blue"
                  />
                </label>
                <label className="text-sm font-semibold">
                  Last name
                  <input
                    name="last"
                    required
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
                  className="mt-2 w-full rounded-xl border border-slate-200 p-3 font-normal outline-none focus:border-brand-blue"
                />
              </label>
              <label className="block text-sm font-semibold">
                Email
                <input
                  name="email"
                  required
                  type="email"
                  className="mt-2 w-full rounded-xl border border-slate-200 p-3 font-normal outline-none focus:border-brand-blue"
                />
              </label>
              <label className="block text-sm font-semibold">
                What would you like help with?
                <textarea
                  name="message"
                  required
                  rows={5}
                  placeholder="For example: heel pain after standing, brace no longer fitting, new prosthetic evaluation, or help understanding a referral."
                  className="mt-2 w-full rounded-xl border border-slate-200 p-3 font-normal outline-none focus:border-brand-blue"
                />
              </label>
              <p className="text-xs leading-relaxed text-slate-500">
                Please do not send emergency concerns or highly sensitive
                medical information by ordinary email. Call 911 for emergencies.
              </p>
              <button className="inline-flex items-center gap-2 rounded-full bg-brand-red px-6 py-3.5 font-bold text-white">
                <Send className="w-4 h-4" /> Prepare my request
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
