import { createClient } from "@supabase/supabase-js";

// Safe loading of environment variables for both Vite client and Nitro server environment
const supabaseUrl =
  (typeof window !== "undefined" ? import.meta.env.VITE_SUPABASE_URL : "") ||
  import.meta.env.VITE_SUPABASE_URL ||
  (typeof process !== "undefined" ? process.env.VITE_SUPABASE_URL : "") ||
  "";

const supabaseAnonKey =
  (typeof window !== "undefined" ? import.meta.env.VITE_SUPABASE_ANON_KEY : "") ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  (typeof process !== "undefined" ? process.env.VITE_SUPABASE_ANON_KEY : "") ||
  "";

export const isSupabaseConfigured =
  Boolean(supabaseUrl) &&
  supabaseUrl !== "https://your-project-id.supabase.co" &&
  Boolean(supabaseAnonKey) &&
  supabaseAnonKey !== "your-anon-key";

// Use a placeholder URL/Key to prevent crashes during builds or initialization if keys are missing
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : "https://placeholder-project.supabase.co",
  isSupabaseConfigured ? supabaseAnonKey : "placeholder-anon-key"
);
