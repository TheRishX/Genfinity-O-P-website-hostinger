"use client";

import Link from "next/link";
import { CalendarDays, Phone } from "lucide-react";
import { motion } from "motion/react";

export function MobileCallBar() {
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.5, duration: 0.3 }}
      className="mobile-call-dock fixed bottom-0 left-0 w-full lg:hidden z-40"
    >
      <a href="tel:8885526188" className="mobile-call-dock__call">
        <Phone className="w-5 h-5" />
        <span>
          <small>Speak with us</small>Call now
        </span>
      </a>
      <Link href="/request-consultation" className="mobile-call-dock__book">
        <CalendarDays className="h-5 w-5" />
        <span>
          <small>Start online</small>Request care
        </span>
      </Link>
    </motion.div>
  );
}
