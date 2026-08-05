import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, ArrowRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          {/* Brand & Intro */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-brand-red rounded-xl flex items-center justify-center text-white font-heading font-bold text-xl">
                G
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-xl leading-tight text-white">
                  Genfinity <span className="text-brand-red">O&P</span>
                </span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              Providing premium orthotics and prosthetics care in Tarzana, CA. 
              We are dedicated to helping our patients regain mobility, comfort, and confidence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-heading font-semibold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-4">
              {['Home', 'Services', 'About Us', 'Patient Resources', 'Contact'].map((item) => (
                <li key={item}>
                  <Link
                    href={item === 'Home' ? '/' : `/${item.toLowerCase().replace(/\s+/g, '-')}`}
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
            <h3 className="text-white font-heading font-semibold text-lg mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm">
                <MapPin className="w-5 h-5 text-brand-red shrink-0" />
                <span>
                  18401 Burbank Blvd, Suite 215<br />
                  Tarzana, CA 91356
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Phone className="w-5 h-5 text-brand-red shrink-0" />
                <a href="tel:8885526188" className="hover:text-white transition-colors">(888) 552-6188</a>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Phone className="w-5 h-5 text-slate-500 shrink-0" />
                <span>Fax: (323) 909-8512</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Mail className="w-5 h-5 text-brand-red shrink-0" />
                <a href="mailto:support@genfinityoandp.com" className="hover:text-white transition-colors">support@genfinityoandp.com</a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="text-white font-heading font-semibold text-lg mb-6">Hours of Operation</h3>
            <ul className="space-y-4">
              <li className="flex justify-between text-sm border-b border-slate-800 pb-2">
                <span className="text-slate-400">Monday - Friday</span>
                <span className="text-white">9:00 AM - 5:00 PM</span>
              </li>
              <li className="flex justify-between text-sm border-b border-slate-800 pb-2">
                <span className="text-slate-400">Saturday</span>
                <span className="text-white">By Appointment</span>
              </li>
              <li className="flex justify-between text-sm">
                <span className="text-slate-400">Sunday</span>
                <span className="text-brand-red">Closed</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Genfinity O&P. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-slate-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
