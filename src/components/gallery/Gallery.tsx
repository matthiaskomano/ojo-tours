"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Maximize2, Loader2 } from "lucide-react"; // 🚀 NEW: Added Loader2
import { getGalleryImages } from "@/actions/galleryActions"; // 🚀 NEW: Import database action

// Categories for the interactive filter
const categories = ["All", "Nature", "Wildlife", "Culture", "Hotels", "Adventure"];

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  
  // 🚀 NEW: Dynamic state for the database images
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🚀 NEW: Fetch live images from the database on load
  useEffect(() => {
    const fetchImages = async () => {
      const data = await getGalleryImages();
      
      // Map the database fields to match the animation grid's expected format
      const formattedData = data.map((img: any) => ({
        id: img.id,
        src: img.image, // DB uses 'image', component uses 'src'
        alt: img.title, // DB uses 'title', component uses 'alt'
        category: img.category,
        className: img.className,
      }));

      setGalleryImages(formattedData);
      setIsLoading(false);
    };

    fetchImages();
  }, []);

  // Filter images based on selected category
  const filteredImages = activeCategory === "All" 
    ? galleryImages 
    : galleryImages.filter(img => img.category === activeCategory);

  return (
    <section className="py-32 bg-safari-green relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Heading & Follow Link */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-4"
            >
              <span className="h-px w-8 bg-gold" />
              <span className="text-gold tracking-[0.4em] uppercase text-xs font-bold">
                Through Our Lens
              </span>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-serif text-white"
            >
              Rwanda in <span className="italic text-gold-light">Focus</span>
            </motion.h2>
          </div>

          <motion.a
            href="#"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center text-white/50 hover:text-gold transition-colors duration-300 group"
          >
            <Camera className="mr-2 transform group-hover:scale-110 transition-transform" size={20} />
            <span className="text-xs tracking-[0.2em] uppercase font-bold">Follow @OjoTours</span>
          </motion.a>
        </div>

        {/* Category Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center gap-4 md:gap-8 mb-12 border-b border-white/10 pb-4"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`text-xs tracking-[0.2em] uppercase font-bold transition-all duration-300 relative pb-4 -mb-[17px] ${
                activeCategory === category ? "text-gold" : "text-white/40 hover:text-white"
              }`}
            >
              {category}
              {activeCategory === category && (
                <motion.div 
                  layoutId="activeCategoryIndicator"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold"
                />
              )}
            </button>
          ))}
        </motion.div>

        {/* 🚀 NEW: Loading State & Dynamic Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 size={40} className="text-gold animate-spin mb-4" />
            <p className="text-white/50 tracking-widest uppercase text-xs font-bold">Loading Archives...</p>
          </div>
        ) : galleryImages.length === 0 ? (
          <div className="text-center py-32 text-white/50 italic font-light">
            The visual archives are currently being updated.
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-4 auto-rows-[250px] md:auto-rows-[300px] gap-4 md:gap-6">
            <AnimatePresence>
              {filteredImages.map((image) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                  key={image.id}
                  className={`relative overflow-hidden rounded-3xl group cursor-pointer bg-safari-emerald/50 border border-white/5 ${activeCategory === 'All' ? image.className : 'col-span-1 row-span-1 md:col-span-2 md:row-span-1'}`}
                >
                  {/* Image */}
                  <img 
                    src={image.src} 
                    alt={image.alt} 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-in-out opacity-80 group-hover:opacity-100"
                  />
                  
                  {/* Cinematic Gradient Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-safari-green via-safari-green/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Content Overlay */}
                  <div className="absolute inset-0 p-8 flex flex-col justify-end opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 z-10">
                    <span className="text-gold text-[10px] font-bold uppercase tracking-[0.2em] mb-2 block drop-shadow-md">
                      {image.category}
                    </span>
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-serif text-2xl drop-shadow-md">
                        {image.alt}
                      </h3>
                      <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-white">
                        <Maximize2 size={16} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* View Full Gallery Button */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <button className="bg-transparent border border-gold/50 hover:border-gold hover:bg-gold hover:text-safari-green text-gold px-10 py-4 rounded-full font-bold tracking-[0.2em] uppercase text-xs transition-all duration-500 shadow-[0_0_20px_rgba(212,175,55,0.1)] hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]">
            Explore Full Gallery
          </button>
        </motion.div>

      </div>
    </section>
  );
};

export default Gallery;