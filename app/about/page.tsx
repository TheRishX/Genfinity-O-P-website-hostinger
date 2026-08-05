'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import { Award, HeartHandshake, Microscope } from 'lucide-react';
import { SkeletonImage } from '@/components/SkeletonImage';

export default function AboutPage() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

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
            About Genfinity O&P
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600 max-w-2xl mx-auto"
          >
            Restoring independence through compassionate care and clinical excellence.
          </motion.p>
        </div>
      </section>

      {/* STORY & MISSION */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative rounded-3xl overflow-hidden shadow-2xl aspect-square bg-slate-100"
            >
              <SkeletonImage 
                src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800&h=800" 
                alt="Genfinity O&P Clinic" 
                fill 
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-brand-blue font-semibold tracking-wide uppercase text-sm mb-3">Our Mission</h2>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Patient-Centered Care First</h3>
              <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
                <p>
                  At Genfinity O&P, we believe that every patient has a unique story, unique anatomical needs, and unique goals. Our mission is to listen, evaluate, and craft personalized orthotic and prosthetic solutions that empower our patients to live their lives to the fullest.
                </p>
                <p>
                  Located in the heart of Tarzana, CA, our facility is equipped with modern fabrication technology and a welcoming environment. We handle everything from the initial evaluation and custom fabrication to meticulous fitting and long-term follow-up care.
                </p>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-6 mt-10">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <HeartHandshake className="w-8 h-8 text-brand-red mb-4" />
                  <h4 className="font-bold text-slate-900 mb-2">Compassion</h4>
                  <p className="text-sm text-slate-600">We treat every patient like family, providing a warm, supportive environment.</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <Microscope className="w-8 h-8 text-brand-blue mb-4" />
                  <h4 className="font-bold text-slate-900 mb-2">Innovation</h4>
                  <p className="text-sm text-slate-600">Utilizing advanced materials and scanning technology for the perfect fit.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* MEET THE CLINICIAN */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
            <div className="grid lg:grid-cols-5">
              <div className="lg:col-span-2 relative aspect-square lg:aspect-auto">
                <SkeletonImage 
                  src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600&h=800" 
                  alt="Deepak Kumar Bhardwaj" 
                  fill 
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="lg:col-span-3 p-10 lg:p-16 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-medium mb-6 w-fit">
                  <Award className="w-5 h-5" />
                  <span>BOC Certified Orthotist</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Deepak Kumar Bhardwaj</h3>
                <p className="text-brand-blue font-semibold text-lg mb-8">Lead Clinician & Owner</p>
                
                <div className="space-y-6 text-slate-600 leading-relaxed text-lg">
                  <p>
                    With years of dedicated experience in the field of orthotics and prosthetics, Deepak has built a reputation for his meticulous attention to detail and unwavering commitment to patient outcomes.
                  </p>
                  <p>
                    As a BOC Certified Orthotist, he brings clinical excellence and a deep understanding of biomechanics to every fitting. Whether managing complex spinal conditions or providing supportive devices for daily mobility, Deepak&apos;s approach is always rooted in empathy and precision.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
