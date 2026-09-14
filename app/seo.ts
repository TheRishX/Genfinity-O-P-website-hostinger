import type { Metadata } from "next";

export const SITE_URL = "https://genfinityoandp.com";
export const SITE_NAME = "Genfinity O&P";
export const DEFAULT_SOCIAL_IMAGE = "/images/genfinity/prosthetic-community.avif";

export const seoPages = [
  { path: "/", title: "Best Orthotics & Prosthetics Center in the USA", description: "Expert orthotics and prosthetics care with personalized support for better mobility and comfort.", changeFrequency: "weekly", priority: 1 },
  { path: "/about/", title: "About Our Orthotics & Prosthetics Center", description: "Learn about Genfinity O&P and our patient-centered care.", changeFrequency: "monthly", priority: 0.8 },
  { path: "/services/", title: "Best Custom Orthotics and Prosthetics USA", description: "Personalized braces, foot orthotics and prosthetic limbs for comfort and mobility.", changeFrequency: "monthly", priority: 0.9 },
  { path: "/contact/", title: "Contact Genfinity O&P", description: "Contact Genfinity O&P to request an orthotic, prosthetic, or custom foot orthotic consultation.", changeFrequency: "monthly", priority: 0.8 },
] as const;

export function pageMetadata(path: string): Metadata {
  const page = seoPages.find((item) => item.path === path) ?? seoPages[0];
  return { title: { absolute: page.title }, description: page.description, alternates: { canonical: path }, openGraph: { type: "website", siteName: SITE_NAME, url: new URL(path, SITE_URL).toString(), title: page.title, description: page.description, images: [DEFAULT_SOCIAL_IMAGE] } };
}
