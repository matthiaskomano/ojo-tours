import { prisma } from "../src/lib/prisma";
import { createTestNotification, getUserNotificationCount, getUserNotifications } from "../src/lib/test-notifications";

/**
 * Test script to verify notification system
 * Run with: npx tsx scripts/test-notifications.ts <userId>
 */

async function main() {
  const userId = process.argv[2];

  if (!userId) {
    console.error("Usage: npx tsx scripts/test-notifications.ts <userId>");
    console.error("Please provide a valid user ID");
    process.exit(1);
  }

  console.log("=== Notification System Test ===\n");

  // Step 1: Check current notification count
  console.log("Step 1: Checking current notification count...");
  const currentCount = await getUserNotificationCount(userId);
  console.log(`Current notification count: ${currentCount}\n`);

  // Step 2: Get current notifications
  console.log("Step 2: Fetching current notifications...");
  const currentNotifications = await getUserNotifications(userId);
  console.log(`Current notifications: ${JSON.stringify(currentNotifications, null, 2)}\n`);

  // Step 3: Create a test notification
  console.log("Step 3: Creating test notification...");
  try {
    const testNotification = await createTestNotification(userId);
    console.log(`Test notification created: ${testNotification.id}\n`);
  } catch (error) {
    console.error("Failed to create test notification:", error);
    process.exit(1);
  }

  // Step 4: Check notification count after creation
  console.log("Step 4: Checking notification count after creation...");
  const newCount = await getUserNotificationCount(userId);
  console.log(`New notification count: ${newCount}\n`);

  // Step 5: Get notifications after creation
  console.log("Step 5: Fetching notifications after creation...");
  const newNotifications = await getUserNotifications(userId);
  console.log(`Notifications after creation: ${JSON.stringify(newNotifications, null, 2)}\n`);

  // Step 6: Verify the test notification was created
  console.log("Step 6: Verifying test notification...");
  if (newCount === currentCount + 1) {
    console.log("✅ Test notification created successfully!\n");
  } else {
    console.log("❌ Test notification creation failed!\n");
    process.exit(1);
  }

  // Step 7: Cleanup - delete the test notification
  console.log("Step 7: Cleaning up test notification...");
  const testNotification = newNotifications.find((n) => n.title === "Test Notification");
  if (testNotification) {
    await prisma.notification.delete({
      where: { id: testNotification.id },
    });
    console.log(`Test notification deleted: ${testNotification.id}\n`);
  }

  console.log("=== Test Complete ===");
  console.log("✅ All tests passed!");
}

main()
  .then(() => {
    console.log("\nTest script completed successfully.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nTest script failed:", error);
    process.exit(1);
  });
