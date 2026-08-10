import Link from "next/link";
import { MapPin, Phone, Mail, Clock, ArrowRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-brand-ink text-slate-300 pt-14 pb-10 lg:pt-20">
      <div className="hero-grid absolute inset-0 opacity-20" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mobile-footer lg:hidden">
          <div className="mobile-footer__top">
            <img
              src="/images/brand/genfinity-logo.webp"
              alt="Genfinity O&P"
              className="h-11 w-auto max-w-[190px] object-contain object-left brightness-0 invert"
            />
            <span>Tarzana, California</span>
          </div>
          <h2>Care that stays with you.</h2>
          <p>
            Personalized orthotic, prosthetic, and custom-insole care—with clear
            answers before and after fitting.
          </p>
          <div className="mobile-footer__contact">
            <a href="tel:8885526188">
              <Phone className="h-4 w-4" /> (888) 552-6188
            </a>
            <a href="mailto:support@genfinityoandp.com">
              <Mail className="h-4 w-4" /> Email our team
            </a>
          </div>
          <div className="mobile-footer__links">
            {[
              ["Services", "/services"],
              ["Our Process", "/the-process"],
              ["Insurance", "/insurance"],
              ["Resources", "/patient-resources"],
              ["About", "/about"],
              ["Contact", "/contact"],
            ].map(([item, href]) => (
              <Link href={href} key={href}>
                {item}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ))}
          </div>
          <div className="mobile-footer__address">
            <MapPin className="h-5 w-5" />
            <span>
              18401 Burbank Blvd, Suite 215
              <br />
              Tarzana, CA 91356
            </span>
          </div>
        </div>

        <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          {/* Brand & Intro */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <img
                src="/images/brand/genfinity-logo.webp"
                alt="Genfinity O&P"
                className="h-12 w-auto max-w-[200px] object-contain object-left brightness-0 invert"
              />
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              Personalized orthotic, prosthetic, and custom-insole care in
              Tarzana. Clear answers, careful fitting, and support that
              continues after delivery.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-heading font-semibold text-lg mb-6">
              Quick Links
            </h3>
            <ul className="space-y-4">
              {[
                ["Home", "/"],
                ["Services", "/services"],
                ["What to Expect", "/what-to-expect"],
                ["The Care Process", "/the-process"],
                ["Insurance & Billing", "/insurance"],
                ["Financial Assistance", "/financial-assistance"],
                ["Locations", "/locations"],
                ["About Us", "/about"],
                ["Patient Resources", "/patient-resources"],
                ["Careers", "/careers"],
                ["Contact", "/contact"],
              ].map(([item, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm hover:text-brand-red transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-brand-red transition-colors" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-heading font-semibold text-lg mb-6">
              Contact Us
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm">
                <MapPin className="w-5 h-5 text-brand-red shrink-0" />
                <span>
                  18401 Burbank Blvd, Suite 215
                  <br />
                  Tarzana, CA 91356
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Phone className="w-5 h-5 text-brand-red shrink-0" />
                <a
                  href="tel:8885526188"
                  className="hover:text-white transition-colors"
                >
                  (888) 552-6188
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Mail className="w-5 h-5 text-brand-red shrink-0" />
                <a
                  href="mailto:support@genfinityoandp.com"
                  className="hover:text-white transition-colors"
                >
                  support@genfinityoandp.com
                </a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="text-white font-heading font-semibold text-lg mb-6">
              Plan Your Visit
            </h3>
            <ul className="space-y-4">
              <li className="flex justify-between text-sm border-b border-slate-800 pb-2">
                <span className="text-slate-400">Monday - Friday</span>
                <span className="text-white">Call to schedule</span>
              </li>
              <li className="flex justify-between text-sm border-b border-slate-800 pb-2">
                <span className="text-slate-400">Saturday</span>
                <span className="text-white">By appointment</span>
              </li>
              <li className="flex justify-between text-sm">
                <span className="text-slate-400">Questions?</span>
                <a href="tel:8885526188" className="text-brand-red">
                  Call us directly
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-7 lg:pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Genfinity O&P. All rights
            reserved.
          </p>
          <div className="flex gap-4 text-xs text-slate-500">
            <Link
              href="/privacy"
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms &amp; Conditions
            </Link>
            <Link href="/faqs" className="hover:text-white transition-colors">
              FAQs
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
