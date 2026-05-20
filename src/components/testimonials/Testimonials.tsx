"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

// Luxury-focused mock testimonials with profile photos
const testimonials = [
  {
    id: 1,
    name: "Eleanor & James Sterling",
    location: "London, UK",
    tour: "Silverback Expedition",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1000&auto=format&fit=crop",
    text: "Standing mere feet from a silverback gorilla was a profound, spiritual experience. OJO Tours handled every single detail with absolute perfection—from the luxury lodge transfers to the world-class guides.",
    rating: 5,
  },
  {
    id: 2,
    name: "Marcus Chen",
    location: "Singapore",
    tour: "Custom Akagera Safari",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop",
    text: "I have been on safaris across the continent, but the level of personalized luxury OJO provided in Akagera is unmatched. Our private guide had an incredible eye for predators. Worth every penny.",
    rating: 5,
  },
  {
    id: 3,
    name: "Sophia Laurent",
    location: "Paris, France",
    tour: "Lake Kivu Retreat",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000&auto=format&fit=crop",
    text: "The perfect ending to our Rwandan adventure. The sunset boat cruise on Lake Kivu, accompanied by champagne and local delicacies, was simply breathtaking. A truly five-star experience.",
    rating: 5,
  },
  {
    id: 4,
    name: "David Hoffmann",
    location: "Berlin, Germany",
    tour: "Nyungwe Forest Trek",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop",
    text: "The canopy walk was exhilarating. The biodiversity OJO shared with us was eye-opening. Everything was seamless, from kigali to the deepest forest.",
    rating: 5,
  }
];

const Testimonials = () => {
  return (
    <section className="py-32 bg-safari-green relative border-t border-white/5 overflow-hidden">
      
      {/* Background Typography Accent */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 text-[15rem] font-serif text-white/[0.01] whitespace-nowrap pointer-events-none select-none">
        Guest Voices
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <span className="h-px w-8 bg-gold" />
            <span className="text-gold tracking-[0.4em] uppercase text-xs font-bold">
              Guest Impressions
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
            Voices of the <span className="italic text-gold-light">Wild</span>
          </motion.h2>
        </div>

        {/* Swiper Slider */}
        <div className="pb-16">
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={30}
            slidesPerView={1}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            breakpoints={{
              768: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 3,
              },
            }}
            className="testimonial-swiper !pb-12"
          >
            {testimonials.map((testimonial) => (
              <SwiperSlide key={testimonial.id}>
                <div className="h-full bg-safari-emerald/20 backdrop-blur-md border border-white/10 p-8 md:p-10 rounded-[2rem] flex flex-col hover:border-gold/30 transition-all duration-500 group relative">
                  
                  {/* Quote Icon Background */}
                  <div className="absolute top-6 right-8 text-white/5 group-hover:text-gold/5 transition-colors duration-500">
                    <Quote size={80} />
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-6 relative z-10">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={14} className="fill-gold text-gold" />
                    ))}
                  </div>

                  {/* The Review Text */}
                  <p className="text-white/80 text-lg font-light leading-relaxed mb-8 relative z-10 italic">
                    "{testimonial.text}"
                  </p>

                  {/* Guest Info Row */}
                  <div className="flex items-center gap-4 mt-auto border-t border-white/10 pt-6 relative z-10">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gold/20 group-hover:border-gold/50 transition-colors">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-white font-serif text-xl">{testimonial.name}</h4>
                      <p className="text-gold text-[10px] tracking-[0.1em] uppercase font-bold mt-1">
                        {testimonial.tour}
                      </p>
                      <p className="text-white/40 text-[10px] uppercase mt-0.5">
                        {testimonial.location}
                      </p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

      </div>

      <style jsx global>{`
        .testimonial-swiper .swiper-pagination-bullet {
          background: rgba(255, 255, 255, 0.2) !important;
          opacity: 1;
        }
        .testimonial-swiper .swiper-pagination-bullet-active {
          background: #d4af37 !important;
          width: 20px;
          border-radius: 4px;
        }
      `}</style>
    </section>
  );
};

export default Testimonials;