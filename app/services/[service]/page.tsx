import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetailPage, type ServiceKey } from "@/components/ServiceDetailPage";

const serviceSeo = {
  orthotics: "/services/orthotics",
  prosthetics: "/services/prosthetics",
  "custom-insoles": "/services/custom-insoles",
} as const;

export async function generateMetadata({ params }: { params: Promise<{ service: string }> }): Promise<Metadata> {
  const { service } = await params;
  const path = serviceSeo[service as keyof typeof serviceSeo];
  if (!path) return {};
  const { pageMetadata } = await import("@/lib/seo");
  const labels = { orthotics: "Custom orthotic care", prosthetics: "Personalized prosthetic care", "custom-insoles": "Custom foot orthotics" };
  return { ...pageMetadata(path), title: { absolute: `${labels[service as ServiceKey]} | Genfinity O&P` } };
}

export function generateStaticParams() {
  return Object.keys(serviceSeo).map((service) => ({ service }));
}

export default async function ServiceDetail({ params }: { params: Promise<{ service: string }> }) {
  const { service } = await params;
  if (!(service in serviceSeo)) notFound();
  return <ServiceDetailPage service={service as ServiceKey} />;
}
