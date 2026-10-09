/**
 * Supabase configuration point.
 *
 * NoorHub runs on PostgreSQL through Drizzle. When Supabase credentials are
 * present, the app can additionally use Supabase Auth (for example Google
 * sign-in) and Supabase Row Level Security policies (see src/db/policies.sql).
 *
 * Secrets are read only on the server. The anon key is the only value ever
 * exposed to the browser, which is how Supabase is designed to be used.
 */
export const supabaseConfig = {
  url: process.env.SUPABASE_URL ?? "",
  anonKey: process.env.SUPABASE_ANON_KEY ?? "",
};

export function isSupabaseEnabled() {
  return Boolean(supabaseConfig.url && supabaseConfig.anonKey);
}

export const SUPABASE_ENV_KEYS = ["SUPABASE_URL", "SUPABASE_ANON_KEY"] as const;
