import Link from "next/link";
import { FileText, Phone } from "lucide-react";

const sections = [
  ["Acceptance of terms", "These Terms & Conditions govern your use of the Genfinity O&P website, forms, services, and communications. By using the website, you agree to these terms and our Privacy Policy. Providing a phone number or accepting these terms does not, by itself, enroll you in SMS messaging; SMS enrollment requires a separate, clear opt-in."],
  ["Healthcare services disclaimer", "Website, form, and communication content is provided for general informational purposes only. It is not medical advice, diagnosis, or treatment. A provider-patient relationship is established only through appropriate clinical evaluation and acceptance as a patient. Do not use this website or SMS for emergencies; call 911 for an emergency."],
  ["Appointment requests and service communications", "When you submit information through the website or another approved channel, Genfinity O&P may contact you about the request, scheduling, reminders, follow-up care, insurance, billing, customer support, and other information related to services you requested. Email, phone, and SMS permissions are separate. We will honor the communication preferences you provide, subject to operational and legal requirements."],
];

export default function TermsPage() {
  return <div className="bg-white">
    <section className="relative overflow-hidden bg-brand-ink py-20 text-white sm:py-28"><div className="hero-grid absolute inset-0 opacity-25" /><div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6"><FileText className="mx-auto h-9 w-9 text-brand-red" /><p className="mt-5 text-sm font-bold uppercase tracking-[.2em] text-brand-red">Terms &amp; conditions</p><h1 className="mt-4 text-4xl font-bold sm:text-6xl">Clear terms for clear care.</h1><p className="mt-6 text-lg text-white/70">Effective date: September 8, 2026</p></div></section>
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
      <p className="text-lg leading-relaxed text-slate-600">These terms explain how Genfinity O&amp;P&apos;s website, services, and SMS messaging program may be used.</p>
      <div className="mt-12 space-y-10">
        {sections.map(([title, body]) => <section key={title} className="border-b border-brand-ink/10 pb-10"><h2 className="text-2xl font-bold text-brand-ink">{title}</h2><p className="mt-4 leading-relaxed text-slate-600">{body}</p></section>)}
        <section className="border-b border-brand-ink/10 pb-10"><h2 className="text-2xl font-bold text-brand-ink">SMS Terms of Service</h2><div className="mt-4 space-y-4 leading-relaxed text-slate-600">
          <p>By separately opting in through an optional website checkbox, a form, a conversation, email, or another clear affirmative action, you agree to receive SMS messages from Genfinity O&amp;P LLC at the mobile number you provide. Messages may include appointment scheduling and reminders, follow-up and post-visit instructions, account notifications, insurance or billing notifications, customer care, and other service-related information you request. We do not send promotional or marketing texts unless you provide separate express written consent.</p>
          <p><strong>Message frequency varies.</strong> Message and data rates may apply. Consent is not a condition of purchasing services or receiving healthcare.</p>
          <p>Reply <strong>HELP</strong> for help or call <a className="font-semibold text-brand-red" href="tel:8885526188">(888) 552-6188</a>. Reply <strong>STOP</strong> or <strong>UNSUBSCRIBE</strong> at any time to opt out. You may also opt out by contacting us by phone, email, or mail. After opting out, you may reply <strong>START</strong> or <strong>SUBSCRIBE</strong> to resume messages, where supported.</p>
          <p>We will retain records of SMS consent, including the mobile number, date and time, consent method, and purpose where collected. We do not purchase, sell, rent, or use third-party SMS opt-in lists.</p>
          <p>SMS consent is not shared with third parties or affiliates for their own marketing purposes. Our messaging vendors may process information only as service providers to deliver and manage requested communications.</p>
          <p>See our <Link className="font-semibold text-brand-red hover:underline" href="/privacy">Privacy Policy</Link> for how information is collected, used, and shared.</p>
        </div></section>
        <section className="border-b border-brand-ink/10 pb-10"><h2 className="text-2xl font-bold text-brand-ink">Your responsibilities</h2><p className="mt-4 leading-relaxed text-slate-600">You agree to provide accurate information, keep your contact details current, use the website lawfully, protect your account or form information, and not attempt unauthorized access to systems or data. You are responsible for ensuring you have permission to provide any phone number or contact information submitted on behalf of another person.</p></section>
        <section className="border-b border-brand-ink/10 pb-10"><h2 className="text-2xl font-bold text-brand-ink">Intellectual property, third parties, and changes</h2><p className="mt-4 leading-relaxed text-slate-600">Genfinity O&amp;P website content, branding, graphics, forms, documents, and materials are protected. We may use third-party providers for hosting, scheduling, communications, payments, analytics, and related operations. Terms may be updated by posting a revised version on this site. These Terms are governed by the laws of the State of California.</p></section>
      </div>
      <section className="mt-12 rounded-3xl border border-brand-ink/10 p-8 sm:p-10"><h2 className="text-2xl font-bold text-brand-ink">Contact information</h2><p className="mt-4 leading-relaxed text-slate-600">GENFINITY O&amp;P LLC<br />18401 Burbank Blvd, Suite 215<br />Tarzana, California 91356<br /><a className="text-brand-red hover:underline" href="mailto:support@genfinityoandp.com">support@genfinityoandp.com</a></p><a href="tel:8885526188" className="mt-5 inline-flex items-center gap-2 font-bold text-brand-red"><Phone className="h-5 w-5" /> (888) 552-6188</a></section>
      <p className="mt-8 text-sm text-slate-500">See also: <Link className="font-semibold text-brand-red" href="/privacy">Privacy Policy</Link></p>
    </main>
  </div>;
}
