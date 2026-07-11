"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  Shield,
} from "lucide-react";
import BookingModal from "@/components/modal/BookingModal";
import Link from "next/link";
import { logoutUser, checkAuthStatus } from "@/actions/authActions";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false); // Controls mobile menu
  const [isScrolled, setIsScrolled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Controls the booking modal
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // This listens to the scroll position to change the background from transparent to glass
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await checkAuthStatus();
        console.log(
          "Navbar - Session check:",
          result.authenticated,
          result.user?.email,
        );
        setIsAuthenticated(result.authenticated);
      } catch (error) {
        console.error("Navbar - Auth check error:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();

    // Poll for auth status changes every 2 seconds
    const interval = setInterval(checkAuth, 2000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle logout
  const handleLogout = () => {
    startTransition(async () => {
      await logoutUser();
      setIsAuthenticated(false);
      setIsDropdownOpen(false);
      router.push("/");
      router.refresh();
    });
  };

  // Fully updated luxury navigation links including the new Contact page
  const navLinks = [
    { name: "Destinations", href: "/" },
    { name: "Safaris", href: "/tours" },
    { name: "Lodges", href: "/lodges" },
    { name: "Journal", href: "/journal" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // User Avatar Dropdown Component
  const UserAvatarDropdown = () => (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 group focus:outline-none"
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
                    Explorer
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2 px-2">
              <Link
                href="/dashboard"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/80 hover:text-gold hover:bg-white/5 transition-all duration-200 group/item"
              >
                <div className="w-7 h-7 rounded-lg bg-gold/10 flex items-center justify-center group-hover/item:bg-gold/20 transition-colors">
                  <LayoutDashboard size={13} className="text-gold" />
                </div>
                <span className="text-xs font-semibold tracking-wider uppercase">
                  My Dashboard
                </span>
              </Link>

              <Link
                href="/admin"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/80 hover:text-gold hover:bg-white/5 transition-all duration-200 group/item"
              >
                <div className="w-7 h-7 rounded-lg bg-gold/10 flex items-center justify-center group-hover/item:bg-gold/20 transition-colors">
                  <Shield size={13} className="text-gold" />
                </div>
                <span className="text-xs font-semibold tracking-wider uppercase">
                  Admin Panel
                </span>
              </Link>
            </div>

            {/* Divider */}
            <div className="mx-4 border-t border-white/10" />

            {/* Logout */}
            <div className="py-2 px-2">
              <button
                onClick={handleLogout}
                disabled={isPending}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group/item disabled:opacity-50 disabled:cursor-not-allowed"
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

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-100 transition-all duration-500 ${
          isScrolled
            ? "bg-safari-green/90 backdrop-blur-md border-b border-white/10 py-4 shadow-xl"
            : "bg-transparent py-6"
        }`}
      >
        {/* 🚀 UPGRADED Z-INDEX: Set to 1000 so the Logo and Close button always stay on top of the solid menu */}
        <div className="max-w-335 mx-auto px-4 flex justify-between items-center relative z-1000">
          {/* Logo SECTION */}
          <Link
            href="/"
            className="relative group flex items-center gap-3 md:gap-4"
          >
            <img
              src="/ojo-logo.png"
              alt="OJO Tours Logo"
              className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover border border-white/20 shadow-lg transition-transform duration-300 group-hover:scale-105"
            />
            <span className="text-xl md:text-2xl font-serif text-white tracking-wide">
              OJO{" "}
              <span className="text-gold group-hover:text-gold-light transition-colors">
                Tours
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-white/80 hover:text-gold text-xs tracking-[0.2em] uppercase font-bold transition-colors"
              >
                {link.name}
              </a>
            ))}

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-gold border border-gold-light hover:bg-gold-light text-safari-green px-5 py-2 rounded-full font-bold tracking-widest uppercase text-xs transition-all duration-300 transform cursor-pointer hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]"
              >
                Plan Your Trip
              </button>

              {/* Auth-aware section */}
              {isAuthenticated ? (
                <UserAvatarDropdown />
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/login"
                    className="bg-gold bg-gold-light text-safari-green px-8 py-3 rounded-full font-bold tracking-widest uppercase text-xs transition-all duration-300 transform hover:-translate-y-1 hover shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Mobile Hamburger Toggle */}
          <button
            className="md:hidden text-white relative"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* 🚀 UPGRADED MOBILE MENU: Solid dark hex background and controlled z-index */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="fixed top-0 left-0 w-full h-dvh bg-[#040C08] flex flex-col items-center justify-center space-y-8 z-990 md:hidden"
            >
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-white text-3xl font-serif hover:text-gold transition-colors"
                >
                  {link.name}
                </a>
              ))}

              {/* Mobile auth-aware buttons */}
              {isAuthenticated ? (
                <>
                  {/* Mobile user info card */}
                  <div className="flex flex-col items-center gap-2 py-4">
                    <div className="w-16 h-16 rounded-full bg-linear-to-br from-gold to-gold-light flex items-center justify-center shadow-[0_0_24px_rgba(212,175,55,0.4)] border-2 border-gold/40">
                      <User size={28} className="text-safari-green" />
                    </div>
                    <span className="text-gold/70 text-xs tracking-widest uppercase font-semibold">
                      Explorer Account
                    </span>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="text-white text-2xl font-serif hover:text-gold transition-colors flex items-center gap-3"
                  >
                    <LayoutDashboard size={24} className="text-gold" />
                    My Dashboard
                  </Link>

                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="text-white text-2xl font-serif hover:text-gold transition-colors flex items-center gap-3"
                  >
                    <Shield size={24} className="text-gold" />
                    Admin Panel
                  </Link>

                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    disabled={isPending}
                    className="text-white/60 text-2xl font-serif hover:text-red-400 transition-colors flex items-center gap-3 disabled:opacity-50"
                  >
                    <LogOut size={24} className="text-red-400" />
                    {isPending ? "Signing out…" : "Sign Out"}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    className="text-white text-2xl font-serif hover:text-gold transition-colors"
                  >
                    Sign Up
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="text-white text-2xl font-serif hover:text-gold transition-colors"
                  >
                    Sign In
                  </Link>
                </>
              )}

              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsModalOpen(true);
                }}
                className="bg-gold hover:bg-gold-light text-safari-green px-8 py-4 rounded-full font-bold tracking-widest uppercase text-sm transition-all duration-300 mt-4 shadow-lg"
              >
                Plan Your Trip
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Render the Modal completely outside the header layout */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
