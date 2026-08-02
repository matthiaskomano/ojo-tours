"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updatePassword } from "@/actions/authActions";

export default function UpdatePasswordPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleUpdate(formData: FormData) {
    setIsLoading(true);
    setMessage(null);
    const result = await updatePassword(formData);
    setIsLoading(false);

    if (result.success) {
      setMessage("Password updated. Please sign in again.");
      router.replace("/login?passwordReset=1");
      return;
    }

    setMessage(result.error || "Unable to update password.");
  }

  return (
    <main className="min-h-screen bg-[#040C08] flex items-center justify-center p-4">
      <div className="bg-[#0A1A12] border border-white/10 shadow-xl rounded-2xl p-10 max-w-md w-full text-center">
        <img src="/ojo-logo.png" alt="OJO Tours" className="w-16 h-16 mx-auto mb-6 rounded-full object-cover" />
        <h1 className="text-2xl font-bold text-white mb-2">Create a new password</h1>
        <p className="text-sm text-white/60 mb-8">Choose a unique password with at least 12 characters.</p>

        <form action={handleUpdate} className="space-y-4">
          <input name="password" type="password" required autoComplete="new-password" placeholder="New password" className="w-full bg-[#040C08] border border-white/10 rounded-md px-4 py-3 text-sm text-white" />
          <input name="confirmPassword" type="password" required autoComplete="new-password" placeholder="Confirm new password" className="w-full bg-[#040C08] border border-white/10 rounded-md px-4 py-3 text-sm text-white" />
          {message && <p className="text-xs text-gold">{message}</p>}
          <button disabled={isLoading} className="w-full bg-gold text-[#040C08] font-bold py-3.5 rounded-lg disabled:opacity-50">
            {isLoading ? "Saving…" : "Save password"}
          </button>
        </form>
      </div>
    </main>
  );
}
