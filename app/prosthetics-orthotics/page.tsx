import type { Metadata } from "next";
import { ServiceDetailPage } from "@/components/ServiceDetailPage";
import { pageMetadata } from "@/app/seo";

export const generateMetadata = (): Promise<Metadata> => pageMetadata("/prosthetics-orthotics/");

export default function ProstheticsOrthoticsPage() {
  return <ServiceDetailPage service="prosthetics" />;
}
