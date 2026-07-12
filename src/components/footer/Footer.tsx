"use client";

import React from "react";
import { MapPin, Phone, Mail, ArrowRight, Send } from "lucide-react";
import Link from "next/link";

// --- Custom Social Icons ---
const FacebookIcon = ({ size = 18 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);
const TwitterIcon = ({ size = 18 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);
const InstagramIcon = ({ size = 18 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);
const LinkedInIcon = ({ size = 18 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const Footer = () => {
  return (
    <footer className="w-full bg-[#040C08] border-t border-white/5 relative">
      {/* Visual Top Border */}
      <div className="h-px w-full bg-linear-to-r from-transparent via-gold/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          {/* Brand Identity */}
          <div className="lg:col-span-4">
            {/* 🚀 UPGRADED LOGO SECTION: Round image + Company Name */}
            <a href="/" className="flex items-center gap-3 mb-2 group w-fit">
              <img
                src="/ojo-logo.png"
                alt="OJO Tours Logo"
                className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover border border-white/20 shadow-lg transition-transform duration-300 group-hover:scale-105"
              />
              <h3 className="text-3xl font-serif text-white tracking-wide">
                OJO{" "}
                <span className="text-gold group-hover:text-gold-light transition-colors">
                  Tours
                </span>
              </h3>
            </a>

            <p className="text-gold/60 text-[9px] tracking-[0.3em] uppercase mb-6 font-bold mt-2">
              OJO TOURS & Safaris co.Ltd
            </p>
            <p className="text-white/50 text-sm leading-relaxed mb-8 max-w-sm">
              Curating high-end Rwandan expeditions with a commitment to
              conservation and uncompromised luxury.
            </p>
            <div className="flex space-x-3">
              {[InstagramIcon, FacebookIcon, TwitterIcon, LinkedInIcon].map(
                (Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:bg-gold hover:text-safari-green hover:border-gold transition-all duration-300"
                  >
                    <Icon />
                  </a>
                ),
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-bold tracking-[0.2em] uppercase text-[10px] mb-6 flex items-center gap-2">
              <span className="w-1 h-3 bg-gold inline-block" /> Explore
            </h4>
            <ul className="space-y-3">
              {[
                "Destinations",
                "Safari Packages",
                "Luxury Lodges",
                "Our Story",
                "Journal",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-white/40 hover:text-gold transition-colors text-sm font-light flex items-center group"
                  >
                    <ArrowRight
                      size={10}
                      className="mr-2 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all"
                    />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h4 className="text-white font-bold tracking-[0.2em] uppercase text-[10px] mb-6 flex items-center gap-2">
              <span className="w-1 h-3 bg-gold inline-block" /> Contact Us
            </h4>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <MapPin size={16} className="text-gold mt-1 shrink-0" />
                <p className="text-white/50 text-sm font-light">
                  KG 7 Avenue, Heights Tower, Kigali City
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Phone size={16} className="text-gold shrink-0" />
                <p className="text-white/50 text-sm font-light">
                  +250 788 000 000
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Mail size={16} className="text-gold shrink-0" />
                <p className="text-white/50 text-sm font-light">
                  concierge@ojotours.com
                </p>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-3">
            <h4 className="text-white font-bold tracking-[0.2em] uppercase text-[10px] mb-6 flex items-center gap-2">
              <span className="w-1 h-3 bg-gold inline-block" /> The Journal
            </h4>
            <p className="text-white/40 text-xs mb-6 leading-relaxed">
              Subscribe for exclusive luxury travel inspiration.
            </p>
            <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-gold/50 transition-all"
              />
              <button className="w-full bg-transparent border border-gold text-gold hover:bg-gold cursor-pointer font-bold py-3 rounded-lg transition-all text-[10px] tracking-[0.2em] uppercase flex items-center justify-center gap-2 group">
                Subscribe{" "}
                <Send
                  size={12}
                  className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                />
              </button>
            </form>
          </div>
        </div>

        {/* Legal Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/30 text-[10px] tracking-widest uppercase">
            © {new Date().getFullYear()} OJO TOURS & Safaris co.Ltd.
          </p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Sitemap"].map((item) => (
              <Link
                key={item}
                href="#"
                className="text-white/30 hover:text-gold text-[10px] tracking-widest uppercase transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* This hidden div ensures the footer background stretches if needed */}
      <div className="absolute bottom-[-100px] left-0 w-full h-[100px] bg-[#040C08]" />
    </footer>
  );
};

export default Footer;
