"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";
import { MobileCallBar } from "@/components/MobileCallBar";
import { Navbar } from "@/components/Navbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStaffRoute = pathname.startsWith("/staff");

  return (
    <>
      <Navbar />
      <main
        className={
          isStaffRoute
            ? "staff-app-shell fixed inset-0 overflow-hidden bg-slate-50 pt-[72px] lg:pt-[108px]"
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
    </>
  );
}
