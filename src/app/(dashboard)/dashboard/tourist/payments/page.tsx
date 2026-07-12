"use client";

import { useState, useEffect } from "react";
import { getTouristPayments } from "@/actions/touristActions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

type Payment = {
  id: string;
  amount: string;
  currency: string;
  status: string;
  paymentMethod: string;
  transactionId?: string;
  bookingId?: string;
  createdAt: Date;
};

export default function TouristPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const data = await getTouristPayments();
        setPayments(data);
      } catch (error) {
        console.error("Failed to fetch payments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const filteredAndSortedPayments = payments
    .filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          p.transactionId?.toLowerCase().includes(query) ||
          p.paymentMethod.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      const aValue = a[sortBy as keyof Payment];
      const bValue = b[sortBy as keyof Payment];
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

  const getStatusBadge = (status: string) => {
    if (status === "Pending") {
      return (
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
    }
    if (status === "Completed") {
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      );
    }
    if (status === "Failed") {
      return (
        <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-rose-200">
          <XCircle className="w-3 h-3 mr-1" />
          Failed
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
            Payment History
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            View and track your payment transactions
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-gray-100">
          <CardHeader className="pb-3">
            <CardDescription className="text-sm">Total Spent</CardDescription>
            <CardTitle className="text-2xl">
              ${payments
                .filter((p) => p.status === "Completed")
                .reduce((sum, p) => sum + parseFloat(p.amount), 0)
                .toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-gray-100">
          <CardHeader className="pb-3">
            <CardDescription className="text-sm">Completed Payments</CardDescription>
            <CardTitle className="text-2xl">
              {payments.filter((p) => p.status === "Completed").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-gray-100">
          <CardHeader className="pb-3">
            <CardDescription className="text-sm">Pending Payments</CardDescription>
            <CardTitle className="text-2xl">
              {payments.filter((p) => p.status === "Pending").length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                placeholder="Search by transaction ID or method..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("all")}
              className={statusFilter === "all" ? "bg-[#d4af37] hover:bg-[#c4a030]" : ""}
            >
              All
            </Button>
            <Button
              variant={statusFilter === "Completed" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("Completed")}
              className={statusFilter === "Completed" ? "bg-[#d4af37] hover:bg-[#c4a030]" : ""}
            >
              Completed
            </Button>
            <Button
              variant={statusFilter === "Pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("Pending")}
              className={statusFilter === "Pending" ? "bg-[#d4af37] hover:bg-[#c4a030]" : ""}
            >
              Pending
            </Button>
            <Button
              variant={statusFilter === "Failed" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("Failed")}
              className={statusFilter === "Failed" ? "bg-[#d4af37] hover:bg-[#c4a030]" : ""}
            >
              Failed
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="text-sm text-gray-500 mt-4">Loading payments...</p>
          </div>
        ) : filteredAndSortedPayments.length === 0 ? (
          <div className="text-center py-16">
            <CreditCard className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No payments found
            </h3>
            <p className="text-sm text-gray-500">
              Your payment history will appear here
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("createdAt")}
                  >
                    <div className="flex items-center gap-1">
                      Date
                      {sortBy === "createdAt" &&
                        (sortOrder === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        ))}
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("transactionId")}
                  >
                    <div className="flex items-center gap-1">
                      Transaction ID
                      {sortBy === "transactionId" &&
                        (sortOrder === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        ))}
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("paymentMethod")}
                  >
                    <div className="flex items-center gap-1">
                      Method
                      {sortBy === "paymentMethod" &&
                        (sortOrder === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        ))}
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("amount")}
                  >
                    <div className="flex items-center gap-1">
                      Amount
                      {sortBy === "amount" &&
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAndSortedPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div className="text-sm text-gray-600">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 font-mono">
                        {payment.transactionId || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-gray-400" />
                        <div className="text-sm text-gray-600">
                          {payment.paymentMethod}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {payment.currency} {payment.amount}
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(payment.status)}</td>
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
