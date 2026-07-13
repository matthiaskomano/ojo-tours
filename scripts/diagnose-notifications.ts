import { prisma } from "../src/lib/prisma";

/**
 * Diagnostic script to check notification userId mismatch
 * Run with: npx tsx scripts/diagnose-notifications.ts <email>
 */

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("Usage: npx tsx scripts/diagnose-notifications.ts <email>");
    console.error("Please provide a valid user email");
    process.exit(1);
  }

  console.log("=== Notification System Diagnostic ===\n");

  // Step 1: Find the user by email
  console.log("Step 1: Finding user by email...");
  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });

  if (!user) {
    console.error(`❌ User with email ${email} not found in database`);
    process.exit(1);
  }

  console.log(`✅ User found:`);
  console.log(`   - Database ID: ${user.id}`);
  console.log(`   - Supabase ID: ${user.supabaseId}`);
  console.log(`   - Role: ${user.role?.name}`);
  console.log(`   - Email: ${user.email}\n`);

  // Step 2: Get all notifications in database
  console.log("Step 2: Getting all notifications in database...");
  const allNotifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
  });

  console.log(`   Total notifications in database: ${allNotifications.length}\n`);

  // Step 3: Get notifications for this user
  console.log("Step 3: Getting notifications for this user...");
  const userNotifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  console.log(`   Notifications for user ${user.id}: ${userNotifications.length}\n`);

  // Step 4: Check for userId mismatches
  console.log("Step 4: Checking notification userId distribution...");
  const userIdCounts: Record<string, number> = {};
  allNotifications.forEach((notif) => {
    userIdCounts[notif.userId] = (userIdCounts[notif.userId] || 0) + 1;
  });

  console.log("   Notifications by userId:");
  for (const [userId, count] of Object.entries(userIdCounts)) {
    const isCurrentUser = userId === user.id;
    console.log(`   - ${userId}: ${count} notifications ${isCurrentUser ? "✅ (current user)" : "❌ (different user)"}`);
  }
  console.log();

  // Step 5: Show sample notifications
  console.log("Step 5: Sample notifications:");
  if (allNotifications.length > 0) {
    console.log("   Latest 5 notifications:");
    allNotifications.slice(0, 5).forEach((notif, index) => {
      const isCurrentUser = notif.userId === user.id;
      console.log(`   ${index + 1}. ID: ${notif.id}`);
      console.log(`      userId: ${notif.userId} ${isCurrentUser ? "✅" : "❌"}`);
      console.log(`      title: ${notif.title}`);
      console.log(`      createdAt: ${notif.createdAt.toISOString()}`);
    });
  } else {
    console.log("   No notifications found in database");
  }
  console.log();

  // Step 6: Diagnosis
  console.log("=== Diagnosis ===");
  if (userNotifications.length === 0 && allNotifications.length > 0) {
    console.log("❌ ISSUE FOUND: Notifications exist but userId doesn't match current user");
    console.log(`   Current user ID: ${user.id}`);
    console.log(`   Notification userIds: ${Object.keys(userIdCounts).join(", ")}`);
    console.log("\nPossible solutions:");
    console.log("1. Update notification userId to match current user");
    console.log("2. Check if notifications were created for a different user");
    console.log("3. Verify user sync process is working correctly");
  } else if (userNotifications.length > 0) {
    console.log("✅ Notifications found for current user");
    console.log(`   User has ${userNotifications.length} notifications`);
  } else {
    console.log("ℹ️  No notifications in database");
  }

  console.log("\n=== Diagnostic Complete ===");
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nDiagnostic failed:", error);
    process.exit(1);
  });
