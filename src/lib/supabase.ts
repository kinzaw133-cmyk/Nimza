import { createClient } from "@supabase/supabase-js";

let rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
let rawKey = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  ""
).trim();

// Strip any inadvertent placeholder suffixes
if (rawUrl.includes("your_project_url")) {
  rawUrl = rawUrl.replace("your_project_url", "").trim();
}
if (rawKey.includes("your_publishable_key")) {
  rawKey = rawKey.replace("your_publishable_key", "").trim();
}

const supabaseUrl = rawUrl;
const supabaseKey = rawKey;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  !supabaseUrl.includes("placeholder") &&
  supabaseUrl.startsWith("http")
);

export const configured = isSupabaseConfigured;

export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : "https://placeholder.supabase.co",
  isSupabaseConfigured ? supabaseKey : "placeholder",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: isSupabaseConfigured,
      detectSessionInUrl: isSupabaseConfigured,
    },
  }
);
