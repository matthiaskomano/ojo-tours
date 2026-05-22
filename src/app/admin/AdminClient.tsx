"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion"; 
import { addTour, deleteTour } from "@/actions/tourActions";
import { addJournal, deleteJournal } from "@/actions/journalActions";
import { addLodge, deleteLodge } from "@/actions/lodgeActions"; 
import { updateBookingStatus, deleteBooking } from "@/actions/bookingActions"; 
import { addGalleryImage, deleteGalleryImage } from "@/actions/galleryActions";
import { addTeamMember, deleteTeamMember } from "@/actions/teamActions"; 
import { logoutUser } from "@/actions/authActions";
import { Trash2, LogOut, CheckCircle, XCircle, Clock, DollarSign, TrendingUp, Inbox, LayoutDashboard, Map, Home, BookOpen, Menu, X, Camera, Users } from "lucide-react"; 

export default function AdminClient({ 
  tours, 
  journals,
  lodges,
  bookings,
  gallery,
  team 
}: { 
  tours: any[]; 
  journals: any[];
  lodges: any[];
  bookings: any[];
  gallery: any[];
  team: any[]; 
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"bookings" | "tours" | "journal" | "lodges" | "gallery" | "team">("bookings");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logoutUser();
    router.push("/login");
  };

  // --- FINANCIAL CALCULATIONS ---
  const parsePrice = (priceStr: string) => {
    if (!priceStr) return 0;
    const cleanStr = priceStr.toString().replace(/[^0-9.-]+/g, ""); 
    return parseFloat(cleanStr) || 0;
  };

  const confirmedBookings = bookings.filter((b) => b.status === "Confirmed");
  const pendingCount = bookings.filter((b) => b.status === "Pending").length;
  
  const totalIncome = confirmedBookings.reduce((sum, booking) => sum + parsePrice(booking.totalPrice), 0);

  const formattedIncome = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(totalIncome);

  // --- CHART DATA ENGINE ---
  const chartData = useMemo(() => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const revenueByMonth: Record<string, number> = {};
    
    confirmedBookings.forEach(booking => {
      const date = new Date(booking.created_at || booking.date || Date.now());
      const monthStr = monthNames[date.getMonth()];
      if (!revenueByMonth[monthStr]) revenueByMonth[monthStr] = 0;
      revenueByMonth[monthStr] += parsePrice(booking.totalPrice);
    });

    const currentMonthIndex = new Date().getMonth();
    const finalData = [];
    
    for (let i = 5; i >= 0; i--) {
      let targetMonthIndex = currentMonthIndex - i;
      if (targetMonthIndex < 0) targetMonthIndex += 12;
      const monthName = monthNames[targetMonthIndex];
      finalData.push({
        month: monthName,
        revenue: revenueByMonth[monthName] || 0 
      });
    }
    return finalData;
  }, [confirmedBookings]);
  
  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1000);

  // Reusable Input Style for Light PurpleAdmin Theme
  const inputStyle = "w-full bg-white border border-gray-200 rounded-md px-4 py-3 text-sm text-gray-800 focus:border-[#b66dff] focus:ring-1 focus:ring-[#b66dff] outline-none transition-all placeholder-gray-400 shadow-sm";
  const labelStyle = "block text-[13px] font-semibold text-gray-600 mb-1.5";

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex flex-col lg:flex-row text-gray-800 font-sans selection:bg-[#da8cff] selection:text-white">
      
      {/* 🚀 MOBILE TOP BAR */}
      <div className="lg:hidden bg-[#1a1f2c] border-b border-white/10 p-4 flex justify-between items-center fixed top-0 w-full z-40 shadow-lg">
        <div className="flex items-center gap-3">
          <img src="/ojo-logo.png" alt="Logo" className="w-9 h-9 rounded-full object-cover border border-white/20" />
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-white hover:text-gray-300 transition-colors">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* 🚀 FIXED DARK SIDEBAR */}
      <aside className={`w-64 bg-[#1a1f2c] border-r border-white/5 fixed h-full flex flex-col z-50 transition-transform duration-300 ease-out shadow-2xl ${
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>

        <div className="px-6 py-8 flex items-center gap-4 mb-4 mt-4">
          <img src="/ojo-logo.png" alt="User" className="w-12 h-12 rounded-full object-cover border-2 border-[#b66dff] shadow-md" />
          <div>
            <p className="text-sm font-bold text-white tracking-wide">Admin User</p>
            <p className="text-[11px] text-[#b66dff] font-medium tracking-wider uppercase mt-0.5">Project Manager</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {[
            { id: "bookings", icon: LayoutDashboard, label: "Dashboard", alert: pendingCount > 0 },
            { id: "tours", icon: Map, label: "Expeditions" },
            { id: "lodges", icon: Home, label: "Properties" },
            { id: "gallery", icon: Camera, label: "Gallery" },
            { id: "team", icon: Users, label: "Team Members" },
            { id: "journal", icon: BookOpen, label: "Editorial" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id as any); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === item.id 
                  ? "text-white bg-gradient-to-r from-[#da8cff]/20 to-[#9a55ff]/20 border border-[#b66dff]/30 shadow-sm" 
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-4">
                <item.icon size={18} className={activeTab === item.id ? "text-[#b66dff]" : "text-gray-500"} />
                {item.label}
              </div>
              {item.alert && <span className="flex h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>}
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut size={18} className="text-gray-500" /> Sign Out
          </button>
        </div>
      </aside>

      {/* 🚀 --- MAIN CONTENT AREA --- */}
      <main className="flex-1 w-full lg:ml-64 p-6 lg:p-10 mt-16 lg:mt-0 overflow-y-auto">
        
        {/* HEADER */}
        <header className="mb-10 flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-[#da8cff] to-[#9a55ff] p-2.5 rounded-lg shadow-md">
              <Home size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
                {activeTab === "bookings" && "Dashboard"}
                {activeTab === "tours" && "Manage Expeditions"}
                {activeTab === "lodges" && "Manage Properties"}
                {activeTab === "gallery" && "Manage Photography"}
                {activeTab === "team" && "Manage Directorship"}
                {activeTab === "journal" && "Editorial Content"}
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-wider">Overview & Stats</p>
            </div>
          </div>
        </header>

        {/* 🚀 --- DASHBOARD VIEW --- */}
        {activeTab === "bookings" ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
            
            {/* COLORFUL GRADIENT METRIC CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              
              {/* Pink Card - Revenue */}
              <div className="bg-gradient-to-br from-[#ffbf96] to-[#fe7096] rounded-xl p-8 relative overflow-hidden shadow-lg text-white transform hover:-translate-y-1 transition-transform duration-300">
                <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full border-[20px] border-white/10"></div>
                <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-white/5 -mt-10 -mr-10"></div>
                <div className="flex justify-between items-start mb-6">
                  <h4 className="text-lg font-medium tracking-wide">Total Revenue</h4>
                  <TrendingUp size={28} className="text-white/90" />
                </div>
                <h3 className="text-4xl font-bold mb-2 tracking-tight">{formattedIncome}</h3>
                <p className="text-sm text-white/80 font-medium">Confirmed transactions</p>
              </div>
              
              {/* Blue Card - Confirmed */}
              <div className="bg-gradient-to-br from-[#90caf9] to-[#047edf] rounded-xl p-8 relative overflow-hidden shadow-lg text-white transform hover:-translate-y-1 transition-transform duration-300">
                <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full border-[20px] border-white/10"></div>
                <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-white/5 -mt-10 -mr-10"></div>
                <div className="flex justify-between items-start mb-6">
                  <h4 className="text-lg font-medium tracking-wide">Confirmed Bookings</h4>
                  <CheckCircle size={28} className="text-white/90" />
                </div>
                <h3 className="text-4xl font-bold mb-2 tracking-tight">{confirmedBookings.length}</h3>
                <p className="text-sm text-white/80 font-medium">Active itineraries</p>
              </div>

              {/* Teal Card - Pending */}
              <div className="bg-gradient-to-br from-[#84d9d2] to-[#07cdae] rounded-xl p-8 relative overflow-hidden shadow-lg text-white transform hover:-translate-y-1 transition-transform duration-300">
                <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full border-[20px] border-white/10"></div>
                <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-white/5 -mt-10 -mr-10"></div>
                <div className="flex justify-between items-start mb-6">
                  <h4 className="text-lg font-medium tracking-wide">Pending Requests</h4>
                  <Clock size={28} className="text-white/90" />
                </div>
                <h3 className="text-4xl font-bold mb-2 tracking-tight">{pendingCount}</h3>
                <p className="text-sm text-white/80 font-medium">Requires attention</p>
              </div>
            </div>

            {/* CHART SECTION */}
            <div className="bg-white rounded-xl p-8 mb-8 shadow-sm border border-gray-100 overflow-x-auto relative">
              <h3 className="text-xl font-bold text-gray-800 mb-8">Visit And Sales Statistics</h3>
              
              <div className="flex items-end justify-between gap-6 h-72 min-w-[500px] pb-4">
                {chartData.map((data, index) => {
                  const heightPercentage = Math.max((data.revenue / maxRevenue) * 100, 2); 
                  const isCurrentMonth = index === chartData.length - 1;

                  return (
                    <div key={index} className="flex flex-col items-center w-full group relative h-full justify-end">
                      <div className="w-8 sm:w-12 relative h-full flex items-end justify-center rounded-t bg-transparent overflow-hidden">
                        <motion.div
                          initial={{ height: 0 }} animate={{ height: `${heightPercentage}%` }}
                          transition={{ duration: 1.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }} 
                          className={`w-full relative rounded-t transition-colors duration-500 ${
                            isCurrentMonth ? "bg-gradient-to-t from-[#da8cff] to-[#9a55ff]" : "bg-[#edf0f5] group-hover:bg-[#e0e4eb]"
                          }`}
                        >
                          <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs font-bold py-1.5 px-3 rounded shadow-lg pointer-events-none whitespace-nowrap z-10">
                            ${data.revenue.toLocaleString()}
                          </div>
                        </motion.div>
                      </div>
                      <span className="text-xs text-gray-400 mt-4 font-bold uppercase tracking-wider">
                        {data.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PIPELINE / RECENT TICKETS STYLE */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 overflow-hidden">
              <h3 className="text-xl font-bold text-gray-800 mb-8">Recent Requests</h3>
              
              {bookings.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                   <p className="text-gray-500 font-medium">No recent bookings found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="border-b-2 border-gray-100">
                        <th className="py-4 px-2 text-sm font-bold text-gray-500 uppercase tracking-wider">Assignee / Client</th>
                        <th className="py-4 px-2 text-sm font-bold text-gray-500 uppercase tracking-wider">Subject</th>
                        <th className="py-4 px-2 text-sm font-bold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="py-4 px-2 text-sm font-bold text-gray-500 uppercase tracking-wider">Last Update</th>
                        <th className="py-4 px-2 text-sm font-bold text-gray-500 uppercase tracking-wider">Tracking ID</th>
                        <th className="py-4 px-2 text-sm font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="border-b border-gray-50 hover:bg-[#f8f9fa] transition-colors">
                          <td className="py-5 px-2 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center text-[#b66dff] font-bold text-sm shadow-inner">
                              {booking.customerName.charAt(0)}
                            </div>
                            <span className="text-sm font-bold text-gray-800">{booking.customerName}</span>
                          </td>
                          <td className="py-5 px-2 text-sm font-medium text-gray-600 truncate max-w-[200px]">{booking.itemName}</td>
                          <td className="py-5 px-2">
                            {booking.status === "Pending" && <span className="px-3.5 py-1.5 rounded text-[10px] font-bold text-white bg-gradient-to-r from-[#ffd86b] to-[#ffb347] shadow-sm">PROGRESS</span>}
                            {booking.status === "Confirmed" && <span className="px-3.5 py-1.5 rounded text-[10px] font-bold text-white bg-gradient-to-r from-[#84d9d2] to-[#07cdae] shadow-sm">DONE</span>}
                            {booking.status === "Declined" && <span className="px-3.5 py-1.5 rounded text-[10px] font-bold text-white bg-gradient-to-r from-[#ffbf96] to-[#fe7096] shadow-sm">REJECTED</span>}
                          </td>
                          <td className="py-5 px-2 text-sm font-medium text-gray-500">{booking.date}</td>
                          <td className="py-5 px-2 text-sm font-bold text-gray-400">WD-{booking.id.toString().substring(0,5)}</td>
                          <td className="py-5 px-2 text-right flex justify-end gap-2">
                             <form action={updateBookingStatus.bind(null, booking.id, "Confirmed")}><button type="submit" disabled={booking.status === "Confirmed"} className="p-2 text-green-500 hover:bg-green-50 rounded disabled:opacity-30 transition-colors"><CheckCircle size={18} /></button></form>
                             <form action={updateBookingStatus.bind(null, booking.id, "Declined")}><button type="submit" disabled={booking.status === "Declined"} className="p-2 text-yellow-500 hover:bg-yellow-50 rounded disabled:opacity-30 transition-colors"><XCircle size={18} /></button></form>
                             <form action={deleteBooking.bind(null, booking.id)}><button type="submit" className="p-2 text-red-400 hover:bg-red-50 rounded transition-colors"><Trash2 size={18} /></button></form>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          
          /* --- THE OTHER TABS (Tours, Lodges, Gallery, Team, Journals) --- */
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* INPUT FORMS SIDE */}
            <div className="xl:col-span-1 bg-white shadow-sm border border-gray-100 rounded-xl p-8 h-fit order-first">
              
              {activeTab === "tours" && (
                <>
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Add Expedition</h3>
                  <form action={addTour} className="space-y-5">
                    <div><label className={labelStyle}>Tour Title</label><input required name="title" type="text" className={inputStyle} /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className={labelStyle}>Location</label><input required name="location" type="text" className={inputStyle} /></div>
                      <div><label className={labelStyle}>Duration</label><input required name="duration" type="text" className={inputStyle} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className={labelStyle}>Price</label><input required name="price" type="text" className={inputStyle} /></div>
                      <div><label className={labelStyle}>Category</label>
                        <select required name="category" className={inputStyle}>
                          <option value="Wildlife">Wildlife</option><option value="Safari">Safari</option><option value="Culture">Culture</option><option value="Relaxation">Relaxation</option>
                        </select>
                      </div>
                    </div>
                    <div><label className={labelStyle}>Image URL</label><input required name="image" type="url" className={inputStyle} /></div>
                    <div><label className={labelStyle}>Description</label><textarea required name="description" rows={4} className={`${inputStyle} resize-none`} /></div>
                    <button type="submit" className="w-full bg-gradient-to-r from-[#da8cff] to-[#9a55ff] hover:opacity-90 text-white font-bold tracking-wide py-3.5 rounded-lg mt-6 transition-all shadow-md shadow-purple-200">Publish Tour</button>
                  </form>
                </>
              )}

              {activeTab === "lodges" && (
                <>
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Add Luxury Lodge</h3>
                  <form action={addLodge} className="space-y-5">
                    <div><label className={labelStyle}>Lodge Name</label><input required name="name" type="text" className={inputStyle} /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className={labelStyle}>Location</label><input required name="location" type="text" className={inputStyle} /></div>
                      <div><label className={labelStyle}>Price / Night</label><input required name="price" type="text" className={inputStyle} /></div>
                    </div>
                    <div><label className={labelStyle}>Amenities</label><input required name="amenities" type="text" className={inputStyle} /></div>
                    <div><label className={labelStyle}>Image URL</label><input required name="image" type="url" className={inputStyle} /></div>
                    <div><label className={labelStyle}>Description</label><textarea required name="description" rows={4} className={`${inputStyle} resize-none`} /></div>
                    <button type="submit" className="w-full bg-gradient-to-r from-[#da8cff] to-[#9a55ff] hover:opacity-90 text-white font-bold tracking-wide py-3.5 rounded-lg mt-6 transition-all shadow-md shadow-purple-200">Publish Lodge</button>
                  </form>
                </>
              )}

              {activeTab === "gallery" && (
                <>
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Add Gallery Image</h3>
                  <form action={addGalleryImage} className="space-y-5">
                    <div><label className={labelStyle}>Image Title</label><input required name="title" type="text" className={inputStyle} /></div>
                    <div><label className={labelStyle}>Category</label>
                      <select required name="category" className={inputStyle}>
                        <option value="Wildlife">Wildlife</option><option value="Nature">Nature</option><option value="Culture">Culture</option><option value="Hotels">Hotels</option><option value="Adventure">Adventure</option>
                      </select>
                    </div>
                    <div><label className={labelStyle}>Image URL</label><input required name="image" type="url" className={inputStyle} /></div>
                    <div><label className={labelStyle}>Layout Size</label>
                      <select required name="className" className={inputStyle}>
                        <option value="md:col-span-1 md:row-span-1">Standard Square</option><option value="md:col-span-2 md:row-span-2">Large Featured</option><option value="md:col-span-1 md:row-span-2">Tall Portrait</option><option value="md:col-span-2 md:row-span-1">Wide Landscape</option>
                      </select>
                    </div>
                    <button type="submit" className="w-full bg-gradient-to-r from-[#da8cff] to-[#9a55ff] hover:opacity-90 text-white font-bold tracking-wide py-3.5 rounded-lg mt-6 transition-all shadow-md shadow-purple-200">Publish Image</button>
                  </form>
                </>
              )}

              {activeTab === "team" && (
                <>
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Add Team Member</h3>
                  <form action={addTeamMember} className="space-y-5">
                    <div><label className={labelStyle}>Full Name</label><input required name="name" type="text" className={inputStyle} /></div>
                    <div><label className={labelStyle}>Role</label><input required name="role" type="text" className={inputStyle} /></div>
                    <div><label className={labelStyle}>Headshot URL</label><input required name="image" type="url" className={inputStyle} /></div>
                    <div><label className={labelStyle}>Biography</label><textarea required name="bio" rows={4} className={`${inputStyle} resize-none`} /></div>
                    <button type="submit" className="w-full bg-gradient-to-r from-[#da8cff] to-[#9a55ff] hover:opacity-90 text-white font-bold tracking-wide py-3.5 rounded-lg mt-6 transition-all shadow-md shadow-purple-200">Add Member</button>
                  </form>
                </>
              )}

              {activeTab === "journal" && (
                <>
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Draft Article</h3>
                  <form action={addJournal} className="space-y-5">
                    <div><label className={labelStyle}>Title</label><input required name="title" type="text" className={inputStyle} /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className={labelStyle}>Category</label><input required name="category" type="text" className={inputStyle} /></div>
                      <div><label className={labelStyle}>Read Time</label><input required name="readTime" type="text" className={inputStyle} /></div>
                    </div>
                    <div><label className={labelStyle}>Author</label><input required name="author" type="text" className={inputStyle} /></div>
                    <div><label className={labelStyle}>Image URL</label><input required name="image" type="url" className={inputStyle} /></div>
                    <div><label className={labelStyle}>Excerpt</label><textarea required name="excerpt" rows={4} className={`${inputStyle} resize-none`} /></div>
                    <div className="flex items-center gap-3 pt-2">
                      <input type="checkbox" name="featured" id="featured" className="w-5 h-5 text-[#b66dff] border-gray-300 rounded focus:ring-[#b66dff]" />
                      <label htmlFor="featured" className="text-sm font-medium text-gray-700">Set as Featured Article</label>
                    </div>
                    <button type="submit" className="w-full bg-gradient-to-r from-[#da8cff] to-[#9a55ff] hover:opacity-90 text-white font-bold tracking-wide py-3.5 rounded-lg mt-6 transition-all shadow-md shadow-purple-200">Publish Post</button>
                  </form>
                </>
              )}
            </div>

            {/* DATABASE RECORDS SIDE */}
            <div className="xl:col-span-2">
              <h3 className="text-xl font-bold text-gray-800 mb-6 mt-8 xl:mt-0">Database Records</h3>
              
              {activeTab === "tours" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {tours.length === 0 ? <p className="text-gray-500 text-sm">No tours found.</p> : tours.map((tour) => (
                    <div key={tour.id} className="bg-white border border-gray-100 rounded-xl p-5 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex gap-4 items-center">
                        <img src={tour.image} className="w-14 h-14 rounded-lg object-cover" />
                        <div>
                          <h4 className="font-bold text-sm text-gray-800">{tour.title}</h4>
                          <p className="text-[#b66dff] text-xs font-bold mt-1 tracking-wide">{tour.price}</p>
                        </div>
                      </div>
                      <form action={deleteTour.bind(null, tour.id)}><button type="submit" className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button></form>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "lodges" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {lodges.length === 0 ? <p className="text-gray-500 text-sm">No lodges found.</p> : lodges.map((lodge) => (
                    <div key={lodge.id} className="bg-white border border-gray-100 rounded-xl p-5 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex gap-4 items-center">
                        <img src={lodge.image} className="w-14 h-14 rounded-lg object-cover" />
                        <div>
                          <h4 className="font-bold text-sm text-gray-800">{lodge.name}</h4>
                          <p className="text-[#b66dff] text-xs font-bold mt-1 tracking-wide">{lodge.price}</p>
                        </div>
                      </div>
                      <form action={deleteLodge.bind(null, lodge.id)}><button type="submit" className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button></form>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "gallery" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {gallery.length === 0 ? <p className="text-gray-500 text-sm">No gallery images found.</p> : gallery.map((img) => (
                    <div key={img.id} className="bg-white border border-gray-100 rounded-xl p-5 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex gap-4 items-center">
                        <img src={img.image} className="w-14 h-14 rounded-lg object-cover" />
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{img.category}</span>
                          <h4 className="font-bold text-sm text-gray-800 mt-0.5">{img.title}</h4>
                        </div>
                      </div>
                      <form action={deleteGalleryImage.bind(null, img.id)}><button type="submit" className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button></form>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "team" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {team.length === 0 ? <p className="text-gray-500 text-sm">No team members found.</p> : team.map((member) => (
                    <div key={member.id} className="bg-white border border-gray-100 rounded-xl p-5 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex gap-4 items-center">
                        <img src={member.image} className="w-14 h-14 rounded-full object-cover shadow-sm" />
                        <div>
                          <h4 className="font-bold text-sm text-gray-800">{member.name}</h4>
                          <span className="text-xs font-medium text-gray-500 mt-0.5 block">{member.role}</span>
                        </div>
                      </div>
                      <form action={deleteTeamMember.bind(null, member.id)}><button type="submit" className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button></form>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "journal" && (
                <div className="grid grid-cols-1 gap-5">
                  {journals.length === 0 ? <p className="text-gray-500 text-sm">No journals found.</p> : journals.map((post) => (
                    <div key={post.id} className="bg-white border border-gray-100 rounded-xl p-6 flex justify-between items-center relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      {post.featured && <div className="absolute top-0 right-0 bg-gradient-to-r from-[#da8cff] to-[#9a55ff] text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-bl-xl z-10">Featured</div>}
                      <div className="flex gap-5 items-center">
                        <img src={post.image} className="w-20 h-20 rounded-lg object-cover shadow-sm" />
                        <div>
                          <span className="text-[10px] font-bold text-[#b66dff] uppercase tracking-wider">{post.category}</span>
                          <h4 className="font-bold text-lg text-gray-800 mt-1 mb-1">{post.title}</h4>
                          <span className="text-xs font-medium text-gray-500">By {post.author}</span>
                        </div>
                      </div>
                      <form action={deleteJournal.bind(null, post.id)}><button type="submit" className="p-3 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={18} /></button></form>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </motion.div>
        )}
      </main>
    </div>
  );
}