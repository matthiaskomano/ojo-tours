import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { dashboardPathForRole, safeRedirectPath } from "@/lib/auth/redirects";
import { authProviderForUser, getDatabaseUserByEmail, syncUserWithDatabase } from "@/lib/auth";
import { logAuthEvent } from "@/lib/auth/events";

function callbackError(request: NextRequest) {
  return NextResponse.redirect(
    new URL("/login?error=authentication_failed", request.url),
  );
}

function wrongSignInMethodUrl(request: NextRequest, provider: string | null | undefined) {
  const method = provider === "google" ? "google" : provider === "github" ? "github" : "email";
  return NextResponse.redirect(new URL(`/login?error=use_${method}`, request.url));
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const requestedNext = requestUrl.searchParams.get("next");
  const next = requestedNext ? safeRedirectPath(requestedNext) : null;
  const response = NextResponse.redirect(new URL("/login", request.url));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) =>
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          ),
      },
    },
  );

  let user;
  let eventType = "oauth";

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error || !data.user) return callbackError(request);
    user = data.user;
  } else if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as
        | "signup"
        | "recovery"
        | "invite"
        | "email_change"
        | "magiclink",
    });
    if (error || !data.user) return callbackError(request);
    user = data.user;
    eventType = type;
  } else {
    // Never accept access or refresh tokens via URL query parameters.
    return callbackError(request);
  }

  if (eventType === "recovery") {
    response.headers.set(
      "Location",
      new URL("/update-password", request.url).toString(),
    );
    return response;
  }

  try {
    const existingUser = user.email ? await getDatabaseUserByEmail(user.email) : null;
    const provider = authProviderForUser(user);
    if (existingUser?.authProvider && existingUser.authProvider !== provider) {
      await supabase.auth.signOut({ scope: "local" });
      await logAuthEvent({
        event: "oauth_login",
        success: false,
        supabaseUserId: user.id,
        provider,
        metadata: { reason: "wrong_sign_in_method" },
      });
      // Keep the cookie mutations made by signOut so middleware does not see a
      // stale session and immediately redirect away from the explanatory page.
      response.headers.set(
        "Location",
        wrongSignInMethodUrl(request, existingUser.authProvider).toString(),
      );
      return response;
    }

    const dbUser = await syncUserWithDatabase(user);
    if (!dbUser.isActive) return callbackError(request);

    const { data: aal } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    const destination =
      aal?.currentLevel === "aal1" && aal?.nextLevel === "aal2"
        ? `/mfa${next ? `?next=${encodeURIComponent(next)}` : ""}`
        : next || dashboardPathForRole(dbUser.role.name);

    await logAuthEvent({
      event: eventType === "signup" ? "email_verified" : "oauth_login",
      success: true,
      supabaseUserId: user.id,
      provider: eventType === "oauth" ? user.app_metadata.provider : undefined,
    });

    response.headers.set(
      "Location",
      new URL(destination, request.url).toString(),
    );
    return response;
  } catch (error) {
    console.error("[auth] Callback profile provisioning failed", error);
    await supabase.auth.signOut({ scope: "local" });
    return callbackError(request);
  }
}
