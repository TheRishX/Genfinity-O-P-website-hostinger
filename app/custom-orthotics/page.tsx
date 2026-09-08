import type { Metadata } from "next";
import { ServiceDetailPage } from "@/components/ServiceDetailPage";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("/custom-orthotics/");

export default function CustomOrthoticsPage() {
  return <ServiceDetailPage service="orthotics" />;
}
