import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Phone } from "lucide-react";

const paths = [
  {
    title: "Prosthetic care",
    steps: [
      "Referral and initial conversation",
      "Clinical evaluation, measurements, and casting or scanning",
      "Insurance documentation and component planning",
      "Diagnostic or preparatory fitting when appropriate",
      "Final alignment, delivery, education, and follow-up",
    ],
  },
  {
    title: "Custom-fabricated orthotics",
    steps: [
      "Referral and evaluation",
      "Measurements, casting, scanning, or gait assessment",
      "Device design and fabrication",
      "Fitting, comfort and function checks",
      "Delivery instructions and follow-up adjustments",
    ],
  },
  {
    title: "Custom-fit orthotics",
    steps: [
      "Evaluation of your body, symptoms, and goals",
      "Precise measurements and device selection",
      "Coverage verification or authorization when required",
      "Fitting and individualized adjustment",
      "Use, care guidance, and follow-up",
    ],
  },
];

export default function ProcessPage() {
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-brand-ink py-20 text-white sm:py-28">
        <div className="hero-grid absolute inset-0 opacity-20" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[.82fr_1.18fr] lg:gap-14">
          <div className="text-center lg:text-left">
            <p className="text-sm font-bold uppercase tracking-[.2em] text-brand-red">
              The Genfinity process
            </p>
            <h1 className="mt-4 text-4xl font-bold sm:text-6xl">
              Your path, made clear.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
              Timelines vary by device, clinical need, documentation, and
              insurance approval. What should never vary is knowing where you
              are in the process and what happens next.
            </p>
          </div>
          <div className="relative mx-auto w-full max-w-2xl">
            <div className="absolute -inset-3 rounded-[2rem] border border-white/10" />
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.6rem] border border-white/15 bg-brand-blue shadow-2xl shadow-black/30">
              <Image
                src="/images/genfinity/process-orthotic-fitting.avif"
                alt="A clinician carefully fitting a custom knee orthosis for a patient"
                fill
                priority
                sizes="(max-width: 1023px) 92vw, 55vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/15 bg-brand-ink/70 p-4 backdrop-blur-md sm:bottom-5 sm:left-5 sm:right-auto sm:max-w-xs">
                <p className="text-xs font-bold uppercase tracking-[.17em] text-red-300">
                  Hands-on from day one
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  Evaluation, fitting, and follow-up centered on you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {paths.map((path) => (
              <article
                key={path.title}
                className="rounded-3xl border border-brand-blue/10 p-7 shadow-sm sm:p-8"
              >
                <h2 className="text-2xl font-bold text-brand-ink">
                  {path.title}
                </h2>
                <ol className="mt-7 space-y-5">
                  {path.steps.map((step, index) => (
                    <li key={step} className="flex gap-3 text-slate-600">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-blue text-xs font-bold text-white">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
          <div className="mt-14 grid gap-8 rounded-3xl bg-brand-blue p-8 text-white lg:grid-cols-[1fr_auto] lg:items-center lg:p-12">
            <div>
              <h2 className="text-3xl font-bold">
                Always know what&apos;s next.
              </h2>
              <p className="mt-3 max-w-3xl text-white/75">
                We tell you what we need, what we are working on, and when to
                expect the next update. If your body or comfort changes, call
                us—adjustment is part of good care.
              </p>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-red" />{" "}
                  Plain-English explanations
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-red" /> Insurance
                  coordination
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-red" /> Long-term
                  follow-up
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <a
                href="tel:8885526188"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-red px-6 py-3.5 font-bold"
              >
                <Phone className="h-4 w-4" /> Call our team
              </a>
              <Link
                href="/request-consultation"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-6 py-3.5 font-bold"
              >
                Start here <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
