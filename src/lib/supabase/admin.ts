import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { getSupabaseAdminConfig } from "@/lib/env.server";
import type { Database } from "@/types/database";

export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("Supabase Admin client is server-only.");
  }

  const { url, serviceRoleKey } = getSupabaseAdminConfig();

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
