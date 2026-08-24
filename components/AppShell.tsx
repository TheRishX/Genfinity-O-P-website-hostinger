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
      {!isStaffRoute && <Navbar />}
      <main
        className={
          isStaffRoute
            ? "staff-app-shell min-h-screen bg-slate-50"
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
