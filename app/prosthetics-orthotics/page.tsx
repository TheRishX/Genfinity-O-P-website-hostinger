import type { Metadata } from "next";
import { ServiceDetailPage } from "@/components/ServiceDetailPage";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("/prosthetics-orthotics/");

export default function ProstheticsOrthoticsPage() {
  return <ServiceDetailPage service="prosthetics" />;
}
