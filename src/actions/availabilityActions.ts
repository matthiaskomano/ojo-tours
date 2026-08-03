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
    if (itemType === "Tour") {
      const availability = await prisma.tourAvailability.findUnique({
        where: {
          tourId_date: {
            tourId: itemId,
            date: date,
          },
        },
      });

      if (!availability) {
        // Create availability record if it doesn't exist
        const tour = await prisma.tour.findUnique({ where: { id: itemId } });

        if (!tour) {
          return { available: false, reason: "Tour not found" };
        }

        // Create default availability with reasonable max slots
        const newAvailability = await prisma.tourAvailability.create({
          data: {
            tourId: itemId,
            date,
            bookedSlots: 0,
            maxSlots: 20, // Default max for tours
            isAvailable: true,
          },
        });

        return {
          available: newAvailability.maxSlots >= guests,
          availableSlots: newAvailability.maxSlots - newAvailability.bookedSlots,
          maxSlots: newAvailability.maxSlots,
        };
      }

      const availableSlots = availability.maxSlots - availability.bookedSlots;

      return {
        available: availableSlots >= guests && availability.isAvailable,
        availableSlots,
        maxSlots: availability.maxSlots,
        reason: availableSlots < guests 
          ? "Not enough available slots" 
          : availability.isAvailable 
            ? null 
            : "Tour not available on this date",
      };
    } else {
      const availability = await prisma.lodgeAvailability.findUnique({
        where: {
          lodgeId_date: {
            lodgeId: itemId,
            date: date,
          },
        },
      });

      if (!availability) {
        // Create availability record if it doesn't exist
        const lodge = await prisma.lodge.findUnique({ where: { id: itemId } });

        if (!lodge) {
          return { available: false, reason: "Lodge not found" };
        }

        // Create default availability with reasonable max slots
        const newAvailability = await prisma.lodgeAvailability.create({
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

      const availableSlots = availability.maxSlots - availability.bookedSlots;

      return {
        available: availableSlots >= guests && availability.isAvailable,
        availableSlots,
        maxSlots: availability.maxSlots,
        reason: availableSlots < guests 
          ? "Not enough available slots" 
          : availability.isAvailable 
            ? null 
            : "Lodge not available on this date",
      };
    }
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
    if (itemType === "Tour") {
      if (isIncrement) {
        await prisma.tourAvailability.update({
          where: {
            tourId_date: {
              tourId: itemId,
              date: date,
            },
          },
          data: {
            bookedSlots: {
              increment: guests,
            },
            isAvailable: true, // Will be recalculated below
          },
        });
      } else {
        await prisma.tourAvailability.update({
          where: {
            tourId_date: {
              tourId: itemId,
              date: date,
            },
          },
          data: {
            bookedSlots: {
              decrement: guests,
            },
          },
        });
      }

      // Recalculate availability
      const availability = await prisma.tourAvailability.findUnique({
        where: {
          tourId_date: {
            tourId: itemId,
            date: date,
          },
        },
      });

      if (availability) {
        await prisma.tourAvailability.update({
          where: {
            tourId_date: {
              tourId: itemId,
              date: date,
            },
          },
          data: {
            isAvailable: availability.maxSlots > availability.bookedSlots,
          },
        });
      }
    } else {
      if (isIncrement) {
        await prisma.lodgeAvailability.update({
          where: {
            lodgeId_date: {
              lodgeId: itemId,
              date: date,
            },
          },
          data: {
            bookedSlots: {
              increment: guests,
            },
            isAvailable: true, // Will be recalculated below
          },
        });
      } else {
        await prisma.lodgeAvailability.update({
          where: {
            lodgeId_date: {
              lodgeId: itemId,
              date: date,
            },
          },
          data: {
            bookedSlots: {
              decrement: guests,
            },
          },
        });
      }

      // Recalculate availability
      const availability = await prisma.lodgeAvailability.findUnique({
        where: {
          lodgeId_date: {
            lodgeId: itemId,
            date: date,
          },
        },
      });

      if (availability) {
        await prisma.lodgeAvailability.update({
          where: {
            lodgeId_date: {
              lodgeId: itemId,
              date: date,
            },
          },
          data: {
            isAvailable: availability.maxSlots > availability.bookedSlots,
          },
        });
      }
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
    if (itemType === "Tour") {
      const availability = await prisma.tourAvailability.findMany({
        where: {
          tourId: itemId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          date: 'asc',
        },
      });
      return availability;
    } else {
      const availability = await prisma.lodgeAvailability.findMany({
        where: {
          lodgeId: itemId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          date: 'asc',
        },
      });
      return availability;
    }
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

    if (itemType === "Tour") {
      await prisma.tourAvailability.upsert({
        where: {
          tourId_date: {
            tourId: itemId,
            date: date,
          },
        },
        create: {
          tourId: itemId,
          date,
          bookedSlots: 0,
          maxSlots,
          isAvailable,
        },
        update: {
          maxSlots,
          isAvailable,
        },
      });
    } else {
      await prisma.lodgeAvailability.upsert({
        where: {
          lodgeId_date: {
            lodgeId: itemId,
            date: date,
          },
        },
        create: {
          lodgeId: itemId,
          date,
          bookedSlots: 0,
          maxSlots,
          isAvailable,
        },
        update: {
          maxSlots,
          isAvailable,
        },
      });
    }

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

    // Generate date range and insert/update records
    const dates = [];
    const currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    for (const date of dates) {
      if (itemType === "Tour") {
        await prisma.tourAvailability.upsert({
          where: {
            tourId_date: {
              tourId: itemId,
              date: date,
            },
          },
          create: {
            tourId: itemId,
            date,
            bookedSlots: 0,
            maxSlots,
            isAvailable,
          },
          update: {
            maxSlots,
            isAvailable,
          },
        });
      } else {
        await prisma.lodgeAvailability.upsert({
          where: {
            lodgeId_date: {
              lodgeId: itemId,
              date: date,
            },
          },
          create: {
            lodgeId: itemId,
            date,
            bookedSlots: 0,
            maxSlots,
            isAvailable,
          },
          update: {
            maxSlots,
            isAvailable,
          },
        });
      }
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
