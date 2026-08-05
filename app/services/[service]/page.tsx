import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, CheckCircle2, Phone, ShieldCheck, Sparkles } from 'lucide-react';

const content = {
  orthotics: {
    eyebrow: 'Orthotic care', title: 'Support that helps you move with confidence.',
    intro: 'Every orthosis begins with your goals, your comfort, and a detailed clinical evaluation. We create support that fits your body and your day-to-day life.',
    includes: ['Ankle-foot orthoses (AFOs)', 'Knee, knee-ankle-foot and hip-knee-ankle-foot orthoses', 'Spinal, cervical and upper-extremity bracing', 'Pediatric orthotic care', 'Diabetic footwear and accommodative devices'],
    image: 'https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?auto=format&fit=crop&q=85&w=1400',
  },
  prosthetics: {
    eyebrow: 'Prosthetic care', title: 'A prosthesis built around the life you want to lead.',
    intro: 'Our prosthetic process pairs careful measurement and fitting with component choices tailored to your activity level, anatomy, and personal goals.',
    includes: ['Below-knee and above-knee prostheses', 'Partial-foot and toe-fill prostheses', 'Upper-extremity prostheses', 'Microprocessor and activity-specific components', 'Post-operative and preparatory devices'],
    image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&q=85&w=1400',
  },
  'custom-insoles': {
    eyebrow: 'Custom foot orthotics', title: 'Relief starts from the ground up.',
    intro: 'Custom insoles can help distribute pressure, improve alignment, and make each step more comfortable. We assess your gait, footwear, and symptoms to create support that is truly yours.',
    includes: ['Custom insoles for flat feet and overpronation', 'Plantar fasciitis and heel-pain support', 'Diabetic and accommodative insoles', 'Sports and work footwear solutions', 'Gait and pressure assessment'],
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=85&w=1400',
  },
  'mobility-equipment': {
    eyebrow: 'Mobility equipment', title: 'The right equipment for safer, easier everyday movement.',
    intro: 'When mobility needs extend beyond a device, our team can help identify durable medical equipment that works with your space, abilities, and care plan.',
    includes: ['Walkers and crutches', 'Manual and power wheelchairs', 'Custom wheelchair seating', 'Standing frames and support equipment', 'Training and fit guidance'],
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=85&w=1400',
  },
} as const;

export function generateStaticParams() { return Object.keys(content).map((service) => ({ service })); }

export default async function ServiceDetail({ params }: { params: Promise<{ service: string }> }) {
  const { service } = await params;
  const page = content[service as keyof typeof content];
  if (!page) notFound();
  return <div className="bg-white">
    <section className="relative isolate overflow-hidden bg-slate-950 py-20 sm:py-28">
      <img src={page.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/20" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mb-5 text-sm font-bold uppercase tracking-[.2em] text-red-300">{page.eyebrow}</p>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">{page.title}</h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-200">{page.intro}</p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row"><a href="tel:8885526188" className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-red px-7 py-3.5 font-bold text-white hover:bg-brand-red-dark"><Phone className="w-5 h-5" /> Call (888) 552-6188</a><Link href="/request-consultation" className="inline-flex items-center justify-center rounded-full border border-white/30 px-7 py-3.5 font-bold text-white hover:bg-white/10">Request a consultation</Link></div>
      </div>
    </section>
    <section className="py-20 sm:py-28"><div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:px-8"><div><p className="text-sm font-bold uppercase tracking-[.18em] text-brand-red">Personalized from the start</p><h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">A thoughtful plan, not a one-size-fits-all device.</h2><p className="mt-6 text-lg leading-relaxed text-slate-600">We listen first, collaborate with your referring clinician when needed, and make space for questions at every stage. Your fit and function guide every adjustment.</p><Link href="/what-to-expect" className="mt-7 inline-flex items-center gap-2 font-bold text-brand-blue hover:text-brand-red">See what to expect <ArrowRight className="w-4 h-4" /></Link></div><div className="rounded-3xl bg-slate-50 p-8 sm:p-10"><h3 className="text-xl font-bold text-slate-900">Care may include</h3><ul className="mt-6 space-y-4">{page.includes.map((item) => <li className="flex gap-3 text-slate-700" key={item}><CheckCircle2 className="mt-0.5 w-5 shrink-0 text-brand-red" />{item}</li>)}</ul></div></div></section>
    <section className="bg-brand-blue py-16"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-7 px-4 sm:px-6 md:flex-row md:items-center lg:px-8"><div className="flex gap-4"><ShieldCheck className="mt-1 w-7 shrink-0 text-red-200" /><div><h2 className="text-2xl font-bold text-white">Let&apos;s find the right next step.</h2><p className="mt-1 text-blue-100">Speak directly with the Genfinity O&amp;P team.</p></div></div><a href="tel:8885526188" className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-bold text-brand-blue hover:bg-slate-100"><Sparkles className="w-4 h-4" /> Call now</a></div></section>
  </div>;
}
