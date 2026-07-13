import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { getDatabaseUser } from "@/lib/auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const access_token = searchParams.get("access_token");
  const refresh_token = searchParams.get("refresh_token");
  const token = searchParams.get("token");
  const type = searchParams.get("type");
  const error = searchParams.get("error");
  const error_description = searchParams.get("error_description");

  // Handle errors from Supabase
  if (error) {
    console.error("Auth callback error:", error, error_description);
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(error_description || error)}`,
        request.url,
      ),
    );
  }

  try {
    const cookieStore = await cookies();
    const supabase = createClient(supabaseUrl, supabaseKey, {
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

    let user;

    // Handle OAuth-style tokens (access_token + refresh_token)
    if (access_token && refresh_token) {
      const { data, error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (sessionError) {
        console.error("Session error:", sessionError);
        return NextResponse.redirect(
          new URL(
            `/login?error=${encodeURIComponent(sessionError.message)}`,
            request.url,
          ),
        );
      }

      user = data.user;
    }
    // Handle OTP token verification (email confirmation)
    else if (token && type) {
      // For email confirmation, Supabase should have already verified the token
      // and set the session. We just need to get the current session.
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.error("Session error after OTP verification:", sessionError);
        return NextResponse.redirect(
          new URL(
            `/login?error=${encodeURIComponent(sessionError?.message || "No session found after verification")}`,
            request.url,
          ),
        );
      }

      user = session.user;
    }
    // No valid tokens found
    else {
      console.error("Missing tokens in auth callback");
      return NextResponse.redirect(
        new URL(
          "/login?error=Email verification link is invalid or has expired. Please request a new verification link.",
          request.url,
        ),
      );
    }

    if (user) {
      // Update emailVerified status in database
      await prisma.user.update({
        where: { supabaseId: user.id },
        data: { emailVerified: true },
      });

      // Set custom session cookie for middleware compatibility
      cookieStore.set("ojo_admin_session", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 1 day
        path: "/",
        sameSite: "lax",
      });

      // Get user role to determine redirect
      const dbUser = await getDatabaseUser(user.id);
      const userRole = dbUser?.role?.name || "TOURIST";

      // Redirect to role-specific dashboard
      const redirectPath =
        userRole === "TOURIST"
          ? "/dashboard/tourist"
          : userRole === "ADMIN" || userRole === "SUPER_ADMIN"
            ? "/admin"
            : "/dashboard";

      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    // Redirect to dashboard on success (fallback)
    return NextResponse.redirect(new URL("/dashboard/tourist", request.url));
  } catch (error) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(
      new URL("/login?error=verification_failed", request.url),
    );
  }
}
