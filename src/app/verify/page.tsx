"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Extract tokens from hash fragment
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1)); // Remove the #

    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    const type = params.get("type");
    const error = params.get("error");

    // If there's an error in the hash, redirect to login with error
    if (error) {
      router.push(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    // If we have tokens, redirect to the server callback with them as query params
    if (access_token && refresh_token) {
      const callbackUrl = `/api/auth/callback?access_token=${encodeURIComponent(access_token)}&refresh_token=${encodeURIComponent(refresh_token)}${type ? `&type=${encodeURIComponent(type)}` : ""}`;
      router.push(callbackUrl);
      return;
    }

    // If no tokens, check if there's an error in query params
    const queryError = searchParams.get("error");
    if (queryError) {
      router.push(`/login?error=${encodeURIComponent(queryError)}`);
      return;
    }

    // No tokens or error, redirect to login
    router.push("/login?error=Invalid verification link");
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Verifying your email...</p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
