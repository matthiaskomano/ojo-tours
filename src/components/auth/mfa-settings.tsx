"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { recordMfaEvent } from "@/actions/authActions";

type Factor = { id: string; friendly_name?: string };

export function MfaSettings() {
  const [factors, setFactors] = useState<Factor[]>([]);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [totpSecret, setTotpSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const supabase = createBrowserSupabaseClient();

  const loadFactors = async () => {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error)
      return setMessage("Unable to load multi-factor authentication settings.");
    setFactors(
      data.totp.map((factor) => ({
        id: factor.id,
        friendly_name: factor.friendly_name,
      })),
    );
  };

  useEffect(() => {
    void loadFactors();
  }, []);

  async function beginEnrollment() {
    setBusy(true);
    setMessage(null);
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Authenticator app",
    });
    setBusy(false);
    if (error) return setMessage(error.message);
    if (!data?.totp?.qr_code) {
      return setMessage(
        "MFA setup did not return a QR code. Confirm TOTP MFA is enabled in your Supabase project and try again.",
      );
    }
    setFactorId(data.id);
    setQrCode(data.totp.qr_code);
    setTotpSecret(data.totp.secret);
  }

  async function verifyFactor(id: string) {
    setBusy(true);
    setMessage(null);
    const { data: challenge, error: challengeError } =
      await supabase.auth.mfa.challenge({ factorId: id });
    if (challengeError || !challenge) {
      setBusy(false);
      return setMessage("Unable to verify this code. Please try again.");
    }
    const { error } = await supabase.auth.mfa.verify({
      factorId: id,
      challengeId: challenge.id,
      code: code.replace(/\s/g, ""),
    });
    setBusy(false);
    if (error)
      return setMessage("That code is invalid or expired. Try a new code.");
    setMessage(
      "Authenticator app enabled. Your other sessions have been signed out.",
    );
    setFactorId(null);
    setQrCode(null);
    setTotpSecret(null);
    setCode("");
    await recordMfaEvent("mfa_enrolled");
    await loadFactors();
  }

  async function disableFactor(id: string) {
    if (
      !window.confirm(
        "Disable this authenticator app? This reduces your account security.",
      )
    )
      return;
    setBusy(true);
    const { error } = await supabase.auth.mfa.unenroll({ factorId: id });
    setBusy(false);
    if (error)
      return setMessage(
        "Unable to disable MFA. Verify your session and try again.",
      );
    setMessage("Authenticator app disabled.");
    await recordMfaEvent("mfa_disabled");
    await loadFactors();
  }

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Two-factor authentication
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Protect your account with an authenticator app. Add a second
          app/device as a backup.
        </p>
      </div>

      {factors.length > 0 && (
        <div className="space-y-2">
          {factors.map((factor) => (
            <div
              key={factor.id}
              className="flex items-center justify-between rounded-lg bg-gray-50 p-3 text-sm text-gray-700"
            >
              <span>{factor.friendly_name || "Authenticator app"}</span>
              <button
                type="button"
                onClick={() => disableFactor(factor.id)}
                disabled={busy}
                className="text-red-600 disabled:opacity-50"
              >
                Disable
              </button>
            </div>
          ))}
        </div>
      )}

      {!factorId && (
        <button
          type="button"
          onClick={beginEnrollment}
          disabled={busy}
          className="rounded-lg bg-[#0A1A12] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {factors.length
            ? "Add backup authenticator"
            : "Enable authenticator app"}
        </button>
      )}

      {factorId && qrCode && (
        <div className="rounded-lg border border-gold/30 p-4 space-y-3">
          <p className="text-sm text-gray-700">
            Scan this code, then enter the six-digit code from your app.
          </p>
          <img
            className="h-44 w-44"
            alt="Authenticator app QR code"
            src={`data:image/svg+xml;utf-8,${qrCode}`}
          />
          {totpSecret && (
            <p className="text-xs text-gray-600">
              Can’t scan it? Enter this setup key manually in your
              authenticator app: {" "}
              <code className="break-all rounded bg-gray-100 px-1 py-0.5 font-mono text-gray-900">
                {totpSecret}
              </code>
            </p>
          )}
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="123456"
            className="w-full rounded-lg border px-3 py-2 text-black"
          />
          <button
            type="button"
            onClick={() => verifyFactor(factorId)}
            disabled={busy || code.length !== 6}
            className="rounded-lg bg-gold px-4 py-2 text-sm font-medium text-[#040C08] disabled:opacity-50"
          >
            Verify and enable
          </button>
        </div>
      )}

      {message && (
        <p className="text-sm text-gray-700" role="status">
          {message}
        </p>
      )}
    </section>
  );
}
