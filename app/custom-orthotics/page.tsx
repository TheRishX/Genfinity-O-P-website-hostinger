import type { Metadata } from "next";
import { ServiceDetailPage } from "@/components/ServiceDetailPage";
import { pageMetadata } from "@/app/seo";

export const generateMetadata = (): Promise<Metadata> => pageMetadata("/custom-orthotics/");

export default function CustomOrthoticsPage() {
  return <ServiceDetailPage service="orthotics" />;
}
