import Link from "next/link";
import { Ear, HeartHandshake, Phone, Ruler, Sparkles } from "lucide-react";

const promises = [
  [
    Ear,
    "You should feel heard",
    "Your concerns, lifestyle, comfort, and goals deserve space in the clinical conversation.",
  ],
  [
    Ruler,
    "The fit should be personal",
    "A device should be measured, selected, fabricated, and adjusted for the person who will live in it.",
  ],
  [
    HeartHandshake,
    "Questions should be welcome",
    "You should understand the recommendation and feel comfortable speaking up when something does not feel right.",
  ],
  [
    Sparkles,
    "Progress should feel like yours",
    "Success may mean less pain, a steadier transfer, walking farther, returning to work, or simply feeling less self-conscious.",
  ],
];

export default function Testimonials() {
  return (
    <div className="bg-white">
      <section className="bg-slate-950 py-20 text-center text-white sm:py-28">
        <p className="text-sm font-bold uppercase tracking-[.2em] text-red-300">
          The experience we work to create
        </p>
        <h1 className="mx-auto mt-4 max-w-4xl text-4xl font-bold sm:text-6xl">
          You come before the device.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
          Genfinity O&amp;P is a growing Tarzana practice. As verified patient
          reviews become available, they can be shared here with permission. We
          will not publish invented testimonials.
        </p>
      </section>
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-6 md:grid-cols-2">
            {promises.map(([Icon, title, text]) => {
              const I = Icon as typeof Ear;
              return (
                <article
                  key={title as string}
                  className="rounded-3xl border border-slate-200 p-8"
                >
                  <I className="h-8 w-8 text-brand-red" />
                  <h2 className="mt-6 text-2xl font-bold text-slate-900">
                    {title as string}
                  </h2>
                  <p className="mt-3 leading-relaxed text-slate-600">
                    {text as string}
                  </p>
                </article>
              );
            })}
          </div>
          <div className="mx-auto mt-16 max-w-3xl rounded-3xl bg-brand-blue p-8 text-center text-white sm:p-12">
            <h2 className="text-3xl font-bold">Your next step starts here.</h2>
            <p className="mt-3 text-white/75">
              Tell us what you want to change. We will tell you honestly how we
              may be able to help.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href="tel:8885526188"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-red px-6 py-3 font-bold"
              >
                <Phone className="w-4 h-4" /> Call our team
              </a>
              <Link
                href="/request-consultation"
                className="inline-flex items-center justify-center rounded-full border border-white/40 px-6 py-3 font-bold"
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
