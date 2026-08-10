import Link from "next/link";
import {
  HandHeart,
  Phone,
  FileQuestion,
  MessageCircle,
  Route,
} from "lucide-react";

const options = [
  [
    FileQuestion,
    "Understand the real cost",
    "We can help separate what is known from what still needs to be confirmed by your insurer.",
  ],
  [
    MessageCircle,
    "Discuss the difficult part openly",
    "Tell us if cost is keeping you from moving forward. A clear conversation is better than silently walking away from care.",
  ],
  [
    Route,
    "Explore practical next steps",
    "Depending on the situation, there may be payment discussions, documentation options, community programs, or manufacturer resources worth exploring.",
  ],
];

export default function Assistance() {
  return (
    <div className="bg-white">
      <section className="bg-brand-blue-light py-20 text-center sm:py-28">
        <HandHeart className="mx-auto h-10 w-10 text-brand-red" />
        <p className="mt-5 text-sm font-bold uppercase tracking-[.2em] text-brand-red">
          Financial assistance
        </p>
        <h1 className="mx-auto mt-4 max-w-4xl text-4xl font-bold text-slate-900 sm:text-6xl">
          Cost should not end care.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
          We cannot promise that every device or expense will be covered. We can
          promise to speak plainly, listen without judgment, and help you
          understand the next reasonable step.
        </p>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {options.map(([Icon, title, text]) => {
            const I = Icon as typeof FileQuestion;
            return (
              <article
                key={title as string}
                className="rounded-3xl border border-slate-200 p-8"
              >
                <I className="h-8 w-8 text-brand-red" />
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
        <div className="mt-14 rounded-3xl bg-slate-950 p-8 text-white sm:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-3xl font-bold">
                Start with a private conversation.
              </h2>
              <p className="mt-3 max-w-3xl leading-relaxed text-slate-300">
                Have your insurance information, prescription, and any estimate
                or denial letter nearby if available. We will listen first and
                explain what we can responsibly do from there.
              </p>
              <p className="mt-4 text-sm text-slate-400">
                Programs, payment options, and eligibility vary. Financial
                assistance is not guaranteed.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <a
                href="tel:8885526188"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-red px-6 py-3.5 font-bold"
              >
                <Phone className="w-5 h-5" /> (888) 552-6188
              </a>
              <Link
                href="/request-consultation"
                className="rounded-full border border-white/30 px-6 py-3.5 text-center font-bold"
              >
                Send a care request
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
