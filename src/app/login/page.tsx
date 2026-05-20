"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, User, ArrowRight, ShieldCheck } from "lucide-react";
import { loginUser } from "@/actions/authActions";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(formData: FormData) {
    setIsLoading(true);
    setError(null);

    const result = await loginUser(formData);

    if (result.success) {
      router.push("/admin"); // Redirect to the command center!
    } else {
      setError(result.error || "Login failed");
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#040C08] flex items-center justify-center relative overflow-hidden selection:bg-gold selection:text-[#040C08]">
      
      {/* Background Cinematic Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=2068&auto=format&fit=crop"
          alt="Safari Background"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040C08] via-[#040C08]/80 to-transparent" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="bg-[#0A1A12]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl">
          
          <div className="text-center mb-10">
            <ShieldCheck size={32} className="text-gold mx-auto mb-4" />
            <h1 className="text-3xl font-serif text-white mb-2">Command Center</h1>
            <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold">
              Secure Access Required
            </p>
          </div>

          <form action={handleLogin} className="space-y-6">
            <div>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  required
                  name="username"
                  type="text"
                  placeholder="Username"
                  className="w-full bg-[#040C08] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-gold/50 transition-colors placeholder-white/20"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  required
                  name="password"
                  type="password"
                  placeholder="Password"
                  className="w-full bg-[#040C08] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-gold/50 transition-colors placeholder-white/20"
                />
              </div>
            </div>

            {/* Error Message Display */}
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gold hover:bg-[#F1D592] text-[#040C08] font-bold py-4 rounded-2xl text-xs tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {isLoading ? "Authenticating..." : "Sign In"}
              {!isLoading && <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <p className="text-center text-white/20 text-[9px] uppercase tracking-[0.2em] mt-8">
            Protected by Next.js Edge Security
          </p>
        </div>
      </motion.div>
    </main>
  );
}