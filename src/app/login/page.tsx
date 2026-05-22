"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";
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
      router.push("/admin"); 
    } else {
      setError(result.error || "Authentication failed. Please verify your credentials.");
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#040C08] flex items-center justify-center relative overflow-hidden selection:bg-gold selection:text-[#040C08]">
      
      {/* Cinematic Animated Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 20, ease: "easeOut", repeat: Infinity, repeatType: "reverse" }}
          src="https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=2068&auto=format&fit=crop"
          alt="Safari Background"
          className="w-full h-full object-cover opacity-30"
        />
        {/* Deep luxury gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#040C08] via-[#040C08]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#040C08]/90 via-transparent to-[#040C08]/90" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[420px] px-6"
      >
        {/* Glassmorphism Card with subtle gold glow */}
        <div className="bg-[#0A1A12]/60 backdrop-blur-3xl border border-white/5 rounded-3xl p-10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden">
          
          {/* Subtle top highlight */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent"></div>

          {/* Branded Header */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <img 
                src="/ojo-logo.png" 
                alt="OJO Tours Logo" 
                className="h-16 w-16 rounded-full object-cover border border-white/10 shadow-2xl" 
              />
            </div>
            <h1 className="text-3xl font-serif text-white mb-2 tracking-wide">
              OJO <span className="text-gold">Tours</span>
            </h1>
            <p className="text-white/40 text-[9px] uppercase tracking-[0.3em] font-bold">
              Command Center Access
            </p>
          </div>

          <form action={handleLogin} className="space-y-5">
            <div>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-gold transition-colors duration-300" />
                <input
                  required
                  name="username"
                  type="email"
                  placeholder="Admin Email"
                  className="w-full bg-[#040C08]/80 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-gold/50 focus:bg-[#040C08] focus:shadow-[0_0_15px_rgba(212,175,55,0.1)] transition-all duration-300 placeholder-white/20"
                />
              </div>
            </div>

            <div>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-gold transition-colors duration-300" />
                <input
                  required
                  name="password"
                  type="password"
                  placeholder="Password"
                  className="w-full bg-[#040C08]/80 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-gold/50 focus:bg-[#040C08] focus:shadow-[0_0_15px_rgba(212,175,55,0.1)] transition-all duration-300 placeholder-white/20"
                />
              </div>
              
              {/* Added Forgot Password Link */}
              <div className="flex justify-end mt-3">
                <Link 
                  href="/forgot-password" 
                  className="text-[11px] text-white/40 hover:text-gold transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            {/* Error Message Display */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: "auto" }} 
                className="text-red-400 text-xs text-center bg-red-500/10 py-3 rounded-xl border border-red-500/20"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gold hover:bg-gold-light text-safari-green font-bold py-4 rounded-xl text-xs tracking-[0.2em] uppercase transition-all duration-300 flex items-center justify-center gap-3 group disabled:opacity-50 mt-4 shadow-lg hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]"
            >
              {isLoading ? "Authenticating..." : "Sign In"}
              {!isLoading && <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

        </div>
      </motion.div>
    </main>
  );
}