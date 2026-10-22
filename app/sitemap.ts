import type { MetadataRoute } from "next";
import { SITE_URL, seoPages } from "@/app/seo";
import { getAllPostSlugs } from "@/app/shared/wordpress";
import { getSettings } from "@/app/shared/site-settings/store";
import { pageKey } from "@/app/shared/site-settings/schema";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { seo } = await getSettings();
  if (!seo.sitemapEnabled) return [];
  const SITE = seo.canonicalBase || SITE_URL;
  const staticPages: MetadataRoute.Sitemap = seoPages
    // Pages set to noindex in the /seo portal are left out of the sitemap.
    .filter((page) => !seo.pages[pageKey(page.path)]?.noindex)
    .map((page) => ({
    url: new URL(page.path, SITE).toString(),
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  const blogLanding: MetadataRoute.Sitemap = [
    {
      url: `${SITE}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  try {
    const posts = await getAllPostSlugs();
    const blogPosts: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${SITE}/blog/${post.slug}`,
      lastModified: new Date(post.modified),
      changeFrequency: "monthly",
      priority: 0.7,
    }));
    return [...staticPages, ...blogLanding, ...blogPosts];
  } catch {
    return [...staticPages, ...blogLanding];
  }
}
