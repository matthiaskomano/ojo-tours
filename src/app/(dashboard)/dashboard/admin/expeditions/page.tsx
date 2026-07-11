"use client";

import { useState, useEffect, useMemo } from "react";
import { getTours } from "@/actions/tourActions";
import { deleteTour } from "@/actions/tourActions";
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
  Plus,
  MapPin as MapIcon,
  Clock,
  DollarSign,
  Edit,
  Trash2,
  Eye,
  Search,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

type Tour = {
  id: string;
  title: string;
  location: string;
  duration: string;
  price: string;
  rating: number;
  category: string;
  image: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
};

export default function ExpeditionsPage() {
  const [allTours, setAllTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all tours once on load
  useEffect(() => {
    const fetchTours = async () => {
      setLoading(true);
      try {
        const tours = await getTours();
        setAllTours(tours);
      } catch (error) {
        console.error("Failed to fetch tours:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTours();
  }, []);

  // Client-side filtering, sorting, and pagination
  const filteredAndSortedTours = useMemo(() => {
    let result = [...allTours];

    // Apply filters
    if (categoryFilter !== "all") {
      result = result.filter((t) => t.category === categoryFilter);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.location.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query),
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      const aValue = a[sortBy as keyof Tour];
      const bValue = b[sortBy as keyof Tour];

      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [allTours, categoryFilter, searchQuery, sortBy, sortOrder]);

  // Apply pagination
  const paginatedTours = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredAndSortedTours.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedTours, page, pageSize]);

  const total = filteredAndSortedTours.length;
  const totalPages = Math.ceil(total / pageSize);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [categoryFilter, searchQuery, sortBy, sortOrder]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this expedition?")) {
      try {
        await deleteTour(id);
        // Refresh tours from server
        const tours = await getTours();
        setAllTours(tours);
      } catch (error) {
        console.error("Failed to delete tour:", error);
      }
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Expeditions
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Manage your tour expeditions and safari packages
          </p>
        </div>
        <Link href="/dashboard/admin/expeditions/new">
          <Button className="bg-linear-to-r from-[#d4af37] to-[#f1d592] hover:opacity-90 text-white">
            <Plus className="mr-2 h-4 w-4" />
            New Expedition
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-800" />
              <Input
                placeholder="Search by title, location, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-black"
              />
            </div>
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48 text-black">
              <SelectValue
                placeholder="Filter by category"
                className="text-black"
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Wildlife">Wildlife</SelectItem>
              <SelectItem value="Safari">Safari</SelectItem>
              <SelectItem value="Culture">Culture</SelectItem>
              <SelectItem value="Relaxation">Relaxation</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="text-sm text-gray-500 mt-4">Loading expeditions...</p>
          </div>
        ) : paginatedTours.length === 0 ? (
          <div className="text-center py-16">
            <MapIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No expeditions found
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Get started by creating your first expedition
            </p>
            <Link href="/dashboard/admin/expeditions/new">
              <Button className="bg-linear-to-r from-[#d4af37] to-[#f1d592] hover:opacity-90 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Create Expedition
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("title")}
                  >
                    <div className="flex items-center gap-1">
                      Expedition
                      {sortBy === "title" &&
                        (sortOrder === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        ))}
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("location")}
                  >
                    <div className="flex items-center gap-1">
                      Location
                      {sortBy === "location" &&
                        (sortOrder === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        ))}
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("duration")}
                  >
                    <div className="flex items-center gap-1">
                      Duration
                      {sortBy === "duration" &&
                        (sortOrder === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        ))}
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("price")}
                  >
                    <div className="flex items-center gap-1">
                      Price
                      {sortBy === "price" &&
                        (sortOrder === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        ))}
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("category")}
                  >
                    <div className="flex items-center gap-1">
                      Category
                      {sortBy === "category" &&
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
                {paginatedTours.map((tour) => (
                  <tr
                    key={tour.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={tour.image}
                          alt={tour.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div>
                          <div className="font-medium text-gray-900">
                            {tour.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            Rating: {tour.rating}/5
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {tour.location}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        {tour.duration}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm font-medium text-gray-900">
                        <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                        {tour.price}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-gold/10 text-primary-gold">
                        {tour.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center text-black justify-end gap-2">
                        <Link href={`/dashboard/admin/expeditions/${tour.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link
                          href={`/dashboard/admin/expeditions/${tour.id}/edit`}
                        >
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(tour.id)}
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
            {Math.min(page * pageSize, total)} of {total} expeditions
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
