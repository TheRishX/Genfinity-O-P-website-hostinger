import {
  Mail,
  UsersRound,
  HeartHandshake,
  Lightbulb,
  ShieldCheck,
} from "lucide-react";

const values = [
  [
    HeartHandshake,
    "Patients before shortcuts",
    "We make room for questions and treat comfort, dignity, and communication as part of clinical quality.",
  ],
  [
    Lightbulb,
    "Curiosity with purpose",
    "We value people who keep learning and use new ideas to solve real patient problems.",
  ],
  [
    ShieldCheck,
    "Precision and accountability",
    "Measurements, documentation, fabrication, follow-up, and teamwork all deserve careful attention.",
  ],
];

export default function Careers() {
  return (
    <div className="bg-white">
      <section className="bg-slate-950 py-20 text-center text-white sm:py-28">
        <UsersRound className="mx-auto h-10 w-10 text-red-300" />
        <p className="mt-5 text-sm font-bold uppercase tracking-[.2em] text-red-300">
          Careers at Genfinity
        </p>
        <h1 className="mx-auto mt-4 max-w-4xl text-4xl font-bold sm:text-6xl">
          Build work that matters.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
          We are building a Tarzana O&amp;P practice around thoughtful care,
          strong clinical standards, and the belief that every role shapes the
          patient experience.
        </p>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {values.map(([Icon, title, text]) => {
            const I = Icon as typeof HeartHandshake;
            return (
              <article
                className="rounded-3xl border border-slate-200 p-8"
                key={title as string}
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
        <div className="mt-14 rounded-3xl bg-brand-blue-light p-8 sm:p-12">
          <h2 className="text-3xl font-bold text-slate-900">
            Grow with Genfinity.
          </h2>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-600">
            Current openings may change as the practice grows. We welcome
            thoughtful inquiries from experienced orthotic and prosthetic
            clinicians, technicians, administrative professionals, billing
            specialists, and students who care about respectful,
            patient-centered work.
          </p>
          <p className="mt-4 text-sm text-slate-500">
            Sending an inquiry does not guarantee an available position or
            interview. Please do not include private patient information.
          </p>
          <a
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-red px-6 py-3.5 font-bold text-white"
            href="mailto:support@genfinityoandp.com?subject=Career%20Inquiry%20-%20Genfinity%20O%26P"
          >
            <Mail className="w-5 h-5" /> Send a career inquiry
          </a>
        </div>
      </section>
    </div>
  );
}
