import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { DEFAULT_SOCIAL_IMAGE, SITE_URL } from "@/lib/seo";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Genfinity O&P | Orthotics & Prosthetics in Tarzana, CA",
    template: "%s | Genfinity O&P",
  },
  description:
    "Personalized orthotics, prosthetics, and custom foot orthotics in Tarzana. Call Genfinity O&P at (888) 552-6188.",
  alternates: { canonical: "/" },
  applicationName: "Genfinity O&P",
  authors: [{ name: "Genfinity O&P", url: SITE_URL }],
  creator: "Genfinity O&P",
  publisher: "Genfinity O&P",
  category: "healthcare",
  referrer: "origin-when-cross-origin",
  formatDetection: { email: false, address: false, telephone: false },
  keywords: [
    "orthotics Tarzana",
    "prosthetics Tarzana",
    "custom foot orthotics Los Angeles",
    "prosthetic clinic Tarzana",
    "Genfinity O&P",
  ],
  openGraph: {
    title: "Genfinity O&P | Move with more comfort and confidence",
    description:
      "25+ years of clinical experience, careful fitting, and patient-first orthotic and prosthetic care in Tarzana.",
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Genfinity O&P",
    images: [
      {
        url: DEFAULT_SOCIAL_IMAGE,
        width: 2528,
        height: 1686,
        alt: "A person moving confidently with a prosthetic leg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Genfinity O&P | Orthotics & Prosthetics in Tarzana, CA",
    description:
      "Personalized orthotic, prosthetic, and custom foot orthotic care in Tarzana, Los Angeles.",
    images: [DEFAULT_SOCIAL_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const clinicStructuredData = {
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  "@id": `${SITE_URL}/#clinic`,
  name: "Genfinity O&P",
  legalName: "GENFINITY O&P LLC",
  url: SITE_URL,
  telephone: "+1-888-552-6188",
  email: "support@genfinityoandp.com",
  image: `${SITE_URL}${DEFAULT_SOCIAL_IMAGE}`,
  logo: `${SITE_URL}/images/brand/genfinity-logo-uploaded.webp`,
  description:
    "Patient-first orthotic, prosthetic, and custom foot orthotic care in Tarzana, California.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "18401 Burbank Blvd, Suite 215",
    addressLocality: "Tarzana",
    addressRegion: "CA",
    postalCode: "91356",
    addressCountry: "US",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "10:00",
      closes: "18:00",
    },
  ],
  areaServed: ["Tarzana", "Los Angeles", "San Fernando Valley"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${inter.variable} scroll-smooth`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(clinicStructuredData).replace(/</g, "\\u003c"),
          }}
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-314681422"
          strategy="afterInteractive"
        />
        <Script id="google-ads-tag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-314681422');
          `}
        </Script>
      </head>
      <body
        className="font-inter bg-slate-50 text-slate-800 antialiased"
        suppressHydrationWarning
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
