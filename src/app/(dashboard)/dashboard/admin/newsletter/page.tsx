"use client";

import { useState, useEffect, useMemo } from "react";
import {
  getNewsletterSubscribers,
  unsubscribeSubscriber,
  deleteSubscriber,
  exportSubscribers,
} from "@/actions/newsletterActions";
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
  Trash2,
  Download,
  Search,
  ChevronUp,
  ChevronDown,
  Mail,
  User,
} from "lucide-react";

type Subscriber = {
  id: string;
  email: string;
  fullName: string | null;
  status: string;
  subscribedAt: Date;
  unsubscribedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export default function NewsletterPage() {
  const [allSubscribers, setAllSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("subscribedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [exporting, setExporting] = useState(false);

  // Fetch all subscribers once on load
  useEffect(() => {
    const fetchSubscribers = async () => {
      setLoading(true);
      try {
        const subscribers = await getNewsletterSubscribers();
        setAllSubscribers(subscribers);
      } catch (error) {
        console.error("Failed to fetch subscribers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscribers();
  }, []);

  // Client-side filtering, sorting, and pagination
  const filteredAndSortedSubscribers = useMemo(() => {
    let result = [...allSubscribers];

    // Apply filters
    if (statusFilter !== "all") {
      result = result.filter((s) => s.status === statusFilter);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.email.toLowerCase().includes(query) ||
          (s.fullName && s.fullName.toLowerCase().includes(query)),
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      const aValue = a[sortBy as keyof Subscriber];
      const bValue = b[sortBy as keyof Subscriber];

      // Handle null/undefined values
      if (aValue == null && bValue == null) comparison = 0;
      else if (aValue == null) comparison = -1;
      else if (bValue == null) comparison = 1;
      else if (aValue < bValue) comparison = -1;
      else if (aValue > bValue) comparison = 1;

      return sortOrder === "asc" ? comparison : -comparison;
    });

    // Apply pagination
    const startIndex = (page - 1) * pageSize;
    return result.slice(startIndex, startIndex + pageSize);
  }, [
    allSubscribers,
    statusFilter,
    searchQuery,
    sortBy,
    sortOrder,
    page,
    pageSize,
  ]);

  const totalPages = Math.ceil(
    allSubscribers.filter(
      (s) =>
        (statusFilter === "all" || s.status === statusFilter) &&
        (searchQuery === "" ||
          s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (s.fullName &&
            s.fullName.toLowerCase().includes(searchQuery.toLowerCase()))),
    ).length / pageSize,
  );

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleUnsubscribe = async (id: string) => {
    if (!confirm("Are you sure you want to unsubscribe this user?")) {
      return;
    }
    try {
      await unsubscribeSubscriber(id);
      // Refresh subscribers
      const subscribers = await getNewsletterSubscribers();
      setAllSubscribers(subscribers);
    } catch (error) {
      console.error("Failed to unsubscribe:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subscriber?")) {
      return;
    }
    try {
      await deleteSubscriber(id);
      // Refresh subscribers
      const subscribers = await getNewsletterSubscribers();
      setAllSubscribers(subscribers);
    } catch (error) {
      console.error("Failed to delete subscriber:", error);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const result = await exportSubscribers();
      if (result.success && result.data) {
        // Convert to CSV
        const headers = Object.keys(result.data[0]).join(",");
        const rows = result.data.map((row: any) =>
          Object.values(row).join(","),
        );
        const csv = [headers, ...rows].join("\n");

        // Create download link
        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `newsletter_subscribers_${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Failed to export subscribers:", error);
    } finally {
      setExporting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "Active") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </span>
      );
    }
    if (status === "Unsubscribed") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Unsubscribed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Newsletter Subscribers
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Manage newsletter subscriptions and export data
          </p>
        </div>
        <Button
          onClick={handleExport}
          disabled={exporting || allSubscribers.length === 0}
          className="cursor-pointer bg-[#d4af37] hover:bg-[#c4a030]"
        >
          <Download className="w-4 h-4 mr-2" />
          {exporting ? "Exporting..." : "Export CSV"}
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                placeholder="Search by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4af37] text-black focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("all")}
              className={
                statusFilter === "all"
                  ? "bg-[#d4af37] hover:bg-[#c4a030]"
                  : "text-black"
              }
            >
              All
            </Button>
            <Button
              variant={statusFilter === "Active" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("Active")}
              className={
                statusFilter === "Active"
                  ? "bg-[#d4af37] hover:bg-[#c4a030]"
                  : "text-black"
              }
            >
              Active
            </Button>
            <Button
              variant={statusFilter === "Unsubscribed" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("Unsubscribed")}
              className={
                statusFilter === "Unsubscribed"
                  ? "bg-[#d4af37] hover:bg-[#c4a030]"
                  : "text-black"
              }
            >
              Unsubscribed
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="text-sm text-gray-500 mt-4">Loading subscribers...</p>
          </div>
        ) : filteredAndSortedSubscribers.length === 0 ? (
          <div className="text-center py-16">
            <Mail className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No subscribers found
            </h3>
            <p className="text-sm text-gray-500">
              Your newsletter subscribers will appear here
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("subscribedAt")}
                  >
                    <div className="flex items-center gap-1">
                      Subscribed
                      {sortBy === "subscribedAt" &&
                        (sortOrder === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        ))}
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("email")}
                  >
                    <div className="flex items-center gap-1">
                      Email
                      {sortBy === "email" &&
                        (sortOrder === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        ))}
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("fullName")}
                  >
                    <div className="flex items-center gap-1">
                      Name
                      {sortBy === "fullName" &&
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
                {filteredAndSortedSubscribers.map((subscriber) => (
                  <tr
                    key={subscriber.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div className="text-sm text-gray-600">
                          {new Date(
                            subscriber.subscribedAt,
                          ).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <div className="text-sm text-gray-600">
                          {subscriber.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {subscriber.fullName ? (
                          <>
                            <User className="h-4 w-4 text-gray-400" />
                            <div className="text-sm text-gray-600">
                              {subscriber.fullName}
                            </div>
                          </>
                        ) : (
                          <span className="text-sm text-gray-400">N/A</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(subscriber.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {subscriber.status === "Active" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnsubscribe(subscriber.id)}
                            className="cursor-pointer text-orange-600 hover:text-orange-700"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(subscriber.id)}
                          className="cursor-pointer text-red-600 hover:text-red-700"
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
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="cursor-pointer"
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="cursor-pointer"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
