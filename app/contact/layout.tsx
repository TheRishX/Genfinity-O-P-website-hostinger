import type { Metadata } from "next";
import { pageMetadata } from "@/app/seo";
export const generateMetadata = (): Promise<Metadata> => pageMetadata("/contact");
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
