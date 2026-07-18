import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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
  const isPublicRoute = publicRoutes.some((route) => {
    if (route === "/") {
      return path === "/";
    }
    return path === route || path.startsWith(route + "/");
  });


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

    // Session cookie exists — allow the request through.
    // Full Supabase + database auth validation is handled by layout-level
    // Server Components (getCurrentUserWithRole) which have proper access
    // to Supabase session cookies and Prisma.
    // This avoids a blocking network call in middleware and prevents
    // cookie-name mismatch issues with Supabase's dynamic cookie names.
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
