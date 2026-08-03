"use server";

import { prisma } from "@/lib/prisma";
import { unstable_noStore as noStore } from "next/cache";
import { requireAnyRole, AuthorizationError } from "@/lib/authorization";
import { revalidatePath } from "next/cache";

// Bulk update booking status
export async function bulkUpdateBookingStatus(formData: FormData) {
  try {
    await requireAnyRole(["ADMIN", "SUPER_ADMIN"]);

    const bookingIds = formData.getAll("bookingIds") as string[];
    const status = formData.get("status") as string;

    if (!bookingIds.length || !status) {
      throw new Error("Booking IDs and status are required");
    }

    const validStatuses = [
      "Pending",
      "Confirmed",
      "Declined",
      "Cancelled",
      "Waitlisted",
    ];
    if (!validStatuses.includes(status)) {
      throw new Error("Invalid status");
    }

    const result = await prisma.booking.updateMany({
      where: {
        id: { in: bookingIds },
      },
      data: { status },
    });

    revalidatePath("/dashboard/admin/bookings");
    revalidatePath("/dashboard/admin");

    return { success: true, affectedCount: result.count };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to bulk update booking status:", error);
    throw error;
  }
}

// Bulk delete bookings
export async function bulkDeleteBookings(formData: FormData) {
  try {
    await requireAnyRole(["SUPER_ADMIN"]);

    const bookingIds = formData.getAll("bookingIds") as string[];

    if (!bookingIds.length) {
      throw new Error("Booking IDs are required");
    }

    const result = await prisma.booking.deleteMany({
      where: {
        id: { in: bookingIds },
      },
    });

    revalidatePath("/dashboard/admin/bookings");
    revalidatePath("/dashboard/admin");

    return { success: true, affectedCount: result.count };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to bulk delete bookings:", error);
    throw error;
  }
}

// Bulk update tour status (active/inactive)
export async function bulkUpdateTourStatus(formData: FormData) {
  try {
    await requireAnyRole(["ADMIN", "SUPER_ADMIN"]);

    const tourIds = formData.getAll("tourIds") as string[];
    const isActive = formData.get("isActive") === "true";

    if (!tourIds.length) {
      throw new Error("Tour IDs are required");
    }

    // Since Tour model doesn't have isActive, we'll use a different approach
    // For now, let's assume we want to update something else or add this field
    // This is a placeholder for when you add isActive to Tour model
    const result = await prisma.tour.updateMany({
      where: {
        id: { in: tourIds },
      },
      data: {
        // Add your actual field updates here
        // For example: isActive
      },
    });

    revalidatePath("/dashboard/admin/expeditions");
    revalidatePath("/dashboard/admin");

    return { success: true, affectedCount: result.count };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to bulk update tour status:", error);
    throw error;
  }
}

// Bulk delete tours
export async function bulkDeleteTours(tourIds: string[]) {
  try {
    await requireAnyRole(["SUPER_ADMIN"]);

    if (!tourIds.length) {
      throw new Error("Tour IDs are required");
    }

    // Check if tours have bookings
    const bookingsCount = await prisma.booking.count({
      where: {
        itemType: "Tour",
        itemId: { in: tourIds },
      },
    });

    if (bookingsCount > 0) {
      throw new Error(
        `Cannot delete tours with existing bookings. ${bookingsCount} bookings found.`,
      );
    }

    const result = await prisma.tour.deleteMany({
      where: {
        id: { in: tourIds },
      },
    });

    revalidatePath("/dashboard/admin/expeditions");
    revalidatePath("/dashboard/admin");

    return { success: true, affectedCount: result.count };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to bulk delete tours:", error);
    throw error;
  }
}

// Bulk update lodge status
export async function bulkUpdateLodgeStatus(
  lodgeIds: string[],
  isActive: boolean,
) {
  try {
    await requireAnyRole(["ADMIN", "SUPER_ADMIN"]);

    if (!lodgeIds.length) {
      throw new Error("Lodge IDs are required");
    }

    // Similar to tours, this is a placeholder for when you add isActive to Lodge model
    const result = await prisma.lodge.updateMany({
      where: {
        id: { in: lodgeIds },
      },
      data: {
        // Add your actual field updates here
      },
    });

    revalidatePath("/dashboard/admin/lodges");
    revalidatePath("/dashboard/admin");

    return { success: true, affectedCount: result.count };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to bulk update lodge status:", error);
    throw error;
  }
}

// Bulk delete lodges
export async function bulkDeleteLodges(lodgeIds: string[]) {
  try {
    await requireAnyRole(["SUPER_ADMIN"]);

    if (!lodgeIds.length) {
      throw new Error("Lodge IDs are required");
    }

    // Check if lodges have bookings
    const bookingsCount = await prisma.booking.count({
      where: {
        itemType: "Lodge",
        itemId: { in: lodgeIds },
      },
    });

    if (bookingsCount > 0) {
      throw new Error(
        `Cannot delete lodges with existing bookings. ${bookingsCount} bookings found.`,
      );
    }

    const result = await prisma.lodge.deleteMany({
      where: {
        id: { in: lodgeIds },
      },
    });

    revalidatePath("/dashboard/admin/lodges");
    revalidatePath("/dashboard/admin");

    return { success: true, affectedCount: result.count };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to bulk delete lodges:", error);
    throw error;
  }
}

// Bulk delete gallery images
export async function bulkDeleteGalleryImages(imageIds: string[]) {
  try {
    await requireAnyRole(["ADMIN", "SUPER_ADMIN"]);

    if (!imageIds.length) {
      throw new Error("Image IDs are required");
    }

    const result = await prisma.gallery.deleteMany({
      where: {
        id: { in: imageIds },
      },
    });

    revalidatePath("/dashboard/admin/gallery");
    revalidatePath("/dashboard/admin");

    return { success: true, affectedCount: result.count };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to bulk delete gallery images:", error);
    throw error;
  }
}

// Bulk update journal status
export async function bulkUpdateJournalStatus(
  journalIds: string[],
  status: string,
) {
  try {
    await requireAnyRole(["ADMIN", "SUPER_ADMIN"]);

    if (!journalIds.length || !status) {
      throw new Error("Journal IDs and status are required");
    }

    const validStatuses = ["draft", "published", "archived"];
    if (!validStatuses.includes(status)) {
      throw new Error("Invalid status");
    }

    const result = await prisma.journal.updateMany({
      where: {
        id: { in: journalIds },
      },
      data: { status },
    });

    revalidatePath("/dashboard/admin/journals");
    revalidatePath("/dashboard/admin");

    return { success: true, affectedCount: result.count };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to bulk update journal status:", error);
    throw error;
  }
}

// Bulk delete journals
export async function bulkDeleteJournals(journalIds: string[]) {
  try {
    await requireAnyRole(["SUPER_ADMIN"]);

    if (!journalIds.length) {
      throw new Error("Journal IDs are required");
    }

    const result = await prisma.journal.deleteMany({
      where: {
        id: { in: journalIds },
      },
    });

    revalidatePath("/dashboard/admin/journals");
    revalidatePath("/dashboard/admin");

    return { success: true, affectedCount: result.count };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to bulk delete journals:", error);
    throw error;
  }
}

// Bulk update user status
export async function bulkUpdateUserStatus(
  userIds: string[],
  isActive: boolean,
) {
  try {
    await requireAnyRole(["ADMIN", "SUPER_ADMIN"]);

    if (!userIds.length) {
      throw new Error("User IDs are required");
    }

    const result = await prisma.user.updateMany({
      where: {
        id: { in: userIds },
      },
      data: { isActive },
    });

    revalidatePath("/dashboard/admin/users");
    revalidatePath("/dashboard/admin");

    return { success: true, affectedCount: result.count };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to bulk update user status:", error);
    throw error;
  }
}

// Bulk delete users
export async function bulkDeleteUsers(userIds: string[]) {
  try {
    await requireAnyRole(["SUPER_ADMIN"]);

    if (!userIds.length) {
      throw new Error("User IDs are required");
    }

    // Check if users have bookings
    const bookingsCount = await prisma.booking.count({
      where: {
        userId: { in: userIds },
      },
    });

    if (bookingsCount > 0) {
      throw new Error(
        `Cannot delete users with existing bookings. ${bookingsCount} bookings found.`,
      );
    }

    const result = await prisma.user.deleteMany({
      where: {
        id: { in: userIds },
      },
    });

    revalidatePath("/dashboard/admin/users");
    revalidatePath("/dashboard/admin");

    return { success: true, affectedCount: result.count };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to bulk delete users:", error);
    throw error;
  }
}

// Bulk mark notifications as read
export async function bulkMarkNotificationsRead(notificationIds: string[]) {
  try {
    await requireAnyRole(["ADMIN", "SUPER_ADMIN"]);

    if (!notificationIds.length) {
      throw new Error("Notification IDs are required");
    }

    const result = await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
      },
      data: { isRead: true },
    });

    revalidatePath("/dashboard/admin/notifications");
    revalidatePath("/dashboard/admin");

    return { success: true, affectedCount: result.count };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to bulk mark notifications as read:", error);
    throw error;
  }
}

// Bulk delete notifications
export async function bulkDeleteNotifications(notificationIds: string[]) {
  try {
    await requireAnyRole(["ADMIN", "SUPER_ADMIN"]);

    if (!notificationIds.length) {
      throw new Error("Notification IDs are required");
    }

    const result = await prisma.notification.deleteMany({
      where: {
        id: { in: notificationIds },
      },
    });

    revalidatePath("/dashboard/admin/notifications");
    revalidatePath("/dashboard/admin");

    return { success: true, affectedCount: result.count };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to bulk delete notifications:", error);
    throw error;
  }
}

// Bulk export data (bookings, users, etc.)
export async function bulkExportData(
  type: string,
  filters?: Record<string, any>,
) {
  try {
    await requireAnyRole(["ADMIN", "SUPER_ADMIN"]);

    let data: any[] = [];
    let filename = "";

    switch (type) {
      case "bookings":
        data = await prisma.booking.findMany({
          where: filters?.status ? { status: filters.status } : undefined,
          include: {
            user: {
              select: {
                email: true,
                fullName: true,
              },
            },
          },
        });
        filename = "bookings-export";
        break;
      case "users":
        data = await prisma.user.findMany({
          where:
            filters?.isActive !== undefined
              ? { isActive: filters.isActive }
              : undefined,
          include: {
            role: {
              select: {
                name: true,
              },
            },
          },
        });
        filename = "users-export";
        break;
      case "tours":
        data = await prisma.tour.findMany();
        filename = "tours-export";
        break;
      case "lodges":
        data = await prisma.lodge.findMany();
        filename = "lodges-export";
        break;
      default:
        throw new Error("Invalid export type");
    }

    // Convert to CSV format
    const headers = Object.keys(data[0] || {}).filter(
      (key) => typeof data[0][key] !== "object",
    );
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            if (value === null || value === undefined) return "";
            if (typeof value === "string")
              return `"${value.replace(/"/g, '""')}"`;
            return String(value);
          })
          .join(","),
      ),
    ].join("\n");

    return {
      success: true,
      data: csvContent,
      filename: `${filename}-${new Date().toISOString().split("T")[0]}.csv`,
      recordCount: data.length,
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to bulk export data:", error);
    throw error;
  }
}
