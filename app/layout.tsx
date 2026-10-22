import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { DEFAULT_SOCIAL_IMAGE, SITE_URL } from "@/app/seo";
import { buildLocalBusinessJsonLd } from "@/app/shared/site-settings/schema";
import { getPublicSiteConfig, getSettings } from "@/app/shared/site-settings/store";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// Re-check admin settings at least hourly; saving in /seo revalidates immediately.
export const revalidate = 3600;

const ROBOTS_MAP = {
  "index, follow": { index: true, follow: true },
  "noindex, follow": { index: false, follow: true },
  "index, nofollow": { index: true, follow: false },
  "noindex, nofollow": { index: false, follow: false },
} as const;

// Site-wide defaults managed from the /seo admin portal.
export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getSettings();
  const base = seo.canonicalBase || SITE_URL;
  const siteName = seo.ogSiteName || "Genfinity O&P";
  const robots = ROBOTS_MAP[seo.robots];
  const image = seo.ogImage
    ? { url: seo.ogImage, width: 1200, height: 630, alt: siteName }
    : { url: DEFAULT_SOCIAL_IMAGE, width: 2528, height: 1686, alt: "A person moving confidently with a prosthetic leg" };
  const keywords = seo.keywords.split(",").map((item) => item.trim()).filter(Boolean);

  return {
    metadataBase: new URL(base),
    title: { default: seo.siteTitle, template: seo.titleTemplate || "%s" },
    description: seo.metaDescription || undefined,
    alternates: { canonical: "/" },
    applicationName: siteName,
    authors: [{ name: siteName, url: base }],
    creator: siteName,
    publisher: siteName,
    category: "healthcare",
    referrer: "origin-when-cross-origin",
    formatDetection: { email: false, address: false, telephone: false },
    keywords: keywords.length ? keywords : undefined,
    openGraph: {
      title: seo.ogTitle || seo.siteTitle,
      description: seo.ogDescription || seo.metaDescription || undefined,
      type: "website",
      locale: "en_US",
      url: "/",
      siteName,
      images: [image],
    },
    twitter: {
      card: seo.twitterCard,
      site: seo.twitterHandle || undefined,
      title: seo.ogTitle || seo.siteTitle,
      description: seo.ogDescription || seo.metaDescription || undefined,
      images: [image.url],
    },
    robots: {
      ...robots,
      googleBot: { ...robots, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
    verification: {
      google: seo.gscVerification || undefined,
      other: seo.bingVerification ? { "msvalidate.01": seo.bingVerification } : undefined,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { seo } = await getSettings();
  const base = seo.canonicalBase || SITE_URL;
  const clinicStructuredData = buildLocalBusinessJsonLd(seo, seo.ogImage || `${base}${DEFAULT_SOCIAL_IMAGE}`);
  const { tracking, cookieText } = await getPublicSiteConfig();
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${inter.variable} scroll-smooth`}
    >
      <head>
        {clinicStructuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(clinicStructuredData).replace(/</g, "\\u003c"),
            }}
          />
        )}
      </head>
      <body
        className="font-inter bg-slate-50 text-slate-800 antialiased"
        suppressHydrationWarning
      >
        <AppShell tracking={tracking} cookieText={cookieText}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
