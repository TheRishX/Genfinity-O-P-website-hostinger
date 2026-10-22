// Shared (client + server) SEO / tracking settings: types, defaults and validation.
// Defaults mirror the values that were previously hard-coded in app/layout.tsx so
// nothing changes on the live site until an admin edits them in /seo.

export const ROBOTS = ["index, follow", "noindex, follow", "index, nofollow", "noindex, nofollow"] as const;
export const TWITTER_CARDS = ["summary_large_image", "summary"] as const;
export const SCHEMA_TYPES = ["MedicalBusiness", "MedicalClinic", "LocalBusiness"] as const;

export type PageOverride = { title: string; description: string; noindex: boolean };

/** "/about/" and "/about" are the same page: overrides are keyed without the trailing slash. */
export const pageKey = (path: string) => (path.length > 1 ? path.replace(/\/+$/, "") : path);

export type SeoSettings = {
  siteTitle: string;
  titleTemplate: string;
  metaDescription: string;
  keywords: string;
  canonicalBase: string;
  robots: (typeof ROBOTS)[number];
  gscVerification: string;
  bingVerification: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogSiteName: string;
  twitterCard: (typeof TWITTER_CARDS)[number];
  twitterHandle: string;
  cookieText: string;
  sitemapEnabled: boolean;
  schema: {
    enabled: boolean;
    type: (typeof SCHEMA_TYPES)[number];
    name: string;
    legalName: string;
    logo: string;
    phone: string;
    email: string;
    hours: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    areaServed: string;
    facebook: string;
    instagram: string;
    youtube: string;
  };
  pages: Record<string, PageOverride>;
};

export type TrackingSettings = {
  gtm: { enabled: boolean; id: string };
  ga4: { enabled: boolean; id: string };
  metaPixel: { enabled: boolean; id: string };
  googleAds: { enabled: boolean; id: string; conversionLabel: string };
  stape: { enabled: boolean; url: string };
  // token = SERVER ONLY. Never returned by any API or rendered into HTML.
  server: { enabled: boolean; endpoint: string; token: string; testEventCode: string };
};

export type SiteSettings = { seo: SeoSettings; tracking: TrackingSettings };

// What the storefront receives. Browser-safe values only.
export type PublicTracking = {
  gtm: string | null;
  ga4: string | null;
  metaPixel: string | null;
  googleAds: { id: string; label: string } | null;
  stapeUrl: string | null;
  serverSide: boolean;
};

export const DEFAULT_COOKIE_TEXT =
  "We use cookies and similar tools to measure site traffic and improve our ads. We never share your health information. You can accept or decline marketing cookies.";

export const DEFAULTS: SiteSettings = {
  seo: {
    siteTitle: "Best Orthotics & Prosthetics Center in the USA",
    titleTemplate: "%s | Genfinity O&P",
    metaDescription:
      "Get expert orthotics and prosthetics care in the USA, with personalized solutions, advanced technology, and support for better mobility and comfort.",
    keywords:
      "orthotics and prosthetics, orthotics Tarzana, prosthetics Tarzana, custom foot orthotics Los Angeles, prosthetic clinic Tarzana, Genfinity O&P",
    canonicalBase: "https://genfinityoandp.com",
    robots: "index, follow",
    gscVerification: "sXaV3JYWUHWqHiBDpvj3xySBZgIPVl73dWN_Ea3lLJc",
    bingVerification: "",
    ogTitle: "Genfinity O&P | Move with more comfort and confidence",
    ogDescription:
      "25+ years of clinical experience, careful fitting, and patient-first orthotic and prosthetic care in Tarzana.",
    ogImage: "",
    ogSiteName: "Genfinity O&P",
    twitterCard: "summary_large_image",
    twitterHandle: "",
    cookieText: "",
    sitemapEnabled: true,
    schema: {
      enabled: true,
      type: "MedicalBusiness",
      name: "Genfinity O&P",
      legalName: "GENFINITY O&P LLC",
      logo: "https://genfinityoandp.com/images/brand/genfinity-logo-uploaded.webp",
      phone: "+1-888-552-6188",
      email: "support@genfinityoandp.com",
      hours: "Mo-Fr 10:00-18:00",
      street: "18401 Burbank Blvd, Suite 215",
      city: "Tarzana",
      state: "CA",
      zip: "91356",
      areaServed: "Tarzana, Los Angeles, San Fernando Valley",
      facebook: "",
      instagram: "",
      youtube: "",
    },
    pages: {},
  },
  tracking: {
    gtm: { enabled: false, id: "" },
    ga4: { enabled: false, id: "" },
    metaPixel: { enabled: false, id: "" },
    googleAds: { enabled: true, id: "AW-314681422", conversionLabel: "QQ2zCM7U_YUcEM7QhpYB" },
    stape: { enabled: false, url: "" },
    server: { enabled: false, endpoint: "", token: "", testEventCode: "" },
  },
};

export type Errors = Record<string, string>;

export const isHttps = (value: string) => {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
};

const str = (value: unknown, fallback: string, max = 2000) =>
  typeof value === "string" ? value.slice(0, max) : fallback;
const bool = (value: unknown, fallback: boolean) => (typeof value === "boolean" ? value : fallback);
const oneOf = <T extends readonly string[]>(list: T, value: unknown, fallback: T[number]): T[number] =>
  typeof value === "string" && (list as readonly string[]).includes(value) ? (value as T[number]) : fallback;

/** Merge stored / submitted JSON onto the defaults, dropping unknown keys and wrong types. */
export function normalizeSettings(input: unknown, base: SiteSettings = DEFAULTS): SiteSettings {
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, any>;
  const s = (raw.seo && typeof raw.seo === "object" ? raw.seo : {}) as Record<string, any>;
  const t = (raw.tracking && typeof raw.tracking === "object" ? raw.tracking : {}) as Record<string, any>;
  const d = base.seo;
  const sc = (s.schema && typeof s.schema === "object" ? s.schema : {}) as Record<string, any>;

  const pages: Record<string, PageOverride> = {};
  if (s.pages && typeof s.pages === "object") {
    for (const [path, value] of Object.entries(s.pages as Record<string, any>)) {
      if (typeof path !== "string" || !path.startsWith("/") || path.length > 200 || !value) continue;
      const override = { title: str(value.title, "", 200).trim(), description: str(value.description, "", 400).trim(), noindex: bool(value.noindex, false) };
      if (override.title || override.description || override.noindex) pages[pageKey(path)] = override;
    }
  } else Object.assign(pages, d.pages);

  const group = <K extends keyof TrackingSettings>(key: K) =>
    (t[key] && typeof t[key] === "object" ? t[key] : {}) as Record<string, any>;
  const tb = base.tracking;

  return {
    seo: {
      siteTitle: str(s.siteTitle, d.siteTitle, 200),
      titleTemplate: str(s.titleTemplate, d.titleTemplate, 200),
      metaDescription: str(s.metaDescription, d.metaDescription, 400),
      keywords: str(s.keywords, d.keywords, 2000),
      canonicalBase: str(s.canonicalBase, d.canonicalBase, 200).trim(),
      robots: oneOf(ROBOTS, s.robots, d.robots),
      gscVerification: str(s.gscVerification, d.gscVerification, 200).trim(),
      bingVerification: str(s.bingVerification, d.bingVerification, 200).trim(),
      ogTitle: str(s.ogTitle, d.ogTitle, 200),
      ogDescription: str(s.ogDescription, d.ogDescription, 400),
      ogImage: str(s.ogImage, d.ogImage, 500).trim(),
      ogSiteName: str(s.ogSiteName, d.ogSiteName, 120),
      twitterCard: oneOf(TWITTER_CARDS, s.twitterCard, d.twitterCard),
      twitterHandle: str(s.twitterHandle, d.twitterHandle, 40).trim(),
      cookieText: str(s.cookieText, d.cookieText, 1000),
      sitemapEnabled: bool(s.sitemapEnabled, d.sitemapEnabled),
      schema: {
        enabled: bool(sc.enabled, d.schema.enabled),
        type: oneOf(SCHEMA_TYPES, sc.type, d.schema.type),
        name: str(sc.name, d.schema.name, 160),
        legalName: str(sc.legalName, d.schema.legalName, 160),
        logo: str(sc.logo, d.schema.logo, 500).trim(),
        phone: str(sc.phone, d.schema.phone, 40),
        email: str(sc.email, d.schema.email, 254).trim(),
        hours: str(sc.hours, d.schema.hours, 200),
        street: str(sc.street, d.schema.street, 200),
        city: str(sc.city, d.schema.city, 100),
        state: str(sc.state, d.schema.state, 40),
        zip: str(sc.zip, d.schema.zip, 20),
        areaServed: str(sc.areaServed, d.schema.areaServed, 500),
        facebook: str(sc.facebook, d.schema.facebook, 500).trim(),
        instagram: str(sc.instagram, d.schema.instagram, 500).trim(),
        youtube: str(sc.youtube, d.schema.youtube, 500).trim(),
      },
      pages,
    },
    tracking: {
      gtm: { enabled: bool(group("gtm").enabled, tb.gtm.enabled), id: str(group("gtm").id, tb.gtm.id, 40).trim() },
      ga4: { enabled: bool(group("ga4").enabled, tb.ga4.enabled), id: str(group("ga4").id, tb.ga4.id, 40).trim() },
      metaPixel: { enabled: bool(group("metaPixel").enabled, tb.metaPixel.enabled), id: str(group("metaPixel").id, tb.metaPixel.id, 40).trim() },
      googleAds: {
        enabled: bool(group("googleAds").enabled, tb.googleAds.enabled),
        id: str(group("googleAds").id, tb.googleAds.id, 40).trim(),
        conversionLabel: str(group("googleAds").conversionLabel, tb.googleAds.conversionLabel, 80).trim(),
      },
      stape: { enabled: bool(group("stape").enabled, tb.stape.enabled), url: str(group("stape").url, tb.stape.url, 300).trim() },
      server: {
        enabled: bool(group("server").enabled, tb.server.enabled),
        endpoint: str(group("server").endpoint, tb.server.endpoint, 300).trim(),
        token: str(group("server").token, tb.server.token, 1000).trim(),
        testEventCode: str(group("server").testEventCode, tb.server.testEventCode, 60).trim(),
      },
    },
  };
}

export function validateTracking(t: TrackingSettings, { tokenAlreadySet = false } = {}): Errors {
  const e: Errors = {};
  const need = (key: string, value: string, ok: (v: string) => boolean, empty: string, bad: string) => {
    if (!value) e[key] = empty;
    else if (!ok(value)) e[key] = bad;
  };
  if (t.gtm.enabled) need("gtm", t.gtm.id, (v) => /^GTM-[A-Z0-9]+$/.test(v), "GTM Container ID is required", "Format: GTM-XXXXXXX");
  if (t.ga4.enabled) need("ga4", t.ga4.id, (v) => /^G-[A-Z0-9]+$/.test(v), "GA4 Measurement ID is required", "Format: G-XXXXXXXXXX");
  if (t.metaPixel.enabled) need("metaPixel", t.metaPixel.id, (v) => /^\d+$/.test(v), "Meta Pixel ID is required", "Digits only");
  if (t.googleAds.enabled) {
    need("googleAds", t.googleAds.id, (v) => /^AW-\d+$/.test(v), "Google Ads ID is required", "Format: AW-XXXXXXXXXX");
    need("googleAdsLabel", t.googleAds.conversionLabel, (v) => /^[\w-]+$/.test(v), "Lead Conversion Label is required", "Letters, numbers, - and _ only");
  }
  if (t.stape.enabled) need("stape", t.stape.url, isHttps, "Stape Container URL is required", "Must be a valid https URL");
  if (t.server.endpoint && !isHttps(t.server.endpoint)) e.serverEndpoint = "Must be a valid https URL";
  if (t.server.enabled) {
    if (!t.server.token && !tokenAlreadySet) e.serverToken = "Access token is required";
    if (!t.server.endpoint && !t.metaPixel.id) e.serverEndpoint = "Add a Stape server URL or a Meta Pixel ID for CAPI";
  }
  if (t.server.testEventCode && !/^[\w-]+$/.test(t.server.testEventCode)) e.serverTestCode = "Letters and numbers only";
  return e;
}

export function validateSeo(seo: SeoSettings): Errors {
  const e: Errors = {};
  const url = (key: string, value: string) => {
    if (value && !isHttps(value)) e[key] = "Must be a valid https URL";
  };
  if (!seo.siteTitle.trim()) e.siteTitle = "Site title is required";
  else if (seo.siteTitle.length > 70) e.siteTitle = "Keep under 70 characters";
  if (seo.metaDescription.length > 160) e.metaDescription = "Keep under 160 characters";
  if (seo.titleTemplate && !seo.titleTemplate.includes("%s")) e.titleTemplate = "Must contain %s";
  if (!seo.canonicalBase) e.canonicalBase = "Canonical base URL is required";
  else if (seo.canonicalBase.endsWith("/")) e.canonicalBase = "Remove the trailing /";
  else url("canonicalBase", seo.canonicalBase);
  url("ogImage", seo.ogImage);
  if (seo.ogDescription.length > 300) e.ogDescription = "Keep under 300 characters";
  if (seo.twitterHandle && !/^@\w{1,15}$/.test(seo.twitterHandle)) e.twitterHandle = "Format: @handle";
  if (seo.gscVerification && !/^[\w-]+$/.test(seo.gscVerification)) e.gscVerification = "Paste only the content=\"…\" value";
  if (seo.bingVerification && !/^[\w-]+$/.test(seo.bingVerification)) e.bingVerification = "Paste only the content=\"…\" value";
  const s = seo.schema;
  if (s.enabled) {
    const required = { name: "Business name", phone: "Phone", street: "Street address", city: "City", state: "State", zip: "ZIP code" } as const;
    for (const [key, label] of Object.entries(required)) if (!s[key as keyof typeof required].trim()) e[`schema_${key}`] = `${label} is required`;
    if (!s.logo) e.schema_logo = "Logo URL is required";
    if (s.zip && !/^\d{5}(-\d{4})?$/.test(s.zip.trim())) e.schema_zip = "5-digit ZIP code";
  }
  url("schema_logo", s.logo);
  if (s.email && !/^\S+@\S+\.\S+$/.test(s.email)) e.schema_email = "Invalid email";
  for (const key of ["facebook", "instagram", "youtube"] as const) url(`schema_${key}`, s[key]);
  for (const [path, page] of Object.entries(seo.pages)) {
    if (page.title.length > 70) e[`page:${path}:title`] = "Keep under 70 characters";
    if (page.description.length > 160) e[`page:${path}:description`] = "Keep under 160 characters";
  }
  return e;
}

export function validateAll(settings: SiteSettings, opts: { tokenAlreadySet?: boolean } = {}): Errors {
  return { ...validateSeo(settings.seo), ...validateTracking(settings.tracking, opts) };
}

export function toPublicTracking(t: TrackingSettings): PublicTracking {
  return {
    gtm: t.gtm.enabled && t.gtm.id ? t.gtm.id : null,
    ga4: t.ga4.enabled && t.ga4.id ? t.ga4.id : null,
    metaPixel: t.metaPixel.enabled && t.metaPixel.id ? t.metaPixel.id : null,
    googleAds: t.googleAds.enabled && t.googleAds.id ? { id: t.googleAds.id, label: t.googleAds.conversionLabel } : null,
    stapeUrl: t.stape.enabled && t.stape.url ? t.stape.url.replace(/\/$/, "") : null,
    serverSide: Boolean(t.server.enabled && t.server.token),
  };
}

/** Builds the LocalBusiness JSON-LD object (or null when disabled). */
export function buildLocalBusinessJsonLd(seo: SeoSettings, socialImage?: string) {
  const s = seo.schema;
  if (!s.enabled) return null;
  const base = seo.canonicalBase || DEFAULTS.seo.canonicalBase;
  const list = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);
  const hours = list(s.hours);
  return {
    "@context": "https://schema.org",
    "@type": s.type,
    "@id": `${base}/#clinic`,
    name: s.name,
    legalName: s.legalName || undefined,
    url: base,
    telephone: s.phone,
    email: s.email || undefined,
    image: socialImage || undefined,
    logo: s.logo,
    address: {
      "@type": "PostalAddress",
      streetAddress: s.street,
      addressLocality: s.city,
      addressRegion: s.state,
      postalCode: s.zip,
      addressCountry: "US",
    },
    openingHours: hours.length ? (hours.length === 1 ? hours[0] : hours) : undefined,
    areaServed: list(s.areaServed).length ? list(s.areaServed) : undefined,
    sameAs: [s.facebook, s.instagram, s.youtube].filter(Boolean).length ? [s.facebook, s.instagram, s.youtube].filter(Boolean) : undefined,
  };
}

/** Removes the server-only secret before data leaves the server. */
export function redactSecrets(settings: SiteSettings): SiteSettings {
  return { ...settings, tracking: { ...settings.tracking, server: { ...settings.tracking.server, token: "" } } };
}
