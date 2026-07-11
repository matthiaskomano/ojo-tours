import { getBookings } from "@/actions/bookingActions";
import { updateBookingStatus } from "@/actions/bookingActions";
import { deleteBooking } from "@/actions/bookingActions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, XCircle, Clock, Trash2, Eye } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const bookings = await getBookings();

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Bookings</h1>
          <p className="text-sm text-gray-500 mt-2">Manage customer bookings and reservations</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {bookings.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-sm text-gray-500">Bookings will appear here when customers make reservations</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Guests</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{booking.customerName}</div>
                        <div className="text-sm text-gray-500">{booking.customerEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{booking.itemName}</div>
                        <div className="text-sm text-gray-500">{booking.itemType}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{booking.date}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{booking.guests}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{booking.totalPrice}</div>
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
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <form action={updateBookingStatus.bind(null, booking.id, "Confirmed")}>
                          <Button 
                            type="submit" 
                            variant="ghost" 
                            size="sm" 
                            disabled={booking.status === "Confirmed"}
                            className="text-green-500 hover:text-green-700 hover:bg-green-50 disabled:opacity-30"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </form>
                        <form action={updateBookingStatus.bind(null, booking.id, "Declined")}>
                          <Button 
                            type="submit" 
                            variant="ghost" 
                            size="sm" 
                            disabled={booking.status === "Declined"}
                            className="text-yellow-500 hover:text-yellow-700 hover:bg-yellow-50 disabled:opacity-30"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </form>
                        <form action={deleteBooking.bind(null, booking.id)}>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </form>
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
