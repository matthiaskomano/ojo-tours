const DEFAULT_REDIRECT = "/dashboard/tourist";
const AUTH_PATHS = new Set(["/login", "/register"]);

/** Only permit local, application-owned redirects after authentication. */
export function isSafeRedirectPath(value: string | null | undefined): value is string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return false;
  }

  // Never send a user back to an authentication route. In particular, this
  // prevents a nested `callbackUrl` on /login from recreating a redirect loop.
  return !AUTH_PATHS.has(new URL(value, "http://localhost").pathname);
}

export function safeRedirectPath(value: string | null | undefined): string {
  return isSafeRedirectPath(value) ? value : DEFAULT_REDIRECT;
}

export function dashboardPathForRole(role: string | null | undefined): string {
  if (role === "ADMIN" || role === "SUPER_ADMIN") {
    return "/dashboard/admin";
  }

  if (role === "STAFF") return "/dashboard";

  return DEFAULT_REDIRECT;
}
