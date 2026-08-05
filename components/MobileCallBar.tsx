'use client';

import { Phone } from 'lucide-react';
import { motion } from 'motion/react';

export function MobileCallBar() {
  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.5, duration: 0.3 }}
      className="fixed bottom-0 left-0 w-full lg:hidden z-40 bg-white border-t border-slate-200 p-3 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]"
    >
      <a 
        href="tel:8885526188"
        className="flex items-center justify-center gap-2 w-full py-3.5 bg-brand-red text-white rounded-xl font-semibold shadow-md active:scale-[0.98] transition-transform"
      >
        <Phone className="w-5 h-5" />
        Click to Call Now
      </a>
    </motion.div>
  );
}
