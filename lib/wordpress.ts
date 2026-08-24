import "server-only";

import { cache } from "react";
import { SITE_URL } from "@/lib/seo";

export const WORDPRESS_URL =
  process.env.WORDPRESS_URL ||
  "https://slategrey-magpie-594089.hostingersite.com";

const API_URL = `${WORDPRESS_URL.replace(/\/$/, "")}/wp-json/wp/v2`;
const REVALIDATE_SECONDS = 3600;
const REQUEST_TIMEOUT_MS = 15000;

export interface RenderedField {
  rendered: string;
  protected?: boolean;
}

export interface YoastImage {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
  type?: string;
}

export interface YoastRobots {
  index?: string;
  follow?: string;
  "max-snippet"?: string;
  "max-image-preview"?: string;
  "max-video-preview"?: string;
}

export interface YoastSeo {
  title?: string;
  description?: string;
  robots?: YoastRobots;
  canonical?: string;
  og_locale?: string;
  og_type?: string;
  og_title?: string;
  og_description?: string;
  og_url?: string;
  og_site_name?: string;
  article_publisher?: string;
  article_published_time?: string;
  article_modified_time?: string;
  og_image?: YoastImage[];
  author?: string;
  twitter_card?: "summary" | "summary_large_image" | "player" | "app";
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  twitter_creator?: string;
  twitter_site?: string;
  twitter_misc?: Record<string, string>;
  schema?: Record<string, unknown>;
}

export interface WordPressMedia {
  id: number;
  source_url: string;
  alt_text?: string;
  media_details?: {
    width?: number;
    height?: number;
  };
}

export interface WordPressAuthor {
  id: number;
  name: string;
  avatar_urls?: Record<string, string>;
}

export interface WordPressTerm {
  id: number;
  name: string;
  slug: string;
  taxonomy: "category" | "post_tag" | string;
}

export interface WordPressPost {
  id: number;
  slug: string;
  link: string;
  date: string;
  modified: string;
  title: RenderedField;
  excerpt: RenderedField;
  content: RenderedField;
  featured_media: number;
  yoast_head_json?: YoastSeo;
  _embedded?: {
    author?: WordPressAuthor[];
    "wp:featuredmedia"?: WordPressMedia[];
    "wp:term"?: WordPressTerm[][];
  };
}

export interface PaginatedPosts {
  posts: WordPressPost[];
  total: number;
  totalPages: number;
  page: number;
  perPage: number;
}

export interface PostImage {
  url: string;
  width: number;
  height: number;
  alt: string;
}

function buildApiUrl(path: string, params: Record<string, string | number>) {
  const url = new URL(`${API_URL}/${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }
  return url;
}

async function fetchWordPress(url: URL) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
      next: { revalidate: REVALIDATE_SECONDS, tags: ["wordpress-posts"] },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(`WordPress request timed out after ${REQUEST_TIMEOUT_MS}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`WordPress request failed with status ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new Error("WordPress returned a non-JSON response");
  }

  return response;
}

async function readJson<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    throw new Error("WordPress returned invalid JSON");
  }
}

export const getPosts = cache(
  async (page = 1, perPage = 9): Promise<PaginatedPosts> => {
    const safePage = Math.max(1, Math.trunc(page));
    const safePerPage = Math.min(100, Math.max(1, Math.trunc(perPage)));
    const url = buildApiUrl("posts", {
      status: "publish",
      page: safePage,
      per_page: safePerPage,
      _embed: 1,
    });
    const response = await fetchWordPress(url);
    const posts = await readJson<WordPressPost[]>(response);
    if (!Array.isArray(posts)) {
      throw new Error("WordPress returned an invalid posts payload");
    }

    return {
      posts,
      total: Number(response.headers.get("X-WP-Total") || posts.length),
      totalPages: Number(response.headers.get("X-WP-TotalPages") || 1),
      page: safePage,
      perPage: safePerPage,
    };
  },
);

export const getPostBySlug = cache(
  async (slug: string): Promise<WordPressPost | null> => {
    if (!/^[a-z0-9-]+$/i.test(slug)) return null;
    const url = buildApiUrl("posts", {
      slug,
      status: "publish",
      per_page: 1,
      _embed: 1,
    });
    const response = await fetchWordPress(url);
    const posts = await readJson<WordPressPost[]>(response);
    if (!Array.isArray(posts)) {
      throw new Error("WordPress returned an invalid post payload");
    }
    return posts[0] || null;
  },
);

export interface WordPressPostReference {
  id: number;
  slug: string;
  modified: string;
}

export const getAllPostSlugs = cache(async (): Promise<WordPressPostReference[]> => {
  const fetchPage = async (page: number) => {
    const url = buildApiUrl("posts", {
      status: "publish",
      page,
      per_page: 100,
      _fields: "id,slug,modified",
    });
    const response = await fetchWordPress(url);
    return {
      posts: await readJson<WordPressPostReference[]>(response),
      totalPages: Number(response.headers.get("X-WP-TotalPages") || 1),
    };
  };

  const first = await fetchPage(1);
  if (first.totalPages <= 1) return first.posts;
  const remaining = await Promise.all(
    Array.from({ length: first.totalPages - 1 }, (_, index) =>
      fetchPage(index + 2).then((result) => result.posts),
    ),
  );
  return [first.posts, ...remaining].flat();
});

export function getFeaturedImage(post: WordPressPost): PostImage | null {
  const media = post._embedded?.["wp:featuredmedia"]?.[0];
  const yoastImage = post.yoast_head_json?.og_image?.[0];
  const url = media?.source_url || yoastImage?.url;
  if (!url) return null;

  return {
    url,
    width: media?.media_details?.width || yoastImage?.width || 1600,
    height: media?.media_details?.height || yoastImage?.height || 900,
    alt:
      media?.alt_text ||
      yoastImage?.alt ||
      decodeHtml(stripHtml(post.title.rendered)),
  };
}

export function getAuthor(post: WordPressPost) {
  return post._embedded?.author?.[0]?.name || post.yoast_head_json?.author || "Genfinity O&P";
}

export function getCategories(post: WordPressPost) {
  return (post._embedded?.["wp:term"] || [])
    .flat()
    .filter((term) => term.taxonomy === "category" && term.slug !== "uncategorized");
}

export function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function decodeHtml(value: string) {
  const named: Record<string, string> = {
    amp: "&",
    apos: "'",
    quot: '"',
    lt: "<",
    gt: ">",
    nbsp: " ",
    ndash: "–",
    mdash: "—",
    rsquo: "’",
    lsquo: "‘",
    rdquo: "”",
    ldquo: "“",
    hellip: "…",
  };

  return value.replace(/&(#x?[\da-f]+|[a-z]+);/gi, (match, entity: string) => {
    if (entity[0] === "#") {
      const isHex = entity[1]?.toLowerCase() === "x";
      const code = Number.parseInt(entity.slice(isHex ? 2 : 1), isHex ? 16 : 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    return named[entity.toLowerCase()] ?? match;
  });
}

export function getPlainTitle(post: WordPressPost) {
  return decodeHtml(stripHtml(post.title.rendered));
}

export function getPlainExcerpt(post: WordPressPost) {
  return decodeHtml(stripHtml(post.excerpt.rendered));
}

export function getReadingTime(post: WordPressPost) {
  const yoastEstimate = post.yoast_head_json?.twitter_misc?.["Est. reading time"];
  const match = yoastEstimate?.match(/\d+/);
  if (match) return Math.max(1, Number(match[0]));
  return Math.max(1, Math.ceil(stripHtml(post.content.rendered).split(/\s+/).length / 220));
}

export function getFrontendPostUrl(slug: string) {
  return `${SITE_URL}/blog/${slug}`;
}

export function rewriteSchemaUrls(value: unknown, slug: string): unknown {
  const backend = WORDPRESS_URL.replace(/\/$/, "");
  const backendPost = `${backend}/${slug}`;
  const frontendPost = getFrontendPostUrl(slug);

  if (typeof value === "string") {
    if (value.startsWith(`${backend}/wp-content/`)) return value;
    return value
      .replaceAll(backendPost, frontendPost)
      .replaceAll(backend, SITE_URL);
  }
  if (Array.isArray(value)) return value.map((item) => rewriteSchemaUrls(item, slug));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, rewriteSchemaUrls(item, slug)]),
    );
  }
  return value;
}
