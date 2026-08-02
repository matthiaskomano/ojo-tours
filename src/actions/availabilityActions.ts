"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { requireMinimumRole, AuthorizationError } from "@/lib/authorization";

// Check availability for a specific date and item
export async function checkAvailability(
  itemId: string,
  itemType: "Tour" | "Lodge",
  date: Date,
  guests: number
) {
  noStore();
  try {
    const availabilityTable = itemType === "Tour" ? "tourAvailability" : "lodgeAvailability";
    const idField = itemType === "Tour" ? "tourId" : "lodgeId";

    const availability = await prisma.$queryRawUnsafe(`
      SELECT * FROM "${availabilityTable}"
      WHERE "${idField}" = $1
      AND date = $2
    `, itemId, date);

    if (!availability || (availability as any[]).length === 0) {
      // Create availability record if it doesn't exist
      const item = itemType === "Tour" 
        ? await prisma.tour.findUnique({ where: { id: itemId } })
        : await prisma.lodge.findUnique({ where: { id: itemId } });

      if (!item) {
        return { available: false, reason: "Item not found" };
      }

      // Create default availability with reasonable max slots
      const newAvailability = itemType === "Tour"
        ? await prisma.tourAvailability.create({
            data: {
              tourId: itemId,
              date,
              bookedSlots: 0,
              maxSlots: 20, // Default max for tours
              isAvailable: true,
            },
          })
        : await prisma.lodgeAvailability.create({
            data: {
              lodgeId: itemId,
              date,
              bookedSlots: 0,
              maxSlots: 10, // Default max for lodges
              isAvailable: true,
            },
          });

      return {
        available: newAvailability.maxSlots >= guests,
        availableSlots: newAvailability.maxSlots - newAvailability.bookedSlots,
        maxSlots: newAvailability.maxSlots,
      };
    }

    const availRecord = (availability as any[])[0];
    const availableSlots = availRecord.maxSlots - availRecord.bookedSlots;

    return {
      available: availableSlots >= guests && availRecord.isAvailable,
      availableSlots,
      maxSlots: availRecord.maxSlots,
      reason: availableSlots < guests 
        ? "Not enough available slots" 
        : availRecord.isAvailable 
          ? null 
          : "Item not available on this date",
    };
  } catch (error) {
    console.error("Failed to check availability:", error);
    return { available: false, reason: "Failed to check availability" };
  }
}

// Update booked slots when booking is created/modified/cancelled
export async function updateBookedSlots(
  itemId: string,
  itemType: "Tour" | "Lodge",
  date: Date,
  guests: number,
  isIncrement: boolean
) {
  try {
    const availabilityTable = itemType === "Tour" ? "tourAvailability" : "lodgeAvailability";
    const idField = itemType === "Tour" ? "tourId" : "lodgeId";

    if (isIncrement) {
      await prisma.$queryRawUnsafe(`
        UPDATE "${availabilityTable}"
        SET bookedSlots = bookedSlots + $1,
            isAvailable = (maxSlots - (bookedSlots + $1)) > 0,
            updatedAt = NOW()
        WHERE "${idField}" = $2
        AND date = $3
      `, guests, itemId, date);
    } else {
      await prisma.$queryRawUnsafe(`
        UPDATE "${availabilityTable}"
        SET bookedSlots = GREATEST(bookedSlots - $1, 0),
            isAvailable = (maxSlots - GREATEST(bookedSlots - $1, 0)) > 0,
            updatedAt = NOW()
        WHERE "${idField}" = $2
        AND date = $3
      `, guests, itemId, date);
    }

    revalidatePath("/dashboard/admin/bookings");
    revalidatePath("/dashboard/tourist/bookings");
  } catch (error) {
    console.error("Failed to update booked slots:", error);
    throw error;
  }
}

// Get availability calendar for an item
export async function getAvailabilityCalendar(
  itemId: string,
  itemType: "Tour" | "Lodge",
  startDate: Date,
  endDate: Date
) {
  noStore();
  try {
    const availabilityTable = itemType === "Tour" ? "tourAvailability" : "lodgeAvailability";
    const idField = itemType === "Tour" ? "tourId" : "lodgeId";

    const availability = await prisma.$queryRawUnsafe(`
      SELECT * FROM "${availabilityTable}"
      WHERE "${idField}" = $1
      AND date >= $2
      AND date <= $3
      ORDER BY date ASC
    `, itemId, startDate, endDate);

    return availability;
  } catch (error) {
    console.error("Failed to get availability calendar:", error);
    return [];
  }
}

// Set availability for a specific date (admin only)
export async function setAvailability(
  itemId: string,
  itemType: "Tour" | "Lodge",
  date: Date,
  maxSlots: number,
  isAvailable: boolean
) {
  try {
    await requireMinimumRole("STAFF");

    const availabilityTable = itemType === "Tour" ? "tourAvailability" : "lodgeAvailability";
    const idField = itemType === "Tour" ? "tourId" : "lodgeId";

    await prisma.$queryRawUnsafe(`
      INSERT INTO "${availabilityTable}" ("${idField}", date, bookedSlots, maxSlots, isAvailable, "createdAt", "updatedAt")
      VALUES ($1, $2, 0, $3, $4, NOW(), NOW())
      ON CONFLICT ("${idField}", date)
      DO UPDATE SET
        maxSlots = $3,
        isAvailable = $4,
        updatedAt = NOW()
    `, itemId, date, maxSlots, isAvailable);

    revalidatePath("/dashboard/admin/bookings");
    revalidatePath("/tours/[id]");
    return { success: true };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to set availability:", error);
    return { success: false, error: "Failed to set availability" };
  }
}

// Bulk set availability for a date range (admin only)
export async function bulkSetAvailability(
  itemId: string,
  itemType: "Tour" | "Lodge",
  startDate: Date,
  endDate: Date,
  maxSlots: number,
  isAvailable: boolean
) {
  try {
    await requireMinimumRole("STAFF");

    const availabilityTable = itemType === "Tour" ? "tourAvailability" : "lodgeAvailability";
    const idField = itemType === "Tour" ? "tourId" : "lodgeId";

    // Generate date range and insert/update records
    const dates = [];
    const currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    for (const date of dates) {
      await prisma.$queryRawUnsafe(`
        INSERT INTO "${availabilityTable}" ("${idField}", date, bookedSlots, maxSlots, isAvailable, "createdAt", "updatedAt")
        VALUES ($1, $2, 0, $3, $4, NOW(), NOW())
        ON CONFLICT ("${idField}", date)
        DO UPDATE SET
          maxSlots = $3,
          isAvailable = $4,
          updatedAt = NOW()
      `, itemId, date, maxSlots, isAvailable);
    }

    revalidatePath("/dashboard/admin/bookings");
    revalidatePath("/tours/[id]");
    return { success: true, count: dates.length };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to bulk set availability:", error);
    return { success: false, error: "Failed to bulk set availability" };
  }
}
