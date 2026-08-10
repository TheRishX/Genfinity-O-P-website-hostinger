"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowDown,
  ArrowRight,
  Check,
  HeartPulse,
  MapPin,
  Phone,
  ScanLine,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { SkeletonImage } from "@/components/SkeletonImage";

const services = [
  {
    number: "01",
    title: "Custom orthotics",
    promise: "Feel supported—not restricted.",
    description:
      "Support shaped around your body, your movement, and the life you want to keep living.",
    image: "/images/genfinity/orthotic-clinical-care.avif",
    href: "/services/orthotics",
    icon: ScanLine,
    options: ["Ankle-foot orthoses", "Knee & spinal support", "Pediatric care"],
  },
  {
    number: "02",
    title: "Prosthetic care",
    promise: "Built for where life takes you.",
    description:
      "A personal path toward a comfortable fit, confident movement, and more freedom in your day.",
    image: "/images/genfinity/prosthetic-lifestyle.avif",
    href: "/services/prosthetics",
    icon: Sparkles,
    options: [
      "Below-knee solutions",
      "Above-knee solutions",
      "Activity-specific care",
    ],
  },
  {
    number: "03",
    title: "Custom insoles",
    promise: "Give every step better support.",
    description:
      "Personalized foot support designed to ease pressure, improve balance, and keep you moving.",
    image: "/images/genfinity/orthotic-shoe-fitting.avif",
    href: "/services/custom-insoles",
    icon: HeartPulse,
    options: ["Heel-pain support", "Flat-foot support", "Diabetic insoles"],
  },
];

const trustPoints = [
  ["25+", "years of experience"],
  ["01:01", "personal evaluation"],
  ["Always", "support after fitting"],
];

export function MobileHome() {
  const reduceMotion = useReducedMotion();
  const reveal = {
    initial: { opacity: 0, y: reduceMotion ? 0 : 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.55 },
  };

  return (
    <div className="mobile-home lg:hidden">
      <section className="mobile-home__hero">
        <div className="mobile-home__grid" aria-hidden="true" />
        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <div className="mobile-home__eyebrow">
            <span className="mobile-home__eyebrow-icon">
              <HeartPulse className="h-4 w-4" />
            </span>
            Orthotics &amp; prosthetics · Tarzana
          </div>
          <h1 className="mobile-home__title">
            Move better.
            <span>Live fully.</span>
          </h1>
          <p className="mobile-home__intro">
            Personalized care that helps you feel more comfortable, capable, and
            confident in motion.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.12 }}
          className="mobile-home__visual"
        >
          <div className="mobile-home__visual-ring" aria-hidden="true" />
          <div className="mobile-home__image-wrap">
            <SkeletonImage
              src="/images/genfinity/hero-mobility.webp"
              alt="A man with a prosthetic leg walking confidently beside a loved one"
              fill
              priority
              className="object-cover object-[62%_center]"
            />
            <div className="mobile-home__image-shade" />
            <div className="mobile-home__image-copy">
              <span>Care with purpose</span>
              <strong>Built around your goals.</strong>
            </div>
          </div>
          <div className="mobile-home__location">
            <span className="mobile-home__location-pulse">
              <MapPin className="h-4 w-4" />
            </span>
            Tarzana, Los Angeles
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mobile-home__actions"
        >
          <a href="tel:8885526188" className="mobile-home__primary">
            <Phone className="h-5 w-5" /> Call for care
          </a>
          <Link href="/request-consultation" className="mobile-home__secondary">
            Request consultation <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <a className="mobile-home__scroll-cue" href="#mobile-care">
          Explore your care options <ArrowDown className="h-4 w-4" />
        </a>
      </section>

      <section
        aria-label="Why patients choose Genfinity"
        className="mobile-trust"
      >
        <div className="mobile-trust__track">
          {trustPoints.map(([value, label], index) => (
            <div className="mobile-trust__item" key={label}>
              <span>0{index + 1}</span>
              <strong>{value}</strong>
              <small>{label}</small>
            </div>
          ))}
        </div>
      </section>

      <section id="mobile-care" className="mobile-care">
        <motion.div {...reveal} className="mobile-section-heading">
          <p>Your care. Your way forward.</p>
          <h2>Find what feels right.</h2>
          <span>Start with the outcome you want—not the name of a device.</span>
        </motion.div>

        <div className="mobile-care__cards">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.article
                {...reveal}
                transition={{ duration: 0.55, delay: index * 0.06 }}
                whileTap={reduceMotion ? undefined : { scale: 0.985 }}
                className="mobile-service"
                key={service.title}
              >
                <div className="mobile-service__image" key="image">
                  <SkeletonImage
                    src={service.image}
                    alt={`${service.title} at Genfinity O&P`}
                    fill
                    className="object-cover"
                  />
                  <div className="mobile-service__image-overlay" />
                  <span className="mobile-service__number">
                    {service.number}
                  </span>
                  <div className="mobile-service__icon">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mobile-service__promise">
                    {service.promise}
                  </div>
                </div>
                <div className="mobile-service__body" key="body">
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <ul>
                    {service.options.map((option) => (
                      <li key={option}>
                        <Check className="h-3.5 w-3.5" /> {option}
                      </li>
                    ))}
                  </ul>
                  <Link href={service.href}>
                    Explore care <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section className="mobile-journey">
        <div className="mobile-journey__orb" aria-hidden="true" />
        <motion.div {...reveal} className="relative z-10">
          <p className="mobile-journey__eyebrow">A clearer care experience</p>
          <h2>Never wonder what comes next.</h2>
          <p className="mobile-journey__intro">
            From your first question through fitting and follow-up, we keep the
            process personal and understandable.
          </p>
        </motion.div>

        <div className="mobile-journey__steps">
          {[
            [
              "01",
              "We listen",
              "Your comfort, challenges, and goals come first.",
            ],
            [
              "02",
              "We design",
              "Your care plan is shaped around your body and daily life.",
            ],
            [
              "03",
              "We stay",
              "Fitting, adjustments, and support continue after delivery.",
            ],
          ].map(([number, title, text], index) => (
            <motion.div
              {...reveal}
              transition={{ duration: 0.5, delay: index * 0.07 }}
              className="mobile-journey__step"
              key={number}
            >
              <span key="number">{number}</span>
              <div key="content">
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <Link href="/what-to-expect" className="mobile-journey__link">
          See what to expect <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <section className="mobile-promise">
        <motion.div {...reveal} className="mobile-promise__card">
          <div className="mobile-promise__icon">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <p>Patient-first care</p>
          <h2>Your life leads the plan.</h2>
          <span>
            Walk the dog. Return to work. Feel steady again. The goal that
            matters to you matters to us.
          </span>
          <a href="tel:8885526188">
            <Phone className="h-5 w-5" /> Talk with our team
          </a>
        </motion.div>
      </section>
    </div>
  );
}
