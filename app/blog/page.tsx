import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, Clock3, UserRound } from "lucide-react";
import { notFound } from "next/navigation";
import {
  getAuthor,
  getCategories,
  getFeaturedImage,
  getPlainExcerpt,
  getPlainTitle,
  getPosts,
  getReadingTime,
} from "@/lib/outstatic";
import { DEFAULT_SOCIAL_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo";

const PAGE_SIZE = 9;

// Outstatic content is committed to GitHub and included during the Vercel build.
// Keeping the index static ensures the serverless runtime does not need to read
// the local content database after deployment.
export const dynamic = "force-static";

const blogDescription =
  "Practical guidance about orthotics, prosthetics, foot pain, mobility, device care, and preparing for treatment from Genfinity O&P.";

export async function generateMetadata(): Promise<Metadata> {
  const suffix = "";
  const canonical = `${SITE_URL}/blog`;
  return {
    title: `Orthotics & Prosthetics Blog${suffix}`,
    description: blogDescription,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: SITE_NAME,
      url: canonical,
      title: `Orthotics & Prosthetics Blog${suffix} | Genfinity O&P`,
      description:
        "Clear, useful guidance to help you understand your options and move forward with confidence.",
      images: [{ url: DEFAULT_SOCIAL_IMAGE, alt: "Genfinity O&P patient education" }],
    },
    twitter: {
      card: "summary_large_image",
      title: `Orthotics & Prosthetics Blog${suffix} | Genfinity O&P`,
      description:
        "Practical guidance about mobility, orthotics, prosthetics, and foot health.",
      images: [DEFAULT_SOCIAL_IMAGE],
    },
  };
}

function pageHref(page: number) {
  return page <= 1 ? "/blog" : `/blog?page=${page}`;
}

export default async function BlogPage() {
  const page = 1;

  let result;
  try {
    result = await getPosts(page, PAGE_SIZE);
  } catch {
    return (
      <main className="bg-slate-50 px-4 py-24 text-center sm:px-6">
        <BookOpen className="mx-auto h-12 w-12 text-brand-red" />
        <h1 className="mt-5 text-3xl font-bold text-brand-ink">Our articles are temporarily unavailable.</h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">Please try again shortly. You can still call our team at (888) 552-6188 with questions.</p>
      </main>
    );
  }

  if (page > result.totalPages && result.totalPages > 0) notFound();
  const featured = page === 1 ? result.posts[0] : null;
  const posts = featured ? result.posts.slice(1) : result.posts;

  return (
    <main className="bg-slate-50">
      <section className="relative overflow-hidden border-b border-slate-200 bg-white py-16 sm:py-20 lg:py-24">
        <div className="hero-grid pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-red/15 bg-red-50 px-4 py-2 text-sm font-bold text-brand-red">
              <BookOpen className="h-4 w-4" /> Genfinity Learning Center
            </div>
            <h1 className="mt-6 text-4xl font-bold leading-tight text-brand-ink sm:text-5xl lg:text-6xl">
              Clear answers for your next step.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
              Useful guidance about foot pain, orthotics, prosthetics, mobility, and what to expect from care—written to make complex decisions feel simpler.
            </p>
          </div>
        </div>
      </section>

      {featured && (
        <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8 lg:pt-16">
          <Link href={`/blog/${featured.slug}`} className="group grid overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/50 lg:grid-cols-[1.18fr_.82fr]">
            <div className="relative min-h-72 overflow-hidden bg-slate-100 sm:min-h-96">
              <Image
                src={getFeaturedImage(featured)?.url || DEFAULT_SOCIAL_IMAGE}
                alt={getFeaturedImage(featured)?.alt || getPlainTitle(featured)}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover transition duration-700 group-hover:scale-[1.035]"
              />
            </div>
            <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
              <p className="text-xs font-bold uppercase tracking-[.2em] text-brand-red">Featured article</p>
              <h2 className="mt-4 text-3xl font-bold leading-tight text-brand-ink sm:text-4xl">{getPlainTitle(featured)}</h2>
              <p className="mt-5 line-clamp-3 leading-relaxed text-slate-600">{getPlainExcerpt(featured)}</p>
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />{new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(featured.date))}</span>
                <span className="inline-flex items-center gap-1.5"><Clock3 className="h-4 w-4" />{getReadingTime(featured)} min read</span>
              </div>
              <span className="mt-8 inline-flex items-center gap-2 font-bold text-brand-red">Read article <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
            </div>
          </Link>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-brand-red">Latest guidance</p>
            <h2 className="mt-2 text-3xl font-bold text-brand-ink">Explore all articles</h2>
          </div>
          <p className="hidden text-sm text-slate-500 sm:block">{result.total} articles</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const image = getFeaturedImage(post);
            const category = getCategories(post)[0];
            return (
              <article key={post.id} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60">
                <Link href={`/blog/${post.slug}`} className="block">
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    <Image src={image?.url || DEFAULT_SOCIAL_IMAGE} alt={image?.alt || getPlainTitle(post)} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover transition duration-500 group-hover:scale-[1.04]" />
                    {category && <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-brand-red shadow-sm backdrop-blur">{category.name}</span>}
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(post.date))}</span>
                      <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />{getReadingTime(post)} min</span>
                    </div>
                    <h3 className="mt-4 line-clamp-2 text-xl font-bold leading-snug text-brand-ink transition group-hover:text-brand-red">{getPlainTitle(post)}</h3>
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600">{getPlainExcerpt(post)}</p>
                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
                      <span className="inline-flex min-w-0 items-center gap-1.5 truncate text-slate-500"><UserRound className="h-4 w-4 shrink-0" />{getAuthor(post)}</span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-brand-red transition group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>

        {result.totalPages > 1 && (
          <nav aria-label="Blog pagination" className="mt-12 flex items-center justify-center gap-2">
            {page > 1 && <Link href={pageHref(page - 1)} className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-brand-ink hover:border-brand-red hover:text-brand-red">Previous</Link>}
            {Array.from({ length: result.totalPages }, (_, index) => index + 1).map((number) => (
              <Link key={number} href={pageHref(number)} aria-current={number === page ? "page" : undefined} className={`grid h-10 w-10 place-items-center rounded-full text-sm font-bold ${number === page ? "bg-brand-red text-white" : "border border-slate-200 bg-white text-slate-600 hover:border-brand-red hover:text-brand-red"}`}>{number}</Link>
            ))}
            {page < result.totalPages && <Link href={pageHref(page + 1)} className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-brand-ink hover:border-brand-red hover:text-brand-red">Next</Link>}
          </nav>
        )}
      </section>
    </main>
  );
}
