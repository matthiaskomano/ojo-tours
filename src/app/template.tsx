"use client";

import React from "react";
import { motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.7, 
        ease: [0.215, 0.610, 0.355, 1.000] // Premium cinematic cubic-bezier curve
      }}
    >
      {children}
    </motion.div>
  );
}