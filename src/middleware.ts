import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

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

  // Check if the path is admin/dashboard route
  const isAdminRoute = adminRoutes.some((route) => path.startsWith(route));
  const isDashboardRoute = dashboardRoutes.some((route) =>
    path.startsWith(route),
  );

  if (isAdminRoute || isDashboardRoute) {
    // Check for custom cookie (backward compatibility)
    const sessionCookie = request.cookies.get("ojo_admin_session")?.value;

    if (!sessionCookie) {
      // No session cookie - redirect to login
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // For admin routes, we could add additional role checking here
    // For now, we'll maintain backward compatibility by just checking the cookie
    // Future enhancement: Verify Supabase session and check user role
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
