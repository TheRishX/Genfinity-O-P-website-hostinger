import type { Metadata } from "next";
import { ServiceDetailPage } from "@/components/ServiceDetailPage";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("/custom-foot-orthotics/");

export default function CustomFootOrthoticsPage() {
  return <ServiceDetailPage service="custom-insoles" />;
}
