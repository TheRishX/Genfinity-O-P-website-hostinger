import type { Metadata } from "next";
import { ResetOwnerPassword } from "@/components/staff/ResetOwnerPassword";

export const metadata: Metadata = {
  title: "Set Owner Password | Genfinity O&P",
  robots: { index: false, follow: false },
};

export default async function ResetOwnerPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const token = (await searchParams).token || "";
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-md">
        <ResetOwnerPassword token={token} />
      </div>
    </main>
  );
}
