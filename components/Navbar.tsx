"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, Menu, X, ChevronDown, MapPin, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
  { name: "About Us", href: "/about" },
  { name: "Patient Resources", href: "/patient-resources" },
  { name: "Contact", href: "/contact" },
];

const CARE_LINKS = [
  { name: "Custom Orthotics", href: "/services/orthotics" },
  { name: "Prosthetic Care", href: "/services/prosthetics" },
  { name: "Custom Foot Orthotics", href: "/services/custom-insoles" },
  { name: "The Care Process", href: "/the-process" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setTimeout(() => setMobileMenuOpen(false), 0);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-slate-100"
          : "bg-white border-transparent"
      }`}
    >
      <div className="hidden lg:block bg-brand-blue text-white py-2 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="location-pin">
              <MapPin className="relative z-10 w-4 h-4" />
            </span>{" "}
            Tarzana, Los Angeles · Patient-first care
          </span>
          <a
            className="call-shine relative overflow-hidden rounded-full px-3 py-1 font-semibold hover:text-white/80"
            href="tel:8885526188"
          >
            Call now: (888) 552-6188
          </a>
        </div>
      </div>
      <div className="hidden lg:block max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <img
              src="/images/brand/genfinity-logo.webp"
              alt="Genfinity O&P"
              className="h-11 w-auto max-w-[190px] object-contain object-left"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-7">
            <ul className="flex items-center gap-8">
              {NAV_LINKS.slice(0, 1).map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={`text-sm font-medium transition-colors hover:text-brand-red ${
                      pathname === link.href
                        ? "text-brand-red font-semibold"
                        : "text-slate-600"
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              <li className="relative group">
                <button className="flex items-center gap-1 text-sm font-medium text-slate-600 group-hover:text-brand-red transition-colors">
                  Care & Services <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <div className="absolute left-0 top-full pt-4 hidden group-hover:block">
                  <div className="w-72 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl shadow-slate-900/10">
                    {CARE_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-brand-blue-light hover:text-brand-blue"
                      >
                        {link.name}
                      </Link>
                    ))}
                    <Link
                      href="/services"
                      className="block rounded-xl px-4 py-3 text-sm font-semibold text-brand-red hover:bg-red-50"
                    >
                      View all services →
                    </Link>
                  </div>
                </div>
              </li>
              {NAV_LINKS.slice(2).map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={`text-sm font-medium transition-colors hover:text-brand-red ${pathname === link.href ? "text-brand-red font-semibold" : "text-slate-600"}`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-4 border-l border-slate-200 pl-8">
              <a
                href="tel:8885526188"
                className="hidden xl:flex items-center gap-2 text-sm font-semibold text-brand-blue hover:text-brand-blue-dark transition-colors"
              >
                <Phone className="w-4 h-4" />
                (888) 552-6188
              </a>
              <Link
                href="/contact"
                className="bg-brand-red hover:bg-brand-red-dark text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-all shadow-md shadow-brand-red/20 hover:shadow-lg hover:-translate-y-0.5"
              >
                Book Appointment
              </Link>
            </div>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 -mr-2 text-slate-600 hover:text-brand-red transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Purpose-built mobile navigation */}
      <div className="mobile-nav lg:hidden">
        <Link
          href="/"
          className="mobile-nav__brand"
          aria-label="Genfinity O&P home"
        >
          <img
            src="/images/brand/genfinity-logo.webp"
            alt="Genfinity O&P"
            className="h-10 w-auto max-w-[168px] object-contain object-left"
          />
        </Link>
        <div className="mobile-nav__actions">
          <a
            href="tel:8885526188"
            className="mobile-nav__call"
            aria-label="Call Genfinity O&P"
          >
            <Phone className="h-4 w-4" />
          </a>
          <button
            className="mobile-nav__toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.button
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="mobile-menu__backdrop lg:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              className="mobile-menu lg:hidden"
            >
              <div className="mobile-menu__heading">
                <span>Explore Genfinity</span>
                <strong>How can we help?</strong>
              </div>
              <nav aria-label="Mobile navigation">
                <ul className="mobile-menu__primary">
                  {NAV_LINKS.map((link, index) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className={pathname === link.href ? "is-active" : ""}
                      >
                        <span>0{index + 1}</span>
                        {link.name}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </li>
                  ))}
                </ul>
                <p className="mobile-menu__label">Care &amp; services</p>
                <div className="mobile-menu__care">
                  {CARE_LINKS.map((link) => (
                    <Link href={link.href} key={link.href}>
                      {link.name}
                    </Link>
                  ))}
                  <Link href="/what-to-expect">What to Expect</Link>
                  <Link href="/insurance">Insurance &amp; Billing</Link>
                </div>
              </nav>
              <div className="mobile-menu__contact">
                <a href="tel:8885526188">
                  <Phone className="h-4 w-4" /> (888) 552-6188
                </a>
                <Link href="/contact">Book Appointment</Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
