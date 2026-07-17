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
import { getDashboardForRole, getRoleLabel } from "@/lib/navigation";
import { clearClientSession } from "@/lib/supabase-client";
import { UserAvatarDropdown } from "./UserAvatarDropdown";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false); // Controls mobile menu
  const [isScrolled, setIsScrolled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Controls the booking modal
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [userRole, setUserRole] = useState<string | null>(null);
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

  // Check authentication status and fetch user role
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await checkAuthStatus();

        setIsAuthenticated(result.authenticated);
        setUserRole(result.role);
      } catch (error) {
        console.error("Navbar - Auth check error:", error);
        setIsAuthenticated(false);
        setUserRole(null);
      }
    };

    checkAuth();
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
      try {
        const result = await logoutUser();

        if (result.success) {
          // Clear client-side session
          await clearClientSession();

          setIsAuthenticated(false);
          setIsDropdownOpen(false);

          // Redirect to login page for consistent behavior
          router.push("/");
          router.refresh();
        } else {
        }
      } catch (error) {
        console.error("[Navbar] Logout error:", error);
      }
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
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-white/80 hover:text-gold text-xs tracking-[0.2em] uppercase font-bold transition-colors"
              >
                {link.name}
              </Link>
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
                <UserAvatarDropdown
                  userRole={userRole}
                  isDropdownOpen={isDropdownOpen}
                  setIsDropdownOpen={setIsDropdownOpen}
                  handleLogout={handleLogout}
                  isPending={isPending}
                  dropdownRef={dropdownRef}
                />
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/login"
                    className="bg-gold bg-gold-light text-safari-green px-5 py-3 rounded-full font-bold tracking-widest uppercase text-xs transition-all duration-300 transform hover:-translate-y-1 hover shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Mobile Navigation: Avatar/Sign In + Hamburger */}
          <div className="lg:hidden flex items-center gap-4">
            {/* Mobile Avatar Dropdown or Sign In */}
            {isAuthenticated ? (
              <UserAvatarDropdown
                userRole={userRole}
                isDropdownOpen={isDropdownOpen}
                setIsDropdownOpen={setIsDropdownOpen}
                handleLogout={handleLogout}
                isPending={isPending}
                dropdownRef={dropdownRef}
              />
            ) : (
              <Link
                href="/login"
                className="bg-gold border border-gold-light hover:bg-gold-light text-safari-green px-4 py-2 rounded-full font-bold tracking-widest uppercase text-xs transition-all duration-300"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              className="text-white relative"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* 🚀 UPGRADED MOBILE MENU: Solid dark hex background and controlled z-index */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="fixed top-0 left-0 w-full h-dvh bg-[#040C08] flex flex-col items-center justify-center space-y-8 z-990 lg:hidden pt-10"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-white text-3xl font-serif hover:text-gold transition-colors"
                >
                  {link.name}
                </Link>
              ))}

              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsModalOpen(true);
                }}
                className="bg-gold hover:bg-gold-light text-safari-green px-5 py-3 rounded-full font-bold tracking-widest uppercase text-sm transition-all duration-300 mt-4 shadow-lg"
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
