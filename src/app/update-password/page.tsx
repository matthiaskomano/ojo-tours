"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    
    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Password updated successfully! Redirecting...");
      setTimeout(() => router.push("/login"), 2000);
    }
  }

  return (
    <main className="min-h-screen bg-[#040C08] flex items-center justify-center">
      <div className="bg-[#0A1A12]/80 border border-white/10 rounded-2xl p-10 max-w-md w-full text-center">
        <h1 className="text-2xl font-serif text-white mb-6">Create New Password</h1>
        <form onSubmit={handleUpdate} className="space-y-4">
          <input
            type="password"
            required
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New Secure Password"
            className="w-full bg-[#040C08] border border-white/10 rounded-xl py-3 px-4 text-white"
          />
          {message && <p className="text-gold text-xs">{message}</p>}
          <button type="submit" className="w-full bg-gold text-[#040C08] font-bold py-3 rounded-xl">
            Save & Login
          </button>
        </form>
      </div>
    </main>
  );
}