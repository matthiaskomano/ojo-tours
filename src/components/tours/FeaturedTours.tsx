"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, Star, ArrowRight } from "lucide-react";
// Import our database fetching function!
import { getTours } from "@/actions/tourActions";
import Link from "next/link";

const FeaturedTours = () => {
  // 1. Set up state to hold live database tours and loading status
  const [tours, setTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 2. Fetch tours from the database as soon as the component loads
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

  return (
    <section className="py-32 bg-[#0A1A12] relative z-10 border-t border-white/5 overflow-hidden">
      {/* Subtle Topographic/Abstract Background Element */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold/5 via-transparent to-transparent opacity-50 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-6"
            >
              <span className="h-px w-8 bg-gold" />
              <span className="text-gold tracking-[0.4em] uppercase text-xs font-bold">
                Curated Experiences
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-serif text-white leading-tight"
            >
              Featured{" "}
              <span className="italic text-[#F1D592]">Destinations</span>
            </motion.h2>
          </div>

          <motion.a
            href="/tours"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="hidden md:flex items-center gap-2 text-gold hover:text-[#F1D592] tracking-[0.2em] uppercase text-xs font-bold transition-colors group pb-2"
          >
            View All Journeys
            <ArrowRight
              size={16}
              className="transform group-hover:translate-x-2 transition-transform"
            />
          </motion.a>
        </div>

        {/* 3. Conditional Rendering: Show Loading, Empty state, or Live Database Grid */}
        {loading ? (
          <div className="text-center py-32 text-gold animate-pulse tracking-[0.2em] text-xs uppercase font-bold">
            Loading Live Database...
          </div>
        ) : tours.length === 0 ? (
          <div className="text-center py-32 bg-[#040C08]/50 border border-white/5 border-dashed rounded-3xl">
            <p className="text-white/50">
              No tours found. Add your first tour in the Admin Dashboard!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {tours.map((tour, index) => (
              <motion.div
                key={tour.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: index * 0.15,
                  duration: 0.8,
                  ease: "easeOut",
                }}
                className="group rounded-[2rem] bg-[#040C08]/50 backdrop-blur-xl border border-white/5 overflow-hidden hover:border-gold/30 hover:shadow-[0_0_40px_rgba(212,175,55,0.15)] transition-all duration-700 flex flex-col relative"
              >
                {/* Image Container */}
                <div className="relative h-80 overflow-hidden">
                  <div className="absolute top-6 right-6 z-20 bg-[#0A1A12]/90 backdrop-blur-md px-4 py-2 rounded-full flex items-center border border-white/10 shadow-2xl">
                    <Star className="text-gold w-3 h-3 mr-2 fill-gold" />
                    <span className="text-white text-xs font-bold tracking-wider">
                      {tour.rating}
                    </span>
                  </div>

                  <div className="absolute inset-0 bg-linear-to-t from-[#040C08] via-transparent to-transparent z-10" />

                  <img
                    src={tour.image}
                    alt={tour.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-[1.5s] ease-out"
                  />
                </div>

                {/* Card Content */}
                <div className="p-8 md:p-10 flex flex-col grow relative z-20 -mt-12">
                  <div className="mb-6">
                    <span className="inline-block bg-[#0A1A12] border border-white/10 text-gold text-[9px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-4 shadow-lg">
                      {tour.category}
                    </span>
                    <h3 className="text-3xl font-serif text-white group-hover:text-[#F1D592] transition-colors duration-500 leading-snug">
                      {tour.title}
                    </h3>
                  </div>

                  <div className="flex items-center text-white/50 text-[10px] tracking-widest uppercase mb-6 space-x-6 border-b border-white/5 pb-6">
                    <div className="flex items-center">
                      <MapPin size={14} className="mr-2 text-gold opacity-80" />
                      {tour.location}
                    </div>
                    <div className="flex items-center">
                      <Clock size={14} className="mr-2 text-gold opacity-80" />
                      {tour.duration}
                    </div>
                  </div>

                  <p className="text-white/60 text-sm font-light leading-relaxed mb-10 grow">
                    {tour.description}
                  </p>

                  <div className="flex items-end justify-between pt-2">
                    <div>
                      <span className="text-white/40 text-[9px] uppercase tracking-[0.2em] block mb-1.5">
                        Starting from
                      </span>
                      <p className="text-3xl text-white font-serif">
                        {tour.price}
                      </p>
                    </div>
                    <Link
                      href={`/tours/${tour.id}`}
                      className="bg-transparent border border-white/20 text-white hover:border-gold hover:bg-gold hover:opacity-70 px-8 py-3.5 rounded-full text-[10px] tracking-[0.2em] uppercase font-bold transition-all duration-500"
                    >
                      Discover
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Mobile View All Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-16 md:hidden"
        >
          <Link
            href="/tours"
            className="inline-block bg-transparent border border-white/20 text-white hover:border-gold hover:text-gold px-10 py-4 rounded-full font-bold tracking-widest uppercase text-xs transition-all duration-300"
          >
            View All Journeys
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedTours;
