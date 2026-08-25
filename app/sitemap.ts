import type { MetadataRoute } from "next";
import { SITE_URL, seoPages } from "@/lib/seo";
import { getAllPostSlugs } from "@/lib/outstatic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = seoPages.map((page) => ({
    url: new URL(page.path, SITE_URL).toString(),
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  const blogLanding: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  try {
    const posts = await getAllPostSlugs();
    const blogPosts: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.modified),
      changeFrequency: "monthly",
      priority: 0.7,
    }));
    return [...staticPages, ...blogLanding, ...blogPosts];
  } catch {
    return [...staticPages, ...blogLanding];
  }
}
