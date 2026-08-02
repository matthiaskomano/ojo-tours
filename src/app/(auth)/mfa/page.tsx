"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { checkAuthStatus, recordMfaEvent } from "@/actions/authActions";

function MfaChallengePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("Loading your authenticator…");
  const [busy, setBusy] = useState(false);
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    void (async () => {
      const { data, error } = await supabase.auth.mfa.listFactors();
      const factor = data?.totp[0];
      if (error || !factor) {
        setMessage(
          "No authenticator app is available. Please sign in again or contact support.",
        );
        return;
      }
      setFactorId(factor.id);
      setMessage("");
    })();
  }, []);

  async function verify() {
    if (!factorId) return;
    setBusy(true);
    const { data: challenge, error: challengeError } =
      await supabase.auth.mfa.challenge({ factorId });
    if (challengeError || !challenge) {
      setBusy(false);
      return setMessage("Unable to verify right now. Please try again.");
    }
    const { error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: code.replace(/\s/g, ""),
    });
    setBusy(false);
    if (error)
      return setMessage("That code is invalid or expired. Try a new code.");
    await recordMfaEvent("mfa_verified");
    const next = searchParams.get("next");
    if (next?.startsWith("/") && !next.startsWith("//")) {
      router.replace(next);
    } else {
      const auth = await checkAuthStatus();
      router.replace(
        auth.role === "ADMIN" || auth.role === "SUPER_ADMIN"
          ? "/dashboard/admin"
          : "/dashboard/tourist",
      );
    }
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#040C08] grid place-items-center p-4">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void verify();
        }}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0A1A12] p-8 text-center"
      >
        <h1 className="text-2xl font-semibold text-white">Verify it's you</h1>
        <p className="mt-2 text-sm text-white/60">
          Enter the six-digit code from your authenticator app.
        </p>
        <input
          inputMode="numeric"
          autoFocus
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={(event) => setCode(event.target.value)}
          className="mt-6 w-full rounded-lg border border-white/15 bg-[#040C08] px-4 py-3 text-center tracking-[0.4em] text-white"
          placeholder="123456"
        />
        {message && (
          <p className="mt-3 text-sm text-gold" role="status">
            {message}
          </p>
        )}
        <button
          disabled={!factorId || code.length !== 6 || busy}
          className="mt-5 w-full rounded-lg bg-gold py-3 font-semibold text-[#040C08] disabled:opacity-50"
        >
          {busy ? "Verifying…" : "Continue"}
        </button>
      </form>
    </main>
  );
}

export default function MfaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#040C08] grid place-items-center p-4">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
      <MfaChallengePage />
    </Suspense>
  );
}
