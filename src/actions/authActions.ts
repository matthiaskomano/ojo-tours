"use server";

import { z } from "zod";
import { dashboardPathForRole, safeRedirectPath } from "@/lib/auth/redirects";
import {
  createSupabaseClient,
  getDatabaseUserByEmail,
  getCurrentUser,
  getDatabaseUser,
  signOut,
  syncUserWithDatabase,
} from "@/lib/auth";
import { loginSchema, registerSchema } from "@/lib/validations/auth";
import { logAuthEvent } from "@/lib/auth/events";

const oauthProviderSchema = z.enum(["google", "github"]);
const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/\d/, "Password must contain a number")
  .regex(/[^a-zA-Z\d]/, "Password must contain a special character");

function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

function providerLabel(provider: string | null | undefined) {
  if (provider === "google") return "Google";
  if (provider === "github") return "GitHub";
  return "email and password";
}

export async function loginUser(formData: FormData) {
  const validation = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });
  if (!validation.success) {
    return { success: false, error: validation.error.flatten().fieldErrors.username?.[0] || validation.error.flatten().fieldErrors.password?.[0] || "Validation failed" };
  }

  const email = validation.data.username.trim().toLowerCase();
  const existingUser = await getDatabaseUserByEmail(email);
  if (existingUser?.authProvider && existingUser.authProvider !== "email") {
    return {
      success: false,
      error: `This account was created with ${providerLabel(existingUser.authProvider)}. Please continue with ${providerLabel(existingUser.authProvider)}.`,
    };
  }

  const supabase = await createSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: validation.data.password,
  });
  if (error || !data.user) {
    await logAuthEvent({ event: "login", success: false, provider: "password" });
    return { success: false, error: "Invalid email or password." };
  }

  if (!data.user.email_confirmed_at) {
    await supabase.auth.signOut({ scope: "local" });
    return { success: false, error: "Please verify your email before logging in." };
  }

  try {
    const dbUser = await syncUserWithDatabase(data.user);
    if (!dbUser.isActive) {
      await supabase.auth.signOut({ scope: "local" });
      return { success: false, error: "This account is inactive. Please contact support." };
    }

    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    await logAuthEvent({ event: "login", success: true, provider: "password", supabaseUserId: data.user.id });
    return {
      success: true,
      role: dbUser.role.name,
      requiresMfa: aal.currentLevel === "aal1" && aal.nextLevel === "aal2",
    };
  } catch (error) {
    console.error("[auth] Profile sync failed after password login", error);
    await logAuthEvent({ event: "login", success: false, provider: "password", supabaseUserId: data.user.id });
    await supabase.auth.signOut({ scope: "local" });
    return { success: false, error: "We could not complete sign-in. Please try again." };
  }
}

/** Starts a PKCE OAuth flow; the verifier is stored in the SSR cookie session. */
export async function startOAuthSignIn(providerInput: string, requestedPath?: string | null) {
  const provider = oauthProviderSchema.safeParse(providerInput);
  if (!provider.success) return { success: false, error: "Unsupported sign-in provider." };

  const supabase = await createSupabaseClient();
  const callbackUrl = new URL(`${appUrl()}/api/auth/callback`);
  if (requestedPath?.startsWith("/") && !requestedPath.startsWith("//")) {
    callbackUrl.searchParams.set("next", safeRedirectPath(requestedPath));
  }
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider.data,
    options: { redirectTo: callbackUrl.toString() },
  });
  if (error || !data.url) return { success: false, error: "Unable to start social sign-in. Please try again." };
  return { success: true, url: data.url };
}

export async function logoutUser() {
  const user = await getCurrentUser();
  const result = await signOut();
  await logAuthEvent({ event: "logout", success: true, supabaseUserId: user?.id });
  return result;
}

export async function checkAuthStatus() {
  const user = await getCurrentUser();
  if (!user) return { authenticated: false, user: null, role: null };

  const dbUser = await getDatabaseUser(user.id);
  if (!dbUser || !dbUser.isActive) return { authenticated: false, user: null, role: null };

  return {
    authenticated: true,
    user: { ...dbUser, email: user.email, fullName: dbUser.fullName || user.user_metadata?.full_name || "" },
    role: dbUser.role.name,
  };
}

export async function requestPasswordReset(formData: FormData) {
  const email = z.string().email().safeParse(formData.get("email"));
  // Deliberately generic to reduce account enumeration.
  if (!email.success) return { success: true };

  const supabase = await createSupabaseClient();
  await supabase.auth.resetPasswordForEmail(email.data.toLowerCase(), {
    redirectTo: `${appUrl()}/update-password`,
  });
  await logAuthEvent({ event: "password_reset_requested", success: true });
  return { success: true };
}

export async function resendVerificationEmail(emailInput: string) {
  const email = z.string().email().safeParse(emailInput);
  if (!email.success) return { success: false, error: "Enter a valid email address." };

  const supabase = await createSupabaseClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: email.data.toLowerCase(),
    options: { emailRedirectTo: `${appUrl()}/api/auth/callback` },
  });
  return error ? { success: false, error: "Unable to send verification email. Please try again later." } : { success: true };
}

export async function registerUser(formData: FormData) {
  const validation = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!validation.success) {
    return { success: false, error: Object.values(validation.error.flatten().fieldErrors)[0]?.[0] || "Validation failed" };
  }

  const existingUser = await getDatabaseUserByEmail(validation.data.email);
  if (existingUser) {
    const provider = providerLabel(existingUser.authProvider);
    return {
      success: false,
      error: `An account already exists with this email. Please sign in with ${provider}.`,
    };
  }

  const supabase = await createSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email: validation.data.email.trim().toLowerCase(),
    password: validation.data.password,
    options: {
      data: { full_name: validation.data.fullName.trim() },
      emailRedirectTo: `${appUrl()}/api/auth/callback`,
    },
  });

  // Supabase intentionally returns a generic success response for existing
  // accounts when confirmation is enabled; preserve that anti-enumeration behavior.
  if (error) {
    await logAuthEvent({ event: "registration", success: false, provider: "password" });
    return { success: false, error: "Unable to create your account. Please try again." };
  }
  await logAuthEvent({ event: "registration", success: true, provider: "password", supabaseUserId: data.user?.id });
  return { success: true, message: "Check your inbox to verify your email address." };
}

export async function updatePassword(formData: FormData) {
  const password = passwordSchema.safeParse(formData.get("password"));
  const confirmPassword = formData.get("confirmPassword");
  if (!password.success || password.data !== confirmPassword) {
    return { success: false, error: password.success ? "Passwords do not match." : password.error.issues[0]?.message };
  }

  const supabase = await createSupabaseClient();
  const { error } = await supabase.auth.updateUser({ password: password.data });
  if (error) return { success: false, error: "Password reset link is invalid or expired. Request a new one." };

  // Password changes end every session; the user signs in again with the new password.
  const user = await getCurrentUser();
  await logAuthEvent({ event: "password_reset_completed", success: true, supabaseUserId: user?.id });
  await supabase.auth.signOut({ scope: "global" });
  return { success: true };
}

export async function getPostAuthRedirect(role: string | null, requestedPath?: string | null) {
  return requestedPath ? safeRedirectPath(requestedPath) : dashboardPathForRole(role);
}

export async function recordMfaEvent(event: "mfa_enrolled" | "mfa_verified" | "mfa_disabled") {
  const user = await getCurrentUser();
  if (!user) return;
  await logAuthEvent({ event, success: true, supabaseUserId: user.id });
}
