"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const Preloader = () => {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
  const [loading, setLoading] = useState(!isDashboard);

  useEffect(() => {
    if (isDashboard) return; // Skip preloader entirely on dashboard routes
    // Simulate initial asset loading and display the luxury intro
    const timer = setTimeout(() => setLoading(false), 2600);
    return () => clearTimeout(timer);
  }, [isDashboard]);

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#040C08]"
        >
          <div className="text-center space-y-6">
            {/* Gold glowing animated emblem WITH YOUR LOGO */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [0.8, 1.05, 1], opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="w-16 h-16 rounded-full bg-[#1B3022] border border-[#D4AF37]/30 flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(212,175,55,0.15)] overflow-hidden"
            >
              <img 
                src="/ojo-logo.png" 
                alt="OJO Tours Logo" 
                className="w-full h-full object-cover p-1 rounded-full" 
              />
            </motion.div>

            {/* Typography branding stagger */}
            <div className="overflow-hidden">
              <motion.h1 
                initial={{ y: 40 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="text-3xl md:text-4xl font-serif tracking-wide text-white"
              >
                OJO <span className="text-[#D4AF37]">Tours</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="text-[9px] tracking-[0.4em] uppercase text-[#D4AF37] font-bold mt-2"
              >
                OJO TOURS & Safaris co.Ltd
              </motion.p>
            </div>

            {/* Elegant low-profile loading bar */}
            <div className="w-32 h-[1px] bg-white/10 mx-auto rounded-full overflow-hidden relative mt-4">
              <motion.div 
                initial={{ left: "-100%" }}
                animate={{ left: "100%" }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;