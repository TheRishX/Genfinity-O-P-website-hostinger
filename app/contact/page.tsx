"use client";

import { FormEvent, useState } from "react";
import { motion } from "motion/react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ClipboardList,
  ArrowRight,
  Send,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form).entries())),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "We could not send your message.");
      form.reset();
      setSent(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We could not send your message. Please call us instead.");
    } finally {
      setSubmitting(false);
    }
  };

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

      {/* NEW PATIENT REGISTRATION — primary next step */}
      <section className="relative z-10 -mt-8 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-brand-ink px-6 py-8 text-white shadow-2xl shadow-slate-900/15 sm:px-9 lg:flex lg:items-center lg:justify-between lg:gap-10 lg:px-12"
        >
          <div className="pointer-events-none absolute inset-0 hero-grid opacity-[.08]" />
          <div className="relative flex max-w-3xl items-start gap-4 sm:gap-5">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-red shadow-lg shadow-black/20 sm:h-14 sm:w-14">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-red-300">New to Genfinity?</p>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Register before your first visit.</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
                Share your health, insurance, and care information securely at your own pace—so our team can prepare for you.
              </p>
            </div>
          </div>
          <Link
            href="/patient-intake"
            className="relative mt-6 inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-brand-red px-6 py-3.5 font-bold text-white shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-brand-red-dark lg:mt-0"
          >
            Register as a new patient <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </section>

      {/* MESSAGE FORM & CLINIC DETAILS */}
      <section id="contact-form" className="scroll-mt-28 py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Form — primary column */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="lg:col-span-7"
            >
              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-10">
                {sent ? (
                  <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                    <CheckCircle2 className="h-12 w-12 text-brand-red" />
                    <h2 className="mt-5 text-2xl font-bold text-brand-ink">Your message has been sent.</h2>
                    <p className="mt-3 max-w-md text-slate-600">A Genfinity team member will contact you soon. For immediate scheduling help, call (888) 552-6188.</p>
                  </div>
                ) : (
                  <form onSubmit={submit} className="space-y-5">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[.18em] text-brand-red">Questions or appointment help</p>
                      <h2 className="mt-2 text-3xl font-bold text-brand-ink">Send us a message.</h2>
                      <p className="mt-3 text-slate-600">Tell us what changed or how we can help. You do not need to know which device or service you need.</p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="text-sm font-semibold text-brand-ink">First name<input name="first" required autoComplete="given-name" maxLength={80} className="mt-2 w-full rounded-xl border border-slate-200 p-3 font-normal outline-none focus:border-brand-red" /></label>
                      <label className="text-sm font-semibold text-brand-ink">Last name<input name="last" required autoComplete="family-name" maxLength={80} className="mt-2 w-full rounded-xl border border-slate-200 p-3 font-normal outline-none focus:border-brand-red" /></label>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="text-sm font-semibold text-brand-ink">Phone number<input name="phone" required type="tel" autoComplete="tel" maxLength={40} className="mt-2 w-full rounded-xl border border-slate-200 p-3 font-normal outline-none focus:border-brand-red" /></label>
                      <label className="text-sm font-semibold text-brand-ink">Email<input name="email" required type="email" autoComplete="email" maxLength={254} className="mt-2 w-full rounded-xl border border-slate-200 p-3 font-normal outline-none focus:border-brand-red" /></label>
                    </div>
                    <label className="block text-sm font-semibold text-brand-ink">How can we help?<textarea name="message" required rows={5} maxLength={3000} placeholder="For example: foot pain, a brace that no longer fits, a prosthetic evaluation, or help with a referral." className="mt-2 w-full rounded-xl border border-slate-200 p-3 font-normal outline-none focus:border-brand-red" /></label>
                    <label className="flex items-start gap-3 text-sm leading-relaxed text-slate-600">
                      <input name="smsConsent" value="yes" type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-brand-red" />
                      <span>By checking this box, I consent to receive DELIVERY NOTIFICATIONS SMS from Genfinity O&amp;P LLC. Reply STOP to opt-out; Reply HELP for support; Message &amp; data rates may apply; Messaging frequency may vary. Visit <a className="font-semibold text-brand-red hover:underline" href="https://genfinityoandp.com/privacy">https://genfinityoandp.com/privacy</a> to see our privacy policy and <a className="font-semibold text-brand-red hover:underline" href="https://genfinityoandp.com/terms">https://genfinityoandp.com/terms</a> for our Terms of Service.</span>
                    </label>
                    <div className="absolute -left-[10000px]" aria-hidden="true"><label>Leave empty<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
                    <p className="text-xs leading-relaxed text-slate-500">Please do not send emergency concerns or highly sensitive medical information here. Call 911 for emergencies.</p>
                    {error && <p role="alert" className="text-sm font-semibold text-brand-red">{error} Call (888) 552-6188 for immediate help.</p>}
                    <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-full bg-brand-red px-6 py-3.5 font-bold text-white transition hover:bg-brand-red-dark disabled:cursor-wait disabled:opacity-60">
                      <Send className="h-4 w-4" /> {submitting ? "Sending…" : "Send my message"}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>

            {/* Clinic details — right column */}
            <motion.aside
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="space-y-7 lg:col-span-5"
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-brand-red">Prefer to speak with us?</p>
                <h2 className="mt-3 text-3xl font-bold text-brand-ink">We&apos;re here to help.</h2>
                <p className="mt-4 leading-relaxed text-slate-600">Call for the fastest help with scheduling, referrals, insurance questions, or a device that no longer feels right.</p>
              </div>
              <div className="space-y-6 rounded-3xl border border-slate-100 bg-slate-50 p-6 sm:p-7">
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

              <div className="p-6 bg-white rounded-2xl border border-slate-200">
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
            </motion.aside>
          </div>
        </div>
      </section>
    </div>
  );
}
