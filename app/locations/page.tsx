import { Clock, Mail, MapPin, Phone } from "lucide-react";
export default function Locations() {
  return (
    <div className="bg-white">
      <section className="bg-brand-blue-light py-20 text-center sm:py-28">
        <p className="text-sm font-bold uppercase tracking-[.2em] text-brand-red">
          Visit Genfinity O&amp;P
        </p>
        <h1 className="mt-4 text-4xl font-bold text-slate-900 sm:text-6xl">
          Expert O&amp;P care in Tarzana.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl px-4 text-lg leading-relaxed text-slate-600">
          A welcoming clinic where questions are encouraged, comfort is taken
          seriously, and your goals stay at the center of the plan.
        </p>
      </section>
      <section className="py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2">
          <div className="overflow-hidden rounded-3xl bg-slate-100">
            <iframe
              title="Genfinity O&P location"
              src="https://www.google.com/maps?q=18401+Burbank+Blvd+Suite+215+Tarzana+CA+91356&output=embed"
              className="h-[440px] w-full border-0"
              loading="lazy"
            />
          </div>
          <article className="rounded-3xl bg-slate-950 p-8 text-white sm:p-12">
            <p className="text-sm font-bold uppercase tracking-[.18em] text-red-300">
              Tarzana clinic
            </p>
            <h2 className="mt-3 text-3xl font-bold">Genfinity O&amp;P</h2>
            <p className="mt-4 leading-relaxed text-slate-300">
              Serving Tarzana and surrounding Los Angeles communities with
              custom orthotic, prosthetic, and foot-orthotic care.
            </p>
            <div className="mt-9 space-y-6 text-slate-300">
              <div className="flex gap-4">
                <MapPin className="w-5 shrink-0 text-red-300" />
                <span>
                  18401 Burbank Blvd, Suite 215
                  <br />
                  Tarzana, Los Angeles, CA 91356
                </span>
              </div>
              <div className="flex gap-4">
                <Phone className="w-5 shrink-0 text-red-300" />
                <a className="hover:text-white" href="tel:8885526188">
                  (888) 552-6188
                </a>
              </div>
              <div className="flex gap-4">
                <Mail className="w-5 shrink-0 text-red-300" />
                <a
                  className="hover:text-white"
                  href="mailto:support@genfinityoandp.com"
                >
                  support@genfinityoandp.com
                </a>
              </div>
              <div className="flex gap-4">
                <Clock className="w-5 shrink-0 text-red-300" />
                <span>
                  Monday–Friday: 10:00 am to 6:00 pm
                  <br />
                  Saturday–Sunday: By appointment
                </span>
              </div>
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href="https://maps.google.com/?q=18401+Burbank+Blvd+Suite+215+Tarzana+CA+91356"
                target="_blank"
                rel="noreferrer"
                className="inline-block rounded-full bg-brand-red px-6 py-3 font-bold"
              >
                Get directions
              </a>
              <a
                href="tel:8885526188"
                className="inline-block rounded-full border border-white/30 px-6 py-3 font-bold"
              >
                Call before your visit
              </a>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
