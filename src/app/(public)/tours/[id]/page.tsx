"use client";

import React, { useState, useEffect, use } from "react"; // 🚀 Added `use` here
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Clock,
  Users,
  Activity,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Calendar,
  ShieldCheck,
  Star,
} from "lucide-react";
// 1. Import your database actions!
import { getTourById } from "@/actions/tourActions";
import { addBooking } from "@/actions/bookingActions"; // 🚀 Added booking action

// 🚀 Updated the params type to be a Promise for Next.js 15
export default function TourDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // 🚀 UNWRAP THE PROMISE HERE
  const { id } = use(params);

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // 2. State for live database loading
  const [tour, setTour] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 3. Fetch the live data when the page loads
  useEffect(() => {
    async function loadTour() {
      try {
        // 🚀 Use the unwrapped `id` here
        const fetchedTour = await getTourById(id);
        setTour(fetchedTour);
      } catch (error) {
        console.error("Failed to load tour details");
      } finally {
        setLoading(false);
      }
    }
    loadTour();
  }, [id]); // 🚀 Updated dependency array to track the unwrapped `id`

  // --- LOADING STATE ---
  if (loading) {
    return (
      <main className="min-h-screen bg-[#040C08] flex flex-col items-center justify-center text-white">
        <div className="text-gold animate-pulse tracking-[0.2em] text-xs uppercase font-bold">
          Loading Live Expedition Data...
        </div>
      </main>
    );
  }

  // --- 404 NOT FOUND STATE ---
  if (!tour) {
    return (
      <main className="min-h-screen bg-[#040C08] flex flex-col items-center justify-center text-white">
        <h1 className="text-4xl font-serif text-gold mb-4">
          Journey Not Found
        </h1>
        <p className="text-white/60 mb-8">
          The expedition you are looking for does not exist in the database.
        </p>
        <a
          href="/tours"
          className="border border-gold text-gold px-8 py-3 rounded-full uppercase tracking-widest text-xs font-bold hover:bg-gold hover:text-[#040C08] transition-colors"
        >
          Return to Tours
        </a>
      </main>
    );
  }

  // --- SMART FALLBACK DATA ---
  const groupSize = "Max 6 People";
  const difficulty = "Moderate";
  const reviewsCount = Math.floor(Math.random() * 150) + 20;

  const itinerary = [
    {
      day: "Day 1",
      title: "Arrival & VIP Transfer",
      desc: `Arrive and transfer to your accommodation near ${tour.location}. Evening briefing and welcome dinner.`,
    },
    {
      day: "Day 2",
      title: "The Main Expedition",
      desc: `Embark on your guided ${tour.category.toLowerCase()} experience. Spend the day exploring and discovering the wonders of the region.`,
    },
    {
      day: "Day 3",
      title: "Departure",
      desc: "Leisurely breakfast overlooking the landscape before your private transfer out.",
    },
  ];

  const included = [
    "Luxury Accommodation",
    "All Gourmet Meals",
    "Private 4x4 Vehicle",
    "Expert Local Guide",
  ];
  const excluded = [
    "International Flights",
    "Premium Imported Alcohol",
    "Personal Travel Insurance",
    "Gratuities",
  ];

  const gallery = [tour.image, tour.image, tour.image, tour.image];

  const faqs = [
    {
      q: `What should I pack for ${tour.location}?`,
      a: "We recommend comfortable, neutral-colored clothing, sturdy walking shoes, and a good camera.",
    },
    {
      q: "Are permits guaranteed?",
      a: "Yes, once your booking is confirmed, we immediately secure any necessary high-demand permits.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#040C08] selection:bg-gold selection:text-[#040C08] pb-24">
      {/* Large Hero Section */}
      <section className="relative h-[70vh] min-h-[600px] flex items-end pb-20 border-b border-white/5">
        <div className="absolute inset-0 z-0">
          <img
            src={tour.image}
            alt={tour.title}
            className="w-full h-full object-cover scale-105 animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#040C08] via-[#040C08]/60 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <div className="flex items-center gap-4 mb-4">
              <span className="bg-gold text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                {tour.category}
              </span>
              <div className="flex items-center text-gold bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                <Star size={12} className="fill-gold mr-1" />
                <span className="text-white text-xs tracking-wider">
                  {tour.rating} ({reviewsCount} reviews)
                </span>
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif text-white mb-4 leading-tight drop-shadow-lg">
              {tour.title}
            </h1>
            <div className="flex items-center text-white/70 text-sm tracking-widest uppercase">
              <MapPin size={16} className="mr-2 text-gold" /> {tour.location}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content & Sidebar Layout */}
      <section className="max-w-7xl mx-auto px-6 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
          {/* LEFT COLUMN: Main Content */}
          <div className="lg:col-span-2 space-y-20">
            {/* Quick Facts */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-white/10">
              {[
                { icon: Clock, label: "Duration", value: tour.duration },
                { icon: Users, label: "Group Size", value: groupSize },
                { icon: Activity, label: "Physical", value: difficulty },
                { icon: Calendar, label: "Availability", value: "Year Round" },
              ].map((fact, idx) => (
                <div key={idx} className="flex flex-col">
                  <fact.icon size={24} className="text-gold mb-3 opacity-80" />
                  <span className="text-white/40 text-[10px] uppercase tracking-[0.2em] mb-1">
                    {fact.label}
                  </span>
                  <span className="text-white font-bold text-sm">
                    {fact.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Overview */}
            <div>
              <h2 className="text-3xl font-serif text-white mb-6">
                The Experience
              </h2>
              <p className="text-white/70 text-lg font-light leading-relaxed whitespace-pre-wrap">
                {tour.description}
              </p>
            </div>

            {/* Itinerary Timeline */}
            <div>
              <h2 className="text-3xl font-serif text-white mb-10">
                Daily Itinerary
              </h2>
              <div className="space-y-8 pl-4 border-l border-white/10 ml-2 relative">
                {itinerary.map((day, idx) => (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    key={idx}
                    className="relative pl-8"
                  >
                    <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-gold shadow-[0_0_10px_rgba(212,175,55,0.8)]" />
                    <span className="text-gold text-[10px] font-bold uppercase tracking-[0.2em] block mb-2">
                      {day.day}
                    </span>
                    <h3 className="text-xl font-serif text-white mb-3">
                      {day.title}
                    </h3>
                    <p className="text-white/60 text-sm leading-loose">
                      {day.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Inclusions / Exclusions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-[#0A1A12] p-10 rounded-3xl border border-white/5">
              <div>
                <h3 className="text-xl font-serif text-white mb-6 flex items-center">
                  <CheckCircle2 className="mr-3 text-gold" size={20} /> What's
                  Included
                </h3>
                <ul className="space-y-4">
                  {included.map((item, idx) => (
                    <li
                      key={idx}
                      className="text-white/70 text-sm font-light flex items-start"
                    >
                      <span className="text-gold mr-3 mt-1 text-xs">✦</span>{" "}
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-serif text-white mb-6 flex items-center">
                  <XCircle className="mr-3 text-white/30" size={20} /> Not
                  Included
                </h3>
                <ul className="space-y-4">
                  {excluded.map((item, idx) => (
                    <li
                      key={idx}
                      className="text-white/40 text-sm font-light flex items-start"
                    >
                      <span className="mr-3 mt-1 text-xs opacity-50">✦</span>{" "}
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Image Gallery Grid */}
            <div>
              <h2 className="text-3xl font-serif text-white mb-6">Gallery</h2>
              <div className="grid grid-cols-2 gap-4">
                {gallery.map((img, idx) => (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    key={idx}
                    className={`overflow-hidden rounded-2xl ${idx === 0 ? "col-span-2 h-80" : "h-48"}`}
                  >
                    <img
                      src={img}
                      alt="Tour Gallery"
                      className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700"
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Map Placeholder */}
            <div>
              <h2 className="text-3xl font-serif text-white mb-6">Location</h2>
              <div className="relative h-80 w-full rounded-3xl overflow-hidden border border-white/10 group bg-[#111] flex items-center justify-center">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                <div className="text-center relative z-10">
                  <MapPin
                    size={40}
                    className="text-gold mx-auto mb-4 animate-bounce"
                  />
                  <p className="text-white font-serif text-xl mb-4">
                    {tour.location}
                  </p>
                  <button className="text-[10px] text-white/50 tracking-[0.2em] uppercase border border-white/20 px-6 py-3 rounded-full hover:border-gold hover:text-gold transition-colors">
                    View Interactive Map
                  </button>
                </div>
              </div>
            </div>

            {/* FAQs Accordion */}
            <div className="pb-20">
              <h2 className="text-3xl font-serif text-white mb-8">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="bg-[#0A1A12] border border-white/10 rounded-2xl overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
                    >
                      <span className="text-white font-serif text-lg">
                        {faq.q}
                      </span>
                      <ChevronDown
                        size={20}
                        className={`text-gold transition-transform duration-300 ${openFaq === idx ? "rotate-180" : ""}`}
                      />
                    </button>
                    <AnimatePresence>
                      {openFaq === idx && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                        >
                          <div className="p-6 pt-0 text-white/60 font-light leading-relaxed border-t border-white/5 mt-2">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Fully Functional Booking Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 bg-[#0A1A12] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
              <div className="mb-8 border-b border-white/10 pb-6">
                <span className="text-white/50 text-[10px] uppercase tracking-[0.2em] block mb-2">
                  Starting from
                </span>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-serif text-white">
                    {tour.price}
                  </span>
                  <span className="text-white/40 text-sm mb-1.5">/ person</span>
                </div>
              </div>

              {/* 🚀 THE SECURE BOOKING FORM */}
              <form
                action={async (formData) => {
                  await addBooking(formData);
                  alert(
                    "Reservation Request Sent! We will contact you shortly to confirm.",
                  );
                }}
                className="space-y-5 mb-8"
              >
                {/* Hidden inputs to secretly pass the tour data to the database */}
                <input type="hidden" name="itemName" value={tour.title} />
                <input type="hidden" name="itemType" value="Tour" />
                <input type="hidden" name="totalPrice" value={tour.price} />

                <div>
                  <label className="text-white/60 text-[10px] tracking-widest uppercase mb-2 block">
                    Full Name
                  </label>
                  <input
                    required
                    name="customerName"
                    type="text"
                    placeholder="e.g. John Doe"
                    className="w-full bg-[#040C08] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-gold/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-white/60 text-[10px] tracking-widest uppercase mb-2 block">
                    Email Address
                  </label>
                  <input
                    required
                    name="customerEmail"
                    type="email"
                    placeholder="john@example.com"
                    className="w-full bg-[#040C08] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-gold/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-white/60 text-[10px] tracking-widest uppercase mb-2 block">
                    Travel Date
                  </label>
                  <input
                    required
                    name="date"
                    type="date"
                    className="w-full bg-[#040C08] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-gold/50 transition-colors appearance-none"
                    style={{ colorScheme: "dark" }}
                  />
                </div>

                <div>
                  <label className="text-white/60 text-[10px] tracking-widest uppercase mb-2 block">
                    Guests
                  </label>
                  <select
                    required
                    name="guests"
                    className="w-full bg-[#040C08] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-gold/50 appearance-none cursor-pointer"
                  >
                    <option value="1 Adult" className="bg-[#111]">
                      1 Adult
                    </option>
                    <option value="2 Adults" className="bg-[#111]">
                      2 Adults
                    </option>
                    <option value="3 Adults" className="bg-[#111]">
                      3 Adults
                    </option>
                    <option value="4+ Adults" className="bg-[#111]">
                      4+ Adults
                    </option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#F1D592] cursor-pointer text-[#040C08] font-bold py-4 rounded-xl text-xs tracking-[0.2em] uppercase transition-all duration-300 shadow-[0_0_30px_rgba(212,175,55,0.4)] transform hover:-translate-y-1 mt-4"
                >
                  Request to Book
                </button>
              </form>

              {/* Trust Badges */}
              <div className="space-y-4 border-t border-white/10 pt-6">
                <div className="flex items-center text-white/50 text-xs font-light">
                  <ShieldCheck
                    size={16}
                    className="text-gold mr-3 opacity-80"
                  />{" "}
                  Secure Encryption
                </div>
                <div className="flex items-center text-white/50 text-xs font-light">
                  <Calendar size={16} className="text-gold mr-3 opacity-80" />{" "}
                  Flexible Rescheduling
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
