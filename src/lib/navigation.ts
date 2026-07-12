/**
 * Navigation utilities for role-based dashboard routing
 * Provides centralized mapping of user roles to their corresponding dashboard routes
 */

export interface DashboardRoute {
  label: string;
  href: string;
  icon?: string;
}

/**
 * Role-to-dashboard mapping configuration
 * Centralized location for managing role-based navigation
 */
export const ROLE_DASHBOARD_MAP: Record<string, DashboardRoute> = {
  TOURIST: {
    label: "My Dashboard",
    href: "/dashboard/tourist",
  },
  STAFF: {
    label: "My Dashboard",
    href: "/dashboard/staff", // Future route
  },
  ADMIN: {
    label: "Admin Panel",
    href: "/dashboard/admin",
  },
  SUPER_ADMIN: {
    label: "Admin Panel",
    href: "/dashboard/admin",
  },
};

/**
 * Role display labels for UI purposes
 */
export const ROLE_LABELS: Record<string, string> = {
  TOURIST: "Explorer",
  STAFF: "Staff Member",
  ADMIN: "Administrator",
  SUPER_ADMIN: "Super Admin",
};

/**
 * Get dashboard route configuration for a specific role
 * @param role - The user's role name
 * @returns Dashboard route configuration or default TOURIST route
 */
export function getDashboardForRole(role: string | null | undefined): DashboardRoute {
  if (!role) {
    return ROLE_DASHBOARD_MAP.TOURIST;
  }
  return ROLE_DASHBOARD_MAP[role] || ROLE_DASHBOARD_MAP.TOURIST;
}

/**
 * Get display label for a role
 * @param role - The user's role name
 * @returns Human-readable role label
 */
export function getRoleLabel(role: string | null | undefined): string {
  if (!role) {
    return ROLE_LABELS.TOURIST;
  }
  return ROLE_LABELS[role] || ROLE_LABELS.TOURIST;
}

/**
 * Check if a role has admin-level access
 * @param role - The user's role name
 * @returns True if role is ADMIN or SUPER_ADMIN
 */
export function isAdminRole(role: string | null | undefined): boolean {
  if (!role) return false;
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

/**
 * Get all available dashboard routes (for admin/debugging purposes)
 * @returns Array of all dashboard route configurations
 */
export function getAllDashboardRoutes(): DashboardRoute[] {
  return Object.values(ROLE_DASHBOARD_MAP);
}
