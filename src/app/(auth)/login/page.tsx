"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, ArrowRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { loginUser } from "@/actions/authActions";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
} from "@/components/ui/input-group";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginInput) {
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("password", data.password);

    const result = await loginUser(formData);

    if (result.success) {
      // Use callbackUrl if provided, otherwise redirect based on user role
      if (callbackUrl) {
        router.push(callbackUrl);
      } else {
        const adminRoles = ["ADMIN", "SUPER_ADMIN", "STAFF"];
        if (result.role && adminRoles.includes(result.role)) {
          router.push("/dashboard/admin");
        } else {
          // TOURIST users go to tourist dashboard
          router.push("/dashboard/tourist");
        }
      }
    } else {
      setError(
        result.error ||
          "Authentication failed. Please verify your credentials.",
      );
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
          transition={{
            duration: 20,
            ease: "easeOut",
            repeat: Infinity,
            repeatType: "reverse",
          }}
          src="https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=2068&auto=format&fit=crop"
          alt="Safari Background"
          className="w-full h-full object-cover opacity-25"
        />
        {/* Deep luxury gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-[#040C08] via-[#040C08]/85 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-r from-[#040C08]/95 via-transparent to-[#040C08]/95" />

        {/* Animated particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-gold/20 rounded-full"
              initial={{
                x: Math.random() * 100 + "%",
                y: Math.random() * 100 + "%",
                opacity: 0,
              }}
              animate={{
                opacity: [0, 1, 0],
                y: [null, -100],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-lg px-6"
      >
        {/* Glassmorphism Card with enhanced effects */}
        <div className="bg-[#0A1A12]/70 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 shadow-[0_25px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
          {/* Animated top border */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-gold to-transparent"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              backgroundSize: "200% 100%",
            }}
          />

          {/* Subtle inner glow */}
          <div className="absolute inset-0 bg-linear-to-br from-gold/5 via-transparent to-transparent pointer-events-none" />

          {/* Branded Header */}
          <div className="text-center mb-12 relative">
            <motion.div
              className="flex justify-center mb-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Link href="/">
                <div className="relative">
                  <div className="absolute inset-0 bg-gold/20 blur-2xl rounded-full animate-pulse" />
                  <img
                    src="/ojo-logo.png"
                    alt="OJO Tours Logo"
                    className="h-20 w-20 rounded-full object-cover border-2 border-gold/30 shadow-2xl relative z-10"
                  />
                </div>
              </Link>
            </motion.div>

            <motion.h1
              className="text-4xl font-serif text-white mb-3 tracking-wide"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Welcome Back
            </motion.h1>

            <motion.p
              className="text-white/50 text-sm font-light tracking-wide"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Sign in to access your dashboard
            </motion.p>
          </div>

          <form
            id="login-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <Controller
              name="username"
              control={form.control}
              render={({ field, fieldState }) => (
                <div data-invalid={fieldState.invalid}>
                  <label
                    htmlFor="login-username"
                    className="block text-white/60 text-xs uppercase tracking-wider mb-2 font-semibold"
                  >
                    Email Address
                  </label>
                  <InputGroup>
                    <InputGroupAddon align="start">
                      <InputGroupText>
                        <Mail size={20} />
                      </InputGroupText>
                    </InputGroupAddon>
                    <Input
                      {...field}
                      id="login-username"
                      type="email"
                      placeholder="you@example.com"
                      aria-invalid={fieldState.invalid}
                      className="bg-[#040C08]/90 border-white/10 text-white placeholder:text-white/30 focus:border-gold/60 focus:bg-[#040C08] py-5 px-10"
                    />
                  </InputGroup>
                  {fieldState.invalid && (
                    <p className="text-red-400 text-xs mt-2">
                      {fieldState.error?.message}
                    </p>
                  )}
                </div>
              )}
            />

            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <div data-invalid={fieldState.invalid}>
                  <label
                    htmlFor="login-password"
                    className="block text-white/60 text-xs uppercase tracking-wider mb-2 font-semibold"
                  >
                    Password
                  </label>
                  <InputGroup>
                    <InputGroupAddon align="start">
                      <InputGroupText>
                        <Lock size={20} />
                      </InputGroupText>
                    </InputGroupAddon>
                    <Input
                      {...field}
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      aria-invalid={fieldState.invalid}
                      className="bg-[#040C08]/90 border-white/10 text-white placeholder:text-white/30 focus:border-gold/60 focus:bg-[#040C08] py-5 px-10"
                    />
                    <InputGroupAddon align="end">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-white/40 hover:text-gold transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </InputGroupAddon>
                  </InputGroup>
                  <div className="flex justify-end mt-3">
                    <Link
                      href="/forgot-password"
                      className="text-xs text-white/60 hover:text-gold transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  {fieldState.invalid && (
                    <p className="text-red-400 text-xs mt-2">
                      {fieldState.error?.message}
                    </p>
                  )}
                </div>
              )}
            />

            {/* Error Message Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-start gap-3"
                >
                  <div className="text-red-400 mt-0.5">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-red-400 text-sm">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#F1D592] hover:bg-gold-600 text-[#040C08] font-bold py-5 cursor-pointer rounded-2xl text-sm tracking-[0.2em] uppercase hover:-translate-y-0.5"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </Button>
          </form>

          {/* Bottom Link */}
          <motion.div
            className="text-center mt-8 pt-6 border-t border-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <p className="text-white/50 text-sm">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-gold hover:text-[#F1D592] font-semibold transition-colors inline-flex items-center gap-1 group"
              >
                Create account
                <ArrowRight
                  size={14}
                  className="transform group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
