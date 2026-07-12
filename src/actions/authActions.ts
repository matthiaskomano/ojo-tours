"use server";

import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import {
  syncUserWithDatabase,
  setSessionCookie,
  signOut,
  createSupabaseClient,
  getDatabaseUser,
} from "@/lib/auth";
import { loginSchema, registerSchema } from "@/lib/validations/auth";

// Initialize Supabase Client
// Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are in your .env file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    // If Supabase rejects the login, return the error to the UI
    return { success: false, error: "Invalid email or password." };
  }

  // 2. Check if user exists and email is verified
  if (data.user) {
    try {
      const dbUser = await getDatabaseUser(data.user.id);

      // Check if email is verified
      if (dbUser && !dbUser.emailVerified) {
        return {
          success: false,
          error:
            "Please verify your email before logging in. Check your inbox for the verification link.",
        };
      }

      // Sync user with database (update last login)
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

  // 4. Get user role to determine redirect
  const dbUser = await getDatabaseUser(data.user.id);
  const userRole = dbUser?.role?.name || "TOURIST";

  return { success: true, role: userRole };
}

// --- LOGOUT FUNCTION ---
export async function logoutUser() {
  // Use the centralized signOut function
  await signOut();
}

// --- CHECK AUTH STATUS FOR CLIENT COMPONENTS ---
export async function checkAuthStatus() {
  try {
    const client = await createSupabaseClient();
    const {
      data: { session },
    } = await client.auth.getSession();

    if (!session?.user) {
      return { authenticated: false, user: null, role: null };
    }

    // Fetch database user with role information
    const dbUser = await getDatabaseUser(session.user.id);

    return {
      authenticated: true,
      user: session.user,
      role: dbUser?.role?.name || "TOURIST",
    };
  } catch (error) {
    console.error("Error checking auth status:", error);
    return { authenticated: false, user: null, role: null };
  }
}

// --- NEW: FORGOT PASSWORD FUNCTION ---
export async function requestPasswordReset(formData: FormData) {
  const email = formData.get("email") as string;

  if (!email) return { success: false, error: "Email is required" };

  try {
    const supabase = await createSupabaseClient();
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
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/callback`,
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

    // 3. Don't set session cookie - user needs to verify email first
    // await setSessionCookie();

    return {
      success: true,
      message:
        "Registration successful! Please check your email to verify your account.",
    };
  } catch (error: any) {
    console.error("Registration error:", error);
    return { success: false, error: "Registration failed. Please try again." };
  }
}
