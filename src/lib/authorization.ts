import { getCurrentUserWithRole } from "./auth";
import { prisma } from "./prisma";

/**
 * Authorization utilities for RBAC
 * Provides role-based and permission-based access control
 */

/**
 * Authorization error class
 */
export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthorizationError";
  }
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUserWithRole();

  if (!user) {
    throw new AuthorizationError("Authentication required");
  }

  if (!user.isActive) {
    throw new AuthorizationError("Account is inactive");
  }

  return user;
}

/**
 * Require specific role - throws error if user doesn't have the role
 */
export async function requireRole(roleName: string) {
  const user = await requireAuth();

  if (user.role?.name !== roleName) {
    throw new AuthorizationError(`Role '${roleName}' required`);
  }

  return user;
}

/**
 * Require any of the specified roles - throws error if user doesn't have any
 */
export async function requireAnyRole(roleNames: string[]) {
  const user = await requireAuth();

  if (!user.role || !roleNames.includes(user.role.name)) {
    throw new AuthorizationError(
      `One of the following roles required: ${roleNames.join(", ")}`,
    );
  }

  return user;
}

/**
 * Require minimum role level - throws error if user's role is below the minimum
 * Role hierarchy: SUPER_ADMIN > ADMIN > STAFF > TOURIST
 */
export async function requireMinimumRole(minimumRole: string) {
  const roleHierarchy: Record<string, number> = {
    TOURIST: 0,
    STAFF: 1,
    ADMIN: 2,
    SUPER_ADMIN: 3,
  };

  const user = await requireAuth();
  const userRoleName = user.role?.name || "TOURIST";
  const userLevel = roleHierarchy[userRoleName] ?? 0;
  const requiredLevel = roleHierarchy[minimumRole] ?? 0;

  if (userLevel < requiredLevel) {
    throw new AuthorizationError(`Minimum role '${minimumRole}' required`);
  }

  return user;
}

/**
 * Check if user has specific role (non-throwing)
 */
export async function hasRole(roleName: string): Promise<boolean> {
  try {
    const user = await getCurrentUserWithRole();
    return user?.role?.name === roleName;
  } catch {
    return false;
  }
}

/**
 * Check if user has any of the specified roles (non-throwing)
 */
export async function hasAnyRole(roleNames: string[]): Promise<boolean> {
  try {
    const user = await getCurrentUserWithRole();
    return user?.role ? roleNames.includes(user.role.name) : false;
  } catch {
    return false;
  }
}

/**
 * Check if user meets minimum role level (non-throwing)
 */
export async function meetsMinimumRole(minimumRole: string): Promise<boolean> {
  try {
    const roleHierarchy: Record<string, number> = {
      TOURIST: 0,
      STAFF: 1,
      ADMIN: 2,
      SUPER_ADMIN: 3,
    };

    const user = await getCurrentUserWithRole();
    if (!user?.role) return false;

    const userLevel = roleHierarchy[user.role.name] ?? 0;
    const requiredLevel = roleHierarchy[minimumRole] ?? 0;

    return userLevel >= requiredLevel;
  } catch {
    return false;
  }
}

/**
 * Check if user has specific permission (future-ready)
 */
export async function hasPermission(permissionName: string): Promise<boolean> {
  try {
    const user = await getCurrentUserWithRole();
    if (!user?.role) return false;

    const roleWithPermissions = await prisma.role.findUnique({
      where: { id: user.roleId },
      include: {
        permissions: true,
      },
    });

    return (
      roleWithPermissions?.permissions.some(
        (permission) => permission.name === permissionName,
      ) || false
    );
  } catch {
    return false;
  }
}

/**
 * Require specific permission (future-ready)
 */
export async function requirePermission(permissionName: string) {
  const userHasPermission = await hasPermission(permissionName);

  if (!userHasPermission) {
    throw new AuthorizationError(`Permission '${permissionName}' required`);
  }

  return await getCurrentUserWithRole();
}

/**
 * Get user's role name
 */
export async function getUserRole(): Promise<string | null> {
  try {
    const user = await getCurrentUserWithRole();
    return user?.role?.name || null;
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated (non-throwing)
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const user = await getCurrentUserWithRole();
    return user !== null && user.isActive;
  } catch {
    return false;
  }
}

/**
 * Authorization decorator for Server Actions
 * Wraps a function with role-based authorization
 */
export function withAuthorization<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: {
    requireAuth?: boolean;
    requireRole?: string;
    requireAnyRole?: string[];
    requireMinimumRole?: string;
  },
): T {
  return (async (...args: Parameters<T>) => {
    // Apply authorization checks
    if (options.requireAuth) {
      await requireAuth();
    }

    if (options.requireRole) {
      await requireRole(options.requireRole);
    }

    if (options.requireAnyRole) {
      await requireAnyRole(options.requireAnyRole);
    }

    if (options.requireMinimumRole) {
      await requireMinimumRole(options.requireMinimumRole);
    }

    // Execute the original function
    return fn(...args);
  }) as T;
}

/**
 * Role-based route protection helper
 * Returns redirect URL if unauthorized, null if authorized
 */
export async function checkRouteAccess(
  requiredRoles?: string[],
  minimumRole?: string,
): Promise<string | null> {
  try {
    if (requiredRoles) {
      await requireAnyRole(requiredRoles);
    } else if (minimumRole) {
      await requireMinimumRole(minimumRole);
    } else {
      await requireAuth();
    }

    return null; // Authorized
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return "/login"; // Redirect to login
    }
    return "/login"; // Default to login on any error
  }
}
