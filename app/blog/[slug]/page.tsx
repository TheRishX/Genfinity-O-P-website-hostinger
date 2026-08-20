import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, Clock3, Phone, UserRound } from "lucide-react";
import { WordPressContent } from "@/components/blog/WordPressContent";
import {
  decodeHtml,
  getAllPostSlugs,
  getAuthor,
  getCategories,
  getFeaturedImage,
  getFrontendPostUrl,
  getPlainExcerpt,
  getPlainTitle,
  getPostBySlug,
  getPosts,
  getReadingTime,
  rewriteSchemaUrls,
  type YoastRobots,
} from "@/lib/wordpress";
import { DEFAULT_SOCIAL_IMAGE, SITE_NAME } from "@/lib/seo";

export const revalidate = 3600;
export const dynamicParams = true;

type PageProps = { params: Promise<{ slug: string }> };

function directiveNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value?.split(":").at(-1));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function imagePreview(robots: YoastRobots | undefined) {
  const value = robots?.["max-image-preview"]?.split(":").at(-1);
  return value === "none" || value === "standard" || value === "large"
    ? value
    : "large";
}

export async function generateStaticParams() {
  try {
    const posts = await getAllPostSlugs();
    return posts.slice(0, 30).map((post) => ({ slug: post.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  let post;
  try {
    post = await getPostBySlug(slug);
  } catch {
    return {
      title: "Article temporarily unavailable",
      robots: { index: false, follow: false },
    };
  }
  if (!post) return {};

  const seo = post.yoast_head_json || {};
  const title = decodeHtml(seo.title || getPlainTitle(post));
  const description = decodeHtml(seo.description || getPlainExcerpt(post));
  const canonical = getFrontendPostUrl(post.slug);
  const featured = getFeaturedImage(post);
  const ogImages = (seo.og_image?.length ? seo.og_image : featured ? [featured] : [])
    .map((image) => ({
      url: image.url,
      ...(image.width ? { width: image.width } : {}),
      ...(image.height ? { height: image.height } : {}),
      alt: image.alt || featured?.alt || title,
    }));
  const robots = seo.robots;

  return {
    title: { absolute: title },
    description,
    authors: [{ name: getAuthor(post) }],
    alternates: { canonical },
    robots: {
      index: robots?.index !== "noindex",
      follow: robots?.follow !== "nofollow",
      googleBot: {
        index: robots?.index !== "noindex",
        follow: robots?.follow !== "nofollow",
        "max-snippet": directiveNumber(robots?.["max-snippet"], -1),
        "max-image-preview": imagePreview(robots),
        "max-video-preview": directiveNumber(robots?.["max-video-preview"], -1),
      },
    },
    openGraph: {
      type: "article",
      locale: seo.og_locale || "en_US",
      siteName: decodeHtml(seo.og_site_name || SITE_NAME),
      url: canonical,
      title: decodeHtml(seo.og_title || title),
      description: decodeHtml(seo.og_description || description),
      publishedTime: seo.article_published_time || post.date,
      modifiedTime: seo.article_modified_time || post.modified,
      authors: [getAuthor(post)],
      images: ogImages.length ? ogImages : [{ url: DEFAULT_SOCIAL_IMAGE, alt: title }],
    },
    twitter: {
      card: seo.twitter_card || "summary_large_image",
      title: decodeHtml(seo.twitter_title || seo.og_title || title),
      description: decodeHtml(seo.twitter_description || seo.og_description || description),
      images: [seo.twitter_image || ogImages[0]?.url || DEFAULT_SOCIAL_IMAGE],
      ...(seo.twitter_creator ? { creator: seo.twitter_creator } : {}),
      ...(seo.twitter_site ? { site: seo.twitter_site } : {}),
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  let post;
  try {
    post = await getPostBySlug(slug);
  } catch {
    return (
      <main className="bg-slate-50 px-4 py-24 text-center sm:px-6">
        <h1 className="text-3xl font-bold text-brand-ink">This article is temporarily unavailable.</h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">Please try again shortly or explore the rest of our learning center.</p>
        <Link href="/blog" className="mt-7 inline-flex items-center gap-2 rounded-full bg-brand-red px-6 py-3 font-bold text-white"><ArrowLeft className="h-4 w-4" /> Back to all articles</Link>
      </main>
    );
  }
  if (!post) notFound();

  const title = getPlainTitle(post);
  const featured = getFeaturedImage(post);
  const categories = getCategories(post);
  const schema = post.yoast_head_json?.schema
    ? rewriteSchemaUrls(post.yoast_head_json.schema, post.slug)
    : null;
  let relatedPosts: Awaited<ReturnType<typeof getPosts>>["posts"] = [];
  try {
    relatedPosts = (await getPosts(1, 4)).posts.filter((item) => item.id !== post.id).slice(0, 3);
  } catch {
    // Related reading is optional; the article remains fully usable.
  }

  return (
    <main className="bg-white">
      {schema !== null && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema)
              .replace(/</g, "\\u003c")
              .replace(/\u2028/g, "\\u2028")
              .replace(/\u2029/g, "\\u2029"),
          }}
        />
      )}

      <article>
        <header className="relative overflow-hidden border-b border-slate-200 bg-slate-50">
          <div className="hero-grid pointer-events-none absolute inset-0 opacity-40" />
          <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-sm text-slate-500">
              <Link href="/blog" className="font-semibold hover:text-brand-red">Learning Center</Link>
              <span aria-hidden="true">/</span>
              <span className="truncate">{categories[0]?.name || "Article"}</span>
            </nav>
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => <span key={category.id} className="rounded-full border border-brand-red/15 bg-red-50 px-3 py-1.5 text-xs font-bold text-brand-red">{category.name}</span>)}
              </div>
            )}
            <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-[1.08] text-brand-ink sm:text-5xl lg:text-6xl">{title}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-600">{getPlainExcerpt(post)}</p>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2"><UserRound className="h-4 w-4 text-brand-red" />{getAuthor(post)}</span>
              <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-brand-red" />{new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(post.date))}</span>
              <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-brand-red" />{getReadingTime(post)} minute read</span>
            </div>
          </div>
        </header>

        {featured && (
          <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8 lg:pt-12">
            <div className="relative aspect-[16/9] overflow-hidden rounded-[2rem] bg-slate-100 shadow-2xl shadow-slate-200/70">
              <Image src={featured.url} alt={featured.alt} fill priority sizes="(max-width: 1200px) 94vw, 1152px" className="object-cover" />
            </div>
          </div>
        )}

        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,760px)_260px] lg:px-8 lg:py-16">
          <WordPressContent html={post.content.rendered} />
          <aside className="h-fit lg:sticky lg:top-32">
            <div className="rounded-3xl bg-brand-ink p-6 text-white shadow-xl">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-red-300">Need a clearer answer?</p>
              <h2 className="mt-3 text-2xl font-bold">Talk with our care team.</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/70">Your symptoms and goals are personal. We can help you understand the most useful next step.</p>
              <a href="tel:8885526188" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-red px-5 py-3 font-bold text-white"><Phone className="h-4 w-4" /> (888) 552-6188</a>
              <Link href="/contact" className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-bold text-white">Contact us <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </aside>
        </div>
      </article>

      {relatedPosts.length > 0 && (
        <section className="border-t border-slate-200 bg-slate-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4">
              <div><p className="text-xs font-bold uppercase tracking-[.18em] text-brand-red">Keep learning</p><h2 className="mt-2 text-3xl font-bold text-brand-ink">Related reading</h2></div>
              <Link href="/blog" className="hidden items-center gap-2 font-bold text-brand-red sm:inline-flex">View all <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {relatedPosts.map((related) => {
                const image = getFeaturedImage(related);
                return <Link key={related.id} href={`/blog/${related.slug}`} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><div className="relative aspect-[16/10] bg-slate-100"><Image src={image?.url || DEFAULT_SOCIAL_IMAGE} alt={image?.alt || getPlainTitle(related)} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-[1.04]" /></div><div className="p-5"><p className="text-xs font-semibold text-brand-red">{getReadingTime(related)} min read</p><h3 className="mt-2 line-clamp-2 text-lg font-bold leading-snug text-brand-ink group-hover:text-brand-red">{getPlainTitle(related)}</h3></div></Link>;
              })}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
