/**
 * Test script to verify email notification system for all notification types
 * This script tests the email-only notification implementation
 */

import { Resend } from "resend";
import { prisma } from "../src/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

// Test email configuration
const TEST_EMAIL = process.env.TEST_EMAIL || "mulbahjamesoplano@gmail.com";

console.log("🧪 Email Notification System Test");
console.log("==================================");
console.log(`Test Email: ${TEST_EMAIL}`);
console.log("");

async function testBookingConfirmationEmail() {
  console.log("1. Testing Booking Confirmation Email...");
  try {
    const { data, error } = await resend.emails.send({
      from: "OJO Tours <bookings@ojotours.com>",
      to: TEST_EMAIL,
      subject: "Test: Booking Confirmation",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a5f2a;">Booking Confirmed!</h1>
          <p>This is a test booking confirmation email.</p>
          <p>Best regards,<br>OJO Tours Team</p>
        </div>
      `,
    });

    if (error) {
      console.error("❌ Failed:", error);
      return false;
    }
    console.log("✅ Booking confirmation email sent successfully");
    return true;
  } catch (error) {
    console.error("❌ Error:", error);
    return false;
  }
}

async function testCancellationEmail() {
  console.log("2. Testing Cancellation Email...");
  try {
    const { data, error } = await resend.emails.send({
      from: "OJO Tours <bookings@ojotours.com>",
      to: TEST_EMAIL,
      subject: "Test: Booking Cancelled",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #d32f2f;">Booking Cancelled</h1>
          <p>This is a test cancellation email.</p>
          <p>Best regards,<br>OJO Tours Team</p>
        </div>
      `,
    });

    if (error) {
      console.error("❌ Failed:", error);
      return false;
    }
    console.log("✅ Cancellation email sent successfully");
    return true;
  } catch (error) {
    console.error("❌ Error:", error);
    return false;
  }
}

async function testWaitlistConfirmationEmail() {
  console.log("3. Testing Waitlist Confirmation Email...");
  try {
    const { data, error } = await resend.emails.send({
      from: "OJO Tours <bookings@ojotours.com>",
      to: TEST_EMAIL,
      subject: "Test: Waitlist Confirmation",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a5f2a;">Added to Waitlist!</h1>
          <p>This is a test waitlist confirmation email.</p>
          <p>Best regards,<br>OJO Tours Team</p>
        </div>
      `,
    });

    if (error) {
      console.error("❌ Failed:", error);
      return false;
    }
    console.log("✅ Waitlist confirmation email sent successfully");
    return true;
  } catch (error) {
    console.error("❌ Error:", error);
    return false;
  }
}

async function testWaitlistAvailabilityEmail() {
  console.log("4. Testing Waitlist Availability Email...");
  try {
    const { data, error } = await resend.emails.send({
      from: "OJO Tours <bookings@ojotours.com>",
      to: TEST_EMAIL,
      subject: "Test: Spot Available",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a5f2a;">Good News! A Spot is Available</h1>
          <p>This is a test waitlist availability email.</p>
          <p>Best regards,<br>OJO Tours Team</p>
        </div>
      `,
    });

    if (error) {
      console.error("❌ Failed:", error);
      return false;
    }
    console.log("✅ Waitlist availability email sent successfully");
    return true;
  } catch (error) {
    console.error("❌ Error:", error);
    return false;
  }
}

async function testPaymentConfirmationEmail() {
  console.log("5. Testing Payment Confirmation Email...");
  try {
    const { data, error } = await resend.emails.send({
      from: "OJO Tours <payments@ojotours.com>",
      to: TEST_EMAIL,
      subject: "Test: Payment Confirmation",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a5f2a;">Payment Received!</h1>
          <p>This is a test payment confirmation email.</p>
          <p>Best regards,<br>OJO Tours Team</p>
        </div>
      `,
    });

    if (error) {
      console.error("❌ Failed:", error);
      return false;
    }
    console.log("✅ Payment confirmation email sent successfully");
    return true;
  } catch (error) {
    console.error("❌ Error:", error);
    return false;
  }
}

async function testRefundNotificationEmail() {
  console.log("6. Testing Refund Notification Email...");
  try {
    const { data, error } = await resend.emails.send({
      from: "OJO Tours <payments@ojotours.com>",
      to: TEST_EMAIL,
      subject: "Test: Refund Processed",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #d32f2f;">Refund Processed</h1>
          <p>This is a test refund notification email.</p>
          <p>Best regards,<br>OJO Tours Team</p>
        </div>
      `,
    });

    if (error) {
      console.error("❌ Failed:", error);
      return false;
    }
    console.log("✅ Refund notification email sent successfully");
    return true;
  } catch (error) {
    console.error("❌ Error:", error);
    return false;
  }
}

async function testPaymentReminderEmail() {
  console.log("7. Testing Payment Reminder Email...");
  try {
    const { data, error } = await resend.emails.send({
      from: "OJO Tours <bookings@ojotours.com>",
      to: TEST_EMAIL,
      subject: "Test: Payment Reminder",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #ff9800;">Payment Reminder</h1>
          <p>This is a test payment reminder email.</p>
          <p>Best regards,<br>OJO Tours Team</p>
        </div>
      `,
    });

    if (error) {
      console.error("❌ Failed:", error);
      return false;
    }
    console.log("✅ Payment reminder email sent successfully");
    return true;
  } catch (error) {
    console.error("❌ Error:", error);
    return false;
  }
}

async function runAllTests() {
  console.log("Starting Email Notification Tests...\n");

  const results = {
    bookingConfirmation: await testBookingConfirmationEmail(),
    cancellation: await testCancellationEmail(),
    waitlistConfirmation: await testWaitlistConfirmationEmail(),
    waitlistAvailability: await testWaitlistAvailabilityEmail(),
    paymentConfirmation: await testPaymentConfirmationEmail(),
    refundNotification: await testRefundNotificationEmail(),
    paymentReminder: await testPaymentReminderEmail(),
  };

  console.log("\n==================================");
  console.log("Test Results Summary:");
  console.log("==================================");

  const passed = Object.values(results).filter((r) => r).length;
  const total = Object.keys(results).length;

  Object.entries(results).forEach(([test, result]) => {
    console.log(
      `${result ? "✅" : "❌"} ${test}: ${result ? "PASSED" : "FAILED"}`,
    );
  });

  console.log(`\nTotal: ${passed}/${total} tests passed`);

  if (passed === total) {
    console.log("🎉 All email notification tests passed!");
  } else {
    console.log("⚠️ Some tests failed. Please check the errors above.");
  }

  process.exit(passed === total ? 0 : 1);
}

// Run the tests
runAllTests().catch((error) => {
  console.error("Fatal error running tests:", error);
  process.exit(1);
});
