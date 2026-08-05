import type {Metadata} from 'next';
import { Outfit, Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LiveChat } from '@/components/LiveChat';
import { MobileCallBar } from '@/components/MobileCallBar';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Genfinity O&P | Orthotics and Prosthetics Clinic Tarzana, CA',
  description: 'Premium orthotics and prosthetics care in Tarzana, California. We provide personalized, compassionate solutions for our patients.',
  keywords: 'Orthotics, Prosthetics, Clinic, Tarzana, CA, Genfinity O&P, Deepak Kumar Bhardwaj',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable} scroll-smooth`}>
      <body className="font-inter bg-slate-50 text-slate-800 antialiased" suppressHydrationWarning>
        <Navbar />
        <main className="min-h-screen pt-20">
          {children}
        </main>
        <Footer />
        <LiveChat />
        <MobileCallBar />
      </body>
    </html>
  );
}
