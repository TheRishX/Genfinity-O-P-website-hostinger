import Link from "next/link";
import {
  BadgeCheck,
  CircleDollarSign,
  FileCheck2,
  Phone,
  ShieldQuestion,
} from "lucide-react";

export default function InsurancePage() {
  return (
    <div className="bg-white">
      <section className="bg-slate-950 py-20 text-center text-white sm:py-28">
        <p className="text-sm font-bold uppercase tracking-[.2em] text-red-300">
          Insurance &amp; billing
        </p>
        <h1 className="mx-auto mt-4 max-w-4xl text-4xl font-bold sm:text-6xl">
          Coverage, made clearer.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
          Orthotic and prosthetic benefits vary by plan, diagnosis,
          prescription, and authorization. We help you understand the known
          requirements before delivery.
        </p>
      </section>
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              [
                FileCheck2,
                "We review the requirements",
                "Our team can check available benefits, documentation needs, referrals, and prior-authorization requirements.",
              ],
              [
                BadgeCheck,
                "We coordinate the paperwork",
                "When appropriate, we work with your referring provider and payer to support the medical documentation process.",
              ],
              [
                CircleDollarSign,
                "We discuss known costs",
                "Before moving forward, we explain the information available to us about deductibles, coinsurance, copays, or non-covered items.",
              ],
            ].map(([Icon, title, text]) => {
              const I = Icon as typeof FileCheck2;
              return (
                <article
                  className="rounded-3xl bg-slate-50 p-8"
                  key={title as string}
                >
                  <I className="w-8 h-8 text-brand-red" />
                  <h2 className="mt-6 text-xl font-bold text-slate-900">
                    {title as string}
                  </h2>
                  <p className="mt-3 leading-relaxed text-slate-600">
                    {text as string}
                  </p>
                </article>
              );
            })}
          </div>
          <div className="mt-14 grid gap-10 rounded-3xl border border-slate-200 p-8 lg:grid-cols-2 lg:p-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">
                What to have ready
              </h2>
              <ul className="mt-6 space-y-4 text-slate-600">
                <li>• Your current insurance card and photo ID</li>
                <li>• A prescription or referral, if already provided</li>
                <li>
                  • Your diagnosis and referring provider&apos;s contact
                  information
                </li>
                <li>• Any authorization or denial letters you have received</li>
                <li>
                  • Questions about deductibles, frequency limits, or network
                  status
                </li>
              </ul>
            </div>
            <div>
              <ShieldQuestion className="h-9 w-9 text-brand-red" />
              <h2 className="mt-5 text-3xl font-bold text-slate-900">
                Do you accept my plan?
              </h2>
              <p className="mt-4 leading-relaxed text-slate-600">
                The most accurate answer comes from checking your specific
                policy and the service being requested. Call us with your
                insurance information. We will tell you what we can verify and
                what may still require confirmation from your insurer.
              </p>
              <a
                href="tel:8885526188"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-red px-6 py-3.5 font-bold text-white"
              >
                <Phone className="w-5 h-5" /> Check your coverage
              </a>
            </div>
          </div>
          <div className="mt-10 rounded-3xl bg-brand-blue p-8 text-white sm:flex sm:items-center sm:justify-between sm:gap-8">
            <div>
              <h2 className="text-2xl font-bold">
                No insurance—or worried about cost?
              </h2>
              <p className="mt-2 text-white/75">
                Start with a conversation. We can explain the available
                information and point you toward practical next steps.
              </p>
            </div>
            <Link
              href="/financial-assistance"
              className="mt-6 inline-flex shrink-0 rounded-full border border-white/35 px-6 py-3 font-bold sm:mt-0"
            >
              Financial assistance information
            </Link>
          </div>
          <p className="mt-8 text-center text-sm leading-relaxed text-slate-500">
            Verification is not a guarantee of payment. Final coverage is
            determined by your insurance plan based on eligibility, medical
            necessity, authorization, and plan rules.
          </p>
        </div>
      </section>
    </div>
  );
}
