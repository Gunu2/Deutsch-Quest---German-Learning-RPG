import { createClient } from "@supabase/supabase-js";
import config from "../src/config.js";

const configured = Boolean(
  config.SUPABASE_URL &&
  config.SUPABASE_ANON_KEY &&
  !config.SUPABASE_URL.includes("YOUR_PROJECT")
);

export const supabase = configured
  ? createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    })
  : null;

export const isSupabaseConfigured = configured;