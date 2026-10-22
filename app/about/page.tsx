"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  Ear,
  HeartHandshake,
  Microscope,
  Phone,
  RefreshCcw,
  Ruler,
  ShieldCheck,
} from "lucide-react";
const consultationImage = "/images/genfinity/orthotic-clinical-care.avif";
const orthoticsImage = "/images/genfinity/prosthetic-community.avif";

export default function AboutPage() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* HEADER */}
      <section className="bg-slate-50 py-20 lg:py-28 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6"
          >
            About Genfinity O&P
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600 max-w-2xl mx-auto"
          >
            Clinical precision is only the beginning. The real goal is helping
            you feel like yourself again.
          </motion.p>
        </div>
      </section>

      {/* STORY & MISSION */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative rounded-3xl overflow-hidden shadow-2xl aspect-square bg-slate-100"
            >
              <Image
                src={consultationImage}
                alt="An orthotic specialist shaping a custom ankle-foot orthosis"
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-brand-blue font-semibold tracking-wide uppercase text-sm mb-3">
                Why Genfinity exists
              </h2>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                More than a diagnosis.
              </h3>
              <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
                <p>
                  People may notice a brace or prosthesis before they notice
                  you. We understand how frustrating, vulnerable, or exhausting
                  that can feel. Our role is to give you clear information,
                  thoughtful care, and a device that supports the person you
                  are—not a label on a chart.
                </p>
                <p>
                  In Tarzana, Genfinity O&amp;P brings together 30 years of
                  collective experience, precise assessment, in-house
                  fabrication capability, careful fitting, and long-term
                  follow-up. The process is personal because the outcome affects
                  your everyday life.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6 mt-10">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <HeartHandshake className="w-8 h-8 text-brand-red mb-4" />
                  <h4 className="font-bold text-slate-900 mb-2">Compassion</h4>
                  <p className="text-sm text-slate-600">
                    You deserve time to ask questions, express concerns, and
                    feel heard without being rushed.
                  </p>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <Microscope className="w-8 h-8 text-brand-blue mb-4" />
                  <h4 className="font-bold text-slate-900 mb-2">Innovation</h4>
                  <p className="text-sm text-slate-600">
                    Measurements, gait observations, materials, and component
                    choices are guided by real-life goals.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* HOW WE CARE */}
      <section className="relative overflow-hidden bg-brand-ink py-20 text-white sm:py-28">
        <div className="pointer-events-none absolute inset-0 hero-grid opacity-20" />
        <div className="pointer-events-none absolute -right-40 top-10 h-96 w-96 rounded-full bg-brand-red/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-brand-blue/30 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-end">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-xs font-bold uppercase tracking-[.2em] text-brand-red">
                How we care
              </p>
              <h2 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                Four promises behind every fitting.
              </h2>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg leading-relaxed text-white/65"
            >
              30 years of collective experience have taught us that a good
              device comes from good listening, careful work, and staying close
              after the first appointment. Here is what you can count on.
            </motion.p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Ear,
                title: "We listen first",
                text: "Your goals, your routine, and what has not worked before shape the plan before anything is measured.",
              },
              {
                icon: Ruler,
                title: "Made around you",
                text: "Precise assessment and in-house fabrication capability mean your device is built for your body, not pulled off a shelf.",
              },
              {
                icon: RefreshCcw,
                title: "Fit refined over time",
                text: "Comfort and function are adjusted through follow-up visits, guided by your feedback as your needs change.",
              },
              {
                icon: ShieldCheck,
                title: "Paperwork handled",
                text: "When appropriate, we coordinate with your referring provider and help you understand insurance requirements.",
              },
            ].map((item, index) => (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="group relative rounded-[1.75rem] border border-white/10 bg-white/[.06] p-7 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-brand-red/50 hover:bg-white/[.09]"
              >
                <span className="absolute right-6 top-6 text-sm font-bold tabular-nums text-white/25">
                  0{index + 1}
                </span>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-red text-white shadow-lg shadow-brand-red/30 transition group-hover:scale-105">
                  <item.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-6 text-xl font-bold text-white">{item.title}</h3>
                <p className="mt-3 leading-relaxed text-white/65">{item.text}</p>
              </motion.article>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 flex flex-col items-start justify-between gap-6 rounded-[1.75rem] border border-white/10 bg-white p-7 text-brand-ink sm:p-8 md:flex-row md:items-center"
          >
            <div>
              <h3 className="text-2xl font-bold">Not sure where to start?</h3>
              <p className="mt-1 text-slate-600">
                Tell us what is getting in the way. We will help you find the right next step.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                href="/request-consultation"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-red px-6 py-3.5 font-bold text-white transition hover:brightness-110"
              >
                Request a consultation <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="tel:8885526188"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 px-6 py-3.5 font-bold text-brand-ink transition hover:bg-slate-50"
              >
                <Phone className="h-4 w-4" /> (888) 552-6188
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CLINICAL LEADERSHIP */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-slate-100 shadow-2xl">
              <Image
                src={orthoticsImage}
                alt="A person with a prosthetic leg enjoying time outdoors with a loved one"
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-blue-light border border-brand-blue/20 text-brand-blue font-medium mb-6 w-fit">
                <Award className="w-5 h-5" />
                <span>BOC Certified Orthotist</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                Experience guided by empathy
              </h3>
              <p className="text-brand-blue font-semibold text-lg mb-8">
                Clinical leadership by Deepak Kumar Bhardwaj
              </p>

              <div className="space-y-6 text-slate-600 leading-relaxed text-lg">
                <p>
                  Deepak brings experienced clinical judgment to each
                  evaluation, fitting, and adjustment. That experience is used for one
                  purpose: solving the problem in front of the patient.
                </p>
                <p>
                  His approach combines biomechanics, careful listening, and
                  practical problem-solving. Whether the need is complex
                  bracing, foot pain relief, prosthetic mobility, or day-to-day
                  support, the conversation begins with what the patient wants
                  to do more comfortably and confidently.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
