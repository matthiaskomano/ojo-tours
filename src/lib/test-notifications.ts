import { prisma } from "@/lib/prisma";

/**
 * Test utility to create a test notification for a user
 * This helps verify the notification system is working
 */
export async function createTestNotification(userId: string) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title: "Test Notification",
        message: "This is a test notification to verify the system is working correctly.",
        type: "test",
      },
    });
    console.log("[Test] Created test notification:", notification.id);
    return notification;
  } catch (error) {
    console.error("[Test] Failed to create test notification:", error);
    throw error;
  }
}

/**
 * Test utility to check if user has any notifications
 */
export async function getUserNotificationCount(userId: string) {
  try {
    const count = await prisma.notification.count({
      where: { userId },
    });
    console.log(`[Test] User ${userId} has ${count} notifications`);
    return count;
  } catch (error) {
    console.error("[Test] Failed to get notification count:", error);
    return 0;
  }
}

/**
 * Test utility to get all notifications for a user
 */
export async function getUserNotifications(userId: string) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    console.log(`[Test] Found ${notifications.length} notifications for user ${userId}`);
    return notifications;
  } catch (error) {
    console.error("[Test] Failed to get notifications:", error);
    return [];
  }
}

/**
 * Test utility to check if Supabase Realtime is enabled for a table
 * This requires running SQL in Supabase
 */
export function generateRealtimeSetupSQL() {
  return `
-- Enable realtime for notifications
alter publication supabase_realtime add table notification;

-- Enable realtime for bookings
alter publication supabase_realtime add table booking;

-- Enable realtime for payments
alter publication supabase_realtime add table payment;

-- Check what tables are in the realtime publication
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
  `;
}
