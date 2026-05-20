"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; 
import { motion, Variants } from "framer-motion"; 
import { MapPin, Calendar, Users, Search, ChevronDown } from "lucide-react";

// 🚀 --- CINEMATIC BACKGROUND IMAGES ---
const backgrounds = [
  "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=2068&auto=format&fit=crop", // 1. Your original Safari Vehicle
  "https://images.unsplash.com/photo-1523805009345-7448845a9e53?q=80&w=2072&auto=format&fit=crop", // 2. Golden African Sunset & Wildlife
  "https://images.unsplash.com/photo-1534177616072-ef7dc120449d?q=80&w=2070&auto=format&fit=crop", // 3. Epic Landscape / Elephants
];

const Hero = () => {
  const router = useRouter();

  // --- BACKGROUND SLIDER ENGINE ---
  const [currentBg, setCurrentBg] = useState(0);

  useEffect(() => {
    // Change the background image every 6 seconds
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % backgrounds.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // --- SEARCH BAR STATE ENGINE ---
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState("2 Guests");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/tours?location=${encodeURIComponent(location)}&date=${date}&guests=${encodeURIComponent(guests)}`);
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      
      {/* 🚀 --- ANIMATED SLIDING BACKGROUND --- */}
      <div className="absolute inset-0 z-0 bg-[#040C08]">
        {backgrounds.map((bg, index) => (
          <div
            key={bg}
            className={`absolute inset-0 w-full h-full transition-opacity duration-[2000ms] ease-in-out ${
              index === currentBg ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <img 
              src={bg} 
              alt="Premium Safari Background" 
              className="w-full h-full object-cover scale-105" 
            />
          </div>
        ))}
        {/* Dark gradient overlay for luxury feel and text readability (must sit above images) */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#040C08]/80 via-black/40 to-[#040C08]/90 z-20"></div>
      </div>

      {/* 🚀 --- MAIN CONTENT (Now z-30 to stay above the slider) --- */}
      <motion.div 
        className="relative z-30 w-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center mt-8 md:mt-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.span variants={itemVariants} className="text-gold tracking-[0.3em] uppercase text-xs md:text-sm font-bold mb-4 block">
          Premium African Safaris
        </motion.span>
        
        <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight">
          Discover Rwanda <br className="hidden sm:block" /> with <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-white border-b-2 border-gold pb-2">OJO Tours</span>
        </motion.h1>
        
        <motion.p variants={itemVariants} className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mb-10 md:mb-12 font-light px-4">
          Experience gorilla trekking, safaris, luxury vacations, and unforgettable African adventures.
        </motion.p>

        {/* ACTION BUTTONS */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mb-12 md:mb-16 w-full sm:w-auto px-4 sm:px-0">
          <Link href="/tours" className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-full font-bold tracking-wider uppercase text-sm transition-all duration-300 text-center inline-block w-full sm:w-auto shadow-lg">
            Book a Tour
          </Link>
          <Link href="/lodges" className="bg-black/30 border border-white/30 hover:border-gold hover:text-gold hover:bg-black/50 text-white px-8 py-4 rounded-full font-bold tracking-wider uppercase text-sm transition-all duration-300 backdrop-blur-md text-center inline-block w-full sm:w-auto shadow-lg">
            Explore Destinations
          </Link>
        </motion.div>

        {/* FUNCTIONAL SEARCH FORM */}
        <motion.form 
          onSubmit={handleSearch}
          variants={itemVariants}
          className="w-full max-w-4xl bg-white/10 backdrop-blur-xl border border-white/20 p-4 md:p-6 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-center gap-4"
        >
          {/* Where Input */}
          <div className="flex-1 w-full flex items-center bg-black/40 border border-white/10 rounded-2xl px-4 py-3.5 focus-within:border-gold/50 transition-colors group hover:bg-black/60">
            <MapPin className="text-gold mr-3 shrink-0 group-hover:scale-110 transition-transform" size={20} />
            <input 
              type="text" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Where to?" 
              className="bg-transparent text-white placeholder-white/50 focus:outline-none w-full text-sm" 
            />
          </div>
          
          {/* Date Input */}
          <div className="flex-1 w-full flex items-center bg-black/40 border border-white/10 rounded-2xl px-4 py-3.5 focus-within:border-gold/50 transition-colors group hover:bg-black/60">
            <Calendar className="text-gold mr-3 shrink-0 group-hover:scale-110 transition-transform" size={20} />
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-white placeholder-white/50 focus:outline-none w-full appearance-none cursor-pointer text-sm" 
              style={{ colorScheme: "dark" }}
            />
          </div>
          
          {/* Guests Dropdown */}
          <div className="flex-1 w-full flex items-center bg-black/40 border border-white/10 rounded-2xl px-4 py-3.5 focus-within:border-gold/50 transition-colors relative group hover:bg-black/60">
            <Users className="text-gold mr-3 shrink-0 group-hover:scale-110 transition-transform" size={20} />
            <select 
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="bg-transparent text-white focus:outline-none w-full appearance-none cursor-pointer text-sm"
            >
              <option value="1 Guest" className="bg-[#111]">1 Guest</option>
              <option value="2 Guests" className="bg-[#111]">2 Guests</option>
              <option value="3 Guests" className="bg-[#111]">3 Guests</option>
              <option value="4+ Guests" className="bg-[#111]">4+ Guests</option>
            </select>
            <ChevronDown size={16} className="text-white/50 absolute right-4 pointer-events-none" />
          </div>

          <button type="submit" className="w-full md:w-auto bg-gold hover:bg-[#F1D592] text-[#040C08] px-8 py-3.5 rounded-2xl font-bold flex items-center justify-center transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:-translate-y-0.5">
            <Search size={20} className="mr-2" /> <span className="uppercase tracking-widest text-xs">Search</span>
          </button>
        </motion.form>
      </motion.div>

      {/* Smooth Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 text-white/50 hidden md:block"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <ChevronDown size={32} />
      </motion.div>
    </div>
  );
};

export default Hero;