"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseConfig } from "./config";

let cached: SupabaseClient | null = null;

/**
 * Browser Supabase client. Returns null when Supabase is not configured so the
 * UI can fall back to the built-in email and password flow.
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!supabaseConfig.url || !supabaseConfig.anonKey) return null;
  if (cached) return cached;
  cached = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
    auth: { persistSession: false, detectSessionInUrl: true },
  });
  return cached;
}
