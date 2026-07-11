"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Clock, Search, ChevronLeft, ChevronRight, Star } from "lucide-react";
// 1. Import our database fetching function
import { getTours } from "@/actions/tourActions";

// We keep the categories hardcoded so the filter buttons always look perfect
const categories = ["All", "Safari", "Gorilla Trekking", "Culture", "Adventure", "Luxury"];
const ITEMS_PER_PAGE = 4;

export default function ToursPage() {
  // 2. Set up state for our live database data
  const [tours, setTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Existing state for filters and pagination
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // 3. Fetch tours from the database as soon as the page loads
  useEffect(() => {
    async function loadLiveTours() {
      try {
        const dbTours = await getTours();
        setTours(dbTours);
      } catch (error) {
        console.error("Failed to load tours", error);
      } finally {
        setLoading(false);
      }
    }
    loadLiveTours();
  }, []);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery]);

  // 4. Filter Logic (Now uses live 'tours' state instead of fake data)
  const filteredTours = tours.filter((tour) => {
    const matchesCategory = activeCategory === "All" || tour.category === activeCategory;
    
    // Safety check just in case a database entry is missing a title or location
    const tourTitle = tour.title || "";
    const tourLocation = tour.location || "";
    
    const matchesSearch = tourTitle.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tourLocation.toLowerCase().includes(searchQuery.toLowerCase());
                          
    return matchesCategory && matchesSearch;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredTours.length / ITEMS_PER_PAGE);
  const paginatedTours = filteredTours.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <main className="min-h-screen bg-safari-green selection:bg-gold selection:text-safari-green">
      <Navbar />

      {/* Cinematic Header */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=2068&auto=format&fit=crop"
            alt="Rwanda Safari Landscape"
            className="w-full h-full object-cover opacity-40 scale-105 animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-safari-green via-safari-green/60 to-transparent" />
        </div>

        <div className="relative z-10 text-center px-6 mt-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <span className="h-px w-8 bg-gold" />
            <span className="text-gold tracking-[0.4em] uppercase text-xs font-bold">
              Curated Experiences
            </span>
            <span className="h-px w-8 bg-gold" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-serif text-white mb-6"
          >
            Our Safari <span className="italic text-gold-light">Packages</span>
          </motion.h1>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="py-10 px-6 sticky top-20 z-40 bg-safari-green/90 backdrop-blur-md border-b border-white/5 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Categories */}
          <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-6 w-full md:w-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`relative px-4 py-2 text-xs tracking-[0.2em] uppercase font-bold transition-colors ${
                  activeCategory === category ? "text-gold" : "text-white/50 hover:text-white"
                }`}
              >
                {category}
                {activeCategory === category && (
                  <motion.div 
                    layoutId="tourCategoryIndicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <input 
              type="text" 
              placeholder="Search destinations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-gold/50 focus:bg-white/10 transition-all placeholder-white/30"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          </div>

        </div>
      </section>

      {/* Tour Grid Section */}
      <section className="py-20 px-6 min-h-[600px]">
        <div className="max-w-7xl mx-auto">
          
          {loading ? (
             <div className="text-center py-32 text-gold animate-pulse tracking-[0.2em] text-xs uppercase font-bold">
               Loading Live Database...
             </div>
          ) : (
            <>
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
                <AnimatePresence mode="popLayout">
                  {paginatedTours.map((pkg) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.4 }}
                      key={pkg.id} 
                      className="group rounded-3xl bg-safari-emerald/30 backdrop-blur-sm border border-white/5 overflow-hidden hover:bg-safari-emerald/60 hover:border-gold/30 hover:shadow-[0_10px_40px_rgba(212,175,55,0.05)] transition-all duration-500 flex flex-col"
                    >
                      {/* Tour Image */}
                      <div className="relative h-72 overflow-hidden">
                        <div className="absolute top-5 right-5 z-10 bg-safari-green/80 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center border border-white/10 shadow-lg">
                          <Star className="text-gold w-3.5 h-3.5 mr-1.5 fill-gold" />
                          <span className="text-white text-xs font-bold tracking-wider">{pkg.rating}</span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-safari-green/80 via-transparent to-transparent z-[1]" />
                        <img 
                          src={pkg.image} 
                          alt={pkg.title} 
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-in-out"
                        />
                      </div>

                      {/* Tour Content */}
                      <div className="p-8 flex flex-col flex-grow relative z-10 -mt-6 bg-gradient-to-b from-transparent to-safari-emerald/50">
                        <div className="mb-4">
                          <span className="text-gold text-[10px] font-bold uppercase tracking-[0.2em] mb-3 block">
                            {pkg.category}
                          </span>
                          <h3 className="text-3xl font-serif text-white group-hover:text-gold-light transition-colors duration-300">
                            {pkg.title}
                          </h3>
                        </div>
                        
                        <div className="flex items-center text-white/50 text-xs tracking-widest uppercase mb-6 space-x-6">
                          <div className="flex items-center">
                            <MapPin size={14} className="mr-2 text-gold" />
                            {pkg.location}
                          </div>
                          <div className="flex items-center">
                            <Clock size={14} className="mr-2 text-gold" />
                            {pkg.duration}
                          </div>
                        </div>

                        <p className="text-white/60 text-sm leading-loose mb-8 flex-grow">
                          {pkg.description}
                        </p>
                        
                        <div className="flex items-end justify-between pt-6 border-t border-white/10">
                          <div>
                            <span className="text-white/40 text-[10px] uppercase tracking-[0.2em] block mb-1">Starting from</span>
                            <p className="text-2xl text-white font-serif">{pkg.price}</p>
                          </div>
                          <a 
                            href={`/tours/${pkg.id}`}
                            className="bg-transparent border border-gold/50 hover:bg-gold hover:text-safari-green text-gold px-8 py-3 rounded-full font-bold tracking-[0.2em] uppercase text-xs transition-all duration-500 text-center"
                          >
                            View Itinerary
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Empty State */}
              {filteredTours.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-white/50 text-xl font-serif">No journeys found matching your criteria.</p>
                  <button 
                    onClick={() => { setActiveCategory("All"); setSearchQuery(""); }}
                    className="mt-6 text-gold hover:text-gold-light uppercase tracking-widest text-xs font-bold transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-20 gap-4">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:border-gold hover:text-gold disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:text-white transition-all"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  <div className="flex gap-2">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                          currentPage === i + 1 
                          ? "bg-gold text-safari-green" 
                          : "text-white/50 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:border-gold hover:text-gold disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:text-white transition-all"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          )}

        </div>
      </section>

      <Footer />
    </main>
  );
}