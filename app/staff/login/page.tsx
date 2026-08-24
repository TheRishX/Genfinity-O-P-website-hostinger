import type { Metadata } from "next";
import { StaffLogin } from "@/components/staff/StaffLogin";

export const metadata: Metadata = {
  title: "Owner Sign In | Genfinity O&P",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default function StaffLoginPage() {
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) &&
    process.env.OWNER_EMAIL,
  );
  return (
    <div className="grid min-h-screen place-items-center overflow-y-auto bg-[#f6f7f8] px-4 py-10">
      <div className="mx-auto max-w-md">
        <StaffLogin configured={configured} />
      </div>
    </div>
  );
}
