"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { requireAuth, AuthorizationError } from "@/lib/authorization";

// Get current tourist's bookings
export async function getTouristBookings() {
  noStore();
  try {
    const user = await requireAuth();
    
    const bookings = await prisma.booking.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    
    return bookings;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to fetch tourist bookings:", error);
    return [];
  }
}

// Get tourist's wishlist
export async function getTouristWishlist() {
  noStore();
  try {
    const user = await requireAuth();
    
    const wishlist = await prisma.wishlist.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    
    return wishlist;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to fetch tourist wishlist:", error);
    return [];
  }
}

// Add to wishlist
export async function addToWishlist(itemId: string, itemType: string) {
  try {
    const user = await requireAuth();
    
    // Check if already in wishlist
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_itemId_itemType: {
          userId: user.id,
          itemId,
          itemType,
        },
      },
    });
    
    if (existing) {
      // Remove if already exists
      await prisma.wishlist.delete({
        where: { id: existing.id },
      });
      return { success: true, action: "removed" };
    }
    
    // Add to wishlist
    await prisma.wishlist.create({
      data: {
        userId: user.id,
        itemId,
        itemType,
      },
    });
    
    return { success: true, action: "added" };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to add to wishlist:", error);
    throw error;
  }
}

// Remove from wishlist
export async function removeFromWishlist(id: string) {
  try {
    const user = await requireAuth();
    
    const wishlistItem = await prisma.wishlist.findUnique({
      where: { id },
    });
    
    if (!wishlistItem || wishlistItem.userId !== user.id) {
      throw new AuthorizationError("Access denied");
    }
    
    await prisma.wishlist.delete({
      where: { id },
    });
    
    revalidatePath("/dashboard/tourist/wishlist");
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to remove from wishlist:", error);
    throw error;
  }
}

// Get tourist's notifications
export async function getTouristNotifications() {
  noStore();
  try {
    const user = await requireAuth();
    
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    
    return notifications;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to fetch tourist notifications:", error);
    return [];
  }
}

// Get unread notification count
export async function getUnreadNotificationCount() {
  noStore();
  try {
    const user = await requireAuth();
    
    const count = await prisma.notification.count({
      where: {
        userId: user.id,
        isRead: false,
      },
    });
    
    return count;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to fetch unread notification count:", error);
    return 0;
  }
}

// Mark notification as read
export async function markNotificationRead(id: string) {
  try {
    const user = await requireAuth();
    
    const notification = await prisma.notification.findUnique({
      where: { id },
    });
    
    if (!notification || notification.userId !== user.id) {
      throw new AuthorizationError("Access denied");
    }
    
    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    
    revalidatePath("/dashboard/tourist/notifications");
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to mark notification as read:", error);
    throw error;
  }
}

// Mark all notifications as read
export async function markAllNotificationsRead() {
  try {
    const user = await requireAuth();
    
    await prisma.notification.updateMany({
      where: {
        userId: user.id,
        isRead: false,
      },
      data: { isRead: true },
    });
    
    revalidatePath("/dashboard/tourist/notifications");
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to mark all notifications as read:", error);
    throw error;
  }
}

// Delete notification
export async function deleteNotification(id: string) {
  try {
    const user = await requireAuth();
    
    const notification = await prisma.notification.findUnique({
      where: { id },
    });
    
    if (!notification || notification.userId !== user.id) {
      throw new AuthorizationError("Access denied");
    }
    
    await prisma.notification.delete({
      where: { id },
    });
    
    revalidatePath("/dashboard/tourist/notifications");
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to delete notification:", error);
    throw error;
  }
}

// Get tourist's reviews
export async function getTouristReviews() {
  noStore();
  try {
    const user = await requireAuth();
    
    const reviews = await prisma.review.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    
    return reviews;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to fetch tourist reviews:", error);
    return [];
  }
}

// Create or update review
export async function upsertReview(itemId: string, itemType: string, rating: number, comment?: string) {
  try {
    const user = await requireAuth();
    
    await prisma.review.upsert({
      where: {
        userId_itemId_itemType: {
          userId: user.id,
          itemId,
          itemType,
        },
      },
      update: {
        rating,
        comment,
      },
      create: {
        userId: user.id,
        itemId,
        itemType,
        rating,
        comment,
      },
    });
    
    revalidatePath("/dashboard/tourist/reviews");
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to upsert review:", error);
    throw error;
  }
}

// Delete review
export async function deleteReview(id: string) {
  try {
    const user = await requireAuth();
    
    const review = await prisma.review.findUnique({
      where: { id },
    });
    
    if (!review || review.userId !== user.id) {
      throw new AuthorizationError("Access denied");
    }
    
    await prisma.review.delete({
      where: { id },
    });
    
    revalidatePath("/dashboard/tourist/reviews");
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to delete review:", error);
    throw error;
  }
}

// Cancel booking (tourist-only)
export async function cancelTouristBooking(id: string) {
  try {
    const user = await requireAuth();
    
    const booking = await prisma.booking.findUnique({
      where: { id },
    });
    
    if (!booking || booking.userId !== user.id) {
      throw new AuthorizationError("Access denied");
    }
    
    if (booking.status !== "Pending") {
      throw new Error("Can only cancel pending bookings");
    }
    
    await prisma.booking.update({
      where: { id },
      data: { status: "Cancelled" },
    });
    
    revalidatePath("/dashboard/tourist/bookings");
    revalidatePath("/dashboard/tourist");
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to cancel booking:", error);
    throw error;
  }
}

// Get tourist's payments
export async function getTouristPayments() {
  noStore();
  try {
    const user = await requireAuth();
    
    const payments = await prisma.payment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    
    return payments;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to fetch tourist payments:", error);
    return [];
  }
}
