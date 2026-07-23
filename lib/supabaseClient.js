import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const CAMPUSES = [
  { key: "columbia", name: "Columbia" },
  { key: "lewisburg", name: "Lewisburg" },
  { key: "shelbyville", name: "Shelbyville" },
];
