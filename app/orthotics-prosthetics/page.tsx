import type { Metadata } from "next";
import Home from "@/app/page";
import { pageMetadata } from "@/app/seo";

export const generateMetadata = (): Promise<Metadata> => pageMetadata("/orthotics-prosthetics/");

export default Home;
