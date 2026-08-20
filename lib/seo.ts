import type { Metadata } from "next";

export const SITE_URL = "https://genfinityoandp.com";
export const SITE_NAME = "Genfinity O&P";
export const DEFAULT_SOCIAL_IMAGE =
  "/images/genfinity/prosthetic-community.avif";

export const seoPages = [
  { path: "/", title: "Orthotics & Prosthetics in Tarzana, CA", description: "Personalized orthotic, prosthetic, and custom foot orthotic care in Tarzana, Los Angeles. More than 25 years of clinical experience. Call (888) 552-6188.", priority: 1, changeFrequency: "weekly" },
  { path: "/about", title: "About Our Orthotic & Prosthetic Clinic", description: "Meet Genfinity O&P, a patient-first orthotic and prosthetic clinic in Tarzana combining clinical precision, careful fitting, and long-term support.", priority: 0.8, changeFrequency: "monthly" },
  { path: "/services", title: "Orthotic, Prosthetic & Custom Insole Services", description: "Explore custom orthotics, advanced prosthetics, diabetic footwear, pediatric bracing, and custom foot orthotics in Tarzana, CA.", priority: 0.9, changeFrequency: "monthly" },
  { path: "/services/orthotics", title: "Custom Orthotics & Bracing in Tarzana", description: "Custom and custom-fit AFOs, KAFOs, spinal braces, upper-extremity orthoses, pediatric orthotics, and diabetic footwear in Tarzana.", priority: 0.9, changeFrequency: "monthly" },
  { path: "/services/prosthetics", title: "Personalized Prosthetic Care in Tarzana", description: "Below-knee, above-knee, upper-extremity, myoelectric, microprocessor, and activity-specific prosthetic care built around your life.", priority: 0.9, changeFrequency: "monthly" },
  { path: "/services/custom-insoles", title: "Custom Foot Orthotics & Insoles in Tarzana", description: "Custom insoles and foot orthotics for plantar fasciitis, flat feet, diabetic care, sports, work footwear, and pressure relief.", priority: 0.9, changeFrequency: "monthly" },
  { path: "/patient-resources", title: "Patient Resources", description: "Prepare for orthotic or prosthetic care with guidance on appointments, insurance, financial assistance, the fitting process, and common questions.", priority: 0.7, changeFrequency: "monthly" },
  { path: "/what-to-expect", title: "What to Expect at Your First Visit", description: "Learn what happens during an orthotic or prosthetic evaluation, what to bring, and how Genfinity O&P plans care around your goals.", priority: 0.7, changeFrequency: "monthly" },
  { path: "/the-process", title: "Our Orthotic & Prosthetic Care Process", description: "Understand evaluation, measurement, fabrication, fitting, delivery, and follow-up for custom orthotic and prosthetic devices.", priority: 0.7, changeFrequency: "monthly" },
  { path: "/insurance", title: "Insurance for Orthotics & Prosthetics", description: "Learn about prescriptions, documentation, benefits verification, authorization, and insurance considerations for orthotic and prosthetic care.", priority: 0.7, changeFrequency: "monthly" },
  { path: "/financial-assistance", title: "Financial Assistance & Payment Guidance", description: "Explore payment guidance and financial assistance options for orthotic and prosthetic care at Genfinity O&P.", priority: 0.6, changeFrequency: "monthly" },
  { path: "/faqs", title: "Orthotics & Prosthetics FAQs", description: "Straight answers about prescriptions, first appointments, insurance, device fitting, AFOs, KAFOs, prostheses, adjustments, and follow-up.", priority: 0.7, changeFrequency: "monthly" },
  { path: "/testimonials", title: "Patient Care Testimonials", description: "Learn about the patient-centered standards that guide every orthotic and prosthetic evaluation, fitting, adjustment, and follow-up.", priority: 0.6, changeFrequency: "monthly" },
  { path: "/locations", title: "Tarzana Orthotic & Prosthetic Clinic", description: "Visit Genfinity O&P at 18401 Burbank Blvd, Suite 215, Tarzana, CA 91356. Find hours, directions, phone, and contact details.", priority: 0.8, changeFrequency: "monthly" },
  { path: "/contact", title: "Contact Genfinity O&P", description: "Contact Genfinity O&P in Tarzana to ask a question or request an orthotic, prosthetic, or custom foot orthotic consultation.", priority: 0.8, changeFrequency: "monthly" },
  { path: "/careers", title: "Careers at Genfinity O&P", description: "Explore career opportunities with a growing orthotic and prosthetic practice committed to thoughtful, patient-centered care in Tarzana.", priority: 0.5, changeFrequency: "monthly" },
  { path: "/privacy", title: "Privacy & Policies", description: "Read the Genfinity O&P website privacy policy and learn how personal and health-related information is handled.", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", title: "Terms & Conditions", description: "Read the terms and conditions governing use of the Genfinity O&P website, services, communications, and SMS program.", priority: 0.3, changeFrequency: "yearly" },
] as const;

export type SeoPath = (typeof seoPages)[number]["path"];

export function pageMetadata(path: SeoPath): Metadata {
  const page = seoPages.find((item) => item.path === path)!;
  const url = new URL(path, SITE_URL).toString();

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: SITE_NAME,
      url,
      title: `${page.title} | ${SITE_NAME}`,
      description: page.description,
      images: [{ url: DEFAULT_SOCIAL_IMAGE, width: 2528, height: 1686, alt: "A Genfinity O&P patient moving confidently with a prosthetic leg" }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${page.title} | ${SITE_NAME}`,
      description: page.description,
      images: [DEFAULT_SOCIAL_IMAGE],
    },
  };
}
