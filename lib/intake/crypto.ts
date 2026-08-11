import "server-only";
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
} from "crypto";

const stagingKey = createHash("sha256")
  .update("genfinity-staging-only-not-for-phi")
  .digest();

function keyFromEnv(name: "INTAKE_ENCRYPTION_KEY" | "INTAKE_SEARCH_KEY") {
  const value = process.env[name];
  if (!value) {
    if (process.env.PATIENT_INTAKE_MODE === "live")
      throw new Error(`${name} is required in live mode`);
    return stagingKey;
  }
  const key = Buffer.from(value, "base64");
  if (key.length !== 32)
    throw new Error(`${name} must be a base64-encoded 32-byte key`);
  return key;
}

export function encryptJson(value: unknown) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(
    "aes-256-gcm",
    keyFromEnv("INTAKE_ENCRYPTION_KEY"),
    iv,
  );
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(value), "utf8"),
    cipher.final(),
  ]);
  return {
    ciphertext: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
  };
}

export function decryptJson<T>(payload: {
  ciphertext: string;
  iv: string;
  tag: string;
}): T {
  const decipher = createDecipheriv(
    "aes-256-gcm",
    keyFromEnv("INTAKE_ENCRYPTION_KEY"),
    Buffer.from(payload.iv, "base64"),
  );
  decipher.setAuthTag(Buffer.from(payload.tag, "base64"));
  const clear = Buffer.concat([
    decipher.update(Buffer.from(payload.ciphertext, "base64")),
    decipher.final(),
  ]);
  return JSON.parse(clear.toString("utf8")) as T;
}

export function normalizeSearch(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function blindToken(value: string) {
  return createHmac("sha256", keyFromEnv("INTAKE_SEARCH_KEY"))
    .update(value)
    .digest("hex");
}

export function buildSearchTokens(values: Record<string, string>) {
  const rows: Array<{ field: string; token_hash: string }> = [];
  for (const [field, raw] of Object.entries(values)) {
    const normalized = normalizeSearch(raw);
    if (!normalized) continue;
    const candidates = new Set([normalized]);
    for (const word of normalized.split(" ")) {
      for (let length = 2; length <= word.length; length += 1)
        candidates.add(word.slice(0, length));
    }
    for (const candidate of candidates)
      rows.push({ field, token_hash: blindToken(candidate) });
  }
  return rows;
}

export function hashSecret(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function consentHash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}
