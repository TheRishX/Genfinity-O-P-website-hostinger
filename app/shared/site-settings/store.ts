// Server-only persistence for SEO / tracking settings.
// Uses the Hostinger MySQL database when configured, otherwise a JSON file in
// private storage (local development).
import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { RowDataPacket } from "mysql2/promise";
import { getPool, isDatabaseConfigured } from "@/app/shared/mysql/client";
import { DEFAULTS, normalizeSettings, redactSecrets, toPublicTracking, type SiteSettings } from "./schema";

const SETTINGS_KEY = "seo_tracking";
const CACHE_TTL = 10_000;
const FAILURE_TTL = 30_000;
const HISTORY_LIMIT = 25;
const NO_CHANGES = "No changes";

export type HistoryEntry = { id: number; savedAt: string; savedBy: string; summary: string };

type FileStore = {
  settings?: { value: unknown; updatedAt: string; updatedBy: string };
  history?: (HistoryEntry & { value: unknown })[];
};

type Cached = { value: SiteSettings; meta: { updatedAt: string | null; updatedBy: string | null }; at: number; ok: boolean };
// Route handlers and page rendering load separate copies of this module, so the
// cache lives on globalThis: a save from the API is then seen by the next render.
const shared = globalThis as typeof globalThis & { __genfinitySiteSettings?: Cached | null };
let tablesReady: Promise<void> | null = null;

const storageRoot = () =>
  path.resolve(/* turbopackIgnore: true */ process.env.HOSTINGER_STORAGE_PATH || path.join(process.cwd(), ".private-storage"));
const storeFile = () => path.join(/* turbopackIgnore: true */ storageRoot(), "site-settings.json");

async function readFileStore(): Promise<FileStore> {
  try {
    return JSON.parse(await readFile(storeFile(), "utf8")) as FileStore;
  } catch {
    return {};
  }
}

async function writeFileStore(data: FileStore) {
  await mkdir(storageRoot(), { recursive: true });
  await writeFile(storeFile(), JSON.stringify(data, null, 2), { mode: 0o600 });
}

function ensureTables() {
  tablesReady ??= (async () => {
    const pool = getPool();
    await pool.query(`CREATE TABLE IF NOT EXISTS site_settings (
      setting_key VARCHAR(80) PRIMARY KEY,
      value JSON NOT NULL,
      updated_by VARCHAR(254) NULL,
      updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
    )`);
    await pool.query(`CREATE TABLE IF NOT EXISTS site_settings_history (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      setting_key VARCHAR(80) NOT NULL,
      value JSON NOT NULL,
      summary VARCHAR(500) NOT NULL DEFAULT '',
      saved_by VARCHAR(254) NULL,
      saved_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
      INDEX site_settings_history_key_idx (setting_key, saved_at)
    )`);
  })().catch((error) => {
    tablesReady = null;
    throw error;
  });
  return tablesReady;
}

const parseJson = (value: unknown) => (typeof value === "string" ? JSON.parse(value) : value);

async function readRow(key: string): Promise<{ value: unknown; updatedAt: string | null; updatedBy: string | null } | null> {
  if (!isDatabaseConfigured()) {
    const store = await readFileStore();
    return store.settings ? { value: store.settings.value, updatedAt: store.settings.updatedAt, updatedBy: store.settings.updatedBy } : null;
  }
  await ensureTables();
  const [rows] = await getPool().query<RowDataPacket[]>("SELECT value, updated_by, updated_at FROM site_settings WHERE setting_key = ?", [key]);
  if (!rows[0]) return null;
  return { value: parseJson(rows[0].value), updatedAt: new Date(rows[0].updated_at).toISOString(), updatedBy: rows[0].updated_by ?? null };
}

/** Full settings including the server-only token. Never send this to a browser. */
export async function getSettings(): Promise<SiteSettings> {
  return (await getSettingsWithMeta()).settings;
}

export async function getSettingsWithMeta() {
  const hit = shared.__genfinitySiteSettings;
  if (hit && Date.now() - hit.at < (hit.ok ? CACHE_TTL : FAILURE_TTL)) return { settings: hit.value, ...hit.meta };
  let next: Cached;
  try {
    const row = await readRow(SETTINGS_KEY);
    const value = row ? normalizeSettings(row.value) : structuredClone(DEFAULTS);
    next = { value, meta: { updatedAt: row?.updatedAt ?? null, updatedBy: row?.updatedBy ?? null }, at: Date.now(), ok: true };
  } catch (error) {
    console.error("Could not load site settings; using last known values.", error instanceof Error ? error.message : error);
    // Keep the last good values (or defaults) briefly so a down database doesn't stall every render.
    next = { value: hit?.value ?? structuredClone(DEFAULTS), meta: hit?.meta ?? { updatedAt: null, updatedBy: null }, at: Date.now(), ok: false };
  }
  shared.__genfinitySiteSettings = next;
  return { settings: next.value, ...next.meta };
}

function invalidate() {
  shared.__genfinitySiteSettings = null;
}

function describeChanges(before: SiteSettings, after: SiteSettings) {
  const changed: string[] = [];
  const walk = (a: any, b: any, prefix: string) => {
    for (const key of new Set([...Object.keys(a ?? {}), ...Object.keys(b ?? {})])) {
      if (key === "token") continue;
      const name = prefix ? `${prefix}.${key}` : key;
      if (a?.[key] && b?.[key] && typeof a[key] === "object" && typeof b[key] === "object") walk(a[key], b[key], name);
      else if (JSON.stringify(a?.[key]) !== JSON.stringify(b?.[key])) changed.push(name);
    }
  };
  walk(before, after, "");
  if (before.tracking.server.token !== after.tracking.server.token) changed.push("tracking.server.token");
  if (!changed.length) return NO_CHANGES;
  return (changed.slice(0, 8).join(", ") + (changed.length > 8 ? ` +${changed.length - 8} more` : "")).slice(0, 500);
}

export async function saveSettings(next: SiteSettings, savedBy: string) {
  const before = await getSettingsUncached();
  const summary = describeChanges(before, next);
  const now = new Date().toISOString();
  // History never stores the secret token.
  const historyValue = redactSecrets(next);
  if (!isDatabaseConfigured()) {
    const store = await readFileStore();
    const history = store.history ?? [];
    const id = (history[0]?.id ?? 0) + 1;
    store.settings = { value: next, updatedAt: now, updatedBy: savedBy };
    if (summary !== NO_CHANGES) store.history = [{ id, savedAt: now, savedBy, summary, value: historyValue }, ...history].slice(0, HISTORY_LIMIT);
    await writeFileStore(store);
  } else {
    await ensureTables();
    const pool = getPool();
    await pool.query(
      "INSERT INTO site_settings (setting_key, value, updated_by) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value), updated_by = VALUES(updated_by)",
      [SETTINGS_KEY, JSON.stringify(next), savedBy],
    );
    if (summary !== NO_CHANGES) {
      await pool.query("INSERT INTO site_settings_history (setting_key, value, summary, saved_by) VALUES (?, ?, ?, ?)", [SETTINGS_KEY, JSON.stringify(historyValue), summary, savedBy]);
    }
    await pool.query(
      "DELETE FROM site_settings_history WHERE setting_key = ? AND id NOT IN (SELECT id FROM (SELECT id FROM site_settings_history WHERE setting_key = ? ORDER BY id DESC LIMIT ?) keep)",
      [SETTINGS_KEY, SETTINGS_KEY, HISTORY_LIMIT],
    );
  }
  invalidate();
  return { summary, savedAt: now };
}

async function getSettingsUncached() {
  invalidate();
  return getSettings();
}

export async function listHistory(): Promise<HistoryEntry[]> {
  if (!isDatabaseConfigured()) return ((await readFileStore()).history ?? []).map(({ value: _value, ...entry }) => entry);
  await ensureTables();
  const [rows] = await getPool().query<RowDataPacket[]>(
    "SELECT id, summary, saved_by, saved_at FROM site_settings_history WHERE setting_key = ? ORDER BY id DESC LIMIT ?",
    [SETTINGS_KEY, HISTORY_LIMIT],
  );
  return rows.map((row) => ({ id: Number(row.id), summary: String(row.summary), savedBy: String(row.saved_by ?? ""), savedAt: new Date(row.saved_at).toISOString() }));
}

export async function getHistoryValue(id: number): Promise<SiteSettings | null> {
  if (!isDatabaseConfigured()) {
    const entry = ((await readFileStore()).history ?? []).find((item) => item.id === id);
    return entry ? normalizeSettings(entry.value) : null;
  }
  await ensureTables();
  const [rows] = await getPool().query<RowDataPacket[]>("SELECT value FROM site_settings_history WHERE setting_key = ? AND id = ?", [SETTINGS_KEY, id]);
  return rows[0] ? normalizeSettings(parseJson(rows[0].value)) : null;
}

export async function getPublicSiteConfig() {
  const { seo, tracking } = await getSettings();
  return { tracking: toPublicTracking(tracking), cookieText: seo.cookieText };
}

export function storageMode() {
  return isDatabaseConfigured() ? "mysql" : "file";
}
