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
    !process.env.MYSQL_DATABASE ||
    !process.env.MYSQL_USER ||
    !process.env.MYSQL_PASSWORD ||
    !process.env.OWNER_EMAIL
  )
    redirect("/staff/login");
  return (
    <div className="min-h-screen bg-slate-50">
      <IntakeDashboard />
    </div>
  );
}
