"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Map,
  Heart,
  Bell,
  CreditCardIcon,
  TrendingUp,
  CheckCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TouristOverview({
  bookings,
  wishlistCount,
  unreadNotifications,
}: {
  bookings: any[];
  wishlistCount: number;
  unreadNotifications: number;
}) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    },
  };

  // Calculate stats
  const confirmedBookings = bookings.filter((b) => b.status === "Confirmed");
  const pendingBookings = bookings.filter((b) => b.status === "Pending");
  const totalBookings = bookings.length;

  const parsePrice = (priceStr: string) => {
    if (!priceStr) return 0;
    const cleanStr = priceStr.toString().replace(/[^0-9.-]+/g, "");
    return parseFloat(cleanStr) || 0;
  };

  const totalSpent = confirmedBookings.reduce(
    (sum, booking) => sum + parsePrice(booking.totalPrice),
    0,
  );

  const formattedSpent = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(totalSpent);

  // Quick actions
  const quickActions = [
    {
      title: "My Bookings",
      count: totalBookings,
      href: "/dashboard/tourist/bookings",
      icon: Calendar,
      color: "from-blue-500 to-blue-600",
      description: "View all reservations",
    },
    {
      title: "My Trips",
      count: confirmedBookings.length,
      href: "/dashboard/tourist/trips",
      icon: Map,
      color: "from-emerald-500 to-emerald-600",
      description: "Upcoming adventures",
    },
    {
      title: "Wishlist",
      count: wishlistCount,
      href: "/dashboard/tourist/wishlist",
      icon: Heart,
      color: "from-purple-500 to-purple-600",
      description: "Saved experiences",
    },
  ];

  const getStatusBadge = (status: string) => {
    if (status === "Pending") {
      return (
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
    }
    if (status === "Confirmed") {
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Confirmed
        </Badge>
      );
    }
    if (status === "Cancelled") {
      return (
        <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-rose-200">
          Cancelled
        </Badge>
      );
    }
    return <Badge>{status}</Badge>;
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
            <TrendingUp size={16} className="text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Welcome Back
          </h1>
        </div>
        <p className="text-sm text-gray-500 mt-1 ml-10">
          Here's an overview of your travel adventures.
        </p>
      </motion.div>

      {/* METRIC CARDS */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {/* Total Bookings Card */}
        <div className="bg-gradient-to-br from-[#90caf9] to-[#047edf] rounded-2xl p-6 relative overflow-hidden shadow-lg text-white hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute -bottom-8 -right-8 w-36 h-36 rounded-full border-[16px] border-white/10" />
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/5 -mt-8 -mr-8" />
          <div className="relative">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-semibold text-white/80 uppercase tracking-widest">
                Total Bookings
              </p>
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Calendar size={18} className="text-white" />
              </div>
            </div>
            <p className="text-3xl font-extrabold tracking-tight">{totalBookings}</p>
            <p className="text-xs text-white/70 mt-1 font-medium">All reservations</p>
          </div>
        </div>

        {/* Confirmed Trips Card */}
        <div className="bg-gradient-to-br from-[#84d9d2] to-[#07cdae] rounded-2xl p-6 relative overflow-hidden shadow-lg text-white hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute -bottom-8 -right-8 w-36 h-36 rounded-full border-[16px] border-white/10" />
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/5 -mt-8 -mr-8" />
          <div className="relative">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-semibold text-white/80 uppercase tracking-widest">
                Confirmed Trips
              </p>
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <CheckCircle size={18} className="text-white" />
              </div>
            </div>
            <p className="text-3xl font-extrabold tracking-tight">{confirmedBookings.length}</p>
            <p className="text-xs text-white/70 mt-1 font-medium">Upcoming adventures</p>
          </div>
        </div>

        {/* Total Spent Card */}
        <div className="bg-gradient-to-br from-[#ffbf96] to-[#fe7096] rounded-2xl p-6 relative overflow-hidden shadow-lg text-white hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute -bottom-8 -right-8 w-36 h-36 rounded-full border-[16px] border-white/10" />
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/5 -mt-8 -mr-8" />
          <div className="relative">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-semibold text-white/80 uppercase tracking-widest">
                Total Spent
              </p>
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <CreditCardIcon size={18} className="text-white" />
              </div>
            </div>
            <p className="text-3xl font-extrabold tracking-tight">{formattedSpent}</p>
            <p className="text-xs text-white/70 mt-1 font-medium">On confirmed trips</p>
          </div>
        </div>
      </motion.div>

      {/* QUICK ACTIONS */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.title} href={action.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-gray-100">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center shadow-sm`}
                    >
                      <Icon size={18} className="text-white" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">
                      {action.count}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-base">{action.title}</CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {action.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </motion.div>

      {/* NOTIFICATIONS & PENDING BOOKINGS */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Notifications Card */}
        <Card className="border-gray-100">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Notifications</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Stay updated on your bookings
                </CardDescription>
              </div>
              {unreadNotifications > 0 && (
                <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">
                  {unreadNotifications} unread
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/tourist/notifications">
              <div className="flex items-center justify-center py-4 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                View all notifications
                <ArrowRight size={14} className="ml-2" />
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* Pending Bookings Card */}
        <Card className="border-gray-100">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Pending Bookings</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  {pendingBookings.length} awaiting confirmation
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {pendingBookings.length === 0 ? (
              <div className="flex items-center justify-center py-4 text-sm text-gray-500">
                No pending bookings
              </div>
            ) : (
              <div className="space-y-3">
                {pendingBookings.slice(0, 3).map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {booking.itemName}
                      </p>
                      <p className="text-xs text-gray-500">{booking.date}</p>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                ))}
                {pendingBookings.length > 3 && (
                  <Link href="/dashboard/tourist/bookings">
                    <div className="flex items-center justify-center py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                      View all pending bookings
                      <ArrowRight size={14} className="ml-2" />
                    </div>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* RECENT BOOKINGS */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-800">Recent Bookings</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Latest {Math.min(bookings.length, 5)} of {bookings.length} total bookings
            </p>
          </div>
          <Link href="/dashboard/tourist/bookings">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9a55ff] hover:text-[#b66dff] transition-colors bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg cursor-pointer">
              View All
              <ArrowRight size={13} />
            </div>
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Calendar size={24} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-semibold">No bookings found</p>
            <p className="text-gray-400 text-sm mt-1">
              Start exploring and book your first adventure!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {bookings.slice(0, 5).map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#e9d5ff] to-[#c084fc] flex items-center justify-center text-[#7e22ce] font-bold text-sm shadow-sm shrink-0">
                    {booking.itemType === "Tour" ? "T" : "L"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {booking.itemName}
                    </p>
                    <p className="text-xs text-gray-500">{booking.date}</p>
                  </div>
                </div>
                {getStatusBadge(booking.status)}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
