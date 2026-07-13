import { createClient } from "@supabase/supabase-js";
import { prisma } from "../src/lib/prisma";

/**
 * Diagnostic script to check Supabase Realtime configuration
 * Run with: npx tsx scripts/diagnose-realtime.ts
 */

async function main() {
  console.log("=== Supabase Realtime Diagnostic Tool ===\n");

  // Step 1: Check Supabase client configuration
  console.log("Step 1: Checking Supabase client configuration...");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log("Supabase URL:", supabaseUrl ? "✅ Set" : "❌ Not set");
  console.log("Supabase Anon Key:", supabaseAnonKey ? "✅ Set" : "❌ Not set");

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("❌ Missing required environment variables");
    console.error(
      "Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file",
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log("");

  // Step 2: Check database connection
  console.log("Step 2: Checking database connection...");
  try {
    await prisma.$connect();
    console.log("✅ Database connection successful\n");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }

  // Step 3: Check if Notification table exists
  console.log("Step 3: Checking Notification table...");
  try {
    const notificationCount = await prisma.notification.count();
    console.log(
      `✅ Notification table exists (${notificationCount} records)\n`,
    );
  } catch (error) {
    console.error("❌ Notification table check failed:", error);
    process.exit(1);
  }

  // Step 4: Check if Booking table exists
  console.log("Step 4: Checking Booking table...");
  try {
    const bookingCount = await prisma.booking.count();
    console.log(`✅ Booking table exists (${bookingCount} records)\n`);
  } catch (error) {
    console.error("❌ Booking table check failed:", error);
    process.exit(1);
  }

  // Step 5: Test Supabase Realtime connection
  console.log("Step 5: Testing Supabase Realtime connection...");
  try {
    const channel = supabase
      .channel("test-connection")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Notification" },
        (payload) => {
          console.log("✅ Realtime subscription successful:", payload);
        },
      )
      .subscribe((status) => {
        console.log(`Realtime subscription status: ${status}`);
        if (status === "SUBSCRIBED") {
          console.log("✅ Realtime connection established\n");
          supabase.removeChannel(channel);
        } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
          console.error("❌ Realtime connection failed\n");
        }
      });

    // Wait a moment for the connection to establish
    await new Promise((resolve) => setTimeout(resolve, 2000));
  } catch (error) {
    console.error("❌ Realtime connection test failed:", error);
  }

  // Step 6: Generate SQL for enabling Realtime
  console.log(
    "Step 6: SQL commands to enable Realtime (run in Supabase SQL Editor):",
  );
  console.log(`
-- Enable realtime for notifications
alter publication supabase_realtime add table notification;

-- Enable realtime for bookings  
alter publication supabase_realtime add table booking;

-- Enable realtime for payments
alter publication supabase_realtime add table payment;

-- Check what tables are in the realtime publication
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
`);

  console.log("=== Diagnostic Complete ===");
  console.log("\nIf Realtime connection failed, please:");
  console.log("1. Run the SQL commands above in your Supabase SQL Editor");
  console.log(
    "2. Check your Supabase project settings to ensure Realtime is enabled",
  );
  console.log("3. Verify your environment variables are set correctly");
  console.log("4. Check browser console for WebSocket errors");

  await prisma.$disconnect();
}

main()
  .then(() => {
    console.log("\nDiagnostic completed successfully.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nDiagnostic failed:", error);
    process.exit(1);
  });
