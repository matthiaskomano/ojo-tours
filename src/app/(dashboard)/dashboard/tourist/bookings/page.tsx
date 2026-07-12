"use client";

import { useState, useEffect } from "react";
import { getTouristBookings } from "@/actions/touristActions";
import { cancelTouristBooking } from "@/actions/touristActions";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Search,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Booking = {
  id: string;
  itemName: string;
  itemType: string;
  customerName: string;
  customerEmail: string;
  date: string;
  guests: string;
  totalPrice: string;
  status: string;
  createdAt: Date;
};

export default function TouristBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [itemTypeFilter, setItemTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const data = await getTouristBookings();
        setBookings(data);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const filteredAndSortedBookings = bookings
    .filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (itemTypeFilter !== "all" && b.itemType !== itemTypeFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          b.itemName.toLowerCase().includes(query) ||
          b.customerName.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      const aValue = a[sortBy as keyof Booking];
      const bValue = b[sortBy as keyof Booking];
      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleCancel = async (id: string) => {
    if (confirm("Are you sure you want to cancel this booking?")) {
      try {
        await cancelTouristBooking(id);
        const data = await getTouristBookings();
        setBookings(data);
      } catch (error) {
        console.error("Failed to cancel booking:", error);
        alert("Failed to cancel booking. Please try again.");
      }
    }
  };

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
    if (status === "Declined") {
      return (
        <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-rose-200">
          <XCircle className="w-3 h-3 mr-1" />
          Declined
        </Badge>
      );
    }
    if (status === "Cancelled") {
      return (
        <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200">
          Cancelled
        </Badge>
      );
    }
    return <Badge>{status}</Badge>;
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            My Bookings
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            View and manage your travel reservations
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                placeholder="Search by name or item..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Confirmed">Confirmed</SelectItem>
              <SelectItem value="Declined">Declined</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={itemTypeFilter} onValueChange={setItemTypeFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Tour">Tour</SelectItem>
              <SelectItem value="Lodge">Lodge</SelectItem>
              <SelectItem value="Custom Itinerary">Custom Itinerary</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="text-sm text-gray-500 mt-4">Loading bookings...</p>
          </div>
        ) : filteredAndSortedBookings.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No bookings found
            </h3>
            <p className="text-sm text-gray-500">
              Bookings will appear here when you make reservations
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("itemName")}
                  >
                    <div className="flex items-center gap-1">
                      Item
                      {sortBy === "itemName" &&
                        (sortOrder === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        ))}
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("date")}
                  >
                    <div className="flex items-center gap-1">
                      Date
                      {sortBy === "date" &&
                        (sortOrder === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        ))}
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("guests")}
                  >
                    <div className="flex items-center gap-1">
                      Guests
                      {sortBy === "guests" &&
                        (sortOrder === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        ))}
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("totalPrice")}
                  >
                    <div className="flex items-center gap-1">
                      Total
                      {sortBy === "totalPrice" &&
                        (sortOrder === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        ))}
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center gap-1">
                      Status
                      {sortBy === "status" &&
                        (sortOrder === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        ))}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAndSortedBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {booking.itemName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.itemType}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{booking.date}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{booking.guests}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {booking.totalPrice}
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(booking.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {booking.status === "Pending" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleCancel(booking.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
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
