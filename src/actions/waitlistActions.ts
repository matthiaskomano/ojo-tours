"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import {
  requireAuth,
  requireMinimumRole,
  AuthorizationError,
} from "@/lib/authorization";
import { sendWaitlistConfirmationEmail } from "./emailActions";

// Add to waitlist
export async function addToWaitlist(data: {
  itemId: string;
  itemType: "Tour" | "Lodge";
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  preferredDate: Date;
  guests: number;
}) {
  noStore();
  try {
    // Check if already on waitlist
    const existing = await prisma.waitlist.findFirst({
      where: {
        itemId: data.itemId,
        itemType: data.itemType,
        customerEmail: data.customerEmail,
        preferredDate: data.preferredDate,
        status: "Pending",
      },
    });

    if (existing) {
      return {
        success: false,
        error: "You are already on the waitlist for this date",
      };
    }

    const waitlistEntry = await prisma.waitlist.create({
      data: {
        ...data,
        status: "Pending",
      },
    });

    // Send confirmation email
    await sendWaitlistConfirmationEmail(waitlistEntry);

    revalidatePath("/dashboard/admin/bookings");
    revalidatePath("/tours/[id]");

    return {
      success: true,
      waitlistEntry,
      message:
        "You have been added to the waitlist. We'll contact you when a spot becomes available.",
    };
  } catch (error) {
    console.error("Failed to add to waitlist:", error);
    return { success: false, error: "Failed to add to waitlist" };
  }
}

// Add authenticated user to waitlist
export async function addUserToWaitlist(data: {
  itemId: string;
  itemType: "Tour" | "Lodge";
  preferredDate: Date;
  guests: number;
}) {
  noStore();
  try {
    const user = await requireAuth();

    // Check if already on waitlist
    const existing = await prisma.waitlist.findFirst({
      where: {
        itemId: data.itemId,
        itemType: data.itemType,
        userId: user.id,
        preferredDate: data.preferredDate,
        status: "Pending",
      },
    });

    if (existing) {
      return {
        success: false,
        error: "You are already on the waitlist for this date",
      };
    }

    const waitlistEntry = await prisma.waitlist.create({
      data: {
        ...data,
        userId: user.id,
        customerName: user.fullName || user.email,
        customerEmail: user.email,
        customerPhone: user.phone,
        status: "Pending",
      },
    });

    // Send confirmation email
    await sendWaitlistConfirmationEmail(waitlistEntry);

    revalidatePath("/dashboard/admin/bookings");
    revalidatePath("/dashboard/tourist/bookings");
    revalidatePath("/tours/[id]");

    return {
      success: true,
      waitlistEntry,
      message:
        "You have been added to the waitlist. We'll contact you when a spot becomes available.",
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to add user to waitlist:", error);
    return { success: false, error: "Failed to add to waitlist" };
  }
}

// Get waitlist entries for an item
export async function getItemWaitlist(
  itemId: string,
  itemType: "Tour" | "Lodge",
) {
  noStore();
  try {
    await requireMinimumRole("STAFF");

    const waitlistEntries = await prisma.waitlist.findMany({
      where: {
        itemId,
        itemType,
        status: "Pending",
      },
      orderBy: { preferredDate: "asc" },
    });

    return waitlistEntries;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to get item waitlist:", error);
    return [];
  }
}

// Get user's waitlist entries
export async function getUserWaitlist() {
  noStore();
  try {
    const user = await requireAuth();

    const waitlistEntries = await prisma.waitlist.findMany({
      where: {
        userId: user.id,
      },
      orderBy: { preferredDate: "asc" },
    });

    return waitlistEntries;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to get user waitlist:", error);
    return [];
  }
}

// Contact waitlist entry
export async function contactWaitlistEntry(
  waitlistId: string,
  message?: string,
) {
  noStore();
  try {
    await requireMinimumRole("STAFF");

    const waitlistEntry = await prisma.waitlist.update({
      where: { id: waitlistId },
      data: {
        status: "Contacted",
        contactedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Here you would send an email notification to the customer
    // For now, we'll just update the status

    revalidatePath("/dashboard/admin/bookings");

    return {
      success: true,
      waitlistEntry,
      message: "Waitlist entry marked as contacted",
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to contact waitlist entry:", error);
    return { success: false, error: "Failed to contact waitlist entry" };
  }
}

// Book from waitlist
export async function bookFromWaitlist(
  waitlistId: string,
  bookingData: {
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    totalPrice: number;
    paymentType: "Full" | "Deposit";
    depositAmount?: number;
    specialRequests?: string;
  },
) {
  noStore();
  try {
    await requireMinimumRole("STAFF");

    const waitlistEntry = await prisma.waitlist.findUnique({
      where: { id: waitlistId },
    });

    if (!waitlistEntry) {
      return { success: false, error: "Waitlist entry not found" };
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        itemId: waitlistEntry.itemId,
        itemType: waitlistEntry.itemType,
        customerName: bookingData.customerName || waitlistEntry.customerName,
        customerEmail: bookingData.customerEmail || waitlistEntry.customerEmail,
        customerPhone: bookingData.customerPhone || waitlistEntry.customerPhone,
        date: waitlistEntry.preferredDate,
        guests: waitlistEntry.guests,
        totalPrice: bookingData.totalPrice,
        paymentType: bookingData.paymentType,
        depositAmount: bookingData.depositAmount,
        currency: "USD",
        specialRequests: bookingData.specialRequests,
        userId: waitlistEntry.userId,
        status: "Confirmed",
        confirmedAt: new Date(),
      },
    });

    // Update waitlist entry
    await prisma.waitlist.update({
      where: { id: waitlistId },
      data: {
        status: "Booked",
        updatedAt: new Date(),
      },
    });

    revalidatePath("/dashboard/admin/bookings");
    revalidatePath("/dashboard/tourist/bookings");

    return {
      success: true,
      booking,
      message: "Booking created from waitlist",
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to book from waitlist:", error);
    return { success: false, error: "Failed to book from waitlist" };
  }
}

// Remove from waitlist
export async function removeFromWaitlist(waitlistId: string) {
  noStore();
  try {
    const user = await requireAuth();

    const waitlistEntry = await prisma.waitlist.findUnique({
      where: { id: waitlistId },
    });

    if (!waitlistEntry) {
      return { success: false, error: "Waitlist entry not found" };
    }

    // Check if user can remove this entry
    if (waitlistEntry.userId !== user.id) {
      await requireMinimumRole("STAFF");
    }

    await prisma.waitlist.delete({
      where: { id: waitlistId },
    });

    revalidatePath("/dashboard/admin/bookings");
    revalidatePath("/dashboard/tourist/bookings");

    return {
      success: true,
      message: "Removed from waitlist",
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to remove from waitlist:", error);
    return { success: false, error: "Failed to remove from waitlist" };
  }
}

// Get all waitlist entries for admin
export async function getAllWaitlist(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
  itemType?: string;
}) {
  noStore();
  try {
    await requireMinimumRole("STAFF");

    const { page = 1, pageSize = 50, status, itemType } = params || {};

    const where = {
      ...(status && { status }),
      ...(itemType && { itemType }),
    };

    const [waitlistEntries, total] = await Promise.all([
      prisma.waitlist.findMany({
        where,
        orderBy: { preferredDate: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.waitlist.count({ where }),
    ]);

    return {
      waitlistEntries,
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
    console.error("Failed to get all waitlist entries:", error);
    const { page = 1, pageSize = 50 } = params || {};
    return {
      waitlistEntries: [],
      total: 0,
      page,
      pageSize,
      totalPages: 0,
    };
  }
}

// Auto-expire old waitlist entries (should be run by a cron job)
export async function expireOldWaitlistEntries() {
  noStore();
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const expiredEntries = await prisma.waitlist.updateMany({
      where: {
        preferredDate: { lt: thirtyDaysAgo },
        status: "Pending",
      },
      data: {
        status: "Expired",
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      expiredCount: expiredEntries.count,
    };
  } catch (error) {
    console.error("Failed to expire old waitlist entries:", error);
    return { success: false, error: "Failed to expire old waitlist entries" };
  }
}
