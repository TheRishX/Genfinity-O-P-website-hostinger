import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LiveChat } from "@/components/LiveChat";
import { MobileCallBar } from "@/components/MobileCallBar";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL("https://genfinityoandp.com"),
  title: {
    default: "Genfinity O&P | Orthotics & Prosthetics in Tarzana, CA",
    template: "%s | Genfinity O&P",
  },
  description:
    "Personalized orthotics, prosthetics, and custom foot orthotics in Tarzana. Call Genfinity O&P at (888) 552-6188.",
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
        url: "/images/stock/prosthetic-community.webp",
        width: 1400,
        height: 933,
        alt: "A person moving confidently with a prosthetic leg",
      },
    ],
  },
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
      <body
        className="font-inter bg-slate-50 text-slate-800 antialiased"
        suppressHydrationWarning
      >
        <Navbar />
        <main className="min-h-screen pt-20">{children}</main>
        <Footer />
        <LiveChat />
        <MobileCallBar />
      </body>
    </html>
  );
}
