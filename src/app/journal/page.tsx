"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, ArrowRight, User, Sparkles } from "lucide-react";
// 1. Pulling your live data!
import { getTours } from "@/actions/tourActions"; 

// Added "Safari" to the categories so your existing database tours will show up!
const categories = ["All", "Safari", "Wildlife", "Culture", "Conservation", "Guides", "Photography"];

export default function JournalPage() {
  // 2. State for live database data
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  // 3. Fetch from the database on load
  useEffect(() => {
    async function loadLivePosts() {
      try {
        const dbTours = await getTours();
        setPosts(dbTours);
      } catch (error) {
        console.error("Failed to load journal posts", error);
      } finally {
        setLoading(false);
      }
    }
    loadLivePosts();
  }, []);

  // 4. Filter Logic using Live Data
  const filteredPosts = activeCategory === "All" 
    ? posts 
    : posts.filter(post => post.category?.toLowerCase() === activeCategory.toLowerCase());

  // Make the very first item in the database the "Featured" post
  const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
  // The rest become the regular grid posts
  const regularPosts = filteredPosts.length > 1 ? filteredPosts.slice(1) : [];

  return (
    <main className="min-h-screen bg-safari-green selection:bg-gold selection:text-safari-green flex flex-col">
      <Navbar />

      <div className="flex-grow w-full pb-24">
        {/* Cinematic Header */}
        <section className="relative pt-48 pb-20 px-6 border-b border-white/5">
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-3 mb-6"
            >
              <span className="h-px w-8 bg-gold" />
              <span className="text-gold tracking-[0.4em] uppercase text-xs font-bold">
                Stories & Dispatch
              </span>
              <span className="h-px w-8 bg-gold" />
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-serif text-white mb-6"
            >
              The OJO <span className="italic text-gold-light">Journal</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-white/60 max-w-2xl mx-auto text-lg font-light leading-relaxed"
            >
              Curated perspectives on luxury travel, wildlife conservation, and the vibrant culture of the Land of a Thousand Hills.
            </motion.p>
          </div>
        </section>

        {/* Category Filters */}
        <section className="sticky top-[88px] z-40 bg-safari-green/90 backdrop-blur-xl border-b border-white/5 py-4">
          <div className="max-w-7xl mx-auto px-6 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-6 md:gap-10 min-w-max">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`text-[10px] md:text-xs tracking-[0.2em] uppercase font-bold transition-all duration-300 relative py-2 ${
                    activeCategory === category ? "text-gold" : "text-white/40 hover:text-white"
                  }`}
                >
                  {category}
                  {activeCategory === category && (
                    <motion.div 
                      layoutId="journalCategoryIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-6 pt-16 space-y-24">
          
          {loading ? (
             <div className="text-center py-32 text-gold animate-pulse tracking-[0.2em] text-xs uppercase font-bold">
               Loading Live Editorial Data...
             </div>
          ) : (
            <>
              {/* Featured Article */}
              <AnimatePresence mode="wait">
                {activeCategory === "All" && featuredPost && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                    className="group cursor-pointer"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-white/10 bg-[#0a1a12]">
                      <div className="relative h-[400px] lg:h-[600px] overflow-hidden">
                        <img 
                          src={featuredPost.image} 
                          alt={featuredPost.title}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000"
                        />
                        <div className="absolute top-6 left-6 bg-safari-green/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
                          <span className="text-gold text-[10px] font-bold uppercase tracking-[0.2em]">Featured</span>
                        </div>
                      </div>
                      
                      <div className="p-10 lg:p-16 flex flex-col justify-center">
                        <div className="flex items-center text-white/40 text-xs tracking-widest uppercase mb-6 space-x-6">
                          <span className="text-gold">{featuredPost.category}</span>
                          <span className="flex items-center"><Clock size={12} className="mr-2" /> 5 min read</span>
                        </div>
                        
                        <h2 className="text-4xl lg:text-5xl font-serif text-white mb-6 leading-tight group-hover:text-gold-light transition-colors">
                          {featuredPost.title}
                        </h2>
                        
                        <p className="text-white/60 text-lg font-light leading-relaxed mb-10 line-clamp-4">
                          {featuredPost.description}
                        </p>
                        
                        <div className="flex items-center justify-between mt-auto pt-8 border-t border-white/10">
                          <div className="flex items-center text-white/50 text-sm">
                            <User size={16} className="mr-2 text-gold" /> OJO Editorial
                          </div>
                          <a href={`/tours/${featuredPost.id}`} className="flex items-center text-gold text-xs tracking-widest uppercase font-bold">
                            Read Article <ArrowRight size={14} className="ml-2 transform group-hover:translate-x-2 transition-transform" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Article Grid */}
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                <AnimatePresence mode="popLayout">
                  {regularPosts.map((post, index) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      key={post.id}
                      className="group cursor-pointer flex flex-col"
                    >
                      <div className="relative h-64 overflow-hidden rounded-2xl mb-6 border border-white/10">
                        <img 
                          src={post.image} 
                          alt={post.title}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-safari-green via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>
                      
                      <div className="flex items-center text-white/40 text-[10px] tracking-widest uppercase mb-4 space-x-4">
                        <span className="text-gold">{post.category}</span>
                        <span>•</span>
                        <span className="flex items-center"><Calendar size={10} className="mr-1.5" /> Recently Added</span>
                      </div>
                      
                      <h3 className="text-2xl font-serif text-white mb-4 group-hover:text-gold-light transition-colors leading-snug">
                        {post.title}
                      </h3>
                      
                      <p className="text-white/50 text-sm font-light leading-relaxed mb-6 flex-grow line-clamp-3">
                        {post.description}
                      </p>
                      
                      <a href={`/tours/${post.id}`} className="flex items-center text-gold text-[10px] tracking-widest uppercase font-bold mt-auto pt-4 border-t border-white/5 w-fit">
                        Read Article <ArrowRight size={12} className="ml-2 transform group-hover:translate-x-2 transition-transform" />
                      </a>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Empty State */}
              {filteredPosts.length === 0 && (
                <div className="text-center py-20 border border-white/5 rounded-3xl bg-white/[0.02]">
                  <p className="text-white/50 text-xl font-serif">No articles found in this category.</p>
                  <button 
                    onClick={() => setActiveCategory("All")}
                    className="mt-6 text-gold hover:text-gold-light uppercase tracking-widest text-xs font-bold transition-colors"
                  >
                    View All Stories
                  </button>
                </div>
              )}
            </>
          )}

        </div>

        {/* Newsletter Callout Block */}
        <section className="max-w-5xl mx-auto px-6 mt-32">
          <div className="bg-[#0a1a12] border border-gold/20 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-50" />
            <Sparkles size={24} className="text-gold mx-auto mb-6" />
            <h2 className="text-3xl md:text-5xl font-serif text-white mb-4">Join the Inner Circle</h2>
            <p className="text-white/60 font-light mb-10 max-w-lg mx-auto">
              Receive exclusive travel guides, conservation updates, and priority access to our newest luxury itineraries.
            </p>
            <form className="flex flex-col sm:flex-row max-w-md mx-auto gap-3" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="flex-grow bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white text-sm focus:outline-none focus:border-gold/50 transition-all"
              />
              <button className="bg-gold hover:bg-gold-light text-safari-green font-bold py-4 px-8 rounded-xl transition-all duration-300 text-xs tracking-[0.2em] uppercase whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </div>
        </section>

      </div>

      <Footer />
    </main>
  );
}