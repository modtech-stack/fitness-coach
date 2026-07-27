"use client";

import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseConfig } from "@/lib/env";
import type { Database } from "@/types/database";

let browserClient:
  | ReturnType<typeof createBrowserClient<Database>>
  | undefined;

export function createClient() {
  if (!browserClient) {
    const { url, publishableKey } = getSupabaseConfig();
    browserClient = createBrowserClient<Database>(
      url,
      publishableKey,
    );
  }

  return browserClient;
}
