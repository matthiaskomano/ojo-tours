"use server";

import { prisma } from "@/lib/prisma";
import { unstable_noStore as noStore } from "next/cache";
import { requireAuth, AuthorizationError, requireAnyRole } from "@/lib/authorization";

// Get all notifications (admin only)
export async function getAllNotifications() {
  noStore();
  try {
    await requireAnyRole(["ADMIN", "SUPER_ADMIN"]);
    
    const notifications = await prisma.notification.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    
    return notifications;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to fetch all notifications:", error);
    return [];
  }
}

// Get admin's own notifications
export async function getAdminNotifications() {
  noStore();
  try {
    await requireAnyRole(["ADMIN", "SUPER_ADMIN"]);
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
    console.error("Failed to fetch admin notifications:", error);
    return [];
  }
}

// Mark notification as read (admin)
export async function markAdminNotificationRead(id: string) {
  try {
    await requireAnyRole(["ADMIN", "SUPER_ADMIN"]);
    const user = await requireAuth();
    
    const notification = await prisma.notification.findUnique({
      where: { id },
    });
    
    if (!notification) {
      throw new AuthorizationError("Notification not found");
    }
    
    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    
    return { success: true };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to mark notification as read:", error);
    throw error;
  }
}

// Mark all notifications as read (admin)
export async function markAllAdminNotificationsRead() {
  try {
    await requireAnyRole(["ADMIN", "SUPER_ADMIN"]);
    
    await prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });
    
    return { success: true };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to mark all notifications as read:", error);
    throw error;
  }
}

// Delete notification (admin)
export async function deleteAdminNotification(id: string) {
  try {
    await requireAnyRole(["ADMIN", "SUPER_ADMIN"]);
    
    const notification = await prisma.notification.findUnique({
      where: { id },
    });
    
    if (!notification) {
      throw new AuthorizationError("Notification not found");
    }
    
    await prisma.notification.delete({
      where: { id },
    });
    
    return { success: true };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to delete notification:", error);
    throw error;
  }
}
