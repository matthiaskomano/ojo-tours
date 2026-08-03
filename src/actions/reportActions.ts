"use server";

import { prisma } from "@/lib/prisma";
import { unstable_noStore as noStore } from "next/cache";
import { requireMinimumRole, AuthorizationError } from "@/lib/authorization";
import * as XLSX from "xlsx";

// 1. Get booking statistics
export async function getBookingStats() {
  noStore();
  try {
    await requireMinimumRole("STAFF");

    const [total, confirmed, pending, declined] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { status: "Confirmed" } }),
      prisma.booking.count({ where: { status: "Pending" } }),
      prisma.booking.count({ where: { status: "Declined" } }),
    ]);

    return { total, confirmed, pending, declined };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to fetch booking stats:", error);
    return { total: 0, confirmed: 0, pending: 0, declined: 0 };
  }
}

// 2. Get content statistics (tours, lodges, journals, gallery, team)
export async function getContentStats() {
  noStore();
  try {
    await requireMinimumRole("STAFF");

    const [tours, lodges, journals, gallery, team] = await Promise.all([
      prisma.tour.count(),
      prisma.lodge.count(),
      prisma.journal.count(),
      prisma.gallery.count(),
      prisma.team.count(),
    ]);

    return { tours, lodges, journals, gallery, team };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to fetch content stats:", error);
    return { tours: 0, lodges: 0, journals: 0, gallery: 0, team: 0 };
  }
}

// 3. Get revenue data (sum of confirmed bookings)
export async function getRevenueStats() {
  noStore();
  try {
    await requireMinimumRole("STAFF");

    const confirmedBookings = await prisma.booking.findMany({
      where: { status: "Confirmed" },
      select: { totalPrice: true },
    });

    const totalRevenue = confirmedBookings.reduce((sum, booking) => {
      const price = booking.totalPrice || 0;
      return sum + price;
    }, 0);

    return { totalRevenue, confirmedBookingsCount: confirmedBookings.length };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to fetch revenue stats:", error);
    return { totalRevenue: 0, confirmedBookingsCount: 0 };
  }
}

// 4. Get recent bookings (last 10)
export async function getRecentBookings() {
  noStore();
  try {
    await requireMinimumRole("STAFF");

    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Fetch item names for each booking
    const bookingIds = bookings.map((b) => b.itemId);
    const tours = await prisma.tour.findMany({
      where: { id: { in: bookingIds } },
      select: { id: true, title: true },
    });
    const lodges = await prisma.lodge.findMany({
      where: { id: { in: bookingIds } },
      select: { id: true, name: true },
    });

    const tourMap = new Map(tours.map((t) => [t.id, t.title]));
    const lodgeMap = new Map(lodges.map((l) => [l.id, l.name]));

    // Add itemName to each booking
    return bookings.map((booking) => ({
      ...booking,
      itemName:
        booking.itemType === "Tour"
          ? tourMap.get(booking.itemId) || "Unknown Tour"
          : lodgeMap.get(booking.itemId) || "Unknown Lodge",
    }));
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to fetch recent bookings:", error);
    return [];
  }
}

// 5. Get popular items (most booked tours/lodges)
export async function getPopularItems() {
  noStore();
  try {
    await requireMinimumRole("STAFF");

    const bookings = await prisma.booking.groupBy({
      by: ["itemId", "itemType"],
      where: { status: "Confirmed" },
      _count: {
        itemId: true,
      },
      orderBy: {
        _count: {
          itemId: "desc",
        },
      },
      take: 5,
    });

    return bookings.map((item) => ({
      id: item.itemId,
      type: item.itemType,
      count: item._count.itemId,
    }));
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to fetch popular items:", error);
    return [];
  }
}
