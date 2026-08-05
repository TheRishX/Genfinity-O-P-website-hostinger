'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, Star, ShieldCheck, HeartPulse, Activity, Phone } from 'lucide-react';
import { SkeletonImage } from '@/components/SkeletonImage';

export default function Home() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 lg:pt-24 lg:pb-32 overflow-hidden bg-white">
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            <motion.div 
              initial="hidden" 
              animate="visible" 
              variants={staggerContainer}
              className="max-w-2xl"
            >
              <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue-light text-brand-blue font-medium text-sm mb-6">
                <HeartPulse className="w-4 h-4" />
                <span>Compassionate Care in Tarzana, CA</span>
              </motion.div>
              
              <motion.h1 variants={fadeIn} className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.1] mb-6">
                Reclaim Your Mobility, <span className="text-brand-blue">Restore Your Independence</span>
              </motion.h1>
              
              <motion.p variants={fadeIn} className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
                Premium custom orthotics and prosthetics designed for your unique body and lifestyle. Experience personalized care that moves you forward.
              </motion.p>
              
              <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/contact" 
                  className="inline-flex justify-center items-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white px-8 py-3.5 rounded-full font-semibold transition-all shadow-lg shadow-brand-red/20 hover:shadow-xl hover:-translate-y-0.5"
                >
                  Book Your Evaluation
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link 
                  href="/services" 
                  className="inline-flex justify-center items-center gap-2 bg-white text-slate-700 hover:text-brand-blue px-8 py-3.5 rounded-full font-semibold transition-all border border-slate-200 hover:border-brand-blue hover:bg-slate-50"
                >
                  Explore Services
                </Link>
              </motion.div>
              
              <motion.div variants={fadeIn} className="mt-10 flex items-center gap-4 text-sm text-slate-600 font-medium">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden relative">
                      <SkeletonImage src={`https://i.pravatar.cc/150?img=${i + 10}`} alt="Patient avatar" fill className="object-cover" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex text-amber-400 mb-0.5">
                    {[1,2,3,4,5].map((i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                  </div>
                  <span className="text-slate-500">Trusted by 500+ patients</span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {/* Primary Image */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] bg-slate-100 border border-slate-200">
                <SkeletonImage 
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800&h=600" 
                  alt="Clinician assisting a patient" 
                  fill 
                  className="object-cover"
                  referrerPolicy="no-referrer"
                  priority
                />
              </div>
              
              {/* Floating Badge 1 */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="absolute -bottom-6 -left-6 md:-left-12 bg-white p-5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-heading font-bold text-slate-900">BOC Certified</div>
                  <div className="text-sm text-slate-500">Expert Clinicians</div>
                </div>
              </motion.div>

              {/* Floating Badge 2 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="absolute -top-6 -right-6 md:-right-8 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-brand-blue text-white rounded-full flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-heading font-bold text-slate-900">Advanced Tech</div>
                  <div className="text-xs text-slate-500">Custom fitting</div>
                </div>
              </motion.div>
            </motion.div>
            
          </div>
        </div>
      </section>

      {/* SERVICES PREVIEW */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-brand-blue font-semibold tracking-wide uppercase text-sm mb-3">Our Specialties</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Comprehensive Care Solutions</h3>
            <p className="text-slate-600 text-lg">We combine clinical expertise with state-of-the-art technology to create devices that perfectly match your anatomical needs.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Service Card 1 */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeIn}
              className="bg-white rounded-3xl p-8 shadow-lg shadow-slate-200/50 border border-slate-100 group hover:border-brand-blue/30 transition-colors"
            >
              <div className="w-14 h-14 bg-brand-blue-light text-brand-blue rounded-2xl flex items-center justify-center mb-6">
                <HeartPulse className="w-7 h-7" />
              </div>
              <h4 className="text-2xl font-bold text-slate-900 mb-4 font-heading">Custom Orthotics</h4>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Precision-engineered bracing and support systems designed to stabilize, align, and protect your body while reducing pain and improving function.
              </p>
              <ul className="space-y-3 mb-8">
                {['Ankle-Foot Orthoses (AFO)', 'Knee-Ankle-Foot Orthoses (KAFO)', 'Spinal Bracing & Supports', 'Custom Foot Orthotics'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-700 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/services" className="inline-flex items-center gap-2 text-brand-blue font-semibold hover:text-brand-blue-dark group-hover:underline underline-offset-4">
                Learn more about orthotics <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Service Card 2 */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeIn}
              className="bg-white rounded-3xl p-8 shadow-lg shadow-slate-200/50 border border-slate-100 group hover:border-brand-red/30 transition-colors"
            >
              <div className="w-14 h-14 bg-brand-red-light/30 text-brand-red rounded-2xl flex items-center justify-center mb-6">
                <Activity className="w-7 h-7" />
              </div>
              <h4 className="text-2xl font-bold text-slate-900 mb-4 font-heading">Advanced Prosthetics</h4>
              <p className="text-slate-600 mb-6 leading-relaxed">
                State-of-the-art artificial limbs customized to your unique residual limb and lifestyle goals, helping you return to the activities you love.
              </p>
              <ul className="space-y-3 mb-8">
                {['Below-Knee (Transtibial)', 'Above-Knee (Transfemoral)', 'Upper Extremity Prosthetics', 'Sports & Activity Specific'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-700 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/services" className="inline-flex items-center gap-2 text-brand-red font-semibold hover:text-brand-red-dark group-hover:underline underline-offset-4">
                Learn more about prosthetics <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 pt-12">
                  <div className="relative rounded-2xl overflow-hidden aspect-[4/5] shadow-lg">
                    <SkeletonImage src="https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&q=80&w=400&h=500" alt="Clinic facility" fill className="object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="relative rounded-2xl overflow-hidden aspect-square shadow-lg">
                    <SkeletonImage src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=400&h=400" alt="Prosthetic detail" fill className="object-cover" referrerPolicy="no-referrer" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden aspect-square shadow-lg">
                    <SkeletonImage src="https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=400&h=400" alt="Patient walking" fill className="object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="relative rounded-2xl overflow-hidden aspect-[4/5] shadow-lg">
                    <SkeletonImage src="https://images.unsplash.com/photo-1605152276897-4f618f831968?auto=format&fit=crop&q=80&w=400&h=500" alt="Consultation" fill className="object-cover" referrerPolicy="no-referrer" />
                  </div>
                </div>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl">
                <div className="w-20 h-20 bg-brand-blue text-white rounded-full flex flex-col items-center justify-center">
                  <span className="font-bold text-xl">15+</span>
                  <span className="text-[10px] uppercase font-semibold tracking-wider">Years</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <h2 className="text-brand-blue font-semibold tracking-wide uppercase text-sm mb-3">Why Genfinity O&P</h2>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">A Higher Standard of Care</h3>
              <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                Led by Deepak Kumar Bhardwaj, BOC Orthotist, our clinic is built on the belief that every patient deserves dedicated time, active listening, and meticulous craftsmanship.
              </p>
              
              <div className="space-y-6">
                {[
                  { title: 'Personalized Attention', desc: 'We never rush appointments. We take the time to understand your lifestyle, goals, and concerns.' },
                  { title: 'Advanced Technology', desc: 'From 3D scanning to modern materials, we utilize the latest advancements in the field.' },
                  { title: 'Ongoing Support', desc: 'Your journey doesn\'t end at delivery. We provide continuous adjustments and follow-up care.' }
                ].map((feature, idx) => (
                  <motion.div key={idx} variants={fadeIn} className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <div className="w-4 h-4 rounded-full bg-brand-red" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg mb-1">{feature.title}</h4>
                      <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-10">
                <Link href="/about" className="inline-flex items-center gap-2 text-brand-blue font-bold hover:gap-3 transition-all">
                  Meet our team <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10">
           <SkeletonImage src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1920&h=1080" alt="Background texture" fill className="object-cover" referrerPolicy="no-referrer" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-brand-red font-semibold tracking-wide uppercase text-sm mb-3">Patient Stories</h2>
            <h3 className="text-3xl md:text-4xl font-bold mb-6">Hear From Our Community</h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                text: "Deepak and his team truly changed my life. After struggling with my previous prosthetic for years, they crafted one that fits perfectly. I'm back to hiking without pain.",
                author: "Michael T.",
                role: "Prosthetic Patient"
              },
              {
                text: "The level of care and compassion at Genfinity is unmatched. They took the time to explain everything and made sure my custom AFO was comfortable and effective.",
                author: "Sarah J.",
                role: "Orthotic Patient"
              },
              {
                text: "Professional, knowledgeable, and incredibly warm. They handled all my insurance paperwork and made the entire process seamless. Highly recommend!",
                author: "David R.",
                role: "Patient"
              }
            ].map((testimonial, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-slate-800/80 backdrop-blur-sm p-8 rounded-3xl border border-slate-700 relative"
              >
                <div className="flex text-amber-400 mb-6">
                  {[1,2,3,4,5].map((star) => <Star key={star} className="w-5 h-5 fill-current" />)}
                </div>
                <p className="text-slate-300 mb-8 leading-relaxed text-lg">&quot;{testimonial.text}&quot;</p>
                <div>
                  <div className="font-bold text-white">{testimonial.author}</div>
                  <div className="text-slate-500 text-sm">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 bg-brand-blue relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)]"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to Take the Next Step?</h2>
          <p className="text-blue-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Schedule a consultation today and let us help you find the perfect orthotic or prosthetic solution for your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact" 
              className="bg-brand-red hover:bg-white hover:text-brand-red text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-xl hover:-translate-y-1"
            >
              Request an Appointment
            </Link>
            <a 
              href="tel:8885526188" 
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-brand-blue px-8 py-4 rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2"
            >
              <Phone className="w-5 h-5" />
              (888) 552-6188
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
