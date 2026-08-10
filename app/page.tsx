"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  HeartPulse,
  Phone,
  ScanLine,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { SkeletonImage } from "@/components/SkeletonImage";
import { ServiceExploreCard } from "@/components/ServiceExploreCard";
import { MobileHome } from "@/components/MobileHome";
const heroImage = "/images/genfinity/hero-mobility.webp";
const orthoticsImage = "/images/genfinity/orthotic-clinical-care.avif";
const prostheticsCardImage = "/images/genfinity/prosthetic-lifestyle.avif";
const insolesImage = "/images/genfinity/orthotic-shoe-fitting.avif";

const carePaths = [
  {
    title: "Custom orthotics",
    text: "Support and alignment for the moments that make up your everyday life.",
    href: "/services/orthotics",
    image: orthoticsImage,
    treatments: [
      "Ankle-foot orthoses",
      "Spinal & cervical support",
      "Knee bracing",
      "Pediatric orthotic care",
    ],
  },
  {
    title: "Prosthetic care",
    text: "A better fit for comfort, confidence, and the life you want to live.",
    href: "/services/prosthetics",
    image: prostheticsCardImage,
    treatments: [
      "Below-knee prostheses",
      "Above-knee prostheses",
      "Partial-foot solutions",
      "Activity-specific components",
    ],
  },
  {
    title: "Custom insoles",
    text: "Personalized foot support for pain relief, balance, and better steps.",
    href: "/services/custom-insoles",
    image: insolesImage,
    treatments: [
      "Plantar fasciitis support",
      "Flat feet & overpronation",
      "Diabetic accommodative insoles",
      "Sports & work footwear",
    ],
  },
];

export default function Home() {
  return (
    <div className="overflow-hidden bg-white">
      <MobileHome />
      <div className="hidden lg:block">
        <section className="relative isolate bg-white pb-16 pt-10 sm:pb-24 lg:pb-32 lg:pt-20">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_20%,rgba(18,90,88,.13),transparent_27%),radial-gradient(circle_at_90%_78%,rgba(18,90,88,.08),transparent_24%)]" />
          <div className="hero-grid absolute inset-0 -z-10 opacity-70" />
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="min-w-0 max-w-xl"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-blue/15 bg-white px-3 py-1.5 text-sm font-semibold text-brand-blue shadow-sm">
                <HeartPulse className="h-4 w-4 text-brand-red" /> O&amp;P care
                in Tarzana
              </div>
              <h1 className="mt-6 text-4xl font-bold leading-[1.02] text-slate-950 sm:text-5xl lg:text-7xl">
                Move better.{" "}
                <span className="text-brand-blue">Live fully.</span>
              </h1>
              <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-slate-600">
                Pain, instability, limb loss, or a poor-fitting device can
                shrink your world. We help you regain comfort, confidence, and
                the freedom to do more.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="tel:8885526188"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-red px-7 py-3.5 font-bold text-white shadow-lg shadow-brand-red/20 transition hover:bg-brand-red-dark hover:-translate-y-0.5"
                >
                  <Phone className="w-5 h-5" /> Call for care
                </a>
                <Link
                  href="/request-consultation"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-blue/20 bg-white px-7 py-3.5 font-bold text-brand-blue transition hover:border-brand-blue hover:bg-brand-blue-light"
                >
                  Request a consultation <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="mt-9 grid gap-3 text-sm font-medium text-slate-600 sm:flex sm:flex-wrap sm:gap-x-6 sm:gap-y-3">
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-red" /> Personal
                  clinical evaluation
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-red" /> Ongoing
                  adjustments &amp; support
                </span>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="relative mx-auto min-w-0 w-full max-w-[620px]"
            >
              <div className="absolute -inset-4 -z-10 rounded-[2.5rem] border border-brand-blue/15 bg-white/50" />
              <div className="hero-orbit hero-orbit--one pointer-events-none absolute -left-7 -top-7 h-28 w-28 rounded-full border border-brand-red/40" />
              <div className="hero-orbit hero-orbit--two pointer-events-none absolute -bottom-8 -right-7 h-44 w-44 rounded-full border border-brand-blue/35" />
              <div className="relative aspect-[4/4.4] overflow-hidden rounded-[2rem] border border-white/70 bg-brand-blue shadow-2xl shadow-brand-blue/20">
                <SkeletonImage
                  src={heroImage}
                  alt="A patient with a prosthetic leg walking confidently with a clinician"
                  fill
                  priority
                  className="object-cover object-[82%_center] sm:object-right"
                />
                <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-brand-ink/10" />
              </div>
              <div className="absolute -left-6 top-12 z-10 hidden rounded-2xl border border-brand-blue/10 bg-white p-4 shadow-xl lg:block">
                <CalendarCheck className="w-6 text-brand-red" />
                <p className="mt-2 text-xs font-bold uppercase tracking-wider text-brand-blue">
                  A clear next step
                </p>
              </div>
              <div className="mt-4 rounded-2xl border border-brand-blue/10 bg-white p-4 shadow-lg sm:absolute sm:-bottom-8 sm:-left-10 sm:mt-0 sm:max-w-[265px]">
                <p className="text-xs font-bold uppercase tracking-[.16em] text-brand-red">
                  Care with purpose
                </p>
                <p className="mt-1 font-heading text-lg font-bold leading-snug text-brand-ink">
                  Built around your goals, not a generic device.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="relative border-y border-brand-blue/10 bg-white py-7 sm:py-9">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid divide-y divide-brand-blue/10 md:grid-cols-3 md:divide-x md:divide-y-0">
              {[
                [
                  "25+ years of experience",
                  "Experienced clinical judgment for complex and everyday mobility needs.",
                ],
                [
                  "Made around you",
                  "Measurements, materials, and components are selected for your body and goals.",
                ],
                [
                  "Support after delivery",
                  "Follow-up care helps your device keep working as your needs change.",
                ],
              ].map(([title, text], index) => (
                <div
                  key={title}
                  className="flex gap-4 py-6 md:px-7 md:first:pl-0 md:last:pr-0"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-blue text-sm font-bold text-white">
                    0{index + 1}
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {title}
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      {text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative bg-white py-20 sm:py-28">
          <div className="hero-grid absolute inset-0 opacity-35" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-xl">
                <p className="text-sm font-bold uppercase tracking-[.19em] text-brand-red">
                  Find your path forward
                </p>
                <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
                  Care built around you.
                </h2>
                <p className="mt-5 text-lg leading-relaxed text-slate-600">
                  Less pain. Steadier steps. A device that finally feels right.
                  We start with the change you want most.
                </p>
              </div>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 font-bold text-brand-blue"
              >
                View all services <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {carePaths.map((path, index) => (
                <ServiceExploreCard
                  key={path.title}
                  index={index}
                  title={path.title}
                  description={path.text}
                  href={path.href}
                  image={path.image}
                  treatments={path.treatments}
                  icon={
                    index === 0 ? (
                      <ScanLine className="w-6" />
                    ) : index === 1 ? (
                      <Sparkles className="w-6" />
                    ) : (
                      <HeartPulse className="w-6" />
                    )
                  }
                />
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-slate-950 py-20 text-white sm:py-28">
          <div className="hero-grid absolute inset-0 opacity-30 [mask-image:radial-gradient(circle_at_70%_50%,black,transparent_62%)]" />
          <div className="absolute -right-20 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full border border-brand-blue/50" />
          <div className="absolute -right-5 top-1/2 h-52 w-52 -translate-y-1/2 rounded-full border border-brand-red/40" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_.9fr] lg:px-8">
            <div>
              <p className="text-sm font-bold uppercase tracking-[.19em] text-red-300">
                A better care experience
              </p>
              <h2 className="mt-4 max-w-lg text-3xl font-bold leading-tight sm:text-5xl">
                Clear care. Real support.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
                From the first question through every fitting and adjustment,
                you will know what comes next—and why it matters.
              </p>
              <Link
                href="/what-to-expect"
                className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 font-bold text-white transition hover:bg-white hover:text-brand-blue"
              >
                See what to expect <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="relative grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/[.07] p-7 backdrop-blur-sm">
                <ShieldCheck className="w-8 text-red-300" />
                <h3 className="mt-6 text-xl font-bold">Comfort is clinical</h3>
                <p className="mt-3 leading-relaxed text-slate-300">
                  Fit, function, and your feedback inform every adjustment.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[.07] p-7 backdrop-blur-sm sm:translate-y-8">
                <HeartPulse className="w-8 text-red-300" />
                <h3 className="mt-6 text-xl font-bold">Your goals lead</h3>
                <p className="mt-3 leading-relaxed text-slate-300">
                  Walk the dog. Work the shift. Feel steady. It all counts.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-brand-blue py-20 text-center text-white">
          <div className="hero-grid absolute inset-0 opacity-20" />
          <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />
          <div className="relative mx-auto max-w-3xl px-4 sm:px-6">
            <p className="text-sm font-bold uppercase tracking-[.19em] text-red-200">
              Start with a conversation
            </p>
            <h2 className="mt-4 text-3xl font-bold sm:text-5xl">
              Take your next step.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-blue-100">
              You deserve care that listens, understands, and helps you move
              forward with confidence.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href="tel:8885526188"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-red px-7 py-3.5 font-bold text-white shadow-xl shadow-slate-950/20 transition hover:bg-brand-red-dark hover:-translate-y-0.5"
              >
                <Phone className="w-5 h-5" /> (888) 552-6188
              </a>
              <Link
                href="/request-consultation"
                className="inline-flex items-center justify-center rounded-full border border-white/40 px-7 py-3.5 font-bold transition hover:bg-white hover:text-brand-blue"
              >
                Request a consultation
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
