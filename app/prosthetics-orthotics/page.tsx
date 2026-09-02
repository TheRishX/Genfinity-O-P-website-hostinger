import type { Metadata } from "next";
import { ServiceDetailPage } from "@/app/services/[service]/page";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("/prosthetics-orthotics/");

export default function ProstheticsOrthoticsPage() {
  return <ServiceDetailPage service="prosthetics" />;
}
