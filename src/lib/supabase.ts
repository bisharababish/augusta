/* eslint-disable prettier/prettier */

import { createClient } from "@supabase/supabase-js";

// Augusta Victoria Hospital — Supabase project
const SUPABASE_URL = "https://ettcnksmirshaakqxqis.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_8a_IWUoc8kTkc0I4sHPH3g_ZXCF3tGa";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
});

export type DbRole = "patient" | "doctor" | "nurse" | "escort" | "admin";

export interface Profile {
  id: string;
  full_name: string;
  id_number: string;
  phone: string | null;
  date_of_birth: string | null;
  gender: "male" | "female" | "other" | null;
  created_at: string;
}
