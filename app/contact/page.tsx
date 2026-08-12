"use client";

import { motion } from "motion/react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ClipboardList,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
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
            Tell us what changed.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600 max-w-2xl mx-auto"
          >
            You do not need to know which device you need. Tell us what hurts,
            what feels unstable, or what you want to do more confidently. We
            will help you find the right next step.
          </motion.p>
        </div>
      </section>

      {/* CONTACT INFO & FORM */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Info Column */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="lg:col-span-5 space-y-8"
            >
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-6">
                  Let&apos;s make this simpler.
                </h2>
                <p className="text-slate-600 mb-8 leading-relaxed">
                  Call for the fastest help with scheduling, referrals,
                  insurance questions, or an existing device that no longer
                  feels right.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-brand-blue-light text-brand-blue rounded-xl flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">
                      Call Genfinity
                    </h4>
                    <a
                      href="tel:8885526188"
                      className="text-brand-blue font-medium hover:underline block mt-1"
                    >
                      (888) 552-6188
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-brand-blue-light text-brand-blue rounded-xl flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">
                      Our Clinic
                    </h4>
                    <p className="text-slate-600 mt-1">
                      18401 Burbank Blvd, Suite 215
                      <br />
                      Tarzana, CA 91356
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-brand-blue-light text-brand-blue rounded-xl flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">Email</h4>
                    <a
                      href="mailto:support@genfinityoandp.com"
                      className="text-slate-600 hover:text-brand-blue transition-colors mt-1 block"
                    >
                      support@genfinityoandp.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 mt-10">
                <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-brand-red" />
                  Business Hours
                </h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex justify-between">
                    <span>Monday–Friday</span>
                    <span className="font-medium">10:00 am to 6:00 pm</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Saturday–Sunday</span>
                    <span className="font-medium">By appointment</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Form Column */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-7"
            >
              <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-12 h-full flex flex-col justify-center">
                <p className="text-sm font-bold tracking-[.18em] uppercase text-brand-red mb-4">
                  Appointments &amp; questions
                </p>
                <h3 className="text-3xl font-bold text-slate-900 mb-4">
                  Answers start here.
                </h3>
                <p className="text-slate-600 leading-relaxed mb-8">
                  Our team can help you understand whether you may need a
                  referral, what records to bring, and which type of appointment
                  makes sense. If you prefer to write, the consultation form
                  sends your request directly to our team.
                </p>
                <a
                  href="tel:8885526188"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-red px-6 py-3.5 text-white font-bold mb-4"
                >
                  <Phone className="w-5 h-5" /> Call (888) 552-6188
                </a>
                <Link
                  href="/request-consultation"
                  className="inline-flex items-center justify-center rounded-full border border-brand-blue px-6 py-3.5 text-brand-blue font-bold hover:bg-brand-blue-light"
                >
                  Request a consultation online
                </Link>

                <div className="relative mt-8 overflow-hidden rounded-2xl border border-brand-red/15 bg-brand-red/[0.045] p-5 sm:p-6">
                  <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full border border-brand-red/10" />
                  <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-red text-white shadow-md shadow-brand-red/15">
                        <ClipboardList className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[.16em] text-brand-red">
                          New patient
                        </p>
                        <h4 className="mt-1 text-lg font-bold text-brand-ink">
                          Save time before your first visit.
                        </h4>
                        <p className="mt-1 max-w-md text-sm leading-relaxed text-slate-600">
                          Complete your guided intake online at your own pace.
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/patient-intake"
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-brand-red px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-red/15 transition hover:-translate-y-0.5 hover:bg-brand-red-dark"
                    >
                      Start intake <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
