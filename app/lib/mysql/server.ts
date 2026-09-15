// Production deployment source module.
import { createServerDatabase, privateStorage } from "@/app/lib/mysql/client";

export function createServerDatabaseWithStorage() {
  return {
    ...createServerDatabase(),
    storage: {
      from(_bucket?: string) {
        return {
          async remove(files: string[]) { await Promise.all(files.map((file) => privateStorage.remove(file))); return { error: null }; },
          async download(file: string) { try { return { data: await privateStorage.download(file), error: null }; } catch (error) { return { data: null, error }; } },
        };
      },
    },
  };
}

// Hostinger deployment source marker.
