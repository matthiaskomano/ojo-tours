"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { requestPasswordReset } from "@/actions/authActions";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleReset(formData: FormData) {
    setIsLoading(true);
    const result = await requestPasswordReset(formData);
    
    if (result.success) {
      setMessage("Recovery email sent! Please check your inbox.");
    } else {
      setMessage(result.error || "Failed to send email.");
    }
    setIsLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#040C08] flex items-center justify-center relative overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="bg-[#0A1A12]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl text-center">
          <ShieldCheck size={32} className="text-gold mx-auto mb-4" />
          <h1 className="text-3xl font-serif text-white mb-2">Reset Access</h1>
          <p className="text-white/40 text-xs mb-8">Enter your admin email to receive a secure recovery link.</p>

          <form action={handleReset} className="space-y-6">
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                required
                name="email"
                type="email"
                placeholder="Admin Email"
                className="w-full bg-[#040C08] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-gold/50"
              />
            </div>

            {message && (
              <div className="text-gold text-xs py-2">{message}</div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gold hover:bg-[#F1D592] text-[#040C08] font-bold py-4 rounded-2xl text-xs tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2"
            >
              {isLoading ? "Sending..." : "Send Recovery Email"}
              {!isLoading && <ArrowRight size={16} />}
            </button>
          </form>
        </div>
      </motion.div>
    </main>
  );
}