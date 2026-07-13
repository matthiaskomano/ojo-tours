"use client";

import { useState, useEffect, useMemo } from "react";
import { getBookings } from "@/actions/bookingActions";
import { updateBookingStatus } from "@/actions/bookingActions";
import { deleteBooking } from "@/actions/bookingActions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Eye,
  Search,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

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

export default function BookingsPage() {
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [itemTypeFilter, setItemTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all bookings once on load
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const bookings = await getBookings();
        setAllBookings(bookings);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // Client-side filtering, sorting, and pagination
  const filteredAndSortedBookings = useMemo(() => {
    let result = [...allBookings];

    // Apply filters
    if (statusFilter !== "all") {
      result = result.filter((b) => b.status === statusFilter);
    }
    if (itemTypeFilter !== "all") {
      result = result.filter((b) => b.itemType === itemTypeFilter);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.customerName.toLowerCase().includes(query) ||
          b.customerEmail.toLowerCase().includes(query) ||
          b.itemName.toLowerCase().includes(query),
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      const aValue = a[sortBy as keyof Booking];
      const bValue = b[sortBy as keyof Booking];

      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [
    allBookings,
    statusFilter,
    itemTypeFilter,
    searchQuery,
    sortBy,
    sortOrder,
  ]);

  // Apply pagination
  const paginatedBookings = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredAndSortedBookings.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedBookings, page, pageSize]);

  const total = filteredAndSortedBookings.length;
  const totalPages = Math.ceil(total / pageSize);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, itemTypeFilter, searchQuery, sortBy, sortOrder]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await updateBookingStatus(id, newStatus);
      // Refresh bookings from server
      const bookings = await getBookings();
      setAllBookings(bookings);
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this booking?")) {
      try {
        await deleteBooking(id);
        // Refresh bookings from server
        const bookings = await getBookings();
        setAllBookings(bookings);
      } catch (error) {
        console.error("Failed to delete booking:", error);
      }
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Bookings
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Manage customer bookings and reservations
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-800" />
              <Input
                placeholder="Search by name, email, or item..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-black"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48 text-black">
              <SelectValue
                placeholder="Filter by status"
                className="text-black"
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Confirmed">Confirmed</SelectItem>
              <SelectItem value="Declined">Declined</SelectItem>
            </SelectContent>
          </Select>
          <Select value={itemTypeFilter} onValueChange={setItemTypeFilter}>
            <SelectTrigger className="w-full sm:w-48 text-black">
              <SelectValue
                placeholder="Filter by type"
                className="text-black"
              />
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
        ) : paginatedBookings.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No bookings found
            </h3>
            <p className="text-sm text-gray-500">
              Bookings will appear here when customers make reservations
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("customerName")}
                  >
                    <div className="flex items-center gap-1">
                      Customer
                      {sortBy === "customerName" &&
                        (sortOrder === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        ))}
                    </div>
                  </th>
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
                {paginatedBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {booking.customerName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.customerEmail}
                        </div>
                      </div>
                    </td>
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
                      <div className="text-sm text-gray-600">
                        {booking.date}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {booking.guests}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {booking.totalPrice}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {booking.status === "Pending" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </span>
                      )}
                      {booking.status === "Confirmed" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Confirmed
                        </span>
                      )}
                      {booking.status === "Declined" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <XCircle className="h-3 w-3 mr-1" />
                          Declined
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/dashboard/admin/bookings/${booking.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 text-black"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={booking.status === "Confirmed"}
                          className="text-green-500 hover:text-green-700 hover:bg-green-50 disabled:opacity-30"
                          onClick={() =>
                            handleStatusUpdate(booking.id, "Confirmed")
                          }
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={booking.status === "Declined"}
                          className="text-yellow-500 hover:text-yellow-700 hover:bg-yellow-50 disabled:opacity-30 cursor-pointer"
                          onClick={() =>
                            handleStatusUpdate(booking.id, "Declined")
                          }
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(booking.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4">
          <div className="text-sm text-gray-800">
            Showing {(page - 1) * pageSize + 1} to{" "}
            {Math.min(page * pageSize, total)} of {total} bookings
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={`${pageSize}`}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-20 h-8 text-black">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="text-black cursor-pointer"
              >
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="text-black cursor-pointer"
              >
                Previous
              </Button>
              <span className="text-sm text-black cursor-pointer px-2">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="text-black cursor-pointer"
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="text-black cursor-pointer"
              >
                Last
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
