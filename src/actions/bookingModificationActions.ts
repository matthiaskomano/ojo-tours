"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import {
  requireAuth,
  requireMinimumRole,
  AuthorizationError,
} from "@/lib/authorization";
import { checkAvailability, updateBookedSlots } from "./availabilityActions";
import { calculateFinalPrice } from "./pricingActions";

// Modify booking date
export async function modifyBookingDate(
  bookingId: string,
  newDate: Date,
  reason?: string,
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

    // Check if user can modify this booking
    if (booking.userId !== user.id) {
      await requireMinimumRole("STAFF");
    }

    // Check if booking can be modified
    if (booking.status === "Cancelled" || booking.status === "Declined") {
      return {
        success: false,
        error: "Cannot modify cancelled or declined bookings",
      };
    }

    // Check availability for new date
    const availabilityCheck = await checkAvailability(
      booking.itemId,
      booking.itemType as "Tour" | "Lodge",
      newDate,
      booking.guests,
    );

    if (!availabilityCheck.available) {
      return {
        success: false,
        error: availabilityCheck.reason || "No availability for new date",
      };
    }

    // Calculate new price if different date
    const item =
      booking.itemType === "Tour"
        ? await prisma.tour.findUnique({ where: { id: booking.itemId } })
        : await prisma.lodge.findUnique({ where: { id: booking.itemId } });

    if (!item) {
      return { success: false, error: "Item not found" };
    }

    const basePrice = parseFloat(item.price);
    const pricingResult = await calculateFinalPrice(
      booking.itemId,
      booking.itemType as "Tour" | "Lodge",
      newDate,
      booking.guests,
      basePrice,
    );

    // Record old values for modification tracking
    const oldValues = { date: booking.date };

    // Update booked slots - decrease old date, increase new date
    await updateBookedSlots(
      booking.itemId,
      booking.itemType as "Tour" | "Lodge",
      booking.date,
      booking.guests,
      false,
    );
    await updateBookedSlots(
      booking.itemId,
      booking.itemType as "Tour" | "Lodge",
      newDate,
      booking.guests,
      true,
    );

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        date: newDate,
        totalPrice: pricingResult.totalFinalPrice,
        updatedAt: new Date(),
      },
    });

    // Record modification
    await prisma.bookingModification.create({
      data: {
        bookingId,
        modifiedBy: user.id,
        modificationType: "date",
        oldValue: oldValues,
        newValue: { date: newDate },
        reason,
      },
    });

    revalidatePath("/dashboard/admin/bookings");
    revalidatePath("/dashboard/tourist/bookings");
    revalidatePath("/tours/[id]");

    return {
      success: true,
      booking: updatedBooking,
      newPrice: pricingResult.totalFinalPrice,
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to modify booking date:", error);
    return { success: false, error: "Failed to modify booking date" };
  }
}

// Modify booking guest count
export async function modifyBookingGuests(
  bookingId: string,
  newGuestCount: number,
  reason?: string,
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

    // Check if user can modify this booking
    if (booking.userId !== user.id) {
      await requireMinimumRole("STAFF");
    }

    // Check if booking can be modified
    if (booking.status === "Cancelled" || booking.status === "Declined") {
      return {
        success: false,
        error: "Cannot modify cancelled or declined bookings",
      };
    }

    // Check availability for new guest count
    const availabilityCheck = await checkAvailability(
      booking.itemId,
      booking.itemType as "Tour" | "Lodge",
      booking.date,
      newGuestCount,
    );

    if (!availabilityCheck.available) {
      return {
        success: false,
        error:
          availabilityCheck.reason || "No availability for new guest count",
      };
    }

    // Calculate new price
    const item =
      booking.itemType === "Tour"
        ? await prisma.tour.findUnique({ where: { id: booking.itemId } })
        : await prisma.lodge.findUnique({ where: { id: booking.itemId } });

    if (!item) {
      return { success: false, error: "Item not found" };
    }

    const basePrice = parseFloat(item.price);
    const pricingResult = await calculateFinalPrice(
      booking.itemId,
      booking.itemType as "Tour" | "Lodge",
      booking.date,
      newGuestCount,
      basePrice,
    );

    // Record old values for modification tracking
    const oldValues = { guests: booking.guests };

    // Update booked slots
    const guestDifference = newGuestCount - booking.guests;
    await updateBookedSlots(
      booking.itemId,
      booking.itemType as "Tour" | "Lodge",
      booking.date,
      Math.abs(guestDifference),
      guestDifference > 0,
    );

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        guests: newGuestCount,
        totalPrice: pricingResult.totalFinalPrice,
        updatedAt: new Date(),
      },
    });

    // Record modification
    await prisma.bookingModification.create({
      data: {
        bookingId,
        modifiedBy: user.id,
        modificationType: "guests",
        oldValue: oldValues,
        newValue: { guests: newGuestCount },
        reason,
      },
    });

    revalidatePath("/dashboard/admin/bookings");
    revalidatePath("/dashboard/tourist/bookings");
    revalidatePath("/tours/[id]");

    return {
      success: true,
      booking: updatedBooking,
      newPrice: pricingResult.totalFinalPrice,
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to modify booking guests:", error);
    return { success: false, error: "Failed to modify booking guests" };
  }
}

// Get booking modification history
export async function getBookingModifications(bookingId: string) {
  noStore();
  try {
    await requireAuth();

    const modifications = await prisma.bookingModification.findMany({
      where: { bookingId },
      orderBy: { createdAt: "desc" },
    });

    return modifications;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to get booking modifications:", error);
    return [];
  }
}

// Get all modifications for admin monitoring
export async function getAllModifications(params?: {
  page?: number;
  pageSize?: number;
  bookingId?: string;
}) {
  noStore();
  try {
    await requireMinimumRole("STAFF");

    const { page = 1, pageSize = 50, bookingId } = params || {};

    const where = bookingId ? { bookingId } : {};

    const [modifications, total] = await Promise.all([
      prisma.bookingModification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.bookingModification.count({ where }),
    ]);

    return {
      modifications,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to get all modifications:", error);
    const { page = 1, pageSize = 50 } = params || {};
    return {
      modifications: [],
      total: 0,
      page,
      pageSize,
      totalPages: 0,
    };
  }
}
