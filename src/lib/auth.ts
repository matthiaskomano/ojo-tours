import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { cache } from "react";

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create a cookie-aware Supabase client for server-side operations
export async function createSupabaseClient() {
  const cookieStore = await cookies();
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      storage: {
        getItem: (key: string) => {
          return cookieStore.get(key)?.value ?? null;
        },
        setItem: (key: string, value: string) => {
          cookieStore.set(key, value);
        },
        removeItem: (key: string) => {
          cookieStore.delete(key);
        },
      },
    },
  });
}

// Legacy export for backward compatibility
const supabase = createClient(supabaseUrl, supabaseKey);
export { supabase };

/**
 * Get the current session from Supabase
 */
export const getSession = cache(async () => {
  try {
    const client = await createSupabaseClient();
    const {
      data: { session },
    } = await client.auth.getSession();
    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
});

/**
 * Get the current user from Supabase
 */
export const getCurrentUser = cache(async () => {
  try {
    const client = await createSupabaseClient();
    const {
      data: { user },
    } = await client.auth.getUser();
    return user;
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
});

/**
 * Get the database user record with role information
 */
export const getDatabaseUser = cache(async (supabaseUserId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { supabaseId: supabaseUserId },
      include: {
        role: true,
      },
    });
    return user;
  } catch (error) {
    console.error("Error getting database user:", error);
    return null;
  }
});

/**
 * Get the current user with full database information
 */
export const getCurrentUserWithRole = cache(async () => {
  try {
    const supabaseUser = await getCurrentUser();
    if (!supabaseUser) {
      return null;
    }

    const dbUser = await getDatabaseUser(supabaseUser.id);
    return dbUser;
  } catch (error) {
    console.error("Error getting current user with role:", error);
    return null;
  }
});


/**
 * Create or update user in database after Supabase auth
 */
export async function syncUserWithDatabase(
  supabaseUserId: string,
  email: string,
  fullName?: string,
) {
  try {
    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { supabaseId: supabaseUserId },
      include: { role: true },
    });

    if (!user) {
      // Get default TOURIST role
      const touristRole = await prisma.role.findUnique({
        where: { name: "TOURIST" },
      });

      if (!touristRole) {
        throw new Error("TOURIST role not found in database");
      }

      // Create new user with default TOURIST role
      user = await prisma.user.create({
        data: {
          email,
          fullName,
          supabaseId: supabaseUserId,
          roleId: touristRole.id,
          isActive: true,
          emailVerified: false,
        },
        include: { role: true },
      });
    } else {
      // Update last login
      user = await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
        include: { role: true },
      });
    }

    return user;
  } catch (error) {
    console.error("Error syncing user with database:", error);
    throw error;
  }
}

/**
 * Check if user has a specific role
 */
export async function hasRole(
  userId: string,
  roleName: string,
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    return user?.role?.name === roleName;
  } catch (error) {
    console.error("Error checking user role:", error);
    return false;
  }
}

/**
 * Check if user has any of the specified roles
 */
export async function hasAnyRole(
  userId: string,
  roleNames: string[],
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    return roleNames.includes(user?.role?.name || "");
  } catch (error) {
    console.error("Error checking user roles:", error);
    return false;
  }
}

/**
 * Set custom session cookie for middleware compatibility
 */
export async function setSessionCookie() {
  try {
    const cookieStore = await cookies();
    cookieStore.set("ojo_admin_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
      sameSite: "lax",
    });
  } catch (error) {
    console.error("Error setting session cookie:", error);
  }
}

/**
 * Delete custom session cookie
 */
export async function deleteSessionCookie() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("ojo_admin_session");
  } catch (error) {
    console.error("Error deleting session cookie:", error);
  }
}

/**
 * Sign out from Supabase and clear session
 * @param redirectPath - Optional path to redirect after logout (default: "/login")
 */
export async function signOut(redirectPath: string = "/login") {
  try {
    const client = await createSupabaseClient();
    await client.auth.signOut();

    await deleteSessionCookie();

    const result = { success: true, redirectPath };
    return result;
  } catch (error) {
    console.error("[auth.ts] Error signing out:", error);
    throw error;
  }
}
