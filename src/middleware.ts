import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Validate Supabase session from request cookies
 * This ensures the custom session cookie is backed by a valid Supabase session
 */
async function validateSupabaseSession(request: NextRequest): Promise<boolean> {
  try {
    const accessToken = request.cookies.get("sb-access-token")?.value;
    if (!accessToken) return false;

    const { data, error } = await supabase.auth.getUser(accessToken);
    return !error && !!data.user;
  } catch {
    return false;
  }
}

// Public routes that don't require authentication
const publicRoutes = [
  "/",
  "/tours",
  "/lodges",
  "/journal",
  "/about",
  "/contact",
  "/forgot-password",
  "/update-password",
];

// Auth routes (login/register) - redirect if already authenticated
const authRoutes = ["/login", "/register"];

// Admin routes that require ADMIN or SUPER_ADMIN role
const adminRoutes = ["/admin"];

// Tourist routes that require TOURIST role
const touristRoutes = ["/dashboard/tourist"];

// Dashboard routes that require authentication
const dashboardRoutes = ["/dashboard"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Check if the path is public
  const isPublicRoute = publicRoutes.some((route) => path.startsWith(route));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check if the path is an auth route (login/register)
  const isAuthRoute = authRoutes.some(
    (route) => path === route || path.startsWith(`/(auth)${route}`),
  );

  if (isAuthRoute) {
    // Check if user is already authenticated
    const sessionCookie = request.cookies.get("ojo_admin_session")?.value;
    if (sessionCookie) {
      // User is already logged in, redirect to home
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Check if the path is admin/dashboard/tourist route
  const isAdminRoute = adminRoutes.some((route) => path.startsWith(route));
  const isTouristRoute = touristRoutes.some((route) => path.startsWith(route));
  const isDashboardRoute = dashboardRoutes.some((route) =>
    path.startsWith(route),
  );

  if (isAdminRoute || isTouristRoute || isDashboardRoute) {
    // Check for custom cookie (backward compatibility)
    const sessionCookie = request.cookies.get("ojo_admin_session")?.value;

    if (!sessionCookie) {
      // No session cookie - redirect to login
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Enhanced validation: Check if Supabase session is also valid
    const isSupabaseValid = await validateSupabaseSession(request);
    if (!isSupabaseValid) {
      // Custom cookie exists but Supabase session is invalid
      // Clear the invalid cookie and redirect to login
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("ojo_admin_session");
      return response;
    }

    // For admin/tourist routes, we could add additional role checking here
    // For now, we'll maintain backward compatibility by just checking the cookie
    // Role-based protection will be handled at the layout level
  }

  // Allow all other pages to proceed
  return NextResponse.next();
}

// Tell Next.js exactly which routes this middleware should protect
export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/login",
    "/register",
    "/(auth)/:path*",
  ],
};
