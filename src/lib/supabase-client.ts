"use client";

import { createBrowserSupabaseClient } from "./supabase/client";

// Compatibility export for existing realtime consumers.
export const supabase = createBrowserSupabaseClient();

export async function clearClientSession() {
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) console.error("[auth] Client sign-out failed", error);
}
