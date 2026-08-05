'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, HeartPulse, Activity } from 'lucide-react';
import { SkeletonImage } from '@/components/SkeletonImage';

export default function ServicesPage() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const services = [
    {
      id: "orthotics",
      title: "Custom Orthotics",
      icon: <HeartPulse className="w-8 h-8" />,
      color: "blue",
      desc: "Comprehensive orthotic solutions to support, align, prevent, or correct deformities and improve the function of movable parts of the body.",
      items: [
        "Ankle-Foot Orthoses (AFO)",
        "Knee-Ankle-Foot Orthoses (KAFO)",
        "Spinal Orthoses (TLSO, LSO, Cervical)",
        "Upper Extremity Orthoses (Hand, Wrist, Elbow, Shoulder)",
        "Custom Foot Orthotics and Diabetic Footwear",
        "Pediatric Orthotic Solutions"
      ],
      image: "https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?auto=format&fit=crop&q=80&w=800&h=600"
    },
    {
      id: "prosthetics",
      title: "Advanced Prosthetics",
      icon: <Activity className="w-8 h-8" />,
      color: "red",
      desc: "Custom-designed artificial limbs that combine advanced technology with precise anatomical fitting to restore function and mobility.",
      items: [
        "Below-Knee (Transtibial) Prostheses",
        "Above-Knee (Transfemoral) Prostheses",
        "Upper Extremity Prosthetics",
        "Myoelectric and Microprocessor Devices",
        "Sports and Activity-Specific Prosthetics",
        "Post-Surgical Protective Devices"
      ],
      image: "https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&q=80&w=800&h=600"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* HEADER */}
      <section className="bg-slate-50 py-20 lg:py-28 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6"
          >
            Our Services
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600 max-w-2xl mx-auto"
          >
            We provide comprehensive, custom-tailored orthotic and prosthetic care designed to help you live life to the fullest.
          </motion.p>
        </div>
      </section>

      {/* SERVICES DETAILS */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">
          {services.map((service, idx) => (
            <motion.div 
              key={service.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
              className={`flex flex-col gap-12 lg:gap-16 items-center ${idx % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}
            >
              <div className="lg:w-1/2 w-full space-y-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${service.color === 'blue' ? 'bg-brand-blue-light text-brand-blue' : 'bg-brand-red-light/30 text-brand-red'}`}>
                  {service.icon}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900">{service.title}</h2>
                <p className="text-lg text-slate-600 leading-relaxed">{service.desc}</p>
                <ul className="space-y-4 pt-4">
                  {service.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-700 font-medium">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="pt-6">
                  <Link 
                    href="/contact" 
                    className={`inline-flex justify-center items-center gap-2 px-8 py-3.5 rounded-full font-semibold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 ${service.color === 'blue' ? 'bg-brand-blue hover:bg-brand-blue-dark text-white' : 'bg-brand-red hover:bg-brand-red-dark text-white'}`}
                  >
                    Schedule a Consultation
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
              <div className="lg:w-1/2 w-full">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] bg-slate-100">
                  <SkeletonImage 
                    src={service.image} 
                    alt={service.title} 
                    fill 
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-3xl pointer-events-none"></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 bg-brand-blue relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.1),transparent_50%)]"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Not Sure What You Need?</h2>
          <p className="text-blue-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Our experts are here to evaluate your unique situation and recommend the best course of action.
          </p>
          <Link 
            href="/contact" 
            className="inline-block bg-white text-brand-blue px-10 py-4 rounded-full font-bold text-lg transition-all shadow-xl hover:-translate-y-1 hover:bg-slate-50"
          >
            Contact Us Today
          </Link>
        </div>
      </section>
    </div>
  );
}
