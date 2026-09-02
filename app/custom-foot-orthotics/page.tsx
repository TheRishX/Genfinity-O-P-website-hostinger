import type { Metadata } from "next";
import { ServiceDetailPage } from "@/app/services/[service]/page";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("/custom-foot-orthotics/");

export default function CustomFootOrthoticsPage() {
  return <ServiceDetailPage service="custom-insoles" />;
}
