"use server";

import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client
// Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are in your .env file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function loginUser(formData: FormData) {
  // NOTE: Supabase requires an email for login, so "username" from the form will now be treated as an email.
  const email = formData.get("username") as string; 
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Email and password are required." };
  }

  // 1. Verify credentials securely with Supabase Authentication
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    // If Supabase rejects the login, return the error to the UI
    return { success: false, error: "Invalid email or password." };
  }

  // 2. If successful, set the custom cookie so your middleware.ts keeps working perfectly!
  const cookieStore = await cookies();
  cookieStore.set("ojo_admin_session", "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // Expires in 1 day
    path: "/",
  });
  
  return { success: true };
}

// --- LOGOUT FUNCTION ---
export async function logoutUser() {
  // 1. Tell Supabase to securely sign out
  await supabase.auth.signOut();

  // 2. Destroy the local Next.js session cookie
  const cookieStore = await cookies();
  cookieStore.delete("ojo_admin_session");
}

// --- NEW: FORGOT PASSWORD FUNCTION ---
export async function requestPasswordReset(formData: FormData) {
  const email = formData.get("email") as string;

  if (!email) return { success: false, error: "Email is required" };

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // This is the URL they will be sent to when they click the email link
      redirectTo: 'https://ojo-tours.vercel.app/update-password', 
    });

    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}