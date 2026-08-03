"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { requireAuth, requireMinimumRole, AuthorizationError } from "@/lib/authorization";
import { updateBookedSlots } from "./availabilityActions";
import { sendCancellationEmail } from "./emailActions";

// Cancel booking
export async function cancelBooking(
  bookingId: string,
  reason?: string
) {
  noStore();
  try {
    const user = await requireAuth();
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    // Check if user can cancel this booking
    if (booking.userId !== user.id) {
      await requireMinimumRole("STAFF");
    }

    // Check if booking can be cancelled
    if (booking.status === "Cancelled" || booking.status === "Declined") {
      return {
        success: false,
        error: "Booking is already cancelled or declined",
      };
    }

    // Calculate refund based on cancellation policy
    const bookingDate = new Date(booking.date);
    const today = new Date();
    const daysUntilBooking = Math.ceil((bookingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    let refundAmount = 0;
    let refundPercentage = 0;

    // Cancellation policy
    if (daysUntilBooking >= 7) {
      refundPercentage = 100; // Full refund for 7+ days notice
    } else if (daysUntilBooking >= 3) {
      refundPercentage = 50; // 50% refund for 3-7 days notice
    } else if (daysUntilBooking >= 1) {
      refundPercentage = 25; // 25% refund for 1-3 days notice
    } else {
      refundPercentage = 0; // No refund for less than 24 hours notice
    }

    refundAmount = booking.totalPrice * (refundPercentage / 100);

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "Cancelled",
        cancellationReason: reason,
        cancelledAt: new Date(),
        cancelledBy: user.id,
        updatedAt: new Date(),
      },
    });

    // Update availability - free up the slots
    await updateBookedSlots(
      booking.itemId,
      booking.itemType as "Tour" | "Lodge",
      booking.date,
      booking.guests,
      false
    );

    // Process refund if applicable
    if (refundAmount > 0) {
      // Here you would integrate with your payment gateway to process the refund
      // For now, we'll just create a payment record
      await prisma.payment.create({
        data: {
          userId: booking.userId || user.id,
          bookingId: booking.id,
          amount: -refundAmount, // Negative amount for refund
          currency: booking.currency,
          status: "Pending",
          paymentType: "Refund",
          paymentMethod: "Original",
          metadata: {
            refundPercentage,
            originalAmount: booking.totalPrice,
            reason: "Cancellation",
          },
        },
      });
    }

    // Send cancellation email
    await sendCancellationEmail(booking, refundAmount, refundPercentage);

    revalidatePath("/dashboard/admin/bookings");
    revalidatePath("/dashboard/tourist/bookings");
    revalidatePath("/tours/[id]");

    return {
      success: true,
      booking: updatedBooking,
      refundAmount,
      refundPercentage,
      message: `Booking cancelled successfully. ${refundPercentage > 0 ? `${refundPercentage}% refund (${refundAmount} ${booking.currency}) will be processed.` : "No refund due to late cancellation."}`,
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to cancel booking:", error);
    return { success: false, error: "Failed to cancel booking" };
  }
}

// Admin force cancel booking
export async function adminCancelBooking(
  bookingId: string,
  reason: string,
  refundPercentage: number = 100
) {
  noStore();
  try {
    await requireMinimumRole("STAFF");

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    // Calculate refund amount
    const refundAmount = booking.totalPrice * (refundPercentage / 100);

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "Cancelled",
        cancellationReason: reason,
        cancelledAt: new Date(),
        cancelledBy: "System",
        updatedAt: new Date(),
      },
    });

    // Update availability
    await updateBookedSlots(
      booking.itemId,
      booking.itemType as "Tour" | "Lodge",
      booking.date,
      booking.guests,
      false
    );

    // Process refund if applicable
    if (refundAmount > 0) {
      await prisma.payment.create({
        data: {
          userId: booking.userId || "system",
          bookingId: booking.id,
          amount: -refundAmount,
          currency: booking.currency,
          status: "Pending",
          paymentType: "Refund",
          paymentMethod: "Admin",
          metadata: {
            refundPercentage,
            originalAmount: booking.totalPrice,
            reason: "Admin cancellation",
          },
        },
      });
    }

    // Send cancellation email
    await sendCancellationEmail(booking, refundAmount, refundPercentage);

    revalidatePath("/dashboard/admin/bookings");
    revalidatePath("/dashboard/tourist/bookings");

    return {
      success: true,
      booking: updatedBooking,
      refundAmount,
      refundPercentage,
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to admin cancel booking:", error);
    return { success: false, error: "Failed to cancel booking" };
  }
}

// Get cancellation policy details
export async function getCancellationPolicy(bookingId: string) {
  noStore();
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return { error: "Booking not found" };
    }

    const bookingDate = new Date(booking.date);
    const today = new Date();
    const daysUntilBooking = Math.ceil((bookingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    let refundPercentage = 0;
    let policyMessage = "";

    if (daysUntilBooking >= 7) {
      refundPercentage = 100;
      policyMessage = "Full refund available (7+ days before booking)";
    } else if (daysUntilBooking >= 3) {
      refundPercentage = 50;
      policyMessage = "50% refund available (3-7 days before booking)";
    } else if (daysUntilBooking >= 1) {
      refundPercentage = 25;
      policyMessage = "25% refund available (1-3 days before booking)";
    } else {
      refundPercentage = 0;
      policyMessage = "No refund available (less than 24 hours before booking)";
    }

    const refundAmount = booking.totalPrice * (refundPercentage / 100);

    return {
      success: true,
      daysUntilBooking,
      refundPercentage,
      refundAmount,
      policyMessage,
      bookingDate: booking.date,
    };
  } catch (error) {
    console.error("Failed to get cancellation policy:", error);
    return { error: "Failed to get cancellation policy" };
  }
}

// Get cancellation statistics for admin
export async function getCancellationStats(startDate?: Date, endDate?: Date) {
  noStore();
  try {
    await requireMinimumRole("STAFF");

    const where = {
      status: "Cancelled",
      ...(startDate && { cancelledAt: { gte: startDate } }),
      ...(endDate && { cancelledAt: { lte: endDate } }),
    };

    const [totalCancellations, cancelledBookings] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where,
        include: {
          payments: true,
        },
      }),
    ]);

    const totalRefunded = cancelledBookings.reduce((sum, booking) => {
      const refunds = booking.payments.filter(p => p.status === "Refunded");
      return sum + refunds.reduce((refSum, p) => refSum + Math.abs(p.amount), 0);
    }, 0);

    const cancellationsByReason = cancelledBookings.reduce((acc, booking) => {
      const reason = booking.cancellationReason || "No reason provided";
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalCancellations,
      totalRefunded,
      cancellationsByReason,
      averageRefundAmount: totalCancellations > 0 ? totalRefunded / totalCancellations : 0,
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to get cancellation stats:", error);
    return {
      totalCancellations: 0,
      totalRefunded: 0,
      cancellationsByReason: {},
      averageRefundAmount: 0,
    };
  }
}
