"use client";

import { useState, useEffect } from "react";
import {
  getAllPayments,
  getPaymentStats,
  recordPayment,
  recordRefund,
} from "@/actions/paymentActions";
import { getConfirmedBookings } from "@/actions/bookingActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Search,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  RotateCcw,
  Plus,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

type Payment = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string | null;
  paymentType: string;
  transactionId: string | null;
  bookingId: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  refundedAt: Date | null;
  refundReason: string | null;
  metadata: any;
  booking: {
    id: string;
    customerName: string;
    customerEmail: string;
    itemType: string;
    itemId: string;
  } | null;
  user: {
    id: string;
    email: string;
    fullName: string | null;
  };
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBookings, setConfirmedBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  // Form state for recording payment
  const [paymentForm, setPaymentForm] = useState({
    bookingId: "",
    amount: "",
    paymentMethod: "Bank Transfer",
    paymentType: "Full" as "Full" | "Deposit" | "Installment",
    transactionId: "",
    notes: "",
  });

  // Form state for refund
  const [refundForm, setRefundForm] = useState({
    refundAmount: "",
    refundReason: "",
  });

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, [page, statusFilter, searchQuery]);

  useEffect(() => {
    if (showRecordModal) {
      fetchConfirmedBookings();
    }
  }, [showRecordModal]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await getAllPayments({
        page,
        pageSize,
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: searchQuery || undefined,
      });
      setPayments(data.payments);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Failed to fetch payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getPaymentStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch payment stats:", error);
    }
  };

  const fetchConfirmedBookings = async () => {
    setBookingsLoading(true);
    try {
      const data = await getConfirmedBookings();
      setConfirmedBookings(data);
    } catch (error) {
      console.error("Failed to fetch confirmed bookings:", error);
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const result = await recordPayment({
        bookingId: paymentForm.bookingId,
        amount: parseFloat(paymentForm.amount),
        paymentMethod: paymentForm.paymentMethod,
        paymentType: paymentForm.paymentType,
        transactionId: paymentForm.transactionId || undefined,
        notes: paymentForm.notes,
      });

      if (result?.success) {
        setShowRecordModal(false);
        setPaymentForm({
          bookingId: "",
          amount: "",
          paymentMethod: "Bank Transfer",
          paymentType: "Full",
          transactionId: "",
          notes: "",
        });
        setConfirmedBookings([]);
        fetchPayments();
        fetchStats();
      } else {
        toast.error(result?.error || "Failed to record payment");
      }
    } catch (error) {
      console.error("Failed to record payment:", error);
      toast.error("Failed to record payment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;

    setSubmitting(true);

    try {
      const result = await recordRefund({
        paymentId: selectedPayment.id,
        refundAmount: parseFloat(refundForm.refundAmount),
        refundReason: refundForm.refundReason,
        processedBy: "admin",
      });

      if (result?.success) {
        setShowRefundModal(false);
        setRefundForm({ refundAmount: "", refundReason: "" });
        setSelectedPayment(null);
        fetchPayments();
        fetchStats();
      } else {
        toast.error(result?.error || "Failed to process refund");
      }
    } catch (error) {
      console.error("Failed to process refund:", error);
      toast.error("Failed to process refund");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "Completed") {
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      );
    }
    if (status === "Pending") {
      return (
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
    }
    if (status === "Refunded") {
      return (
        <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-rose-200">
          <XCircle className="w-3 h-3 mr-1" />
          Refunded
        </Badge>
      );
    }
    if (status === "Failed") {
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">
          <XCircle className="w-3 h-3 mr-1" />
          Failed
        </Badge>
      );
    }
    return <Badge>{status}</Badge>;
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center text-black">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Payment Management
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Record and manage all payment transactions
          </p>
        </div>
        <Button
          onClick={() => setShowRecordModal(true)}
          className="bg-[#d4af37] hover:bg-[#c4a030]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Record Payment
        </Button>
      </div>

      {/* Summary Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-gray-100">
            <CardHeader className="pb-3">
              <CardDescription className="text-sm">
                Total Revenue
              </CardDescription>
              <CardTitle className="text-2xl">
                ${stats.totalRevenue.toFixed(2)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-gray-100">
            <CardHeader className="pb-3">
              <CardDescription className="text-sm">Completed</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                {stats.completedPayments}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-gray-100">
            <CardHeader className="pb-3">
              <CardDescription className="text-sm">Pending</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                {stats.pendingPayments}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-gray-100">
            <CardHeader className="pb-3">
              <CardDescription className="text-sm">Refunded</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-rose-600" />
                {stats.refundedPayments}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

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
              variant={statusFilter === "Completed" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("Completed")}
              className={
                statusFilter === "Completed"
                  ? "bg-[#d4af37] hover:bg-[#c4a030]"
                  : "text-black"
              }
            >
              Completed
            </Button>
            <Button
              variant={statusFilter === "Pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("Pending")}
              className={
                statusFilter === "Pending"
                  ? "bg-[#d4af37] hover:bg-[#c4a030]"
                  : "text-black"
              }
            >
              Pending
            </Button>
            <Button
              variant={statusFilter === "Refunded" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("Refunded")}
              className={
                statusFilter === "Refunded"
                  ? "bg-[#d4af37] hover:bg-[#c4a030]"
                  : "text-black"
              }
            >
              Refunded
            </Button>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="text-sm text-gray-500 mt-4">Loading payments...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-16">
            <CreditCard className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No payments found
            </h3>
            <p className="text-sm text-gray-500">
              Get started by recording your first payment
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.transactionId || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div>
                        <div className="font-medium text-gray-900">
                          {payment.booking?.customerName ||
                            payment.user?.fullName ||
                            "N/A"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {payment.booking?.customerEmail ||
                            payment.user?.email ||
                            "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${payment.amount.toFixed(2)} {payment.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {payment.paymentType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {payment.paymentMethod || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {payment.status === "Completed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPayment(payment);
                            setRefundForm({
                              refundAmount: payment.amount.toString(),
                              refundReason: "",
                            });
                            setShowRefundModal(true);
                          }}
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        >
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Refund
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 text-black">
            <h2 className="text-xl font-bold mb-4">Record Payment</h2>
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Booking
                </label>
                <Combobox
                  value={paymentForm.bookingId}
                  onValueChange={(value) =>
                    setPaymentForm({
                      ...paymentForm,
                      bookingId: value || "",
                    })
                  }
                >
                  <ComboboxInput
                    placeholder={
                      bookingsLoading
                        ? "Loading bookings..."
                        : "Search confirmed bookings..."
                    }
                    disabled={bookingsLoading}
                  />
                  <ComboboxContent>
                    <ComboboxList>
                      {confirmedBookings.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          {bookingsLoading
                            ? "Loading..."
                            : "No confirmed bookings available"}
                        </div>
                      ) : (
                        confirmedBookings.map((booking) => (
                          <ComboboxItem key={booking.id} value={booking.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {booking.customerName} - {booking.itemName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {booking.itemType} • ${booking.totalPrice} •{" "}
                                {new Date(booking.date).toLocaleDateString()}
                              </span>
                            </div>
                          </ComboboxItem>
                        ))
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <Input
                  required
                  type="number"
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, amount: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <Select
                  value={paymentForm.paymentMethod}
                  onValueChange={(value) =>
                    setPaymentForm({ ...paymentForm, paymentMethod: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Check">Check</SelectItem>
                    <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Type
                </label>
                <Select
                  value={paymentForm.paymentType}
                  onValueChange={(value: any) =>
                    setPaymentForm({ ...paymentForm, paymentType: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full">Full Payment</SelectItem>
                    <SelectItem value="Deposit">Deposit</SelectItem>
                    <SelectItem value="Installment">Installment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction ID (Optional)
                </label>
                <Input
                  value={paymentForm.transactionId}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      transactionId: e.target.value,
                    })
                  }
                  placeholder="Auto-generated if empty"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <Input
                  value={paymentForm.notes}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, notes: e.target.value })
                  }
                  placeholder="Any additional notes"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowRecordModal(false);
                    setConfirmedBookings([]);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#d4af37] hover:bg-[#c4a030]"
                  disabled={submitting}
                >
                  {submitting ? "Recording..." : "Record Payment"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Process Refund</h2>
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">
                <div>
                  <strong>Original Amount:</strong> $
                  {selectedPayment.amount.toFixed(2)}
                </div>
                <div>
                  <strong>Transaction ID:</strong>{" "}
                  {selectedPayment.transactionId}
                </div>
                <div>
                  <strong>Customer:</strong>{" "}
                  {selectedPayment.booking?.customerName}
                </div>
              </div>
            </div>
            <form onSubmit={handleRefund} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Refund Amount
                </label>
                <Input
                  required
                  type="number"
                  step="0.01"
                  max={selectedPayment.amount}
                  value={refundForm.refundAmount}
                  onChange={(e) =>
                    setRefundForm({
                      ...refundForm,
                      refundAmount: e.target.value,
                    })
                  }
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Refund Reason
                </label>
                <Input
                  required
                  value={refundForm.refundReason}
                  onChange={(e) =>
                    setRefundForm({
                      ...refundForm,
                      refundReason: e.target.value,
                    })
                  }
                  placeholder="Reason for refund"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowRefundModal(false);
                    setSelectedPayment(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-rose-600 hover:bg-rose-700"
                  disabled={submitting}
                >
                  {submitting ? "Processing..." : "Process Refund"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
