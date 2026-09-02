import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
const orthoticsImage = "/images/genfinity/orthotic-clinical-care.avif";
const prostheticsImage = "/images/genfinity/prosthetic-hiking.avif";
const insolesImage = "/images/genfinity/orthotic-shoe-fitting.avif";

const content = {
  orthotics: {
    eyebrow: "Custom orthotic care",
    title: "Support that moves with you.",
    intro:
      "When pain, weakness, or poor alignment keeps interrupting your day, a generic brace is rarely enough. We evaluate how your body moves, then create or carefully fit an orthosis around your anatomy, condition, lifestyle, and goals.",
    includes: [
      "Foot orthoses, SMOs and ankle-foot orthoses (AFOs)",
      "Knee braces, KAFOs and complex lower-limb support",
      "Spinal and cervical orthoses",
      "Hand, wrist, elbow and shoulder orthoses",
      "Pediatric orthotic care",
      "Diabetic footwear and pressure-relieving devices",
    ],
    image: orthoticsImage,
  },
  prosthetics: {
    eyebrow: "Personalized prosthetic care",
    title: "Made for your life.",
    intro:
      "We shape the socket, alignment, and component plan around your residual limb, activity level, daily environment, and personal goals. Then we stay involved, because comfort and function are refined over time—not decided in one appointment.",
    includes: [
      "Below-knee and above-knee prostheses",
      "Partial-foot, toe-fill and preparatory prostheses",
      "Upper-extremity and body-powered solutions",
      "Myoelectric and microprocessor components",
      "Hydraulic knees and energy-storing feet",
      "Sports and activity-specific prostheses",
    ],
    image: prostheticsImage,
  },
  "custom-insoles": {
    eyebrow: "Custom foot orthotics",
    title: "Relief starts with your feet.",
    intro:
      "Foot pain can reach into work, exercise, sleep, and the simple plans you keep postponing. We assess your gait, pressure pattern, footwear, and symptoms to create support that addresses the cause—not just the sore spot.",
    includes: [
      "Custom insoles for flat feet and overpronation",
      "Plantar fasciitis and heel-pain support",
      "Diabetic and accommodative insoles",
      "Sports and work footwear solutions",
      "Gait and pressure assessment",
    ],
    image: insolesImage,
  },
} as const;

const serviceSeo = {
  orthotics: "/services/orthotics",
  prosthetics: "/services/prosthetics",
  "custom-insoles": "/services/custom-insoles",
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ service: string }>;
}): Promise<Metadata> {
  const { service } = await params;
  const path = serviceSeo[service as keyof typeof serviceSeo];
  if (!path) return {};
  const { pageMetadata } = await import("@/lib/seo");
  const metadata = pageMetadata(path);
  const title = content[service as keyof typeof content].eyebrow;
  return { ...metadata, title: { absolute: `${title} | Genfinity O&P` } };
}

export function generateStaticParams() {
  return Object.keys(content).map((service) => ({ service }));
}

export function ServiceDetailPage({
  service,
}: {
  service: keyof typeof content;
}) {
  const page = content[service];
  return (
    <div className="bg-white">
      <section className="relative isolate overflow-hidden bg-slate-950 py-20 sm:py-28">
        <img
          src={page.image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/20" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-5 text-sm font-bold uppercase tracking-[.2em] text-red-300">
            {page.eyebrow}
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            {page.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-200">
            {page.intro}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href="tel:8885526188"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-red px-7 py-3.5 font-bold text-white hover:bg-brand-red-dark"
            >
              <Phone className="w-5 h-5" /> Call (888) 552-6188
            </a>
            <Link
              href="/request-consultation"
              className="inline-flex items-center justify-center rounded-full border border-white/30 px-7 py-3.5 font-bold text-white hover:bg-white/10"
            >
              Request a consultation
            </Link>
          </div>
        </div>
      </section>
      <section className="py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.18em] text-brand-red">
              Personalized from the start
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
              Fit for real life.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-slate-600">
              We listen before we measure. We explain the options without
              burying you in jargon. When appropriate, we coordinate
              documentation with your referring provider and help verify
              insurance requirements. Fit, comfort, function, and your feedback
              guide every adjustment.
            </p>
            <div className="mt-7 flex flex-wrap gap-5">
              <Link
                href="/what-to-expect"
                className="inline-flex items-center gap-2 font-bold text-brand-blue hover:text-brand-red"
              >
                What to expect <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/the-process"
                className="inline-flex items-center gap-2 font-bold text-brand-blue hover:text-brand-red"
              >
                See the full process <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="rounded-3xl bg-slate-50 p-8 sm:p-10">
            <h3 className="text-xl font-bold text-slate-900">
              Care may include
            </h3>
            <ul className="mt-6 space-y-4">
              {page.includes.map((item) => (
                <li className="flex gap-3 text-slate-700" key={item}>
                  <CheckCircle2 className="mt-0.5 w-5 shrink-0 text-brand-red" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-7 text-sm leading-relaxed text-slate-500">
              Your clinician will recommend only what is appropriate after an
              individual evaluation.
            </p>
          </div>
        </div>
      </section>
      <section className="bg-brand-blue py-16">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-7 px-4 sm:px-6 md:flex-row md:items-center lg:px-8">
          <div className="flex gap-4">
            <ShieldCheck className="mt-1 w-7 shrink-0 text-red-200" />
            <div>
              <h2 className="text-2xl font-bold text-white">
                Let&apos;s find the right next step.
              </h2>
              <p className="mt-1 text-blue-100">
                Speak directly with the Genfinity O&amp;P team.
              </p>
            </div>
          </div>
          <a
            href="tel:8885526188"
            className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-bold text-brand-blue hover:bg-slate-100"
          >
            <Sparkles className="w-4 h-4" /> Call now
          </a>
        </div>
      </section>
    </div>
  );
}

export default async function ServiceDetail({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  const { service } = await params;
  if (!(service in content)) notFound();
  return <ServiceDetailPage service={service as keyof typeof content} />;
}
