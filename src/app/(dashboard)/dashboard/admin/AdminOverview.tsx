"use client";

import React, { useMemo } from "react";
import { motion, type Variants } from "framer-motion";
import { updateBookingStatus, deleteBooking } from "@/actions/bookingActions";
import {
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Map,
  Home,
  Camera,
  Users,
  BookOpen,
  ArrowRight,
  Activity,
} from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminOverview({
  bookings,
  tours,
  journals,
  lodges,
  gallery,
  team,
}: {
  bookings: any[];
  tours: any[];
  journals: any[];
  lodges: any[];
  gallery: any[];
  team: any[];
}) {
  // --- FINANCIAL CALCULATIONS ---
  const parsePrice = (priceStr: string) => {
    if (!priceStr) return 0;
    const cleanStr = priceStr.toString().replace(/[^0-9.-]+/g, "");
    return parseFloat(cleanStr) || 0;
  };

  const confirmedBookings = bookings.filter((b) => b.status === "Confirmed");
  const pendingCount = bookings.filter((b) => b.status === "Pending").length;

  const totalIncome = confirmedBookings.reduce(
    (sum, booking) => sum + parsePrice(booking.totalPrice),
    0,
  );

  const formattedIncome = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(totalIncome);

  // --- CHART DATA ENGINE ---
  const chartData = useMemo(() => {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const revenueByMonth: Record<string, number> = {};

    confirmedBookings.forEach((booking) => {
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
        revenue: revenueByMonth[monthName] || 0,
      });
    }
    return finalData;
  }, [confirmedBookings]);

  const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 1000);

  // Quick action cards data
  const quickActions = [
    {
      title: "Expeditions",
      count: tours.length,
      href: "/dashboard/admin/expeditions",
      icon: Map,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Properties",
      count: lodges.length,
      href: "/dashboard/admin/lodges",
      icon: Home,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      title: "Gallery",
      count: gallery.length,
      href: "/dashboard/admin/gallery",
      icon: Camera,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Team",
      count: team.length,
      href: "/dashboard/admin/team",
      icon: Users,
      color: "from-orange-500 to-orange-600",
    },
    {
      title: "Editorial",
      count: journals.length,
      href: "/dashboard/admin/journals",
      icon: BookOpen,
      color: "from-pink-500 to-pink-600",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    },
  };

  const getStatusBadge = (status: string) => {
    if (status === "Pending") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-amber-100 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          PENDING
        </span>
      );
    }
    if (status === "Confirmed") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          CONFIRMED
        </span>
      );
    }
    if (status === "Declined") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-rose-100 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          DECLINED
        </span>
      );
    }
    return <span>{status}</span>;
  };

  return (
    <motion.div
      className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 min-w-0"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#d4af37] to-[#d4af37] flex items-center justify-center shadow-md">
            <Activity size={16} className="text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Dashboard Overview
          </h1>
        </div>
        <p className="text-sm text-gray-500 mt-1 ml-10">
          Welcome back! Here&apos;s what&apos;s happening with your business today.
        </p>
      </motion.div>

      {/* METRIC CARDS */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {/* Revenue Card */}
        <div className="bg-gradient-to-br from-[#ffbf96] to-[#fe7096] rounded-2xl p-6 relative overflow-hidden shadow-lg text-white hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute -bottom-8 -right-8 w-36 h-36 rounded-full border-[16px] border-white/10" />
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/5 -mt-8 -mr-8" />
          <div className="relative">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-semibold text-white/80 uppercase tracking-widest">
                Total Revenue
              </p>
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <TrendingUp size={18} className="text-white" />
              </div>
            </div>
            <p className="text-3xl font-extrabold tracking-tight">{formattedIncome}</p>
            <p className="text-xs text-white/70 mt-1 font-medium">From confirmed bookings</p>
          </div>
        </div>

        {/* Confirmed Card */}
        <div className="bg-gradient-to-br from-[#90caf9] to-[#047edf] rounded-2xl p-6 relative overflow-hidden shadow-lg text-white hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute -bottom-8 -right-8 w-36 h-36 rounded-full border-[16px] border-white/10" />
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/5 -mt-8 -mr-8" />
          <div className="relative">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-semibold text-white/80 uppercase tracking-widest">
                Confirmed
              </p>
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <CheckCircle size={18} className="text-white" />
              </div>
            </div>
            <p className="text-3xl font-extrabold tracking-tight">{confirmedBookings.length}</p>
            <p className="text-xs text-white/70 mt-1 font-medium">Active itineraries</p>
          </div>
        </div>

        {/* Pending Card */}
        <div className="bg-gradient-to-br from-[#84d9d2] to-[#07cdae] rounded-2xl p-6 relative overflow-hidden shadow-lg text-white hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute -bottom-8 -right-8 w-36 h-36 rounded-full border-[16px] border-white/10" />
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/5 -mt-8 -mr-8" />
          <div className="relative">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-semibold text-white/80 uppercase tracking-widest">
                Pending
              </p>
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Clock size={18} className="text-white" />
              </div>
            </div>
            <p className="text-3xl font-extrabold tracking-tight">{pendingCount}</p>
            <p className="text-xs text-white/70 mt-1 font-medium">Requires attention</p>
          </div>
        </div>
      </motion.div>

      {/* CHART + QUICK ACTIONS */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 xl:grid-cols-3 gap-6"
      >
        {/* Revenue Chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-gray-800">Revenue Analytics</h3>
              <p className="text-xs text-gray-400 mt-0.5">Last 6 months performance</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-gradient-to-t from-[#d4af37] to-[#d4af37]" />
                Current
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#edf0f5]" />
                Previous
              </span>
            </div>
          </div>
          <div className="flex items-end justify-between gap-3 h-52 overflow-x-auto pb-2">
            {chartData.map((data, index) => {
              const heightPercentage = Math.max(
                (data.revenue / maxRevenue) * 100,
                3,
              );
              const isCurrentMonth = index === chartData.length - 1;

              return (
                <div
                  key={index}
                  className="flex flex-col items-center min-w-[40px] flex-1 group relative h-full justify-end"
                >
                  <div className="w-full max-w-[48px] relative h-full flex items-end justify-center rounded-t overflow-hidden">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPercentage}%` }}
                      transition={{
                        duration: 1.5,
                        delay: index * 0.1,
                        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                      }}
                      className={`w-full rounded-t transition-colors duration-500 ${
                        isCurrentMonth
                          ? "bg-gradient-to-t from-[#d4af37] to-[#d4af37]"
                          : "bg-[#edf0f5] group-hover:bg-[#e0e4eb]"
                      }`}
                    >
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] font-bold py-1 px-2.5 rounded-lg shadow-lg pointer-events-none whitespace-nowrap z-10">
                        ${data.revenue.toLocaleString()}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                      </div>
                    </motion.div>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-3 font-bold uppercase tracking-wider">
                    {data.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Access */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 min-w-0">
          <h3 className="text-base font-bold text-gray-800 mb-5">Quick Access</h3>
          <div className="flex flex-col gap-1.5">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all group border border-transparent hover:border-gray-100"
                >
                  <div
                    className={`w-9 h-9 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm`}
                  >
                    <Icon size={17} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-800 truncate">{action.title}</p>
                    <p className="text-xs text-gray-400">{action.count} items</p>
                  </div>
                  <ArrowRight
                    size={15}
                    className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all shrink-0"
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* RECENT BOOKINGS TABLE */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-800">Recent Bookings</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Latest {Math.min(bookings.length, 10)} of {bookings.length} total bookings
            </p>
          </div>
          <Link
            href="/dashboard/admin/bookings"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9a55ff] hover:text-[#b66dff] transition-colors bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg"
          >
            View All
            <ArrowRight size={13} />
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <BookOpen size={24} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-semibold">No bookings found</p>
            <p className="text-gray-400 text-sm mt-1">Bookings will appear here once created.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/60 hover:bg-gray-50/60">
                  <TableHead className="px-6 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    Client
                  </TableHead>
                  <TableHead className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    Booking Subject
                  </TableHead>
                  <TableHead className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    Status
                  </TableHead>
                  <TableHead className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    Date
                  </TableHead>
                  <TableHead className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    Tracking ID
                  </TableHead>
                  <TableHead className="px-6 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.slice(0, 10).map((booking) => (
                  <TableRow
                    key={booking.id}
                    className="border-b border-gray-50 hover:bg-purple-50/30 transition-colors"
                  >
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#e9d5ff] to-[#c084fc] flex items-center justify-center text-[#7e22ce] font-bold text-sm shadow-sm shrink-0">
                          {booking.customerName?.charAt(0)?.toUpperCase() ?? "?"}
                        </div>
                        <span className="text-sm font-semibold text-gray-800 truncate max-w-[120px]">
                          {booking.customerName}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-4">
                      <span className="text-sm text-gray-600 font-medium truncate block max-w-[200px]">
                        {booking.itemName}
                      </span>
                    </TableCell>

                    <TableCell className="px-4 py-4">
                      {getStatusBadge(booking.status)}
                    </TableCell>

                    <TableCell className="px-4 py-4">
                      <span className="text-sm text-gray-500">{booking.date}</span>
                    </TableCell>

                    <TableCell className="px-4 py-4">
                      <span className="text-xs font-mono font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">
                        WD-{booking.id.toString().substring(0, 5)}
                      </span>
                    </TableCell>

                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <form
                          action={updateBookingStatus.bind(null, booking.id, "Confirmed")}
                        >
                          <button
                            type="submit"
                            disabled={booking.status === "Confirmed"}
                            title="Confirm booking"
                            className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg disabled:opacity-30 transition-colors"
                          >
                            <CheckCircle size={16} />
                          </button>
                        </form>
                        <form
                          action={updateBookingStatus.bind(null, booking.id, "Declined")}
                        >
                          <button
                            type="submit"
                            disabled={booking.status === "Declined"}
                            title="Decline booking"
                            className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg disabled:opacity-30 transition-colors"
                          >
                            <XCircle size={16} />
                          </button>
                        </form>
                        <form action={deleteBooking.bind(null, booking.id)}>
                          <button
                            type="submit"
                            title="Delete booking"
                            className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

