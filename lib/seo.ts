import type { Metadata } from "next";

export const SITE_URL = "https://genfinityoandp.com";
export const SITE_NAME = "Genfinity O&P";
export const DEFAULT_SOCIAL_IMAGE =
  "/images/genfinity/prosthetic-community.avif";

export const seoPages = [
  { path: "/", keyword: "orthotics and prosthetics", title: "Best Orthotics & Prosthetics Center in the USA", description: "Get expert orthotics and prosthetics care in the USA, with personalized solutions, advanced technology, and support for better mobility and comfort.", priority: 1, changeFrequency: "weekly" },
  { path: "/orthotics-prosthetics/", keyword: "orthotics and prosthetics", title: "Best Orthotics & Prosthetics Center in the USA", description: "Get expert orthotics and prosthetics care in the USA, with personalized solutions, advanced technology, and support for better mobility and comfort.", priority: 1, changeFrequency: "weekly" },
  { path: "/about", keyword: "Orthotics & Prosthetics Center", title: "About Our Orthotics & Prosthetics Center", description: "Orthotics and prosthetics center USA provider Genfinity O&P offers expert care for comfort, mobility, and improved quality of life.", priority: 0.8, changeFrequency: "monthly" },
  { path: "/about/", keyword: "Orthotics & Prosthetics Center", title: "About Our Orthotics & Prosthetics Center", description: "Orthotics and prosthetics center USA provider Genfinity O&P offers expert care for comfort, mobility, and improved quality of life.", priority: 0.8, changeFrequency: "monthly" },
  { path: "/services", keyword: "custom orthotics and prosthetics", title: "Best Custom Orthotics and Prosthetics USA | Pain Relief & Support", description: "Custom orthotics & prosthetics by trusted USA experts. Personalized braces, foot orthotics & prosthetic limbs for comfort & mobility.", priority: 0.9, changeFrequency: "monthly" },
  { path: "/our-services-custom-orthotics-and-prosthetics/", keyword: "custom orthotics and prosthetics", title: "Best Custom Orthotics and Prosthetics USA | Pain Relief & Support", description: "Custom orthotics & prosthetics by trusted USA experts. Personalized braces, foot orthotics & prosthetic limbs for comfort & mobility.", priority: 0.9, changeFrequency: "monthly" },
  { path: "/services/orthotics", keyword: "Custom Orthotics", title: "Best Custom Orthotics | Expert Foot Support", description: "Find the best custom orthotics for better foot support, comfort, alignment, and mobility with personalized solutions from orthotics experts.", priority: 0.9, changeFrequency: "monthly" },
  { path: "/custom-orthotics/", keyword: "Custom Orthotics", title: "Best Custom Orthotics | Expert Foot Support", description: "Find the best custom orthotics for better foot support, comfort, alignment, and mobility with personalized solutions from orthotics experts.", priority: 0.9, changeFrequency: "monthly" },
  { path: "/services/prosthetics", keyword: "Prosthetics & Orthotics", title: "Best Prosthetics & Orthotics | Expert Care", description: "Find the best Prosthetics & Orthotics care for improved mobility, comfort, and support with personalized solutions from experienced experts.", priority: 0.9, changeFrequency: "monthly" },
  { path: "/prosthetics-orthotics/", keyword: "Prosthetics & Orthotics", title: "Best Prosthetics & Orthotics | Expert Care", description: "Find the best Prosthetics & Orthotics care for improved mobility, comfort, and support with personalized solutions from experienced experts.", priority: 0.9, changeFrequency: "monthly" },
  { path: "/services/custom-insoles", keyword: "Custom Foot Orthotics", title: "Custom Foot Orthotics | Better Foot Support", description: "Custom Foot Orthotics provide personalized support to improve comfort, alignment, mobility, and everyday performance based on your unique foot needs.", priority: 0.9, changeFrequency: "monthly" },
  { path: "/custom-foot-orthotics/", keyword: "Custom Foot Orthotics", title: "Custom Foot Orthotics | Better Foot Support", description: "Custom Foot Orthotics provide personalized support to improve comfort, alignment, mobility, and everyday performance based on your unique foot needs.", priority: 0.9, changeFrequency: "monthly" },
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
    title: { absolute: page.title },
    description: page.description,
    keywords: "keyword" in page ? [page.keyword] : undefined,
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
