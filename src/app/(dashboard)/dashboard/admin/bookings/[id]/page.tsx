import { getBookings } from "@/actions/bookingActions";
import { updateBookingStatus } from "@/actions/bookingActions";
import { deleteBooking } from "@/actions/bookingActions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Calendar,
  Mail,
  Users,
  DollarSign,
} from "lucide-react";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bookings = await getBookings();
  const booking = bookings.find((b) => b.id === id);

  if (!booking) {
    notFound();
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin/bookings">
          <Button variant="outline" size="sm" className="text-black">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Booking Details
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Booking information and status management
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Booking Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium text-gray-900">{booking.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Guests</p>
                  <p className="font-medium text-gray-900">{booking.guests}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Total Price</p>
                  <p className="font-medium text-gray-900">
                    {booking.totalPrice}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Item Details
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Item Name</p>
                <p className="font-medium text-gray-900">{booking.itemName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Item Type</p>
                <p className="font-medium text-gray-900">{booking.itemType}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Customer Info
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium text-gray-900">
                  {booking.customerName}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">
                    {booking.customerEmail}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Status</h2>
            <div className="space-y-4">
              {booking.status === "Pending" && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  <Clock className="h-4 w-4 mr-2" />
                  Pending
                </span>
              )}
              {booking.status === "Confirmed" && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmed
                </span>
              )}
              {booking.status === "Declined" && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  <XCircle className="h-4 w-4 mr-2" />
                  Declined
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2 mt-6">
              <form
                action={updateBookingStatus.bind(null, booking.id, "Confirmed")}
              >
                <Button
                  type="submit"
                  disabled={booking.status === "Confirmed"}
                  className="w-full bg-green-500 cursor-pointer hover:bg-green-600 text-white disabled:opacity-30"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Booking
                </Button>
              </form>
              <form
                action={updateBookingStatus.bind(null, booking.id, "Declined")}
              >
                <Button
                  type="submit"
                  variant="outline"
                  disabled={booking.status === "Declined"}
                  className="w-full disabled:opacity-30 cursor-pointer text-black"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Decline Booking
                </Button>
              </form>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Metadata</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="text-gray-900">
                  {new Date(booking.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <form action={deleteBooking.bind(null, booking.id)}>
            <Button
              type="submit"
              variant="destructive"
              className="w-full cursor-pointer"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Booking
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
