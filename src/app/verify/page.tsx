"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/** Compatibility page for old verification links. New emails go directly to the callback. */
function VerifyEmailContent() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const tokenHash = params.get("token_hash");
    const type = params.get("type");
    if (tokenHash && type) {
      router.replace(`/api/auth/callback?token_hash=${encodeURIComponent(tokenHash)}&type=${encodeURIComponent(type)}`);
      return;
    }
    router.replace("/login?error=verification_link_expired");
  }, [params, router]);

  return <main className="min-h-screen grid place-items-center">Verifying your email…</main>;
}

export default function VerifyEmailPage() {
  return <Suspense fallback={<main className="min-h-screen grid place-items-center">Verifying your email…</main>}><VerifyEmailContent /></Suspense>;
}
