import Link from "next/link";
import {
  ArrowRight,
  CircleDollarSign,
  ClipboardCheck,
  FileQuestion,
  HeartHandshake,
  Phone,
  ShieldCheck,
} from "lucide-react";

const resources = [
  {
    icon: ClipboardCheck,
    title: "What to expect",
    text: "How to prepare for your first visit and what happens during evaluation, measurement, fitting, and follow-up.",
    href: "/what-to-expect",
  },
  {
    icon: HeartHandshake,
    title: "The care process",
    text: "A clear, device-specific view of the path from referral through delivery and long-term support.",
    href: "/the-process",
  },
  {
    icon: ShieldCheck,
    title: "Insurance guidance",
    text: "What we can verify, what your insurer decides, and the information that helps the process move forward.",
    href: "/insurance",
  },
  {
    icon: CircleDollarSign,
    title: "Financial assistance",
    text: "A respectful place to start when cost or coverage uncertainty is keeping you from seeking care.",
    href: "/financial-assistance",
  },
  {
    icon: FileQuestion,
    title: "Frequently asked questions",
    text: "Plain-English answers about prescriptions, timelines, terminology, fit, insurance, and adjustments.",
    href: "/faqs",
  },
];

export default function PatientResourcesPage() {
  return (
    <div className="bg-white">
      <section className="bg-slate-50 py-20 text-center sm:py-28">
        <div className="mx-auto max-w-3xl px-4">
          <p className="text-sm font-bold uppercase tracking-[.2em] text-brand-red">
            Patient resources
          </p>
          <h1 className="mt-4 text-4xl font-bold text-slate-900 sm:text-6xl">
            Clear answers. Better decisions.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-slate-600">
            Good decisions begin with clear information. Use these resources to
            prepare, ask better questions, and understand the path ahead.
          </p>
        </div>
      </section>
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-6 md:grid-cols-2">
            {resources.map(({ icon: Icon, title, text, href }, index) => (
              <article
                key={title}
                className={`rounded-3xl border border-slate-200 p-8 ${index === 0 ? "md:col-span-2 md:grid md:grid-cols-[auto_1fr_auto] md:items-center md:gap-7" : ""}`}
              >
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-blue text-white">
                  <Icon className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="mt-6 text-2xl font-bold text-slate-900 md:mt-0">
                    {title}
                  </h2>
                  <p className="mt-3 leading-relaxed text-slate-600">{text}</p>
                </div>
                <Link
                  href={href}
                  className="mt-6 inline-flex items-center gap-2 font-bold text-brand-red md:mt-0"
                >
                  Read more <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
          <div className="mt-14 rounded-3xl bg-brand-blue p-8 text-white sm:p-12">
            <h2 className="text-3xl font-bold">Start with the problem.</h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-white/75">
              Start with the problem, not the product. Call and tell us what is
              affecting your comfort or movement. We will help you understand
              who to see and what to bring.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                href="tel:8885526188"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-red px-6 py-3.5 font-bold"
              >
                <Phone className="h-4 w-4" /> (888) 552-6188
              </a>
              <Link
                href="/request-consultation"
                className="inline-flex items-center justify-center rounded-full border border-white/35 px-6 py-3.5 font-bold"
              >
                Request a consultation
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
