"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";
import { MobileCallBar } from "@/components/MobileCallBar";
import { Navbar } from "@/components/Navbar";
import { CookieConsent } from "@/components/marketing/CookieConsent";
import { MarketingScripts } from "@/components/marketing/MarketingScripts";
import type { PublicTracking } from "@/app/shared/site-settings/schema";

// Admin areas and pages that collect patient health information never load marketing tags.
const NO_MARKETING = ["/staff", "/seo", "/patient-intake"];

export function AppShell({
  children,
  tracking,
  cookieText,
}: {
  children: React.ReactNode;
  tracking: PublicTracking;
  cookieText: string;
}) {
  const pathname = usePathname();
  const isSeoAdmin = pathname === "/seo" || pathname.startsWith("/seo/");
  const isStaffRoute = pathname.startsWith("/staff") || isSeoAdmin;
  const marketingAllowed = !NO_MARKETING.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  // Tags loaded on a public page survive client-side navigation. Entering a
  // protected area afterwards triggers a clean page load so no pixel runs there.
  useEffect(() => {
    if (!marketingAllowed && (window as Window & { __MKT_LOADED?: boolean }).__MKT_LOADED) window.location.reload();
  }, [marketingAllowed]);
  return (
    <>
      {!isStaffRoute && <Navbar />}
      <main
        className={
          isStaffRoute
            ? `staff-app-shell min-h-screen bg-slate-50${isSeoAdmin ? " seo-admin-shell" : ""}`
            : "min-h-screen pt-20"
        }
      >
        {children}
      </main>
      {!isStaffRoute && (
        <>
          <Footer />
          <MobileCallBar />
        </>
      )}
      {marketingAllowed && (
        <>
          <CookieConsent text={cookieText} />
          <MarketingScripts config={tracking} />
        </>
      )}
    </>
  );
}

// Hostinger deployment source marker.
