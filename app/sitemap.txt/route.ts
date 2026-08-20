import { SITE_URL, seoPages } from "@/lib/seo";

export function GET() {
  const body = seoPages
    .map((page) => new URL(page.path, SITE_URL).toString())
    .join("\n");

  return new Response(`${body}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
