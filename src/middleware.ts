import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = new Set([
  "/",
  "/tours",
  "/lodges",
  "/journal",
  "/about",
  "/contact",
  "/forgot-password",
  "/update-password",
  "/verify",
  "/mfa",
]);
const AUTH_PATHS = new Set(["/login", "/register"]);

function isPublicPath(pathname: string) {
  return (
    PUBLIC_PATHS.has(pathname) ||
    pathname.startsWith("/tours/") ||
    pathname.startsWith("/lodges/") ||
    pathname.startsWith("/journal/") ||
    pathname.startsWith("/api/auth/")
  );
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser validates against Supabase Auth. Do not trust a value read from a
  // cookie or getSession() for authorization decisions.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  if (AUTH_PATHS.has(path)) {
    // Auth pages must be reachable without a session. Treating /login as a
    // protected page recursively appends callbackUrl until the request headers
    // exceed the browser/server limit (HTTP 431).
    if (user) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return response;
  }

  if (!isPublicPath(path) && !user) {
    const loginUrl = new URL("/login", request.url);
    const attemptedPath = path + request.nextUrl.search;
    if (path !== "/login" && path !== "/register") {
      loginUrl.searchParams.set("callbackUrl", attemptedPath);
    }
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
