"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { getDashboardForRole, getRoleLabel } from "@/lib/navigation";

interface UserAvatarDropdownProps {
  userRole: string | null;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (open: boolean) => void;
  handleLogout: () => void;
  isPending: boolean;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}

export function UserAvatarDropdown({
  userRole,
  isDropdownOpen,
  setIsDropdownOpen,
  handleLogout,
  isPending,
  dropdownRef,
}: UserAvatarDropdownProps) {
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 group focus:outline-none cursor-pointer"
        aria-label="User menu"
        aria-expanded={isDropdownOpen}
      >
        {/* Avatar circle */}
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-linear-to-br from-gold to-gold-light flex items-center justify-center shadow-[0_0_16px_rgba(212,175,55,0.4)] border-2 border-gold/40 group-hover:border-gold transition-all duration-300 group-hover:shadow-[0_0_24px_rgba(212,175,55,0.6)]">
            <User size={16} className="text-safari-green" />
          </div>
          {/* Online indicator */}
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-safari-green rounded-full" />
        </div>
        <ChevronDown
          size={14}
          className={`text-white/60 transition-transform duration-300 ${
            isDropdownOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-3 w-56 rounded-2xl overflow-hidden shadow-2xl border border-white/10 z-50"
            style={{
              background:
                "linear-linear(135deg, rgba(10,26,18,0.98) 0%, rgba(27,48,34,0.98) 100%)",
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Header */}
            <div className="px-4 py-3.5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-gold to-gold-light flex items-center justify-center shrink-0">
                  <User size={14} className="text-safari-green" />
                </div>
                <div className="min-w-0">
                  <p className="text-white/90 text-xs font-semibold tracking-wide truncate">
                    My Account
                  </p>
                  <p className="text-gold/70 text-[10px] tracking-widest uppercase">
                    {getRoleLabel(userRole)}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2 px-2">
              {(() => {
                const dashboard = getDashboardForRole(userRole);
                const isAdmin =
                  userRole === "ADMIN" || userRole === "SUPER_ADMIN";
                return (
                  <Link
                    href={dashboard.href}
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/80 hover:text-gold hover:bg-white/5 transition-all duration-200 group/item"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gold/10 flex items-center justify-center group-hover/item:bg-gold/20 transition-colors">
                      {isAdmin ? (
                        <Shield size={13} className="text-gold" />
                      ) : (
                        <LayoutDashboard size={13} className="text-gold" />
                      )}
                    </div>
                    <span className="text-xs font-semibold tracking-wider uppercase">
                      {dashboard.label}
                    </span>
                  </Link>
                );
              })()}
            </div>

            {/* Divider */}
            <div className="mx-4 border-t border-white/10" />

            {/* Logout */}
            <div className="py-2 px-2">
              <button
                onClick={handleLogout}
                disabled={isPending}
                className="w-full flex items-center cursor-pointer gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group/item disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center group-hover/item:bg-red-500/20 transition-colors">
                  <LogOut size={13} className="text-red-400" />
                </div>
                <span className="text-xs font-semibold tracking-wider uppercase">
                  {isPending ? "Signing out…" : "Sign Out"}
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
