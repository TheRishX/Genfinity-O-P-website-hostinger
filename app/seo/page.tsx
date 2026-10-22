import type { Metadata } from "next";
import { SeoLogin } from "@/components/seo-admin/SeoLogin";
import { SeoPortal } from "@/components/seo-admin/SeoPortal";
import { adminEmail, getSeoAdmin, isAdminConfigured } from "@/app/shared/seo-admin-auth";
import { getSettingsWithMeta, storageMode } from "@/app/shared/site-settings/store";
import { pageKey, redactSecrets } from "@/app/shared/site-settings/schema";
import { seoPages } from "@/app/shared/seo";

export const metadata: Metadata = {
  title: { absolute: "SEO Admin | Genfinity O&P" },
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function SeoAdminPage() {
  const admin = await getSeoAdmin();
  if (!admin) return <SeoLogin configured={await isAdminConfigured()} />;

  const { settings, updatedAt, updatedBy } = await getSettingsWithMeta();
  // One row per URL; the home page is edited under Search appearance.
  const pages = [...new Map(
    seoPages
      .filter((page) => page.path !== "/")
      .map(({ path, title, description }) => [pageKey(path), { path: pageKey(path), title, description }]),
  ).values()];

  return (
    <SeoPortal
      initial={redactSecrets(settings)}
      initialTokenSet={Boolean(settings.tracking.server.token)}
      updatedAt={updatedAt}
      updatedBy={updatedBy}
      adminEmail={adminEmail()}
      storage={storageMode()}
      pages={pages}
    />
  );
}
