"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import BookingModal from "@/components/modal/BookingModal";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false); // Controls mobile menu
  const [isScrolled, setIsScrolled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Controls the booking modal

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
        className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${
          isScrolled
            ? "bg-safari-green/90 backdrop-blur-md border-b border-white/10 py-4 shadow-xl"
            : "bg-transparent py-6"
        }`}
      >
        {/* 🚀 UPGRADED Z-INDEX: Set to 1000 so the Logo and Close button always stay on top of the solid menu */}
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center relative z-[1000]">
          
          {/* Logo SECTION */}
          <a href="/" className="relative group flex items-center gap-3 md:gap-4">
            <img 
              src="/ojo-logo.png" 
              alt="OJO Tours Logo" 
              className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover border border-white/20 shadow-lg transition-transform duration-300 group-hover:scale-105" 
            />
            <span className="text-xl md:text-2xl font-serif text-white tracking-wide">
              OJO <span className="text-gold group-hover:text-gold-light transition-colors">Tours</span>
            </span>
          </a>

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
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-gold hover:bg-gold-light text-safari-green px-8 py-3 rounded-full font-bold tracking-widest uppercase text-xs transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]"
            >
              Plan Your Trip
            </button>
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
              className="fixed top-0 left-0 w-full h-[100dvh] bg-[#040C08] flex flex-col items-center justify-center space-y-8 z-[990] md:hidden"
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