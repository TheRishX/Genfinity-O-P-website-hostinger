'use client';

import { motion } from 'motion/react';
import { FileText, Clock, CreditCard, HelpCircle } from 'lucide-react';

export default function PatientResourcesPage() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const faqs = [
    {
      q: "Do I need a prescription to be seen?",
      a: "Yes, for custom orthotics and prosthetics, a valid prescription from your treating physician is required before we can begin fabrication or billing insurance."
    },
    {
      q: "What should I bring to my first appointment?",
      a: "Please bring your prescription, insurance cards, a valid photo ID, and any current orthotic or prosthetic devices you are using. Wear comfortable clothing that allows easy access to the area being evaluated."
    },
    {
      q: "How long does the process take?",
      a: "The timeline varies depending on the device. An initial evaluation takes about 45-60 minutes. Custom fabrication typically takes 1 to 3 weeks, followed by fitting and adjustment appointments."
    },
    {
      q: "Does my insurance cover these devices?",
      a: "Most major medical insurance plans, including Medicare, provide coverage for orthotics and prosthetics when deemed medically necessary. We will verify your benefits and discuss any out-of-pocket costs prior to proceeding."
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
            Patient Resources
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600 max-w-2xl mx-auto"
          >
            Everything you need to know before your visit. We&apos;re here to make the process as seamless as possible.
          </motion.p>
        </div>
      </section>

      {/* WHAT TO EXPECT & INSURANCE */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100"
            >
              <div className="w-14 h-14 bg-brand-blue-light text-brand-blue rounded-2xl flex items-center justify-center mb-6">
                <Clock className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">What to Expect</h3>
              <ul className="space-y-4 text-slate-600">
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-brand-blue">1</span>
                  <div>
                    <strong className="text-slate-900 block mb-1">Evaluation</strong>
                    We&apos;ll review your prescription, medical history, and goals, taking precise measurements or casts.
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-brand-blue">2</span>
                  <div>
                    <strong className="text-slate-900 block mb-1">Fabrication</strong>
                    Your custom device is expertly crafted and modified in our facility.
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-brand-blue">3</span>
                  <div>
                    <strong className="text-slate-900 block mb-1">Fitting & Delivery</strong>
                    We ensure a perfect, comfortable fit and instruct you on proper use and care.
                  </div>
                </li>
              </ul>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100"
            >
              <div className="w-14 h-14 bg-brand-red-light/30 text-brand-red rounded-2xl flex items-center justify-center mb-6">
                <CreditCard className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Insurance & Billing</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Navigating healthcare coverage can be complex. Our dedicated administrative staff works closely with your insurance provider to authorize services and minimize your out-of-pocket expenses.
              </p>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h4 className="font-bold text-slate-900 mb-2">Accepted Providers</h4>
                <p className="text-sm text-slate-600">
                  We accept Medicare, Medi-Cal, and most major commercial PPO and HMO plans. Please contact our office to verify your specific coverage.
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="w-16 h-16 bg-white shadow-md rounded-2xl flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="w-8 h-8 text-brand-blue" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
              >
                <h4 className="font-bold text-slate-900 text-lg mb-3">{faq.q}</h4>
                <p className="text-slate-600 leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
