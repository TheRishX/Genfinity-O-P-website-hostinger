import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { IntakeDashboard } from "@/components/staff/IntakeDashboard";
import { requireOwner } from "@/lib/intake/security";

export const metadata: Metadata = {
  title: "Patient Intakes | Genfinity O&P",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function StaffIntakesPage() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    !process.env.OWNER_EMAIL
  )
    redirect("/staff/login");
  if (!(await requireOwner())) redirect("/staff/login");
  return (
    <div className="h-full min-h-0 bg-slate-50">
      <IntakeDashboard />
    </div>
  );
}
