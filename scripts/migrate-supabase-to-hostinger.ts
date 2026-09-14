import { execFile as execFileCallback } from "node:child_process";
import { mkdir, readFile, writeFile, readdir, copyFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { createClient } from "@supabase/supabase-js";
import mysql from "mysql2/promise";

const TABLES = ["staff_users", "staff_profiles", "intake_drafts", "patients", "intakes", "intake_search_tokens", "consent_records", "intake_submission_keys", "intake_signatures", "office_checklists", "intake_amendments", "intake_audit_events", "owner_password_resets", "patient_care_profiles", "patient_visits", "device_orders", "email_templates", "patient_messages", "staff_notification_settings"] as const;
const BATCH = 500;
const outputDir = path.resolve(process.env.MIGRATION_DIR || ".migration-export");
const apply = process.argv.includes("--apply");
const execFile = promisify(execFileCallback);

function requireApproval() {
  if (process.env.ALLOW_PHI_MIGRATION !== "true") throw new Error("Refusing PHI migration. Set ALLOW_PHI_MIGRATION=true only after written compliance approval.");
}

function mysqlValue(value: unknown) {
  if (Array.isArray(value) || (value && typeof value === "object")) return JSON.stringify(value);
  if (typeof value === "string" && value.includes("T") && value.endsWith("Z")) return value.replace("T", " ").replace("Z", "");
  return value ?? null;
}

async function exportSource() {
  requireApproval();
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY are required for export");
  const source = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
  await mkdir(outputDir, { recursive: true });
  const manifest: Record<string, number> = {};
  for (const table of TABLES) {
    if (table === "staff_users") {
      const { data: users, error } = await source.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (error) throw error;
      const owners = (users.users || []).filter((user) => user.email).map((user) => ({ id: user.id, email: user.email, password_hash: null, password_reset_required: true, created_at: user.created_at, updated_at: user.updated_at }));
      await writeFile(path.join(outputDir, `${table}.json`), JSON.stringify(owners, null, 2));
      manifest[table] = owners.length;
      continue;
    }
    const rows: Record<string, unknown>[] = [];
    for (let from = 0; ; from += BATCH) {
      const { data, error } = await source.from(table).select("*").range(from, from + BATCH - 1);
      if (error) throw new Error(`${table}: ${error.message}`);
      rows.push(...(data || []) as Record<string, unknown>[]);
      if (!data || data.length < BATCH) break;
    }
    await writeFile(path.join(outputDir, `${table}.json`), JSON.stringify(rows, null, 2));
    manifest[table] = rows.length;
  }
  const filesDir = path.join(outputDir, "intake-signatures");
  await mkdir(filesDir, { recursive: true });
  const { data: signatures, error } = await source.from("intake_signatures").select("storage_path");
  if (error) throw error;
  for (const item of signatures || []) {
    const file = await source.storage.from("intake-signatures").download(item.storage_path);
    if (file.error) throw file.error;
    const bytes = Buffer.from(await file.data.arrayBuffer());
    const target = path.join(filesDir, item.storage_path);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, bytes);
  }
  await writeFile(path.join(outputDir, "manifest.json"), JSON.stringify({ exportedAt: new Date().toISOString(), tables: manifest }, null, 2));
  console.log(JSON.stringify({ mode: "export", outputDir, tables: manifest }, null, 2));
}

async function importTarget() {
  requireApproval();
  const manifest = JSON.parse(await readFile(path.join(outputDir, "manifest.json"), "utf8"));
  const db = await mysql.createConnection({ host: process.env.MYSQL_HOST || "127.0.0.1", port: Number(process.env.MYSQL_PORT || 3306), database: process.env.MYSQL_DATABASE, user: process.env.MYSQL_USER, password: process.env.MYSQL_PASSWORD });
  try {
    if (!apply) { console.log(JSON.stringify({ mode: "dry-run", manifest }, null, 2)); return; }
    const backup = path.join(outputDir, `hostinger-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.sql`);
    await execFile("mysqldump", ["--host", process.env.MYSQL_HOST || "127.0.0.1", "--port", String(process.env.MYSQL_PORT || 3306), "--user", process.env.MYSQL_USER || "", process.env.MYSQL_DATABASE || "", "--result-file", backup], { env: { ...process.env, MYSQL_PWD: process.env.MYSQL_PASSWORD || "" } });
    console.log(`Created rollback backup at ${backup}`);
    for (const table of TABLES) {
      const rows = JSON.parse(await readFile(path.join(outputDir, `${table}.json`), "utf8")) as Record<string, unknown>[];
      for (const row of rows) {
        const columns = Object.keys(row).filter((column) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(column));
        const names = columns.map((column) => `\`${column}\``).join(",");
        const placeholders = columns.map(() => "?").join(",");
        await db.execute(`INSERT IGNORE INTO \`${table}\` (${names}) VALUES (${placeholders})`, columns.map((column) => mysqlValue(row[column])) as any[]);
      }
      console.log(`Imported ${rows.length} rows into ${table}`);
    }
    const sourceFiles = path.join(outputDir, "intake-signatures");
    const targetFiles = path.resolve(process.env.HOSTINGER_STORAGE_PATH || path.join(process.cwd(), ".private-storage"));
    async function copyTree(relative: string) {
      const source = path.join(sourceFiles, relative);
      for (const entry of await readdir(source, { withFileTypes: true })) {
        const child = path.join(relative, entry.name);
        if (entry.isDirectory()) await copyTree(child);
        else { const target = path.join(targetFiles, child); await mkdir(path.dirname(target), { recursive: true }); await copyFile(path.join(sourceFiles, child), target); }
      }
    }
    try { await copyTree(""); } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
    console.log(`Copied private signature files to ${targetFiles}`);
  } finally { await db.end(); }
}

async function main() {
  if (process.argv.includes("--export")) await exportSource();
  else if (process.argv.includes("--import")) await importTarget();
  else throw new Error("Use --export or --import; add --apply to perform the import.");
}

main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
