import "server-only";
import { createDatabaseClient, privateStorage } from "@/lib/mysql/client";
export { isDatabaseConfigured } from "@/lib/mysql/client";

export const storage = {
  from(_bucket?: string) {
    return {
      async upload(file: string, bytes: Uint8Array, _options?: unknown) { await privateStorage.upload(file, bytes); return { error: null }; },
      async remove(files: string[]) { await Promise.all(files.map((file) => privateStorage.remove(file))); return { error: null }; },
      async download(file: string) { try { return { data: await privateStorage.download(file), error: null }; } catch (error) { return { data: null, error }; } },
    };
  },
};

export function createAdminClient() { return { ...createDatabaseClient(), storage }; }

// Hostinger deployment source marker.
