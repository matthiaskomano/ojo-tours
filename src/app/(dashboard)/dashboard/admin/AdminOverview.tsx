"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { updateBookingStatus, deleteBooking } from "@/actions/bookingActions";
import {
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Map,
  Home,
  Camera,
  Users,
  BookOpen,
} from "lucide-react";
import Link from "next/link";

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Welcome back! Here's what's happening with your business.
        </p>
      </header>

      {/* COLORFUL GRADIENT METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pink Card - Revenue */}
        <div className="bg-linear-to-br from-[#ffbf96] to-[#fe7096] rounded-xl p-8 relative overflow-hidden shadow-lg text-white transform hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full border-20 border-white/10"></div>
          <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-white/5 -mt-10 -mr-10"></div>
          <div className="flex justify-between items-start mb-6">
            <h4 className="text-lg font-medium tracking-wide">Total Revenue</h4>
            <TrendingUp size={28} className="text-white/90" />
          </div>
          <h3 className="text-4xl font-bold mb-2 tracking-tight">
            {formattedIncome}
          </h3>
          <p className="text-sm text-white/80 font-medium">
            Confirmed transactions
          </p>
        </div>

        {/* Blue Card - Confirmed */}
        <div className="bg-linear-to-br from-[#90caf9] to-[#047edf] rounded-xl p-8 relative overflow-hidden shadow-lg text-white transform hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full border-20 border-white/10"></div>
          <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-white/5 -mt-10 -mr-10"></div>
          <div className="flex justify-between items-start mb-6">
            <h4 className="text-lg font-medium tracking-wide">
              Confirmed Bookings
            </h4>
            <CheckCircle size={28} className="text-white/90" />
          </div>
          <h3 className="text-4xl font-bold mb-2 tracking-tight">
            {confirmedBookings.length}
          </h3>
          <p className="text-sm text-white/80 font-medium">
            Active itineraries
          </p>
        </div>

        {/* Teal Card - Pending */}
        <div className="bg-linear-to-br from-[#84d9d2] to-[#07cdae] rounded-xl p-8 relative overflow-hidden shadow-lg text-white transform hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full border-20 border-white/10"></div>
          <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-white/5 -mt-10 -mr-10"></div>
          <div className="flex justify-between items-start mb-6">
            <h4 className="text-lg font-medium tracking-wide">
              Pending Requests
            </h4>
            <Clock size={28} className="text-white/90" />
          </div>
          <h3 className="text-4xl font-bold mb-2 tracking-tight">
            {pendingCount}
          </h3>
          <p className="text-sm text-white/80 font-medium">
            Requires attention
          </p>
        </div>
      </div>

      {/* CHART SECTION */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 overflow-x-auto relative">
        <h3 className="text-xl font-bold text-gray-800 mb-8">
          Revenue Analytics
        </h3>

        <div className="flex items-end justify-between gap-6 h-72 min-w-[500px] pb-4">
          {chartData.map((data, index) => {
            const heightPercentage = Math.max(
              (data.revenue / maxRevenue) * 100,
              2,
            );
            const isCurrentMonth = index === chartData.length - 1;

            return (
              <div
                key={index}
                className="flex flex-col items-center w-full group relative h-full justify-end"
              >
                <div className="w-8 sm:w-12 relative h-full flex items-end justify-center rounded-t bg-transparent overflow-hidden">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercentage}%` }}
                    transition={{
                      duration: 1.5,
                      delay: index * 0.1,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className={`w-full relative rounded-t transition-colors duration-500 ${
                      isCurrentMonth
                        ? "bg-linear-to-t from-[#da8cff] to-[#9a55ff]"
                        : "bg-[#edf0f5] group-hover:bg-[#e0e4eb]"
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

      {/* QUICK ACTIONS */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                href={action.href}
                className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group"
              >
                <div
                  className={`w-12 h-12 rounded-lg bg-linear-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <Icon size={24} className="text-white" />
                </div>
                <h4 className="font-bold text-gray-800 mb-1">{action.title}</h4>
                <p className="text-sm text-gray-500">{action.count} items</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* RECENT BOOKINGS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 overflow-hidden">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-bold text-gray-800">Recent Bookings</h3>
          <Link
            href="/dashboard/admin/bookings"
            className="text-sm text-[#b66dff] hover:text-[#9a55ff] font-medium"
          >
            View All →
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <p className="text-gray-500 font-medium">
              No recent bookings found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b-2 border-gray-100">
                  <th className="py-4 px-2 text-sm font-bold text-gray-500 uppercase tracking-wider">
                    Assignee / Client
                  </th>
                  <th className="py-4 px-2 text-sm font-bold text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="py-4 px-2 text-sm font-bold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-4 px-2 text-sm font-bold text-gray-500 uppercase tracking-wider">
                    Last Update
                  </th>
                  <th className="py-4 px-2 text-sm font-bold text-gray-500 uppercase tracking-wider">
                    Tracking ID
                  </th>
                  <th className="py-4 px-2 text-sm font-bold text-gray-500 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 10).map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b border-gray-50 hover:bg-[#f8f9fa] transition-colors"
                  >
                    <td className="py-5 px-2 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-linear-to_br from-purple-100 to-purple-200 flex items-center justify-center text-[#b66dff] font-bold text-sm shadow-inner">
                        {booking.customerName.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-gray-800">
                        {booking.customerName}
                      </span>
                    </td>
                    <td className="py-5 px-2 text-sm font-medium text-gray-600 truncate max-w-[200px]">
                      {booking.itemName}
                    </td>
                    <td className="py-5 px-2">
                      {booking.status === "Pending" && (
                        <span className="px-3.5 py-1.5 rounded text-[10px] font-bold text-white bg-linear-to-r from-[#ffd86b] to-[#ffb347] shadow-sm">
                          PROGRESS
                        </span>
                      )}
                      {booking.status === "Confirmed" && (
                        <span className="px-3.5 py-1.5 rounded text-[10px] font-bold text-white bg-linear-to-r from-[#84d9d2] to-[#07cdae] shadow-sm">
                          DONE
                        </span>
                      )}
                      {booking.status === "Declined" && (
                        <span className="px-3.5 py-1.5 rounded text-[10px] font-bold text-white bg-linear-to-r from-[#ffbf96] to-[#fe7096] shadow-sm">
                          REJECTED
                        </span>
                      )}
                    </td>
                    <td className="py-5 px-2 text-sm font-medium text-gray-500">
                      {booking.date}
                    </td>
                    <td className="py-5 px-2 text-sm font-bold text-gray-400">
                      WD-{booking.id.toString().substring(0, 5)}
                    </td>
                    <td className="py-5 px-2 text-right flex justify-end gap-2">
                      <form
                        action={updateBookingStatus.bind(
                          null,
                          booking.id,
                          "Confirmed",
                        )}
                      >
                        <button
                          type="submit"
                          disabled={booking.status === "Confirmed"}
                          className="p-2 text-green-500 hover:bg-green-50 rounded disabled:opacity-30 transition-colors"
                        >
                          <CheckCircle size={18} />
                        </button>
                      </form>
                      <form
                        action={updateBookingStatus.bind(
                          null,
                          booking.id,
                          "Declined",
                        )}
                      >
                        <button
                          type="submit"
                          disabled={booking.status === "Declined"}
                          className="p-2 text-yellow-500 hover:bg-yellow-50 rounded disabled:opacity-30 transition-colors"
                        >
                          <XCircle size={18} />
                        </button>
                      </form>
                      <form action={deleteBooking.bind(null, booking.id)}>
                        <button
                          type="submit"
                          className="p-2 text-red-400 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
