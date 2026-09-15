import "server-only";

import { cache } from "react";

const WORDPRESS_BLOG_URL = (
  process.env.WORDPRESS_BLOG_URL || "https://blog.genfinityoandp.com"
).replace(/\/$/, "");
const WORDPRESS_API_URL = `${WORDPRESS_BLOG_URL}/wp-json/wp/v2`;

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  date: string;
  modified: string;
  author: { name?: string; picture?: string };
  coverImage?: string;
  category?: string;
  tags?: Array<{ label: string; value: string }>;
  focusKeyword?: string;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noIndex?: boolean;
}

export interface PaginatedPosts {
  posts: BlogPost[];
  total: number;
  totalPages: number;
  page: number;
  perPage: number;
}

type WordPressTerm = { id: number; name: string; taxonomy: string };
type WordPressPost = {
  id: number;
  date: string;
  modified: string;
  slug: string;
  link: string;
  title?: { rendered?: string };
  excerpt?: { rendered?: string };
  content?: { rendered?: string };
  _embedded?: {
    author?: Array<{ name?: string; avatar_urls?: Record<string, string> }>;
    "wp:featuredmedia"?: Array<{ source_url?: string; alt_text?: string }>;
    "wp:term"?: WordPressTerm[][];
  };
};

function stripHtml(value = "") {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#8217;|&rsquo;/g, "’")
    .replace(/&#8220;|&ldquo;/g, "“")
    .replace(/&#8221;|&rdquo;/g, "”")
    .replace(/&#8211;|&ndash;/g, "–")
    .replace(/&#8212;|&mdash;/g, "—")
    .replace(/&#038;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function terms(post: WordPressPost) {
  return (post._embedded?.["wp:term"] || []).flat();
}

function normalizePost(post: WordPressPost): BlogPost {
  const media = post._embedded?.["wp:featuredmedia"]?.[0];
  const author = post._embedded?.author?.[0];
  const postTerms = terms(post);
  const categories = postTerms.filter((term) => term.taxonomy === "category");
  const tags = postTerms
    .filter((term) => term.taxonomy === "post_tag")
    .map((term) => ({ label: term.name, value: String(term.id) }));

  return {
    id: String(post.id),
    slug: post.slug,
    title: stripHtml(post.title?.rendered) || "Untitled article",
    description: stripHtml(post.excerpt?.rendered),
    content: post.content?.rendered || "",
    date: post.date,
    modified: post.modified,
    author: { name: author?.name || "Genfinity O&P", picture: author?.avatar_urls?.[96] },
    coverImage: media?.source_url,
    category: categories[0]?.name,
    tags,
  };
}

async function fetchPosts(query: Record<string, string>) {
  const url = new URL(`${WORDPRESS_API_URL}/posts`);
  url.searchParams.set("_embed", "1");
  url.searchParams.set("status", "publish");
  Object.entries(query).forEach(([key, value]) => url.searchParams.set(key, value));
  const response = await fetch(url, { next: { revalidate: 3600 } });
  if (!response.ok) throw new Error(`WordPress posts request failed (${response.status})`);
  return {
    posts: (await response.json() as WordPressPost[]).map(normalizePost),
    total: Number(response.headers.get("X-WP-Total") || 0),
    totalPages: Number(response.headers.get("X-WP-TotalPages") || 1),
  };
}

export const getPosts = cache(async (page = 1, perPage = 9): Promise<PaginatedPosts> => {
  const safePage = Math.max(1, Math.trunc(page));
  const safePerPage = Math.min(100, Math.max(1, Math.trunc(perPage)));
  const result = await fetchPosts({
    page: String(safePage),
    per_page: String(safePerPage),
    orderby: "date",
    order: "desc",
  });
  return { ...result, page: safePage, perPage: safePerPage };
});

export const getPostBySlug = cache(async (slug: string): Promise<BlogPost | null> => {
  if (!/^[a-z0-9-]+$/i.test(slug)) return null;
  const url = new URL(`${WORDPRESS_API_URL}/posts`);
  url.searchParams.set("_embed", "1");
  url.searchParams.set("slug", slug);
  url.searchParams.set("status", "publish");
  const response = await fetch(url, { next: { revalidate: 3600 } });
  if (!response.ok) throw new Error(`WordPress post request failed (${response.status})`);
  const posts = await response.json() as WordPressPost[];
  return posts[0] ? normalizePost(posts[0]) : null;
});

export const getAllPostSlugs = cache(async () => {
  const result = await fetchPosts({ per_page: "100", orderby: "date", order: "desc" });
  return result.posts.map((post) => ({ slug: post.slug, modified: post.modified }));
});

export function getFeaturedImage(post: BlogPost) {
  if (!post.coverImage) return null;
  return { url: post.coverImage, width: 1600, height: 900, alt: post.title };
}

export function getAuthor(post: BlogPost) {
  return post.author?.name || "Genfinity O&P";
}

export function getCategories(post: BlogPost) {
  if (post.category) return [{ id: post.category, name: post.category }];
  return (post.tags || []).map((tag) => ({ id: tag.value, name: tag.label }));
}

export function getPlainTitle(post: BlogPost) {
  return post.title;
}

export function getPlainExcerpt(post: BlogPost) {
  return post.description;
}

export function getReadingTime(post: BlogPost) {
  return Math.max(1, Math.ceil(stripHtml(post.content).split(/\s+/).filter(Boolean).length / 220));
}

export function getFrontendPostUrl(slug: string) {
  return `/blog/${slug}`;
}
