import { getSupabaseConfig } from "@/lib/env";

type SupabaseAdminConfig = {
  url: string;
  serviceRoleKey: string;
};

export function getSupabaseAdminConfig(): SupabaseAdminConfig {
  const { url } = getSupabaseConfig();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "Supabase Admin environment is not configured. Set SUPABASE_SERVICE_ROLE_KEY on the server.",
    );
  }

  return { url, serviceRoleKey };
}
