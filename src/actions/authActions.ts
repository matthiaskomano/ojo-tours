"use server";

import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { syncUserWithDatabase, setSessionCookie, signOut } from "@/lib/auth";
import { loginSchema, registerSchema } from "@/lib/validations/auth";

// Initialize Supabase Client
// Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are in your .env file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function loginUser(formData: FormData) {
  // NOTE: Supabase requires an email for login, so "username" from the form will now be treated as an email.
  const email = formData.get("username") as string;
  const password = formData.get("password") as string;

  // Validate input using Zod
  const validationResult = loginSchema.safeParse({
    username: email,
    password: password,
  });

  if (!validationResult.success) {
    const errors = validationResult.error.flatten().fieldErrors;
    const firstError = Object.values(errors)[0]?.[0] || "Validation failed";
    return { success: false, error: firstError };
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

  // 2. Sync user with database and load role
  if (data.user) {
    try {
      await syncUserWithDatabase(
        data.user.id,
        data.user.email || "",
        data.user.user_metadata?.full_name,
      );
    } catch (syncError) {
      console.error("Error syncing user with database:", syncError);
      // Continue anyway - login should still work
    }
  }

  // 3. If successful, set the custom cookie so your middleware.ts keeps working perfectly!
  await setSessionCookie();

  return { success: true };
}

// --- LOGOUT FUNCTION ---
export async function logoutUser() {
  // Use the centralized signOut function
  await signOut();
}

// --- NEW: FORGOT PASSWORD FUNCTION ---
export async function requestPasswordReset(formData: FormData) {
  const email = formData.get("email") as string;

  if (!email) return { success: false, error: "Email is required" };

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // This is the URL they will be sent to when they click the email link
      redirectTo: "https://ojo-tours.vercel.app/update-password",
    });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- NEW: REGISTER FUNCTION ---
export async function registerUser(formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // Validate input using Zod
  const validationResult = registerSchema.safeParse({
    fullName,
    email,
    password,
    confirmPassword,
  });

  if (!validationResult.success) {
    const errors = validationResult.error.flatten().fieldErrors;
    const firstError = Object.values(errors)[0]?.[0] || "Validation failed";
    return { success: false, error: firstError };
  }

  try {
    // 1. Create user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      // Handle specific Supabase errors
      if (error.message.includes("already registered")) {
        return {
          success: false,
          error: "An account with this email already exists.",
        };
      }
      return { success: false, error: error.message };
    }

    // 2. Sync user with database (assigns default TOURIST role)
    if (data.user) {
      try {
        await syncUserWithDatabase(
          data.user.id,
          data.user.email || "",
          fullName,
        );
      } catch (syncError) {
        console.error("Error syncing user with database:", syncError);
        // Continue anyway - registration should still work
      }
    }

    // 3. Set session cookie
    await setSessionCookie();

    return { success: true };
  } catch (error: any) {
    console.error("Registration error:", error);
    return { success: false, error: "Registration failed. Please try again." };
  }
}
