import {
  getBookingStats,
  getContentStats,
  getRevenueStats,
  getRecentBookings,
  getPopularItems,
} from "@/actions/reportActions";
import {
  CalendarIcon,
  DollarSign,
  TrendingUp,
  Users,
  FileText,
  Home,
  Camera,
  BookOpen,
  Map,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const [
    bookingStats,
    contentStats,
    revenueStats,
    recentBookings,
    popularItems,
  ] = await Promise.all([
    getBookingStats(),
    getContentStats(),
    getRevenueStats(),
    getRecentBookings(),
    getPopularItems(),
  ]);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Reports & Analytics
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Overview of your business performance and metrics
          </p>
        </div>
        <form action="/api/export-excel" method="GET">
          <Button
            type="submit"
            className="bg-linear-to-r from-[#d4af37] to-[#d3b673] hover:opacity-90 text-white cursor-pointer"
          >
            <Download className="mr-2 h-4 w-4" />
            Export to Excel
          </Button>
        </form>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Booking Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Bookings
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {bookingStats.total}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <CalendarIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-green-600 font-medium">
              {bookingStats.confirmed} confirmed
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-yellow-600 font-medium">
              {bookingStats.pending} pending
            </span>
          </div>
        </div>

        {/* Revenue Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ${revenueStats.totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-gray-500">
              From {revenueStats.confirmedBookingsCount} confirmed bookings
            </span>
          </div>
        </div>

        {/* Content Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Content</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {contentStats.tours +
                  contentStats.lodges +
                  contentStats.journals +
                  contentStats.gallery +
                  contentStats.team}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <FileText className="h-6 w-6 text-primary-gold" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-gray-500">Across all content types</span>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Confirmation Rate
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {bookingStats.total > 0
                  ? Math.round(
                      (bookingStats.confirmed / bookingStats.total) * 100,
                    )
                  : 0}
                %
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-gray-500">
              {bookingStats.declined} declined
            </span>
          </div>
        </div>
      </div>

      {/* Content Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Content Overview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <Map className="h-8 w-8 mx-auto text-blue-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {contentStats.tours}
            </p>
            <p className="text-sm text-gray-500">Expeditions</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <Home className="h-8 w-8 mx-auto text-green-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {contentStats.lodges}
            </p>
            <p className="text-sm text-gray-500">Properties</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <Camera className="h-8 w-8 mx-auto text-purple-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {contentStats.gallery}
            </p>
            <p className="text-sm text-gray-500">Gallery</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <BookOpen className="h-8 w-8 mx-auto text-pink-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {contentStats.journals}
            </p>
            <p className="text-sm text-gray-500">Articles</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <Users className="h-8 w-8 mx-auto text-orange-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {contentStats.team}
            </p>
            <p className="text-sm text-gray-500">Team</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Bookings
          </h2>
          {recentBookings.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent bookings</p>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {booking.customerName}
                    </p>
                    <p className="text-xs text-gray-500">{booking.itemName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {booking.totalPrice}
                    </p>
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full ${
                        booking.status === "Confirmed"
                          ? "bg-green-100 text-green-800"
                          : booking.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Popular Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Most Popular Items
          </h2>
          {popularItems.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No data available</p>
          ) : (
            <div className="space-y-3">
              {popularItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-yellow-700">
                        #{index + 1}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900 text-sm">
                      {item.name}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {item.count} bookings
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
