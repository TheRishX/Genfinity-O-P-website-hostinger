// Production deployment source module.
import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import mysql, { type Pool, type ResultSetHeader, type RowDataPacket } from "mysql2/promise";

type Filter = { sql: string; values: unknown[] };
type QueryOptions = { count?: "exact"; head?: boolean };

const TABLES = new Set([
  "staff_profiles", "staff_users", "staff_sessions", "intake_drafts", "patients",
  "intakes", "intake_search_tokens", "consent_records", "intake_submission_keys",
  "intake_signatures", "office_checklists", "intake_amendments", "intake_audit_events",
  "owner_password_resets", "patient_care_profiles", "patient_visits", "device_orders",
  "email_templates", "patient_messages", "staff_notification_settings",
]);

const IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]*$/;
const JSON_COLUMNS = new Set(["checklist", "changed_fields"]);
const NO_ID_TABLES = new Set(["staff_profiles", "staff_users", "staff_sessions", "intake_search_tokens", "consent_records", "intake_submission_keys", "intake_signatures", "office_checklists", "email_templates", "staff_notification_settings", "owner_password_resets"]);
let pool: Pool | undefined;

function identifier(value: string) {
  if (!IDENTIFIER.test(value)) throw new Error(`Invalid database identifier: ${value}`);
  return `\`${value}\``;
}

function tableName(value: string) {
  if (!TABLES.has(value)) throw new Error(`Unsupported database table: ${value}`);
  return identifier(value);
}

function valueFor(column: string, value: unknown) {
  if (value === undefined) return null;
  if (JSON_COLUMNS.has(column) && Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === "string" && value.includes("T") && value.endsWith("Z"))
    return value.replace("T", " ").replace("Z", "");
  return value;
}

function prepareRow(table: string, input: Record<string, unknown>) {
  const row = { ...input };
  const now = new Date().toISOString();
  if (!NO_ID_TABLES.has(table) && row.id === undefined) row.id = randomUUID();
  if (row.created_at === undefined && table !== "intake_search_tokens" && table !== "staff_profiles") row.created_at = now;
  if (row.updated_at === undefined && ["patients", "intakes", "intake_drafts", "office_checklists", "patient_care_profiles", "patient_visits", "device_orders", "email_templates", "staff_notification_settings"].includes(table)) row.updated_at = now;
  if (row.changed_fields === undefined && ["intake_amendments", "intake_audit_events"].includes(table)) row.changed_fields = [];
  if (row.checklist === undefined && table === "office_checklists") row.checklist = {};
  if (row.clinician_notes === undefined && table === "office_checklists") row.clinician_notes = "";
  if (row.expires_at === undefined && table === "intake_drafts") row.expires_at = new Date(Date.now() + 7 * 86400000).toISOString();
  if (row.expires_at === undefined && table === "intake_submission_keys") row.expires_at = new Date(Date.now() + 86400000).toISOString();
  return row;
}

function normalizeRow(row: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(row).map(([key, value]) => {
    if (JSON_COLUMNS.has(key) && typeof value === "string") {
      try { return [key, JSON.parse(value)]; } catch { return [key, value]; }
    }
    return [key, value];
  }));
}

export function isDatabaseConfigured() {
  return Boolean(process.env.MYSQL_DATABASE && process.env.MYSQL_USER && process.env.MYSQL_PASSWORD);
}

export function getPool() {
  if (!isDatabaseConfigured()) throw new Error("Hostinger MySQL configuration is missing");
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || "127.0.0.1",
      port: Number(process.env.MYSQL_PORT || "3306"),
      database: process.env.MYSQL_DATABASE,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      waitForConnections: true,
      connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT || "10"),
      enableKeepAlive: true,
      ssl: process.env.MYSQL_SSL === "true" ? {} : undefined,
    });
  }
  return pool;
}

class Query<T = any> implements PromiseLike<QueryResponse<T>> {
  private columns = "*";
  private filters: Filter[] = [];
  private sort = "";
  private maxRows: number | undefined;
  private mutation: "select" | "insert" | "update" | "delete" | "upsert" = "select";
  private payload: Record<string, unknown> | Record<string, unknown>[] | undefined;
  private selectedAfterMutation = false;
  private options: QueryOptions = {};

  constructor(private readonly table: string) {}

  select(columns = "*", options: QueryOptions = {}) { this.columns = columns; this.options = options; this.selectedAfterMutation = true; return this; }
  eq(column: string, value: unknown) { return this.where(`${identifier(column)} = ?`, [value]); }
  is(column: string, value: null) { return this.where(`${identifier(column)} IS ${value === null ? "NULL" : "NOT NULL"}`, []); }
  gt(column: string, value: unknown) { return this.where(`${identifier(column)} > ?`, [value]); }
  lt(column: string, value: unknown) { return this.where(`${identifier(column)} < ?`, [value]); }
  gte(column: string, value: unknown) { return this.where(`${identifier(column)} >= ?`, [value]); }
  in(column: string, values: unknown[]) { return this.where(`${identifier(column)} IN (${values.map(() => "?").join(",") || "NULL"})`, values); }
  not(column: string, operator: string, value: string) {
    if (operator !== "in") throw new Error(`Unsupported filter operator: ${operator}`);
    const values = value.replace(/^\(|\)$/g, "").split(",").map((item) => item.replace(/^"|"$/g, ""));
    return this.where(`${identifier(column)} NOT IN (${values.map(() => "?").join(",")})`, values);
  }
  ilike(column: string, value: unknown) { return this.where(`${identifier(column)} LIKE ?`, [value]); }
  order(column: string, options: { ascending?: boolean } = {}) { this.sort = ` ORDER BY ${identifier(column)} ${options.ascending === false ? "DESC" : "ASC"}`; return this; }
  limit(value: number) { this.maxRows = value; return this; }
  insert(payload: Record<string, unknown> | Record<string, unknown>[]) { this.mutation = "insert"; this.payload = payload; return this; }
  update(payload: Record<string, unknown>) { this.mutation = "update"; this.payload = payload; return this; }
  upsert(payload: Record<string, unknown> | Record<string, unknown>[]) { this.mutation = "upsert"; this.payload = payload; return this; }
  delete() { this.mutation = "delete"; return this; }
  single() { return this.execute().then((result) => { if (result.data.length !== 1) return { ...result, data: null, error: new Error("Expected exactly one row") }; return { ...result, data: result.data[0] }; }); }
  maybeSingle() { return this.execute().then((result) => ({ ...result, data: result.data[0] || null })); }
  then<TResult1 = QueryResponse<T>, TResult2 = never>(onfulfilled?: ((value: QueryResponse<T>) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null) { return this.execute().then(onfulfilled, onrejected); }

  private where(sql: string, values: unknown[]) { this.filters.push({ sql, values }); return this; }

  private async execute(): Promise<QueryResponse<T>> {
    const where = this.filters.length ? ` WHERE ${this.filters.map((item) => item.sql).join(" AND ")}` : "";
    const values = this.filters.flatMap((item) => item.values);
    try {
      if (this.mutation === "select") {
        if (this.options.head) {
          const [rows] = await getPool().query<RowDataPacket[]>(`SELECT COUNT(*) AS count FROM ${tableName(this.table)}${where}`, values);
          return { data: [], count: Number(rows[0]?.count || 0), error: null };
        }
        const limit = this.maxRows === undefined ? "" : ` LIMIT ${this.maxRows}`;
        const [rows] = await getPool().query<RowDataPacket[]>(`SELECT ${this.safeColumns()} FROM ${tableName(this.table)}${where}${this.sort}${limit}`, values);
        return { data: rows.map((row) => normalizeRow(row as Record<string, unknown>) as T), count: null, error: null };
      }
      const rows = (Array.isArray(this.payload) ? this.payload : [this.payload || {}]).map((row) => prepareRow(this.table, row));
      if (this.mutation === "delete") {
        await getPool().execute<ResultSetHeader>(`DELETE FROM ${tableName(this.table)}${where}`, values as any[]);
        return { data: [], count: null, error: null };
      }
      const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))];
      if (!columns.length) throw new Error("Mutation payload is empty");
      const names = columns.map(identifier).join(", ");
      const placeholders = rows.map(() => `(${columns.map(() => "?").join(", ")})`).join(", ");
      const params = rows.flatMap((row) => columns.map((column) => valueFor(column, row[column])));
      if (this.mutation === "insert") await getPool().execute<ResultSetHeader>(`INSERT INTO ${tableName(this.table)} (${names}) VALUES ${placeholders}`, params as any[]);
      if (this.mutation === "upsert") {
        const updates = columns.filter((column) => !["id", "user_id", "patient_id", "token_hash", "key_hash"].includes(column));
        const clause = updates.length
          ? ` ON DUPLICATE KEY UPDATE ${updates.map((column) => `${identifier(column)} = VALUES(${identifier(column)})`).join(", ")}`
          : ` ON DUPLICATE KEY UPDATE ${identifier(columns[0])} = ${identifier(columns[0])}`;
        await getPool().execute<ResultSetHeader>(`INSERT INTO ${tableName(this.table)} (${names}) VALUES ${placeholders}${clause}`, params as any[]);
      }
      if (this.mutation === "update") {
        const setColumns = Object.keys(this.payload as Record<string, unknown>);
        const setSql = setColumns.map(identifier).map((column) => `${column} = ?`).join(", ");
        await getPool().execute<ResultSetHeader>(`UPDATE ${tableName(this.table)} SET ${setSql}${where}`, [...setColumns.map((column) => valueFor(column, (this.payload as Record<string, unknown>)[column])), ...values] as any[]);
      }
      if (!this.selectedAfterMutation) return { data: [], count: null, error: null };
      const selectWhere = this.filters.length ? where : rows.length === 1 && rows[0].id ? ` WHERE ${identifier("id")} = ?` : "";
      const selectValues = this.filters.length ? values : rows.length === 1 && rows[0].id ? [rows[0].id] : [];
      const [result] = await getPool().query<RowDataPacket[]>(`SELECT ${this.safeColumns()} FROM ${tableName(this.table)}${selectWhere}${this.sort}${this.maxRows === undefined ? "" : ` LIMIT ${this.maxRows}`}`, selectValues);
      return { data: result.map((row) => normalizeRow(row as Record<string, unknown>) as T), count: null, error: null };
    } catch (error) { return { data: [], count: null, error: error instanceof Error ? error : new Error("Database request failed") }; }
  }

  private safeColumns() {
    if (this.columns === "*") return "*";
    return this.columns.split(",").map((column) => identifier(column.trim())).join(", ");
  }
}

export type QueryResponse<T> = { data: T[]; count: number | null; error: Error | null };
export type DatabaseClient = { from<T = any>(table: string): Query<T> };

export function createDatabaseClient(): DatabaseClient { return { from: <T = any>(table: string) => new Query<T>(table) }; }
export const createServerDatabase = createDatabaseClient;
export const createAdminClient = createDatabaseClient;

const storageRoot = () => path.resolve(/* turbopackIgnore: true */ process.env.HOSTINGER_STORAGE_PATH || path.join(process.cwd(), ".private-storage"));
function storageFile(relative: string) {
  if (!relative || relative.includes("..") || path.isAbsolute(relative)) throw new Error("Invalid private storage path");
  return path.join(/* turbopackIgnore: true */ storageRoot(), relative);
}

export const privateStorage = {
  async upload(relative: string, bytes: Uint8Array) { const file = storageFile(relative); await mkdir(path.dirname(file), { recursive: true }); await writeFile(file, bytes, { flag: "wx" }); },
  async download(relative: string) { return readFile(/* turbopackIgnore: true */ storageFile(relative)); },
  async remove(relative: string) { await rm(storageFile(relative), { force: true }); },
};

// Hostinger deployment source marker.
