"use client";

import { useState, useEffect, useMemo } from "react";
import { getBookings } from "@/actions/bookingActions";
import { updateBookingStatus } from "@/actions/bookingActions";
import { cancelBooking } from "@/actions/cancellationActions";
import { getCancellationPolicy } from "@/actions/cancellationActions";
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
  Eye,
  Search,
  ChevronUp,
  ChevronDown,
  Ban,
} from "lucide-react";

type Booking = {
  id: string;
  itemId: string;
  itemName: string;
  itemType: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  date: Date;
  guests: number;
  totalPrice: number;
  status: string;
  paymentType: string;
  currency: string;
  createdAt: Date;
  confirmationSent: boolean;
  confirmedAt?: Date;
};

export default function StaffBookingsPage() {
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [itemTypeFilter, setItemTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationPolicy, setCancellationPolicy] = useState<any>(null);

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

  const filteredAndSortedBookings = useMemo(() => {
    let result = [...allBookings];

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

  const paginatedBookings = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredAndSortedBookings.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedBookings, page, pageSize]);

  const total = filteredAndSortedBookings.length;
  const totalPages = Math.ceil(total / pageSize);

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
      const bookings = await getBookings();
      setAllBookings(bookings);
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleCancelClick = async (booking: Booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
    const policy = await getCancellationPolicy(booking.id);
    setCancellationPolicy(policy);
  };

  const handleCancelBooking = async (reason: string) => {
    if (!selectedBooking) return;

    try {
      await cancelBooking(selectedBooking.id, reason);
      setShowCancelModal(false);
      setSelectedBooking(null);
      setCancellationPolicy(null);

      const bookings = await getBookings();
      setAllBookings(bookings);
    } catch (error) {
      console.error("Failed to cancel booking:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Declined":
        return "bg-red-100 text-red-800";
      case "Cancelled":
        return "bg-gray-100 text-gray-800";
      case "Waitlisted":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Bookings
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            View and manage customer bookings
          </p>
        </div>
      </div>

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
              <SelectItem value="Cancelled">Cancelled</SelectItem>
              <SelectItem value="Waitlisted">Waitlisted</SelectItem>
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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
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
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatDate(booking.date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {booking.guests}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      ${booking.totalPrice.toFixed(2)} {booking.currency}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/admin/bookings/${booking.id}`}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        {booking.status === "Pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleStatusUpdate(booking.id, "Confirmed")
                              }
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleStatusUpdate(booking.id, "Declined")
                              }
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {booking.status === "Confirmed" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCancelClick(booking)}
                            className="text-orange-600 hover:text-orange-700"
                          >
                            <Ban className="h-4 w-4" />
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {(page - 1) * pageSize + 1} to{" "}
            {Math.min(page * pageSize, total)} of {total} bookings
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                ),
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Cancel Booking</h3>

            {cancellationPolicy && (
              <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Refund Policy:</strong>{" "}
                  {cancellationPolicy.policyMessage}
                </p>
                <p className="text-sm text-yellow-800 mt-2">
                  <strong>Refund Amount:</strong> $
                  {cancellationPolicy.refundAmount?.toFixed(2)}{" "}
                  {selectedBooking.currency}
                </p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cancellation Reason
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-md p-2"
                rows={3}
                placeholder="Enter reason for cancellation..."
                id="cancelReason"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedBooking(null);
                  setCancellationPolicy(null);
                }}
              >
                Back
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  const reason =
                    (
                      document.getElementById(
                        "cancelReason",
                      ) as HTMLTextAreaElement
                    )?.value || "";
                  handleCancelBooking(reason);
                }}
              >
                Cancel Booking
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
