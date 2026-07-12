import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const access_token = searchParams.get("access_token");
  const refresh_token = searchParams.get("refresh_token");
  const error = searchParams.get("error");
  const error_description = searchParams.get("error_description");

  // Handle errors from Supabase
  if (error) {
    console.error("Auth callback error:", error, error_description);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error_description || error)}`, request.url)
    );
  }

  if (!access_token || !refresh_token) {
    return NextResponse.redirect(
      new URL("/login?error=missing_tokens", request.url)
    );
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Exchange the tokens for a session
    const { data, error: sessionError } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    if (sessionError) {
      console.error("Session error:", sessionError);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(sessionError.message)}`, request.url)
      );
    }

    if (data.user) {
      // Update emailVerified status in database
      await prisma.user.update({
        where: { supabaseId: data.user.id },
        data: { emailVerified: true },
      });
    }

    // Redirect to dashboard on success
    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(
      new URL("/login?error=verification_failed", request.url)
    );
  }
}
