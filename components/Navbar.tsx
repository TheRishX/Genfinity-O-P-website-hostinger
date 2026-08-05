'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'Services', href: '/services' },
  { name: 'About Us', href: '/about' },
  { name: 'Patient Resources', href: '/patient-resources' },
  { name: 'Contact', href: '/contact' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setTimeout(() => setMobileMenuOpen(false), 0);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-slate-100 py-3' : 'bg-white border-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-brand-red rounded-xl flex items-center justify-center text-white font-heading font-bold text-xl group-hover:bg-brand-red-dark transition-colors">
              G
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-xl leading-tight text-slate-900">
                Genfinity <span className="text-brand-red">O&P</span>
              </span>
              <span className="text-xs text-slate-500 font-medium tracking-wide uppercase">
                Orthotics & Prosthetics
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            <ul className="flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={`text-sm font-medium transition-colors hover:text-brand-red ${
                      pathname === link.href ? 'text-brand-red font-semibold' : 'text-slate-600'
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-4 border-l border-slate-200 pl-8">
              <a href="tel:8885526188" className="hidden xl:flex items-center gap-2 text-sm font-semibold text-brand-blue hover:text-brand-blue-dark transition-colors">
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
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="lg:hidden border-t border-slate-100 bg-white overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              <ul className="flex flex-col gap-4">
                {NAV_LINKS.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className={`block text-lg font-medium transition-colors ${
                        pathname === link.href ? 'text-brand-red' : 'text-slate-700'
                      }`}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">
                <a
                  href="tel:8885526188"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-brand-blue-light text-brand-blue font-semibold"
                >
                  <Phone className="w-5 h-5" />
                  (888) 552-6188
                </a>
                <Link
                  href="/contact"
                  className="flex items-center justify-center w-full py-3 rounded-xl bg-brand-red text-white font-semibold"
                >
                  Book an Appointment
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
