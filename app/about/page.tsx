"use client";

import { motion } from "motion/react";
import { Award, BadgeCheck, HeartHandshake, Microscope, Users } from "lucide-react";
import { SkeletonImage } from "@/components/SkeletonImage";
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
              <SkeletonImage
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

      {/* CARE TEAM */}
      <section className="relative overflow-hidden border-y border-slate-100 bg-slate-50 py-20 sm:py-24">
        <div className="pointer-events-none absolute inset-0 hero-grid opacity-[.035]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-red text-white shadow-lg shadow-brand-red/20">
              <Users className="h-6 w-6" />
            </div>
            <p className="mt-5 text-xs font-bold uppercase tracking-[.2em] text-brand-red">
              Meet your care team
            </p>
            <h2 className="mt-3 text-3xl font-bold text-brand-ink sm:text-4xl">
              Experience you can feel confident in.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Our clinicians bring 30 years of collective experience to thoughtful evaluations, precise fittings, and care shaped around your daily life.
            </p>
          </motion.div>

          <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2">
            {[
              {
                initials: "DB",
                name: "Deepak Kumar Bhardwaj",
                title: "Orthotist · Pedorthist · Orthotic Fitter",
                description:
                  "Focused on practical solutions, careful fitting, and helping every patient move with greater comfort and confidence.",
              },
              {
                initials: "BS",
                name: "Blake Jackson Sanders",
                title: "CPO · Certified Prosthetist Orthotist",
                description:
                  "Bringing certified prosthetic and orthotic expertise to patient-centered evaluation, device selection, and follow-up care.",
              },
            ].map((member, index) => (
              <motion.article
                key={member.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-brand-red/25 hover:shadow-xl hover:shadow-slate-200/60 sm:p-8"
              >
                <div className="absolute right-0 top-0 h-28 w-28 rounded-bl-full bg-brand-red/[.035] transition group-hover:bg-brand-red/[.065]" />
                <div className="relative flex items-start gap-5">
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-brand-ink text-lg font-bold tracking-wide text-white shadow-lg">
                    {member.initials}
                  </div>
                  <div className="min-w-0 pt-1">
                    <BadgeCheck className="mb-3 h-5 w-5 text-brand-red" />
                    <h3 className="text-xl font-bold leading-tight text-brand-ink sm:text-2xl">
                      {member.name}
                    </h3>
                    <p className="mt-2 font-semibold leading-relaxed text-brand-red">
                      {member.title}
                    </p>
                  </div>
                </div>
                <p className="relative mt-6 border-t border-slate-100 pt-5 leading-relaxed text-slate-600">
                  {member.description}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* CLINICAL LEADERSHIP */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-slate-100 shadow-2xl">
              <SkeletonImage
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
