"use client";

import { Cookie, Globe, MoreVertical } from "lucide-react";
import { DEFAULT_COOKIE_TEXT } from "@/app/shared/site-settings/schema";

const truncate = (value: string, max: number) => (value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value);

function hostOf(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return "genfinityoandp.com";
  }
}

export function SerpPreview({ title, description, url, siteName }: { title: string; description: string; url: string; siteName: string }) {
  const host = hostOf(url);
  let crumbs = "";
  try {
    crumbs = new URL(url).pathname.split("/").filter(Boolean).join(" › ");
  } catch {
    /* invalid URL while typing */
  }
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 font-[arial,sans-serif]">
      <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        <Globe className="h-3.5 w-3.5" /> Google preview
      </div>
      <div className="flex items-center gap-3">
        <span className="grid h-7 w-7 place-items-center rounded-full border border-slate-200 bg-slate-50 text-[11px] font-bold text-brand-red">G</span>
        <div className="min-w-0 leading-tight">
          <div className="truncate text-sm text-[#202124]">{siteName || host}</div>
          <div className="truncate text-xs text-[#4d5156]">
            https://{host}
            {crumbs && ` › ${crumbs}`}
          </div>
        </div>
        <MoreVertical className="ml-auto h-4 w-4 text-slate-400" />
      </div>
      <div className="mt-2 text-xl leading-snug text-[#1a0dab] hover:underline">{truncate(title || "Page title", 62)}</div>
      <p className="mt-1 text-sm leading-relaxed text-[#4d5156]">
        {description ? truncate(description, 160) : <span className="italic text-slate-400">Google will pick text from the page when no description is set.</span>}
      </p>
    </div>
  );
}

export function SocialPreview({ title, description, image, url, siteName }: { title: string; description: string; image: string; url: string; siteName: string }) {
  const host = hostOf(url).toUpperCase();
  const img = image || "/images/genfinity/prosthetic-community.avif";
  return (
    <div className="grid gap-4">
      <div>
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Facebook / LinkedIn</div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img} alt="" className="aspect-[1.91/1] w-full bg-slate-100 object-cover" />
          <div className="border-t border-slate-200 bg-[#f0f2f5] px-3 py-2.5">
            <div className="truncate text-[11px] text-[#65676b]">{host}</div>
            <div className="mt-0.5 line-clamp-2 text-[15px] font-semibold leading-snug text-[#050505]">{title || siteName}</div>
            <div className="mt-0.5 line-clamp-1 text-[13px] text-[#65676b]">{description}</div>
          </div>
        </div>
      </div>
      <div>
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">X (Twitter)</div>
        <div className="relative overflow-hidden rounded-2xl border border-slate-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img} alt="" className="aspect-[1.91/1] w-full bg-slate-100 object-cover" />
          <span className="absolute bottom-2 left-2 max-w-[85%] truncate rounded bg-black/70 px-1.5 py-0.5 text-[12px] text-white">{title || siteName}</span>
        </div>
        <div className="mt-1 text-[12px] text-slate-500">From {hostOf(url)}</div>
      </div>
    </div>
  );
}

export function CookiePreview({ text }: { text: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-100 to-slate-50 p-4 pt-20">
      <div className="absolute left-4 right-4 top-4 space-y-2">
        <div className="h-2.5 w-1/3 rounded bg-slate-200" />
        <div className="h-2.5 w-2/3 rounded bg-slate-200" />
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10">
        <div className="flex gap-3">
          <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-brand-red" />
          <div className="text-[13px] leading-relaxed text-slate-700">
            <p>{text.trim() || DEFAULT_COOKIE_TEXT}</p>
            <span className="mt-1 inline-block font-semibold text-brand-red">Privacy policy</span>
          </div>
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <span className="rounded-full border border-slate-300 px-4 py-1.5 text-xs font-bold text-slate-700">Decline</span>
          <span className="rounded-full bg-brand-red px-4 py-1.5 text-xs font-bold text-white">Accept cookies</span>
        </div>
      </div>
    </div>
  );
}
