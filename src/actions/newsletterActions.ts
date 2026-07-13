"use server";

import { prisma } from "@/lib/prisma";

// Create a new newsletter subscription
export async function subscribeToNewsletter(data: {
  email: string;
  fullName?: string;
}) {
  try {
    // Check if email already exists
    const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email: data.email },
    });

    if (existingSubscriber) {
      // If unsubscribed, reactivate
      if (existingSubscriber.status === "Unsubscribed") {
        const updated = await prisma.newsletterSubscriber.update({
          where: { email: data.email },
          data: {
            status: "Active",
            subscribedAt: new Date(),
            unsubscribedAt: null,
            fullName: data.fullName || existingSubscriber.fullName,
          },
        });
        return { success: true, message: "Subscription reactivated", subscriber: updated };
      }
      return { success: false, error: "Email already subscribed" };
    }

    // Create new subscriber
    const subscriber = await prisma.newsletterSubscriber.create({
      data: {
        email: data.email,
        fullName: data.fullName || null,
        status: "Active",
      },
    });

    return { success: true, subscriber };
  } catch (error: any) {
    console.error("Error subscribing to newsletter:", error);
    return { success: false, error: "Failed to subscribe to newsletter" };
  }
}

// Get all newsletter subscribers (for admin)
export async function getNewsletterSubscribers(filters?: {
  status?: string;
  search?: string;
}) {
  try {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { email: { contains: filters.search, mode: "insensitive" } },
        { fullName: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const subscribers = await prisma.newsletterSubscriber.findMany({
      where,
      orderBy: { subscribedAt: "desc" },
    });

    return subscribers;
  } catch (error: any) {
    console.error("Error fetching newsletter subscribers:", error);
    return [];
  }
}

// Get a single subscriber by ID
export async function getSubscriberById(id: string) {
  try {
    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { id },
    });

    return subscriber;
  } catch (error: any) {
    console.error("Error fetching subscriber:", error);
    return null;
  }
}

// Unsubscribe a subscriber
export async function unsubscribeSubscriber(id: string) {
  try {
    const subscriber = await prisma.newsletterSubscriber.update({
      where: { id },
      data: {
        status: "Unsubscribed",
        unsubscribedAt: new Date(),
      },
    });

    return { success: true, subscriber };
  } catch (error: any) {
    console.error("Error unsubscribing:", error);
    return { success: false, error: "Failed to unsubscribe" };
  }
}

// Unsubscribe by email (for public unsubscribe links)
export async function unsubscribeByEmail(email: string) {
  try {
    const subscriber = await prisma.newsletterSubscriber.update({
      where: { email },
      data: {
        status: "Unsubscribed",
        unsubscribedAt: new Date(),
      },
    });

    return { success: true, subscriber };
  } catch (error: any) {
    console.error("Error unsubscribing by email:", error);
    return { success: false, error: "Failed to unsubscribe" };
  }
}

// Delete a subscriber
export async function deleteSubscriber(id: string) {
  try {
    await prisma.newsletterSubscriber.delete({
      where: { id },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting subscriber:", error);
    return { success: false, error: "Failed to delete subscriber" };
  }
}

// Get newsletter statistics for admin dashboard
export async function getNewsletterStats() {
  try {
    const total = await prisma.newsletterSubscriber.count();
    const activeCount = await prisma.newsletterSubscriber.count({
      where: { status: "Active" },
    });
    const unsubscribedCount = await prisma.newsletterSubscriber.count({
      where: { status: "Unsubscribed" },
    });

    // Get recent subscriptions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentCount = await prisma.newsletterSubscriber.count({
      where: {
        subscribedAt: { gte: thirtyDaysAgo },
      },
    });

    return {
      total,
      active: activeCount,
      unsubscribed: unsubscribedCount,
      recent: recentCount,
    };
  } catch (error: any) {
    console.error("Error fetching newsletter stats:", error);
    return {
      total: 0,
      active: 0,
      unsubscribed: 0,
      recent: 0,
    };
  }
}

// Export subscribers data for CSV/Excel
export async function exportSubscribers() {
  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { subscribedAt: "desc" },
    });

    // Format for export
    const exportData = subscribers.map((sub) => ({
      Email: sub.email,
      Name: sub.fullName || "N/A",
      Status: sub.status,
      "Subscribed Date": sub.subscribedAt.toISOString().split("T")[0],
      "Unsubscribed Date": sub.unsubscribedAt
        ? sub.unsubscribedAt.toISOString().split("T")[0]
        : "N/A",
    }));

    return { success: true, data: exportData };
  } catch (error: any) {
    console.error("Error exporting subscribers:", error);
    return { success: false, error: "Failed to export subscribers" };
  }
}
