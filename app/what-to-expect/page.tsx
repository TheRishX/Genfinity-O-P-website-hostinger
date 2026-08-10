import Link from "next/link";
import {
  ClipboardCheck,
  Ruler,
  Wrench,
  HeartHandshake,
  Phone,
} from "lucide-react";
const steps = [
  {
    icon: ClipboardCheck,
    title: "We start with your life—not the device",
    text: "We discuss what hurts, what feels difficult, what you have already tried, and what you want to get back to doing. Bring your prescription, insurance information, photo ID, and current device if you use one.",
  },
  {
    icon: Ruler,
    title: "We measure what matters",
    text: "Depending on your needs, your evaluation may include measurements, casting, scanning, pressure assessment, or observation of how you stand and walk.",
  },
  {
    icon: Wrench,
    title: "We fit, test, and adjust",
    text: "A device is not finished simply because it was fabricated. We check comfort, alignment, function, and how it works with your clothing, footwear, and routine.",
  },
  {
    icon: HeartHandshake,
    title: "We stay available after delivery",
    text: "Bodies change. Goals change. Devices need care. Follow-up visits give us the chance to review progress and make appropriate adjustments.",
  },
];
export default function WhatToExpect() {
  return (
    <div className="bg-white">
      <section className="bg-brand-blue-light py-20 text-center sm:py-28">
        <div className="mx-auto max-w-3xl px-4">
          <p className="text-sm font-bold uppercase tracking-[.2em] text-brand-red">
            Your visit, made clear
          </p>
          <h1 className="mt-4 text-4xl font-bold text-slate-900 sm:text-6xl">
            Know what comes next.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-slate-600">
            You should understand what is happening, why it is recommended, and
            what comes next. We explain the process in plain English and make
            room for every question.
          </p>
        </div>
      </section>
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-6 md:grid-cols-2">
            {steps.map(({ icon: Icon, title, text }, index) => (
              <article
                key={title}
                className="rounded-3xl border border-slate-200 p-8 shadow-sm"
              >
                <span className="text-sm font-bold text-brand-red">
                  0{index + 1}
                </span>
                <Icon className="my-5 w-9 h-9 text-brand-blue" />
                <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
                <p className="mt-3 leading-relaxed text-slate-600">{text}</p>
              </article>
            ))}
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-8">
              <h2 className="text-2xl font-bold text-slate-900">
                Custom fabricated or custom fitted?
              </h2>
              <p className="mt-4 leading-relaxed text-slate-600">
                Some orthoses are created from measurements, casts, or scans
                specifically for your body. Others begin as a prefabricated
                device and are selected and adjusted to your measurements. Your
                clinician will explain which approach is appropriate and why.
              </p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-8">
              <h2 className="text-2xl font-bold text-slate-900">
                A prescription may be required
              </h2>
              <p className="mt-4 leading-relaxed text-slate-600">
                Many custom devices and insurance plans require a prescription
                or medical documentation. Call before your visit and our team
                will help you understand what to bring.
              </p>
            </div>
          </div>
          <div className="mt-16 rounded-3xl bg-slate-950 p-8 text-white sm:p-12">
            <h2 className="text-3xl font-bold">Plain words are enough.</h2>
            <p className="mt-3 max-w-2xl text-slate-300">
              Tell us what is getting in the way. We will help translate the
              problem into a clear next step.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                href="tel:8885526188"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-red px-6 py-3 font-bold"
              >
                <Phone className="w-4 h-4" /> (888) 552-6188
              </a>
              <Link
                className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 font-bold"
                href="/the-process"
              >
                See the complete process
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
