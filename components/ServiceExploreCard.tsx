'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import type { ReactNode } from 'react';

type ServiceExploreCardProps = {
  index: number;
  title: string;
  description: string;
  href: string;
  treatments: string[];
  image: string;
  icon: ReactNode;
};

export function ServiceExploreCard({ index, title, description, href, treatments, image, icon }: ServiceExploreCardProps) {
  return <motion.article initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .08 }} className="group relative min-h-[360px] overflow-hidden rounded-3xl border border-brand-blue/10 bg-white p-7 shadow-sm transition duration-500 hover:-translate-y-2 hover:border-brand-blue/30 hover:shadow-2xl hover:shadow-brand-blue/10">
    <span className="absolute -right-4 -top-8 font-heading text-9xl font-bold text-brand-blue/[.045]">0{index + 1}</span>
    <div className="relative transition duration-300 md:group-hover:translate-y-1 md:group-hover:opacity-0">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-blue text-white shadow-lg shadow-brand-blue/20">{icon}</div>
      <h3 className="mt-7 text-2xl font-bold text-brand-ink">{title}</h3>
      <p className="mt-3 leading-relaxed text-slate-600">{description}</p>
      <ul className="mt-6 space-y-2 md:hidden">{treatments.slice(0, 3).map((item) => <li className="flex items-center gap-2 text-sm font-medium text-brand-ink/80" key={item}><CheckCircle2 className="h-4 w-4 text-brand-red"/>{item}</li>)}</ul>
      <Link href={href} className="mt-7 inline-flex items-center gap-2 font-bold text-brand-blue">Explore care <ArrowRight className="w-4 h-4"/></Link>
    </div>
    <div className="pointer-events-none absolute inset-0 hidden translate-y-5 opacity-0 transition duration-500 md:flex md:flex-col md:group-hover:pointer-events-auto md:group-hover:translate-y-0 md:group-hover:opacity-100">
      <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-ink via-brand-ink/90 to-brand-ink/25" />
      <div className="relative mt-auto p-7 text-white">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-brand-red">Care options</p>
        <h3 className="mt-2 text-2xl font-bold">{title}</h3>
        <ul className="mt-4 grid gap-2">{treatments.slice(0, 4).map((item) => <li key={item} className="flex items-center gap-2 text-sm text-white/85"><CheckCircle2 className="h-4 w-4 shrink-0 text-brand-red"/>{item}</li>)}</ul>
        <Link href={href} className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-brand-ink transition hover:bg-brand-red hover:text-white">Explore treatment <ArrowRight className="w-4 h-4"/></Link>
      </div>
    </div>
  </motion.article>;
}
