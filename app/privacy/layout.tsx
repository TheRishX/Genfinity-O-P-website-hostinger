import type { Metadata } from "next";
import { pageMetadata } from "@/app/seo";
export const generateMetadata = (): Promise<Metadata> => pageMetadata("/privacy");
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
