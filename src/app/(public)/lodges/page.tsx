"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import { motion } from "framer-motion";
import { MapPin, Wind, Coffee, Star, ChevronDown, CheckCircle2, Waves, GlassWater, Sparkles, User } from "lucide-react";
import { getLodges } from "@/actions/lodgeActions"; // 🚀 Import the database action!

export default function LodgesPage() {
  // 🚀 State to hold the live database info
  const [lodges, setLodges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🚀 Fetch the data as soon as the page loads
  useEffect(() => {
    async function fetchLiveLodges() {
      try {
        const liveData = await getLodges();
        setLodges(liveData);
      } catch (error) {
        console.error("Failed to load lodges", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLiveLodges();
  }, []);

  // 🚀 Dynamic Amenities Mapper (Since DB stores strings like "Spa, Pool", we assign icons dynamically)
  const renderAmenityIcon = (amenityString: string) => {
    const lower = amenityString.toLowerCase();
    if (lower.includes("spa")) return <Sparkles size={14} />;
    if (lower.includes("pool") || lower.includes("water")) return <Waves size={14} />;
    if (lower.includes("wine") || lower.includes("bar")) return <GlassWater size={14} />;
    if (lower.includes("butler") || lower.includes("service")) return <User size={14} />;
    if (lower.includes("dining") || lower.includes("food") || lower.includes("tea")) return <Coffee size={14} />;
    return <Wind size={14} />; // Default Icon
  };

  // --- LOADING STATE ---
  if (loading) {
    return (
      <main className="min-h-screen bg-[#0A1A12] flex flex-col items-center justify-center text-white">
        <Navbar />
        <motion.div 
          animate={{ opacity: [0.5, 1, 0.5] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-gold tracking-[0.4em] uppercase text-xs font-bold"
        >
          Loading The Collection...
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#0A1A12] selection:bg-gold selection:text-[#0A1A12]">
      <Navbar />

      <div className="flex-grow w-full">
        {/* 1. Immersive Cinematic Hero */}
        <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?q=80&w=2000&auto=format&fit=crop" 
              alt="Luxury Lodge Safari" 
              className="w-full h-full object-cover opacity-40 scale-105 animate-slow-zoom"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0A1A12]/80 via-transparent to-[#0A1A12]" />
          </div>

          <div className="relative z-10 text-center px-6 mt-20 max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-3 mb-6"
            >
              <span className="h-px w-8 bg-gold" />
              <span className="text-gold tracking-[0.4em] uppercase text-xs font-bold">
                The OJO Collection
              </span>
              <span className="h-px w-8 bg-gold" />
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-8xl font-serif text-white mb-6 leading-tight"
            >
              Sanctuaries in <span className="italic text-[#F1D592]">The Wild</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-white/70 text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto mb-12"
            >
              After a day of thrilling encounters, retreat to Rwanda's most exclusive lodges. Expect world-class gastronomy, private infinity pools, and uncompromised luxury.
            </motion.p>
          </div>

          {/* Scroll Down Indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30 flex flex-col items-center animate-bounce"
          >
            <span className="text-[10px] uppercase tracking-widest mb-2">Explore</span>
            <ChevronDown size={20} className="text-gold" />
          </motion.div>
        </section>

        {/* 2. The OJO Standard (Trust Banner) */}
        <section className="border-y border-white/5 bg-[#040C08] relative z-20">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
              {[
                { title: "Eco-Conscious", desc: "100% sustainable operations leaving zero footprint." },
                { title: "Absolute Privacy", desc: "Exclusive-use villas hidden deep within nature." },
                { title: "Curated Gastronomy", desc: "Farm-to-table dining crafted by master chefs." }
              ].map((item, idx) => (
                <div key={idx} className="pt-6 md:pt-0 px-6">
                  <CheckCircle2 size={24} className="text-gold mx-auto mb-4 opacity-80" />
                  <h4 className="text-white font-serif text-xl mb-2">{item.title}</h4>
                  <p className="text-white/50 text-sm font-light">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Advanced Offset Lodges Grid (LIVE DATA) */}
        <section className="px-6 py-32">
          <div className="max-w-7xl mx-auto space-y-32 md:space-y-48">
            
            {/* Empty State */}
            {lodges.length === 0 && (
              <div className="text-center py-20 border border-white/10 rounded-[2rem] bg-white/5">
                <h3 className="text-2xl font-serif text-gold mb-2">No Sanctuaries Available Yet</h3>
                <p className="text-white/50">Check back soon as we curate our luxury collection.</p>
              </div>
            )}

            {/* Live Database Mapping */}
            {lodges.map((lodge, index) => {
              const isEven = index % 2 === 0;
              
              return (
                <motion.div 
                  key={lodge.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center relative`}
                >
                  
                  {/* Image Side (60% width) */}
                  <div className="w-full lg:w-[60%] relative z-0">
                    <div className="relative h-[400px] lg:h-[650px] w-full rounded-[2rem] overflow-hidden group shadow-2xl">
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700 z-10" />
                      <img 
                        src={lodge.image} 
                        alt={lodge.name} 
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-[1.5s] ease-out"
                      />
                    </div>
                  </div>

                  {/* Content Side (Glassmorphic Offset Card) */}
                  <div className={`w-full lg:w-[50%] z-10 mt-8 lg:mt-0 ${isEven ? 'lg:-ml-20' : 'lg:-mr-20'}`}>
                    <div className="bg-[#1B3022]/90 backdrop-blur-xl border border-white/10 p-8 md:p-12 lg:p-16 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.4)]">
                      
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center text-gold">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} className="fill-gold" />
                          ))}
                        </div>
                        <span className="text-white/40 text-xs tracking-widest uppercase font-light">
                          {lodge.price}
                        </span>
                      </div>
                      
                      <h2 className="text-4xl md:text-5xl font-serif text-white mb-4 leading-tight">{lodge.name}</h2>
                      
                      <div className="flex items-center text-gold text-xs tracking-[0.2em] uppercase mb-8 font-bold">
                        <MapPin size={14} className="mr-2" />
                        {lodge.location}
                      </div>
                      
                      <p className="text-white/70 text-lg font-light leading-relaxed mb-10">
                        {lodge.description}
                      </p>

                      {/* Dynamic Amenities from DB Array */}
                      {lodge.amenities && lodge.amenities.length > 0 && (
                        <div className="space-y-6 mb-12">
                          <h3 className="text-white/50 font-bold tracking-[0.2em] uppercase text-[10px] border-b border-white/10 pb-3">
                            Signature Amenities
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            {lodge.amenities.map((amenityStr: string, idx: number) => (
                              <div key={idx} className="flex items-center text-white/80 text-sm font-light">
                                <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mr-3 text-gold">
                                  {renderAmenityIcon(amenityStr)}
                                </span>
                                {amenityStr}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* We use a simple mailto link for lodge booking since they don't have a detail page yet */}
                        <a href={`mailto:bookings@ojotours.com?subject=Inquiry regarding ${lodge.name}`} className="bg-gold hover:bg-[#F1D592] text-[#0A1A12] px-8 py-4 rounded-full font-bold tracking-[0.2em] uppercase text-xs transition-all duration-500 shadow-[0_0_20px_rgba(212,175,55,0.2)] text-center w-full sm:w-auto">
                          Inquire Now
                        </a>
                      </div>

                    </div>
                  </div>

                </motion.div>
              );
            })}
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}