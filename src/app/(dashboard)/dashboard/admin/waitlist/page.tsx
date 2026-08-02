"use client";

import { useState, useEffect } from "react";
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
  Mail,
  Phone,
  Users,
  CheckCircle,
  XCircle,
  Search,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  getAllWaitlist,
  contactWaitlistEntry,
  bookFromWaitlist,
  removeFromWaitlist,
} from "@/actions/waitlistActions";

type WaitlistEntry = {
  id: string;
  itemId: string;
  itemType: string;
  userId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  preferredDate: Date;
  guests: number;
  status: string;
  contactedAt: Date | null;
  createdAt: Date;
};

export default function WaitlistManagementPage() {
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("preferredDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [itemTypeFilter, setItemTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<WaitlistEntry | null>(null);
  const [showBookModal, setShowBookModal] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchWaitlist = async () => {
      setLoading(true);
      try {
        const result = await getAllWaitlist({
          page,
          pageSize,
          status: statusFilter === "all" ? undefined : statusFilter,
          itemType: itemTypeFilter === "all" ? undefined : itemTypeFilter,
        });
        setWaitlistEntries(result.waitlistEntries);
        setTotal(result.total);
      } catch (error) {
        console.error("Failed to fetch waitlist:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWaitlist();
  }, [page, pageSize, statusFilter, itemTypeFilter]);

  const filteredAndSortedEntries = waitlistEntries
    .filter((entry) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          entry.customerName.toLowerCase().includes(query) ||
          entry.customerEmail.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      const aValue = a[sortBy as keyof WaitlistEntry];
      const bValue = b[sortBy as keyof WaitlistEntry];

      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;

      return sortOrder === "asc" ? comparison : -comparison;
    });

  const totalPages = Math.ceil(total / pageSize);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleContact = async (entryId: string) => {
    try {
      const result = await contactWaitlistEntry(entryId);
      if (result.success) {
        // Refresh waitlist
        const updated = await getAllWaitlist({
          page,
          pageSize,
          status: statusFilter === "all" ? undefined : statusFilter,
          itemType: itemTypeFilter === "all" ? undefined : itemTypeFilter,
        });
        setWaitlistEntries(updated.waitlistEntries);
      }
    } catch (error) {
      console.error("Failed to contact waitlist entry:", error);
    }
  };

  const handleBookFromWaitlist = async (bookingData: any) => {
    if (!selectedEntry) return;

    try {
      const result = await bookFromWaitlist(selectedEntry.id, bookingData);
      if (result.success) {
        setShowBookModal(false);
        setSelectedEntry(null);
        // Refresh waitlist
        const updated = await getAllWaitlist({
          page,
          pageSize,
          status: statusFilter === "all" ? undefined : statusFilter,
          itemType: itemTypeFilter === "all" ? undefined : itemTypeFilter,
        });
        setWaitlistEntries(updated.waitlistEntries);
      }
    } catch (error) {
      console.error("Failed to book from waitlist:", error);
    }
  };

  const handleRemove = async (entryId: string) => {
    if (confirm("Are you sure you want to remove this entry from the waitlist?")) {
      try {
        const result = await removeFromWaitlist(entryId);
        if (result.success) {
          // Refresh waitlist
          const updated = await getAllWaitlist({
            page,
            pageSize,
            status: statusFilter === "all" ? undefined : statusFilter,
            itemType: itemTypeFilter === "all" ? undefined : itemTypeFilter,
          });
          setWaitlistEntries(updated.waitlistEntries);
        }
      } catch (error) {
        console.error("Failed to remove from waitlist:", error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Contacted":
        return "bg-blue-100 text-blue-800";
      case "Booked":
        return "bg-green-100 text-green-800";
      case "Expired":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Waitlist Management
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Manage customer waitlist entries
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-800" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-black"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48 text-black">
              <SelectValue placeholder="Filter by status" className="text-black" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Contacted">Contacted</SelectItem>
              <SelectItem value="Booked">Booked</SelectItem>
              <SelectItem value="Expired">Expired</SelectItem>
            </SelectContent>
          </Select>
          <Select value={itemTypeFilter} onValueChange={setItemTypeFilter}>
            <SelectTrigger className="w-full sm:w-48 text-black">
              <SelectValue placeholder="Filter by type" className="text-black" />
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
            <p className="text-sm text-gray-500 mt-4">Loading waitlist...</p>
          </div>
        ) : filteredAndSortedEntries.length === 0 ? (
          <div className="text-center py-16">
            <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No waitlist entries found
            </h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort("customerName")}>
                    <div className="flex items-center gap-1">
                      Customer
                      {sortBy === "customerName" && (sortOrder === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort("preferredDate")}>
                    <div className="flex items-center gap-1">
                      Preferred Date
                      {sortBy === "preferredDate" && (sortOrder === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort("guests")}>
                    <div className="flex items-center gap-1">
                      Guests
                      {sortBy === "guests" && (sortOrder === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort("status")}>
                    <div className="flex items-center gap-1">
                      Status
                      {sortBy === "status" && (sortOrder === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAndSortedEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{entry.customerName}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          {entry.customerEmail}
                        </div>
                        {entry.customerPhone && (
                          <div className="text-xs text-gray-400 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {entry.customerPhone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatDate(entry.preferredDate)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {entry.guests}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {entry.status === "Pending" && (
                          <>
                            <Button size="sm" variant="ghost" onClick={() => handleContact(entry.id)} className="text-blue-600 hover:text-blue-700">
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => { setSelectedEntry(entry); setShowBookModal(true); }} className="text-green-600 hover:text-green-700">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => handleRemove(entry.id)} className="text-red-600 hover:text-red-700">
                          <XCircle className="h-4 w-4" />
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} entries
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <Button key={pageNum} variant={page === pageNum ? "default" : "outline"} size="sm" onClick={() => setPage(pageNum)}>
                  {pageNum}
                </Button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>
              Next
            </Button>
          </div>
        </div>
      )}

      {showBookModal && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Book from Waitlist</h3>
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p><strong>Customer:</strong> {selectedEntry.customerName}</p>
              <p><strong>Date:</strong> {formatDate(selectedEntry.preferredDate)}</p>
              <p><strong>Guests:</strong> {selectedEntry.guests}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Price
              </label>
              <Input type="number" id="bookingPrice" placeholder="Enter total price" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setShowBookModal(false); setSelectedEntry(null); }}>
                Cancel
              </Button>
              <Button onClick={() => {
                const price = (document.getElementById('bookingPrice') as HTMLInputElement)?.value;
                handleBookFromWaitlist({
                  totalPrice: parseFloat(price) || 0,
                  paymentType: "Full",
                });
              }}>
                Create Booking
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
