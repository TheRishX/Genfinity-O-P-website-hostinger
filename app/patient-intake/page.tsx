import type { Metadata } from "next";
import { PatientIntakeForm } from "@/components/intake/PatientIntakeForm";

export const metadata: Metadata = {
  title: "New Patient Intake | Genfinity O&P",
  description:
    "Complete your Genfinity O&P new patient intake in a guided, mobile-friendly form.",
  robots: { index: false, follow: false },
};

export default function PatientIntakePage() {
  return (
    <main className="min-h-screen bg-slate-50 pt-4">
      <PatientIntakeForm />
    </main>
  );
}
