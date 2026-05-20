"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
// 🚀 FIXED: Using a direct relative path to bypass the red line!
import BookingModal from "../BookingModal"; 

const Cta = () => {
  // State to control when the modal opens and closes
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="py-32 px-6 relative overflow-hidden bg-safari-green">
      {/* Background Image with Parallax Effect */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=2068&auto=format&fit=crop" 
          alt="Rwanda Safari" 
          className="w-full h-full object-cover opacity-30 scale-110 animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-safari-green via-transparent to-safari-green" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center gap-3 mb-8">
            <Sparkles size={16} className="text-gold" />
            <span className="text-gold tracking-[0.4em] uppercase text-xs font-bold">
              Begin Your Journey
            </span>
            <Sparkles size={16} className="text-gold" />
          </div>

          <h2 className="text-5xl md:text-8xl font-serif text-white mb-8 leading-tight">
            Ready to Explore the <br />
            <span className="italic text-gold-light text-4xl md:text-7xl">Land of a Thousand Hills?</span>
          </h2>

          <p className="text-white/60 text-lg md:text-xl font-light leading-relaxed mb-12 max-w-2xl mx-auto">
            From the misty peaks of the Virungas to the golden savannahs of Akagera, your extraordinary Rwandan adventure is waiting to be written.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            {/* Added onClick handler to trigger the modal */}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-gold hover:bg-gold-light text-safari-green px-12 py-5 rounded-full font-bold tracking-[0.2em] uppercase text-xs transition-all duration-500 shadow-[0_0_30px_rgba(212,175,55,0.2)] hover:shadow-[0_0_50px_rgba(212,175,55,0.4)] transform hover:-translate-y-1"
            >
              Book Your Expedition
            </button>
            
            <a 
              href="/contact" 
              className="group flex items-center text-white text-xs font-bold tracking-[0.2em] uppercase transition-colors hover:text-gold"
            >
              Consult an Expert 
              <ArrowRight size={16} className="ml-3 transform group-hover:translate-x-2 transition-transform" />
            </a>
          </div>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/2 -left-20 w-64 h-64 bg-gold/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-gold/5 rounded-full blur-[120px] pointer-events-none" />

      {/* The Modal Component injected into the page */}
      <BookingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </section>
  );
};

export default Cta;