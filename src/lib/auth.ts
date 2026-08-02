import { prisma } from "./prisma";
import { createServerSupabaseClient } from "./supabase/server";

/** @deprecated Use createServerSupabaseClient for new server-side code. */
export const createSupabaseClient = createServerSupabaseClient;

/** Get a verified Supabase user for the current request. */
export async function getCurrentUser() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    return error ? null : user;
  } catch (error) {
    console.error("[auth] Failed to get current user", error);
    return null;
  }
}

export async function getSession() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export async function getDatabaseUser(supabaseUserId: string) {
  return prisma.user.findUnique({
    where: { supabaseId: supabaseUserId },
    select: {
      id: true,
      email: true,
      fullName: true,
      avatar: true,
      supabaseId: true,
      roleId: true,
      isActive: true,
      emailVerified: true,
      authProvider: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
    },
  });
}

export async function getDatabaseUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: {
      id: true,
      email: true,
      fullName: true,
      avatar: true,
      supabaseId: true,
      roleId: true,
      isActive: true,
      emailVerified: true,
      authProvider: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
    },
  });
}

export function authProviderForUser(supabaseUser: {
  app_metadata?: Record<string, unknown>;
}) {
  const provider = supabaseUser.app_metadata?.provider;
  return typeof provider === "string" && provider ? provider : "email";
}

export async function getCurrentUserWithRole() {
  const supabaseUser = await getCurrentUser();
  return supabaseUser ? getDatabaseUser(supabaseUser.id) : null;
}

/**
 * The only application-profile provisioning path. It is idempotent, gives new
 * accounts the least-privileged role, and never accepts a role from the client.
 */
export async function syncUserWithDatabase(supabaseUser: {
  id: string;
  email?: string;
  email_confirmed_at?: string | null;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
}) {
  const email = supabaseUser.email?.trim().toLowerCase();
  if (!email)
    throw new Error("Authenticated user does not have an email address");

  const fullName =
    typeof supabaseUser.user_metadata?.full_name === "string"
      ? supabaseUser.user_metadata.full_name.trim().slice(0, 100)
      : undefined;
  const emailVerified = Boolean(supabaseUser.email_confirmed_at);
  const authProvider = authProviderForUser(supabaseUser);

  const existing = await prisma.user.findUnique({
    where: { supabaseId: supabaseUser.id },
    select: {
      id: true,
      email: true,
      fullName: true,
      avatar: true,
      supabaseId: true,
      roleId: true,
      isActive: true,
      emailVerified: true,
      authProvider: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
    },
  });

  if (existing) {
    return prisma.user.update({
      where: { id: existing.id },
      data: {
        email,
        fullName: fullName || existing.fullName,
        emailVerified,
        authProvider: existing.authProvider || authProvider,
        lastLoginAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatar: true,
        supabaseId: true,
        roleId: true,
        isActive: true,
        emailVerified: true,
        authProvider: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });
  }

  // A different Auth identity with the same address must be resolved by
  // Supabase account-linking policy, never silently linked by application code.
  const emailOwner = await prisma.user.findUnique({ where: { email } });
  if (emailOwner)
    throw new Error("An application profile already exists for this email");

  const touristRole = await prisma.role.findUnique({
    where: { name: "TOURIST" },
  });
  if (!touristRole) throw new Error("TOURIST role not found in database");

  return prisma.user.create({
    data: {
      email,
      authProvider,
      fullName,
      supabaseId: supabaseUser.id,
      roleId: touristRole.id,
      isActive: true,
      emailVerified,
      lastLoginAt: new Date(),
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      avatar: true,
      supabaseId: true,
      roleId: true,
      isActive: true,
      emailVerified: true,
      authProvider: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
    },
  });
}

export async function signOut() {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) throw error;
  return { success: true, redirectPath: "/login" };
}

export async function hasRole(userId: string, roleName: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
    },
  });
  return user?.role?.name === roleName;
}

export async function hasAnyRole(userId: string, roleNames: string[]) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
    },
  });
  return Boolean(user?.role && roleNames.includes(user.role.name));
}
