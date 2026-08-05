'use client';

import { motion } from 'motion/react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function ContactPage() {
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
            Get in Touch
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600 max-w-2xl mx-auto"
          >
            We&apos;re here to answer your questions and help you schedule an evaluation. For fastest response, call us directly or use the live chat.
          </motion.p>
        </div>
      </section>

      {/* CONTACT INFO & FORM */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
            
            {/* Info Column */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="lg:col-span-5 space-y-8"
            >
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-6">Contact Information</h2>
                <p className="text-slate-600 mb-8 leading-relaxed">
                  Have a question or need to schedule an appointment? Use the form to send us a message, or reach out using the details below.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-brand-blue-light text-brand-blue rounded-xl flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">Phone & Fax</h4>
                    <a href="tel:8885526188" className="text-brand-blue font-medium hover:underline block mt-1">(888) 552-6188</a>
                    <span className="text-slate-500 text-sm">Fax: (323) 909-8512</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-brand-blue-light text-brand-blue rounded-xl flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">Our Clinic</h4>
                    <p className="text-slate-600 mt-1">
                      18401 Burbank Blvd, Suite 215<br />
                      Tarzana, CA 91356
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-brand-blue-light text-brand-blue rounded-xl flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">Email</h4>
                    <a href="mailto:support@genfinityoandp.com" className="text-slate-600 hover:text-brand-blue transition-colors mt-1 block">
                      support@genfinityoandp.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 mt-10">
                <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-brand-red" />
                  Business Hours
                </h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span className="font-medium">9:00 AM - 5:00 PM</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Saturday</span>
                    <span className="font-medium">By Appointment</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Sunday</span>
                    <span className="text-brand-red font-medium">Closed</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Form Column */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-7"
            >
              <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-2 sm:p-4 overflow-hidden h-full min-h-[600px] flex flex-col">
                <div className="text-center p-6 pb-2">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Request an Appointment or Inquiry</h3>
                  <p className="text-sm text-slate-500">Please fill out the form below. We will get back to you shortly.</p>
                </div>
                {/* Embed Google Form */}
                <div className="flex-1 w-full rounded-2xl overflow-hidden relative">
                  {/* Note: This is a placeholder Google Form URL. In a real deployment, replace the src with the actual embedded Google Form URL. */}
                  <iframe 
                    src="https://docs.google.com/forms/d/e/1FAIpQLSeQ_X9L1iX_L_1c3Z3d3A_wGg4q4n4d4E_w_w/viewform?embedded=true" 
                    className="absolute inset-0 w-full h-full"
                    frameBorder="0" 
                    marginHeight={0} 
                    marginWidth={0}
                    title="Genfinity O&P Contact Form"
                  >
                    Loading...
                  </iframe>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>
    </div>
  );
}
