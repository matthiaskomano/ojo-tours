"use client";

import React, { useMemo } from "react";
import { motion, type Variants } from "framer-motion";
import {
  Clock,
  TrendingUp,
  Map,
  Home,
  Camera,
  Users,
  BookOpen,
  ArrowRight,
  Activity,
  Eye,
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

export default function StaffOverview({
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

  // Quick action cards data (view-only for staff)
  const quickActions = [
    {
      title: "Expeditions",
      count: tours.length,
      href: "/dashboard/staff/expeditions",
      icon: Map,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Properties",
      count: lodges.length,
      href: "/dashboard/staff/lodges",
      icon: Home,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      title: "Gallery",
      count: gallery.length,
      href: "/dashboard/staff/gallery",
      icon: Camera,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Team",
      count: team.length,
      href: "/dashboard/staff/team",
      icon: Users,
      color: "from-orange-500 to-orange-600",
    },
    {
      title: "Editorial",
      count: journals.length,
      href: "/dashboard/staff/journals",
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
      transition: {
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
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
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#d4af37] to-[#d4af37] flex items-center justify-center shadow-md">
            <Activity size={16} className="text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Staff Dashboard
          </h1>
        </div>
        <p className="text-sm text-gray-500 mt-1 ml-10">
          Welcome back! View bookings and content at a glance.
        </p>
      </motion.div>

      {/* METRIC CARDS */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {/* Revenue Card */}
        <div className="bg-linear-to-br from-[#ffbf96] to-[#fe7096] rounded-2xl p-6 relative overflow-hidden shadow-lg text-white hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute -bottom-8 -right-8 w-36 h-36 rounded-full border-16 border-white/10" />
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
            <p className="text-3xl font-extrabold tracking-tight">
              {formattedIncome}
            </p>
            <p className="text-xs text-white/70 mt-1 font-medium">
              From confirmed bookings
            </p>
          </div>
        </div>

        {/* Confirmed Card */}
        <div className="bg-linear-to-br from-[#90caf9] to-[#047edf] rounded-2xl p-6 relative overflow-hidden shadow-lg text-white hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute -bottom-8 -right-8 w-36 h-36 rounded-full border-16 border-white/10" />
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/5 -mt-8 -mr-8" />
          <div className="relative">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-semibold text-white/80 uppercase tracking-widest">
                Confirmed
              </p>
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Clock size={18} className="text-white" />
              </div>
            </div>
            <p className="text-3xl font-extrabold tracking-tight">
              {confirmedBookings.length}
            </p>
            <p className="text-xs text-white/70 mt-1 font-medium">
              Active itineraries
            </p>
          </div>
        </div>

        {/* Pending Card */}
        <div className="bg-linear-to-br from-[#ffcc80] to-[#ff9800] rounded-2xl p-6 relative overflow-hidden shadow-lg text-white hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute -bottom-8 -right-8 w-36 h-36 rounded-full border-16 border-white/10" />
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
            <p className="text-3xl font-extrabold tracking-tight">
              {pendingCount}
            </p>
            <p className="text-xs text-white/70 mt-1 font-medium">
              Awaiting approval
            </p>
          </div>
        </div>
      </motion.div>

      {/* QUICK ACTIONS */}
      <motion.div variants={itemVariants}>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick View</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group relative bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-gray-200"
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl bg-linear-to-br ${action.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}
                >
                  <action.icon size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {action.count}
                  </p>
                  <p className="text-xs font-medium text-gray-500">
                    {action.title}
                  </p>
                </div>
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight size={14} className="text-gray-400" />
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* REVENUE CHART */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Revenue Overview
        </h3>
        <div className="h-48 flex items-end gap-2">
          {chartData.map((item, index) => {
            const height =
              maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <div
                  className="w-full bg-gray-100 rounded-t-lg relative overflow-hidden"
                  style={{ height: "100%" }}
                >
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-blue-500 to-blue-400 rounded-t-lg"
                  />
                </div>
                <span className="text-xs font-medium text-gray-500">
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* RECENT BOOKINGS */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Bookings
            </h3>
            <Link
              href="/dashboard/staff/bookings"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Guests</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.slice(0, 5).map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">
                    {booking.customerName}
                  </TableCell>
                  <TableCell>{booking.itemName}</TableCell>
                  <TableCell>
                    {new Date(booking.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{booking.guests}</TableCell>
                  <TableCell>{booking.totalPrice}</TableCell>
                  <TableCell>{getStatusBadge(booking.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      {/* READ-ONLY NOTICE */}
      <motion.div
        variants={itemVariants}
        className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3"
      >
        <Eye size={20} className="text-amber-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-900">
            Read-Only Access
          </p>
          <p className="text-xs text-amber-700 mt-1">
            As a staff member, you have view-only access to content and
            bookings. Contact an administrator for any changes.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
