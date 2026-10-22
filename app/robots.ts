import type { MetadataRoute } from "next";
import { SITE_URL } from "@/app/seo";
import { getSettings } from "@/app/shared/site-settings/store";

export const revalidate = 3600;

const PRIVATE_PATHS = ["/api/", "/staff/", "/seo", "/patient-intake/", "/patient-intake"];

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { seo } = await getSettings();
  const base = seo.canonicalBase || SITE_URL;
  // "noindex, follow" still lets crawlers in so they can see the noindex tag;
  // only "noindex, nofollow" closes the whole site.
  const closed = seo.robots === "noindex, nofollow";
  return {
    rules: closed ? { userAgent: "*", disallow: "/" } : { userAgent: "*", allow: "/", disallow: PRIVATE_PATHS },
    sitemap: seo.sitemapEnabled ? `${base}/sitemap.xml` : undefined,
    host: base,
  };
}
