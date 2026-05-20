"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Gem, Compass, Headset } from "lucide-react";

const features = [
  {
    id: 1,
    icon: <Compass size={28} className="text-gold" />,
    title: "Expert Local Guides",
    description: "Discover the hidden gems of Rwanda with our certified, passionate local experts who know the land perfectly."
  },
  {
    id: 2,
    icon: <Gem size={28} className="text-gold" />,
    title: "Luxury Experiences",
    description: "From 5-star lodges to premium safari vehicles, we ensure your comfort matches the breathtaking scenery."
  },
  {
    id: 3,
    icon: <ShieldCheck size={28} className="text-gold" />,
    title: "Safe & Secure Travel",
    description: "Your safety is our top priority. We provide secure transportation and fully vetted luxury accommodations."
  },
  {
    id: 4,
    icon: <Headset size={28} className="text-gold" />,
    title: "24/7 Concierge Support",
    description: "Our dedicated team is available around the clock to assist you with any bespoke requests during your journey."
  }
];

const WhyChooseUs = () => {
  return (
    <section className="py-32 bg-safari-emerald relative border-t border-white/5 overflow-hidden">
      
      {/* Subtle Ambient Gold Glow for Cinematic Feel */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[1000px] h-[600px] md:h-[1000px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <span className="h-px w-8 bg-gold" />
            <span className="text-gold tracking-[0.4em] uppercase text-xs font-bold">
              The OJO Standard
            </span>
            <span className="h-px w-8 bg-gold" />
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-serif text-white leading-tight mb-6"
          >
            Uncompromising <span className="italic text-gold-light">Excellence</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-lg font-light leading-relaxed"
          >
            We don't just organize trips; we orchestrate lifelong memories. Every detail of your journey is handled with absolute precision and care.
          </motion.p>
        </div>

        {/* Premium Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.7, ease: "easeOut" }}
              className="bg-safari-green/40 backdrop-blur-md border border-white/5 p-10 rounded-3xl hover:bg-safari-green/80 hover:border-gold/30 hover:shadow-[0_10px_40px_rgba(212,175,55,0.05)] hover:-translate-y-2 transition-all duration-500 group"
            >
              {/* Icon Container with subtle gradient */}
              <div className="bg-gradient-to-br from-gold/10 to-transparent border border-white/5 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:border-gold/30 group-hover:scale-110 transition-all duration-500">
                {feature.icon}
              </div>
              
              <h3 className="text-xl font-serif text-white mb-4 group-hover:text-gold-light transition-colors duration-300">
                {feature.title}
              </h3>
              
              <p className="text-white/50 text-sm leading-loose">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default WhyChooseUs;