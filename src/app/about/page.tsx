"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import { motion } from "framer-motion";
import { Target, Eye, Award, Users, Map, Leaf, Loader2 } from "lucide-react";
import { getTeam } from "@/actions/teamActions"; // 🚀 NEW: Import the database action

export default function AboutPage() {
  // 🚀 NEW: State to hold the dynamic database team members
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🚀 NEW: Fetch the team members when the page loads
  useEffect(() => {
    const fetchTeam = async () => {
      const data = await getTeam();
      setTeamMembers(data);
      setIsLoading(false);
    };
    fetchTeam();
  }, []);

  return (
    <main className="min-h-screen bg-safari-green selection:bg-gold selection:text-safari-green pb-0 overflow-hidden">
      <Navbar />

      {/* 1. Cinematic Header */}
      <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1547471080-7cb2cb6a5a36?q=80&w=2070&auto=format&fit=crop"
            alt="Rwanda Landscape"
            className="w-full h-full object-cover opacity-60 scale-105 animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-safari-green via-safari-green/80 to-transparent" />
        </div>

        <div className="relative z-10 text-center px-6 mt-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <span className="h-px w-8 bg-gold" />
            <span className="text-gold tracking-[0.4em] uppercase text-xs font-bold">
              Our Heritage
            </span>
            <span className="h-px w-8 bg-gold" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-serif text-white mb-6 drop-shadow-lg"
          >
            The OJO Tours <span className="italic text-gold-light">Story</span>
          </motion.h1>
        </div>
      </section>

      {/* 2. Company Story (Split Layout) */}
      <section className="max-w-7xl mx-auto px-6 -mt-20 relative z-20 mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative h-[500px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
          >
            <img 
              src="https://images.unsplash.com/photo-1534177616072-ef7dc120449d?q=80&w=2000&auto=format&fit=crop" 
              alt="Safari Vehicle in Rwanda" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-safari-green/80 to-transparent" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-5xl font-serif text-white mb-8 leading-tight">Born from a Love <br/><span className="italic text-gold">for the Wild</span></h2>
            <div className="space-y-6 text-white/70 text-lg font-light leading-relaxed">
              <p>
                OJO Tours & Safaris was founded on a simple, yet profound principle: to share the unparalleled beauty of Rwanda with the world, while fiercely protecting the ecosystems that make it so special.
              </p>
              <p>
                Headquartered in the vibrant heart of Kigali, our team knows every hidden trail of Volcanoes National Park and every watering hole in Akagera. We are not just tour operators; we are ambassadors of our homeland.
              </p>
              <blockquote className="border-l-2 border-gold pl-6 py-4 my-8 text-xl font-serif text-white/90 italic bg-white/5 rounded-r-xl pr-4 backdrop-blur-sm shadow-inner">
                "To travel with OJO is to experience Rwanda not as a tourist, but as an honored guest of the land."
              </blockquote>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. Mission & Vision */}
      <section className="py-24 bg-safari-emerald/30 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Mission Card */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-[#0A1A12]/80 backdrop-blur-xl border border-white/10 p-12 rounded-3xl hover:border-gold/30 transition-colors duration-500 group shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold/20 to-transparent flex items-center justify-center mb-8 border border-gold/20 group-hover:scale-110 transition-transform duration-500">
                <Target size={32} className="text-gold" />
              </div>
              <h3 className="text-3xl font-serif text-white mb-6">Our Mission</h3>
              <p className="text-white/60 text-lg leading-relaxed font-light">
                To curate extraordinary, bespoke safari experiences that exceed the expectations of the modern luxury traveler, while actively contributing to the conservation of Rwanda's wildlife and the prosperity of its local communities.
              </p>
            </motion.div>

            {/* Vision Card */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-[#0A1A12]/80 backdrop-blur-xl border border-white/10 p-12 rounded-3xl hover:border-gold/30 transition-colors duration-500 group shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold/20 to-transparent flex items-center justify-center mb-8 border border-gold/20 group-hover:scale-110 transition-transform duration-500">
                <Eye size={32} className="text-gold" />
              </div>
              <h3 className="text-3xl font-serif text-white mb-6">Our Vision</h3>
              <p className="text-white/60 text-lg leading-relaxed font-light">
                To be universally recognized as East Africa’s premier luxury tourism provider, setting the global standard for ethical, high-end travel and ensuring the "Land of a Thousand Hills" thrives for generations to come.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. Tourism Statistics */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center">
            {[
              { icon: Award, stat: "15+", label: "Years Experience" },
              { icon: Map, stat: "500+", label: "Bespoke Itineraries" },
              { icon: Users, stat: "99%", label: "Guest Satisfaction" },
              { icon: Leaf, stat: "10%", label: "Profits to Conservation" }
            ].map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center"
              >
                <item.icon size={32} className="text-gold mb-6 opacity-80" />
                <h4 className="text-4xl md:text-5xl font-serif text-white mb-3">{item.stat}</h4>
                <p className="text-white/50 text-xs tracking-[0.2em] uppercase font-bold">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. 🚀 UPGRADED: Dynamic Database Team Section */}
      <section className="py-32 bg-[#06110c] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-gold tracking-[0.4em] uppercase text-xs font-bold mb-4">The Visionaries</h2>
            <h3 className="text-4xl md:text-5xl font-serif text-white">Meet the <span className="italic text-gold-light">Directors</span></h3>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 size={40} className="text-gold animate-spin mb-4" />
              <p className="text-white/50 tracking-widest uppercase text-xs font-bold">Loading Team...</p>
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center py-20 text-white/50 italic">
              Our team roster is currently being updated. Check back soon!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
              {teamMembers.map((member, index) => (
                <motion.div 
                  key={member.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="group cursor-default bg-safari-green/20 backdrop-blur-sm rounded-3xl p-6 border border-white/5 hover:border-gold/30 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
                >
                  <div className="relative h-[350px] rounded-2xl overflow-hidden mb-6 border border-white/10">
                    <div className="absolute inset-0 bg-safari-green/30 group-hover:bg-transparent transition-colors duration-500 z-10" />
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-105"
                    />
                  </div>
                  <h4 className="text-2xl font-serif text-white mb-1 group-hover:text-gold-light transition-colors">{member.name}</h4>
                  <p className="text-gold text-[10px] tracking-widest uppercase mb-4 font-bold">{member.role}</p>
                  <p className="text-white/60 font-light leading-relaxed text-sm">
                    {member.bio}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 6. Rwanda Information Block */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=2068&auto=format&fit=crop" 
            alt="Rwanda Safari" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-safari-green/90" />
        </div>
        
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <Leaf size={40} className="text-gold mx-auto mb-8 opacity-80" />
          <h2 className="text-4xl md:text-5xl font-serif text-white mb-8">The Land of a Thousand Hills</h2>
          <p className="text-white/70 text-lg md:text-xl font-light leading-relaxed mb-10">
            Rwanda is widely considered the crown jewel of East Africa. A nation of stunning rebirth and pristine natural beauty, it offers the safest, cleanest, and most exclusive safari experiences on the continent. From the thriving capital of Kigali to the majestic Virunga mountain range, every inch of this country pulses with life.
          </p>
          <a href="/tours" className="inline-block bg-transparent border border-gold hover:bg-gold hover:text-safari-green text-gold px-10 py-4 rounded-full font-bold tracking-[0.2em] uppercase text-xs transition-all duration-500 shadow-lg">
            Discover Our Destinations
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}