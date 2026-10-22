import type { Metadata } from "next";
import ServicesPage from "@/app/services/page";
import { pageMetadata } from "@/app/seo";

export const generateMetadata = (): Promise<Metadata> => pageMetadata("/our-services-custom-orthotics-and-prosthetics/");

export default ServicesPage;
