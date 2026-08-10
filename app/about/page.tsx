"use client";

import { motion } from "motion/react";
import { Award, HeartHandshake, Microscope } from "lucide-react";
import { SkeletonImage } from "@/components/SkeletonImage";
const consultationImage = "/images/stock/orthosis-fabrication.webp";
const orthoticsImage = "/images/services/orthotics-fitting.webp";

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
                  In Tarzana, Genfinity O&amp;P brings together more than 25
                  years of clinical experience, precise assessment, in-house
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

      {/* CLINICAL LEADERSHIP */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
            <div className="grid lg:grid-cols-5">
              <div className="lg:col-span-2 relative aspect-square lg:aspect-auto">
                <SkeletonImage
                  src={orthoticsImage}
                  alt="A clinician carefully fitting a custom ankle-foot orthosis"
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="lg:col-span-3 p-10 lg:p-16 flex flex-col justify-center">
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
                    With more than 25 years in orthotics and prosthetics, Deepak
                    brings experienced clinical judgment to each evaluation,
                    fitting, and adjustment. That experience is used for one
                    purpose: solving the problem in front of the patient.
                  </p>
                  <p>
                    His approach combines biomechanics, careful listening, and
                    practical problem-solving. Whether the need is complex
                    bracing, foot pain relief, prosthetic mobility, or
                    day-to-day support, the conversation begins with what the
                    patient wants to do more comfortably and confidently.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
