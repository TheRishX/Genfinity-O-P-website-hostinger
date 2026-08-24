import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { IntakeDashboard } from "@/components/staff/IntakeDashboard";

export const metadata: Metadata = {
  title: "Patient Care | Genfinity O&P",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default function StaffIntakesPage() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    !process.env.OWNER_EMAIL
  )
    redirect("/staff/login");
  return (
    <div className="min-h-screen bg-slate-50">
      <IntakeDashboard />
    </div>
  );
}
