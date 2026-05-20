"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion"; 
import { addTour, deleteTour } from "@/actions/tourActions";
import { addJournal, deleteJournal } from "@/actions/journalActions";
import { addLodge, deleteLodge } from "@/actions/lodgeActions"; 
import { updateBookingStatus, deleteBooking } from "@/actions/bookingActions"; 
import { addGalleryImage, deleteGalleryImage } from "@/actions/galleryActions";
import { addTeamMember, deleteTeamMember } from "@/actions/teamActions"; // 🚀 NEW: Team Actions
import { logoutUser } from "@/actions/authActions";
import { Trash2, LogOut, CheckCircle, XCircle, Clock, DollarSign, TrendingUp, Inbox, LayoutDashboard, Map, Home, BookOpen, Menu, X, Camera, Users } from "lucide-react"; // 🚀 NEW: Users Icon

export default function AdminClient({ 
  tours, 
  journals,
  lodges,
  bookings,
  gallery,
  team // 🚀 NEW: Added team prop
}: { 
  tours: any[]; 
  journals: any[];
  lodges: any[];
  bookings: any[];
  gallery: any[];
  team: any[]; // 🚀 NEW: Added team type
}) {
  const router = useRouter();
  // 🚀 NEW: Added "team" to activeTab state
  const [activeTab, setActiveTab] = useState<"tours" | "journal" | "lodges" | "bookings" | "gallery" | "team">("bookings");
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logoutUser();
    router.push("/login");
  };

  // --- FINANCIAL CALCULATIONS ---
  const parsePrice = (priceStr: string) => {
    if (!priceStr) return 0;
    const cleanStr = priceStr.replace(/[^0-9.-]+/g, ""); 
    return parseFloat(cleanStr) || 0;
  };

  const confirmedBookings = bookings.filter((b) => b.status === "Confirmed");
  const pendingCount = bookings.filter((b) => b.status === "Pending").length;
  
  const totalIncome = confirmedBookings.reduce((sum, booking) => {
    return sum + parsePrice(booking.totalPrice);
  }, 0);

  const formattedIncome = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(totalIncome);

  // --- CHART DATA ENGINE ---
  const chartData = [
    { month: "Dec", revenue: 14500 },
    { month: "Jan", revenue: 22000 },
    { month: "Feb", revenue: 18400 },
    { month: "Mar", revenue: 31000 },
    { month: "Apr", revenue: 27500 },
    { month: "May", revenue: totalIncome }, 
  ];
  
  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 10000);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row text-gray-900 font-sans selection:bg-gold selection:text-white relative">
      
      {/* 🚀 MOBILE TOP BAR (Visible only on small screens) */}
      <div className="lg:hidden bg-[#0B172A] text-white p-4 flex justify-between items-center fixed top-0 w-full z-40 shadow-md">
        <div className="flex items-center gap-2">
          <img src="/ojo-logo.png" alt="Logo" className="w-8 h-8 rounded-full border border-white/20 object-cover" />
          <h1 className="text-xl font-serif">OJO Admin</h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* 🚀 MOBILE SIDEBAR OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* 🚀 FIXED LEFT SIDEBAR (Responsive logic added) */}
      <aside className={`w-64 bg-[#0B172A] border-r border-[#152540] fixed h-full flex flex-col z-50 shadow-2xl transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        <div className="p-8 border-b border-white/10 mb-6 hidden lg:block">
          <h1 className="text-2xl font-serif text-white">OJO Tours</h1>
          <p className="text-blue-200/50 uppercase tracking-widest text-[10px] font-bold mt-1">Command Center</p>
        </div>

        {/* Mobile Sidebar Header */}
        <div className="p-6 border-b border-white/10 mb-6 lg:hidden flex justify-between items-center">
          <span className="text-gold tracking-widest uppercase text-xs font-bold">Menu</span>
          <button onClick={() => setIsMobileMenuOpen(false)} className="text-white/50 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          <button
            onClick={() => { setActiveTab("bookings"); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === "bookings" ? "bg-white/10 text-white" : "text-blue-100/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard size={18} className={activeTab === "bookings" ? "text-gold" : ""} />
              Reservations
            </div>
            {pendingCount > 0 && <span className="flex h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>}
          </button>

          <button
            onClick={() => { setActiveTab("tours"); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === "tours" ? "bg-white/10 text-white" : "text-blue-100/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Map size={18} className={activeTab === "tours" ? "text-gold" : ""} /> Manage Tours
          </button>

          <button
            onClick={() => { setActiveTab("lodges"); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === "lodges" ? "bg-white/10 text-white" : "text-blue-100/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Home size={18} className={activeTab === "lodges" ? "text-gold" : ""} /> Manage Lodges
          </button>

          <button
            onClick={() => { setActiveTab("gallery"); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === "gallery" ? "bg-white/10 text-white" : "text-blue-100/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Camera size={18} className={activeTab === "gallery" ? "text-gold" : ""} /> Manage Gallery
          </button>

          {/* 🚀 NEW: Manage Team Button */}
          <button
            onClick={() => { setActiveTab("team"); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === "team" ? "bg-white/10 text-white" : "text-blue-100/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Users size={18} className={activeTab === "team" ? "text-gold" : ""} /> Manage Team
          </button>

          <button
            onClick={() => { setActiveTab("journal"); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === "journal" ? "bg-white/10 text-white" : "text-blue-100/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            <BookOpen size={18} className={activeTab === "journal" ? "text-gold" : ""} /> Manage Journal
          </button>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-blue-100/60 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-colors"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* 🚀 --- MAIN CONTENT AREA --- */}
      <main className="flex-1 w-full lg:ml-64 p-6 lg:p-12 mt-16 lg:mt-0 overflow-y-auto">

        {/* HEADER */}
        <header className="mb-8 lg:mb-10">
          <h2 className="text-2xl lg:text-3xl font-serif text-gray-900">
            {activeTab === "bookings" && "Overview & Pipeline"}
            {activeTab === "tours" && "Manage Expeditions"}
            {activeTab === "lodges" && "Manage Properties"}
            {activeTab === "gallery" && "Manage Photography"}
            {activeTab === "team" && "Manage Directorship"} {/* 🚀 NEW: Team Header */}
            {activeTab === "journal" && "Editorial Content"}
          </h2>
          <p className="text-gray-500 text-xs lg:text-sm mt-1">Welcome back. Here is what is happening today.</p>
        </header>

        {/* 🚀 --- BOOKINGS DASHBOARD --- */}
        {activeTab === "bookings" ? (
          <div className="w-full max-w-6xl">
            {/* FINANCIAL OVERVIEW CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8 lg:mb-12">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 relative overflow-hidden shadow-sm">
                <div className="absolute top-4 right-4 p-2 bg-gray-50 rounded-lg"><DollarSign size={24} className="text-gold" /></div>
                <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-2 font-bold">Total Confirmed Revenue</p>
                <h3 className="text-3xl lg:text-4xl font-serif text-gray-900">{formattedIncome}</h3>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-2xl p-6 relative overflow-hidden shadow-sm">
                <div className="absolute top-4 right-4 p-2 bg-gray-50 rounded-lg"><TrendingUp size={24} className="text-green-500" /></div>
                <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-2 font-bold">Confirmed Bookings</p>
                <h3 className="text-3xl lg:text-4xl font-serif text-gray-900">{confirmedBookings.length}</h3>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 relative overflow-hidden shadow-sm sm:col-span-2 lg:col-span-1">
                <div className="absolute top-4 right-4 p-2 bg-gray-50 rounded-lg"><Inbox size={24} className="text-yellow-500" /></div>
                <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-2 font-bold">Pending Requests</p>
                <h3 className="text-3xl lg:text-4xl font-serif text-gray-900">{pendingCount}</h3>
              </div>
            </div>

            {/* INTERACTIVE REVENUE CHART */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 lg:p-8 mb-8 lg:mb-12 shadow-sm overflow-x-auto">
              <div className="flex justify-between items-end mb-8 min-w-[500px]">
                <div>
                  <h3 className="text-xl font-serif text-gray-900 mb-1">Revenue Trajectory</h3>
                  <p className="text-gray-400 text-[10px] uppercase tracking-[0.2em] font-bold">Last 6 Months</p>
                </div>
                <div className="text-right">
                  <p className="text-green-500 text-sm font-bold">+24%</p>
                  <p className="text-gray-400 text-[9px] uppercase tracking-widest">vs previous period</p>
                </div>
              </div>

              <div className="flex items-end justify-between gap-2 sm:gap-6 h-48 lg:h-64 mt-8 min-w-[500px]">
                {chartData.map((data, index) => {
                  const heightPercentage = Math.max((data.revenue / maxRevenue) * 100, 2); 
                  const isCurrentMonth = data.month === "May";

                  return (
                    <div key={index} className="flex flex-col items-center w-full group relative h-full justify-end">
                      <div className="w-full relative h-full flex items-end justify-center rounded-t-xl bg-gray-50 overflow-hidden group-hover:bg-gray-100 transition-colors">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${heightPercentage}%` }}
                          transition={{ duration: 1.2, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }} 
                          className={`w-full relative rounded-t-xl transition-colors ${
                            isCurrentMonth ? "bg-gold" : "bg-gray-200 group-hover:bg-gray-300"
                          }`}
                        >
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg shadow-xl pointer-events-none whitespace-nowrap z-10">
                            ${data.revenue.toLocaleString()}
                          </div>
                        </motion.div>
                      </div>
                      <span className={`text-[10px] uppercase tracking-widest mt-4 font-bold transition-colors ${
                        isCurrentMonth ? "text-gold" : "text-gray-400"
                      }`}>
                        {data.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <h3 className="text-xl font-serif text-gray-900 mb-6">Pipeline ({bookings.length})</h3>
            
            {bookings.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-300 rounded-3xl p-8 lg:p-12 text-center text-gray-500">
                No bookings yet. Waiting for your first luxury client!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookings.map((booking) => (
                  <div key={booking.id} className="bg-white border border-gray-200 hover:border-gold/50 transition-colors rounded-2xl p-6 relative group shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="absolute top-6 right-6">
                        {booking.status === "Pending" && <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md text-[9px] uppercase tracking-widest font-bold"><Clock size={12}/> Pending</span>}
                        {booking.status === "Confirmed" && <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-md text-[9px] uppercase tracking-widest font-bold"><CheckCircle size={12}/> Confirmed</span>}
                        {booking.status === "Declined" && <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-md text-[9px] uppercase tracking-widest font-bold"><XCircle size={12}/> Declined</span>}
                      </div>
                      <span className="text-gray-400 text-[10px] uppercase tracking-[0.2em] block mb-1">{booking.itemType} Request</span>
                      <h4 className="font-serif text-lg leading-tight mb-4 text-gray-900 line-clamp-1 pr-20">{booking.itemName}</h4>
                      <div className="space-y-2 mb-6 border-y border-gray-100 py-4">
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Client:</span><span className="text-gray-900 font-medium truncate ml-4">{booking.customerName}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Email:</span><a href={`mailto:${booking.customerEmail}`} className="text-gray-900 font-medium hover:text-gold transition-colors truncate ml-4">{booking.customerEmail}</a></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Date:</span><span className="text-gray-900 font-medium">{booking.date}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Guests:</span><span className="text-gray-900 font-medium">{booking.guests}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Total:</span><span className="text-gray-900 font-bold">{booking.totalPrice}</span></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <div className="flex gap-2">
                        <form action={updateBookingStatus.bind(null, booking.id, "Confirmed")}><button type="submit" disabled={booking.status === "Confirmed"} className="p-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors disabled:opacity-30"><CheckCircle size={16} /></button></form>
                        <form action={updateBookingStatus.bind(null, booking.id, "Declined")}><button type="submit" disabled={booking.status === "Declined"} className="p-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-600 rounded-lg transition-colors disabled:opacity-30"><XCircle size={16} /></button></form>
                      </div>
                      <form action={deleteBooking.bind(null, booking.id)}><button type="submit" className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button></form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* --- THE OTHER TABS (Tours, Lodges, Gallery, Team, Journals) --- */
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 max-w-7xl">
            
            <div className="xl:col-span-1 bg-white border border-gray-200 shadow-sm rounded-3xl p-6 lg:p-8 h-fit order-first">
              
              {/* 1. TOUR FORM */}
              {activeTab === "tours" && (
                <>
                  <h3 className="text-xl font-serif text-gray-900 mb-6">Add Expedition</h3>
                  <form action={addTour} className="space-y-4">
                    <input required name="title" type="text" placeholder="Tour Title" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-gold outline-none" />
                    <div className="grid grid-cols-2 gap-4">
                      <input required name="location" type="text" placeholder="Location" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-gold outline-none" />
                      <input required name="duration" type="text" placeholder="Duration" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-gold outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input required name="price" type="text" placeholder="Price" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-gold outline-none" />
                      <select required name="category" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-gold outline-none">
                        <option value="Wildlife">Wildlife</option><option value="Safari">Safari</option><option value="Culture">Culture</option><option value="Relaxation">Relaxation</option>
                      </select>
                    </div>
                    <input required name="image" type="url" placeholder="Image URL" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-gold outline-none" />
                    <textarea required name="description" rows={4} placeholder="Description..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-gold outline-none resize-none" />
                    <button type="submit" className="w-full bg-gold hover:bg-[#F1D592] text-white font-bold py-3.5 rounded-xl text-xs tracking-widest uppercase mt-4 transition-colors">Publish Tour</button>
                  </form>
                </>
              )}

              {/* 2. LODGE FORM */}
              {activeTab === "lodges" && (
                <>
                  <h3 className="text-xl font-serif text-gray-900 mb-6">Add Luxury Lodge</h3>
                  <form action={addLodge} className="space-y-4">
                    <input required name="name" type="text" placeholder="Lodge Name" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-gold outline-none" />
                    <div className="grid grid-cols-2 gap-4">
                      <input required name="location" type="text" placeholder="Location" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-gold outline-none" />
                      <input required name="price" type="text" placeholder="Price / Night" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-gold outline-none" />
                    </div>
                    <input required name="amenities" type="text" placeholder="Amenities (Spa, Pool)" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-gold outline-none" />
                    <input required name="image" type="url" placeholder="Image URL" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-gold outline-none" />
                    <textarea required name="description" rows={4} placeholder="Description..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-gold outline-none resize-none" />
                    <button type="submit" className="w-full bg-gold hover:bg-[#F1D592] text-white font-bold py-3.5 rounded-xl text-xs tracking-widest uppercase mt-4 transition-colors">Publish Lodge</button>
                  </form>
                </>
              )}

              {/* 3. GALLERY FORM */}
              {activeTab === "gallery" && (
                <>
                  <h3 className="text-xl font-serif text-gray-900 mb-6">Add Gallery Image</h3>
                  <form action={addGalleryImage} className="space-y-4">
                    <input required name="title" type="text" placeholder="Image Title" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-gold outline-none" />
                    <select required name="category" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-gold outline-none">
                      <option value="Wildlife">Wildlife</option><option value="Nature">Nature</option><option value="Culture">Culture</option><option value="Hotels">Hotels</option><option value="Adventure">Adventure</option>
                    </select>
                    <input required name="image" type="url" placeholder="Image URL" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-gold outline-none" />
                    <select required name="className" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-gold outline-none">
                      <option value="md:col-span-1 md:row-span-1">Standard Square</option><option value="md:col-span-2 md:row-span-2">Large Featured</option><option value="md:col-span-1 md:row-span-2">Tall Portrait</option><option value="md:col-span-2 md:row-span-1">Wide Landscape</option>
                    </select>
                    <button type="submit" className="w-full bg-gold hover:bg-[#F1D592] text-white font-bold py-3.5 rounded-xl text-xs tracking-widest uppercase mt-4 transition-colors">Publish Image</button>
                  </form>
                </>
              )}

              {/* 🚀 NEW: 4. TEAM FORM */}
              {activeTab === "team" && (
                <>
                  <h3 className="text-xl font-serif text-gray-900 mb-6">Add Director/Staff</h3>
                  <form action={addTeamMember} className="space-y-4">
                    <input required name="name" type="text" placeholder="Full Name" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-gold outline-none" />
                    <input required name="role" type="text" placeholder="Role (e.g. Managing Director)" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-gold outline-none" />
                    <input required name="image" type="url" placeholder="Headshot URL (Unsplash/ImgBB)" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-gold outline-none" />
                    <textarea required name="bio" rows={4} placeholder="Brief Biography..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-gold outline-none resize-none" />
                    <button type="submit" className="w-full bg-gold hover:bg-[#F1D592] text-white font-bold py-3.5 rounded-xl text-xs tracking-widest uppercase mt-4 transition-colors">Add to Team</button>
                  </form>
                </>
              )}

              {/* 5. JOURNAL FORM */}
              {activeTab === "journal" && (
                <>
                  <h3 className="text-xl font-serif text-gray-900 mb-6">Draft Article</h3>
                  <form action={addJournal} className="space-y-4">
                    <input required name="title" type="text" placeholder="Article Title" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-gold outline-none" />
                    <div className="grid grid-cols-2 gap-4">
                      <input required name="category" type="text" placeholder="Category" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-gold outline-none" />
                      <input required name="readTime" type="text" placeholder="Read Time" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-gold outline-none" />
                    </div>
                    <input required name="author" type="text" placeholder="Author" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-gold outline-none" />
                    <input required name="image" type="url" placeholder="Image URL" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-gold outline-none" />
                    <textarea required name="excerpt" rows={4} placeholder="Excerpt..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-gold outline-none resize-none" />
                    <div className="flex items-center gap-3 pt-2 pl-1">
                      <input type="checkbox" name="featured" id="featured" className="w-4 h-4 text-gold rounded focus:ring-gold cursor-pointer" />
                      <label htmlFor="featured" className="text-gray-600 text-xs cursor-pointer font-medium">Set as Featured Article</label>
                    </div>
                    <button type="submit" className="w-full bg-gold hover:bg-[#F1D592] text-white font-bold py-3.5 rounded-xl text-xs tracking-widest uppercase mt-4 transition-colors">Publish Post</button>
                  </form>
                </>
              )}
            </div>

            <div className="xl:col-span-2">
              <h3 className="text-xl font-serif text-gray-900 mb-6 mt-8 xl:mt-0">Database Records</h3>
              
              {activeTab === "tours" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {tours.length === 0 ? <p className="text-gray-500 italic">No tours found.</p> : tours.map((tour) => (
                    <div key={tour.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex justify-between items-center group shadow-sm">
                      <div className="flex gap-4 items-center">
                        <img src={tour.image} className="w-14 h-14 rounded-lg object-cover" />
                        <div><span className="text-[9px] uppercase tracking-widest text-gray-400">{tour.category}</span><h4 className="font-serif text-sm">{tour.title}</h4><p className="text-gold text-[10px] uppercase font-bold">{tour.price}</p></div>
                      </div>
                      <form action={deleteTour.bind(null, tour.id)}><button type="submit" className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button></form>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "lodges" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {lodges.length === 0 ? <p className="text-gray-500 italic">No lodges found.</p> : lodges.map((lodge) => (
                    <div key={lodge.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex justify-between items-center shadow-sm">
                      <div className="flex gap-4 items-center">
                        <img src={lodge.image} className="w-14 h-14 rounded-lg object-cover" />
                        <div><span className="text-[9px] uppercase tracking-widest text-gray-400">{lodge.location}</span><h4 className="font-serif text-sm">{lodge.name}</h4><p className="text-gold text-[10px] uppercase font-bold">{lodge.price}</p></div>
                      </div>
                      <form action={deleteLodge.bind(null, lodge.id)}><button type="submit" className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button></form>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "gallery" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {gallery.length === 0 ? <p className="text-gray-500 italic">No gallery images found.</p> : gallery.map((img) => (
                    <div key={img.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex justify-between items-center shadow-sm">
                      <div className="flex gap-4 items-center"><img src={img.image} className="w-14 h-14 rounded-lg object-cover" /><div><span className="text-[9px] uppercase tracking-widest text-gray-400">{img.category}</span><h4 className="font-serif text-sm">{img.title}</h4></div></div>
                      <form action={deleteGalleryImage.bind(null, img.id)}><button type="submit" className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button></form>
                    </div>
                  ))}
                </div>
              )}

              {/* 🚀 NEW: TEAM VIEW */}
              {activeTab === "team" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {team.length === 0 ? <p className="text-gray-500 italic">No team members found.</p> : team.map((member) => (
                    <div key={member.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex justify-between items-center shadow-sm">
                      <div className="flex gap-4 items-center">
                        <img src={member.image} className="w-14 h-14 rounded-lg object-cover" />
                        <div><span className="text-[9px] uppercase tracking-widest text-gray-400">{member.role}</span><h4 className="font-serif text-sm">{member.name}</h4></div>
                      </div>
                      <form action={deleteTeamMember.bind(null, member.id)}><button type="submit" className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button></form>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "journal" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {journals.length === 0 ? <p className="text-gray-500 italic">No journals found.</p> : journals.map((post) => (
                    <div key={post.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex justify-between items-center group relative overflow-hidden shadow-sm">
                      {post.featured && <div className="absolute top-0 right-0 bg-gold text-white text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded-bl-lg z-10">Featured</div>}
                      <div className="flex gap-4 items-center"><img src={post.image} className="w-14 h-14 rounded-lg object-cover" /><div><span className="text-[9px] uppercase tracking-widest text-gray-400">{post.category}</span><h4 className="font-serif text-sm">{post.title}</h4><p className="text-gray-500 text-[10px] uppercase">By {post.author}</p></div></div>
                      <form action={deleteJournal.bind(null, post.id)}><button type="submit" className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button></form>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </main>
    </div>
  );
}