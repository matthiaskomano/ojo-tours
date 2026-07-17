import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Clear client-side Supabase session
 * This should be called after server-side logout to ensure complete session cleanup
 */
export async function clearClientSession() {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error("[supabase-client] Error clearing client session:", error);
  }
}
