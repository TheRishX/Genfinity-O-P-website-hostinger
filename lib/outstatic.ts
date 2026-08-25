import "server-only";

import { cache } from "react";
import {
  getDocumentBySlug,
  getDocumentSlugs,
} from "outstatic/server";
import { SITE_URL } from "@/lib/seo";

const POST_FIELDS = [
  "title",
  "description",
  "publishedAt",
  "slug",
  "coverImage",
  "author",
  "content",
  "status",
  "category",
  "tags",
] as const;

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
  status?: "published" | "draft";
}

export interface PaginatedPosts {
  posts: BlogPost[];
  total: number;
  totalPages: number;
  page: number;
  perPage: number;
}

type RawPost = Partial<BlogPost> & {
  publishedAt?: string | Date;
  author?: BlogPost["author"] | string;
  description?: string;
};

function normalizePost(raw: RawPost): BlogPost {
  const date = raw.publishedAt ? new Date(raw.publishedAt).toISOString() : new Date().toISOString();
  return {
    id: raw.slug || raw.title || date,
    slug: raw.slug || "",
    title: raw.title || "Untitled article",
    description: raw.description || "",
    content: raw.content || "",
    date,
    modified: date,
    author: typeof raw.author === "string" ? { name: raw.author } : raw.author || { name: "Genfinity O&P" },
    coverImage: raw.coverImage,
    category: raw.category,
    tags: raw.tags,
    status: raw.status,
  };
}

function publishedPosts() {
  return getDocumentSlugs("posts")
    .map((slug) => getDocumentBySlug("posts", slug, [...POST_FIELDS]))
    .filter((post): post is NonNullable<typeof post> => Boolean(post))
    .map((post) => normalizePost(post as unknown as RawPost))
    .filter((post) => post.status !== "draft");
}

export const getPosts = cache(async (page = 1, perPage = 9): Promise<PaginatedPosts> => {
  const safePage = Math.max(1, Math.trunc(page));
  const safePerPage = Math.min(100, Math.max(1, Math.trunc(perPage)));
  const allPosts = publishedPosts();
  const start = (safePage - 1) * safePerPage;
  return {
    posts: allPosts.slice(start, start + safePerPage),
    total: allPosts.length,
    totalPages: Math.max(1, Math.ceil(allPosts.length / safePerPage)),
    page: safePage,
    perPage: safePerPage,
  };
});

export const getPostBySlug = cache(async (slug: string): Promise<BlogPost | null> => {
  if (!/^[a-z0-9-]+$/i.test(slug)) return null;
  const post = getDocumentBySlug("posts", slug, [...POST_FIELDS]);
  if (!post) return null;
  const normalized = normalizePost(post as unknown as RawPost);
  return normalized.status === "draft" ? null : normalized;
});

export const getAllPostSlugs = cache(async () =>
  getDocumentSlugs("posts").map((slug) => ({ slug, modified: new Date().toISOString() })),
);

export function getFeaturedImage(post: BlogPost) {
  if (!post.coverImage) return null;
  return {
    url: post.coverImage.startsWith("http") ? post.coverImage : `${SITE_URL}${post.coverImage}`,
    width: 1600,
    height: 900,
    alt: post.title,
  };
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
  return Math.max(1, Math.ceil(post.content.trim().split(/\s+/).filter(Boolean).length / 220));
}

export function getFrontendPostUrl(slug: string) {
  return `${SITE_URL}/blog/${slug}`;
}
