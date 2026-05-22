"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  
  // Use the standard Supabase JS client for the frontend
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

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

  // Reusable Input Style for Light PurpleAdmin Theme
  const inputStyle = "w-full bg-white border border-gray-200 rounded-md px-4 py-3 text-sm text-gray-800 focus:border-[#b66dff] focus:ring-1 focus:ring-[#b66dff] outline-none transition-all placeholder-gray-400 shadow-sm";

  return (
    <main className="min-h-screen bg-[#f4f5f7] flex items-center justify-center p-4">
      <div className="bg-white border border-gray-100 shadow-xl rounded-2xl p-10 max-w-md w-full text-center">
        
        {/* Logo and Branding to match the new light theme */}
        <div className="flex justify-center mb-6">
           <img src="/ojo-logo.png" alt="Logo" className="w-16 h-16 rounded-full object-cover border border-gray-100 shadow-sm" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight mb-2">Create New Password</h1>
        <p className="text-sm text-gray-500 mb-8 font-medium">Secure your OJO Tours command center.</p>
        
        <form onSubmit={handleUpdate} className="space-y-5">
          <input
            type="password"
            required
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New Secure Password"
            className={inputStyle}
          />
          
          {message && (
            <p className={`text-xs font-bold p-3 rounded-md ${
              message.includes("successfully") 
                ? "bg-green-50 text-green-600 border border-green-100" 
                : "bg-red-50 text-red-500 border border-red-100"
            }`}>
              {message}
            </p>
          )}
          
          <button type="submit" className="w-full bg-gradient-to-r from-[#da8cff] to-[#9a55ff] hover:opacity-90 text-white font-bold tracking-wide py-3.5 rounded-lg transition-all shadow-md shadow-purple-200">
            Save & Login
          </button>
        </form>
      </div>
    </main>
  );
}