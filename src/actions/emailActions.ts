"use server";

import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

// Send booking confirmation email
export async function sendBookingConfirmationEmail(bookingId: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        payments: true,
      },
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    const item =
      booking.itemType === "Tour"
        ? await prisma.tour.findUnique({ where: { id: booking.itemId } })
        : await prisma.lodge.findUnique({ where: { id: booking.itemId } });

    if (!item) {
      return { success: false, error: "Item not found" };
    }

    const itemName =
      booking.itemType === "Tour" ? (item as any).title : (item as any).name;

    const { data, error } = await resend.emails.send({
      from: "OJO Tours <bookings@ojotours.com>",
      to: booking.customerEmail,
      subject: `Booking Confirmation - ${itemName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a5f2a;">Booking Confirmed!</h1>
          <p>Dear ${booking.customerName},</p>
          <p>Your booking has been confirmed. Here are your booking details:</p>

          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">${itemName}</h2>
            <p><strong>Type:</strong> ${booking.itemType}</p>
            <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
            <p><strong>Guests:</strong> ${booking.guests}</p>
            <p><strong>Total Price:</strong> $${booking.totalPrice} ${booking.currency}</p>
            <p><strong>Payment Type:</strong> ${booking.paymentType}</p>
            ${booking.depositAmount ? `<p><strong>Deposit Amount:</strong> $${booking.depositAmount.toFixed(2)}</p>` : ""}
            ${booking.remainingAmount && booking.remainingAmount > 0 ? `<p><strong>Remaining Amount:</strong> $${booking.remainingAmount.toFixed(2)}</p>` : ""}
            ${booking.specialRequests ? `<p><strong>Special Requests:</strong> ${booking.specialRequests}</p>` : ""}
          </div>

          <p><strong>Booking ID:</strong> ${booking.id}</p>
          <p><strong>Status:</strong> ${booking.status}</p>

          ${
            booking.paymentType === "Deposit" &&
            booking.remainingAmount &&
            booking.remainingAmount > 0
              ? `
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <h3 style="margin-top: 0; color: #856404;">Payment Reminder</h3>
              <p style="color: #856404;">A deposit of $${booking.depositAmount?.toFixed(2)} is required to confirm your booking. The remaining amount of $${booking.remainingAmount.toFixed(2)} is due before your trip date.</p>
            </div>
          `
              : ""
          }

          <p>We look forward to seeing you!</p>
          <p>Best regards,<br>OJO Tours Team</p>
        </div>
      `,
    });

    if (error) {
      console.error("Email error:", error);
      return { success: false, error };
    }

    // Mark confirmation as sent
    await prisma.booking.update({
      where: { id: bookingId },
      data: { confirmationSent: true },
    });

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send booking confirmation email:", error);
    return { success: false, error: "Failed to send email" };
  }
}

// Send cancellation email
export async function sendCancellationEmail(
  booking: any,
  refundAmount: number,
  refundPercentage: number,
) {
  try {
    const item =
      booking.itemType === "Tour"
        ? await prisma.tour.findUnique({ where: { id: booking.itemId } })
        : await prisma.lodge.findUnique({ where: { id: booking.itemId } });

    if (!item) {
      return { success: false, error: "Item not found" };
    }

    const itemName =
      booking.itemType === "Tour" ? (item as any).title : (item as any).name;

    const { data, error } = await resend.emails.send({
      from: "OJO Tours <bookings@ojotours.com>",
      to: booking.customerEmail,
      subject: `Booking Cancelled - ${itemName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #d32f2f;">Booking Cancelled</h1>
          <p>Dear ${booking.customerName},</p>
          <p>Your booking has been cancelled. Here are the details:</p>

          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">${itemName}</h2>
            <p><strong>Type:</strong> ${booking.itemType}</p>
            <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
            <p><strong>Guests:</strong> ${booking.guests}</p>
            <p><strong>Original Price:</strong> $${booking.totalPrice} ${booking.currency}</p>
          </div>
          
          <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Refund Information</h3>
            <p><strong>Refund Percentage:</strong> ${refundPercentage}%</p>
            <p><strong>Refund Amount:</strong> $${refundAmount.toFixed(2)} ${booking.currency}</p>
            <p>Your refund will be processed within 5-7 business days.</p>
          </div>
          
          ${booking.cancellationReason ? `<p><strong>Cancellation Reason:</strong> ${booking.cancellationReason}</p>` : ""}
          
          <p>We hope to see you again in the future!</p>
          <p>Best regards,<br>OJO Tours Team</p>
        </div>
      `,
    });

    if (error) {
      console.error("Email error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send cancellation email:", error);
    return { success: false, error: "Failed to send email" };
  }
}

// Send waitlist confirmation email
export async function sendWaitlistConfirmationEmail(waitlistEntry: any) {
  try {
    const item =
      waitlistEntry.itemType === "Tour"
        ? await prisma.tour.findUnique({ where: { id: waitlistEntry.itemId } })
        : await prisma.lodge.findUnique({
            where: { id: waitlistEntry.itemId },
          });

    if (!item) {
      return { success: false, error: "Item not found" };
    }

    const itemName =
      waitlistEntry.itemType === "Tour"
        ? (item as any).title
        : (item as any).name;

    const { data, error } = await resend.emails.send({
      from: "OJO Tours <bookings@ojotours.com>",
      to: waitlistEntry.customerEmail,
      subject: `Waitlist Confirmation - ${itemName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a5f2a;">Added to Waitlist!</h1>
          <p>Dear ${waitlistEntry.customerName},</p>
          <p>You have been successfully added to the waitlist for:</p>

          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">${itemName}</h2>
            <p><strong>Type:</strong> ${waitlistEntry.itemType}</p>
            <p><strong>Preferred Date:</strong> ${new Date(waitlistEntry.preferredDate).toLocaleDateString()}</p>
            <p><strong>Guests:</strong> ${waitlistEntry.guests}</p>
          </div>
          
          <p>We will contact you as soon as a spot becomes available. Waitlist entries are typically processed within 24-48 hours of availability.</p>
          
          <p><strong>Waitlist ID:</strong> ${waitlistEntry.id}</p>
          
          <p>Best regards,<br>OJO Tours Team</p>
        </div>
      `,
    });

    if (error) {
      console.error("Email error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send waitlist confirmation email:", error);
    return { success: false, error: "Failed to send email" };
  }
}

// Send waitlist availability notification
export async function sendWaitlistAvailabilityNotification(waitlistId: string) {
  try {
    const waitlistEntry = await prisma.waitlist.findUnique({
      where: { id: waitlistId },
    });

    if (!waitlistEntry) {
      return { success: false, error: "Waitlist entry not found" };
    }

    const item =
      waitlistEntry.itemType === "Tour"
        ? await prisma.tour.findUnique({ where: { id: waitlistEntry.itemId } })
        : await prisma.lodge.findUnique({
            where: { id: waitlistEntry.itemId },
          });

    if (!item) {
      return { success: false, error: "Item not found" };
    }

    const itemName =
      waitlistEntry.itemType === "Tour"
        ? (item as any).title
        : (item as any).name;

    const { data, error } = await resend.emails.send({
      from: "OJO Tours <bookings@ojotours.com>",
      to: waitlistEntry.customerEmail,
      subject: `Spot Available - ${itemName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a5f2a;">Good News! A Spot is Available</h1>
          <p>Dear ${waitlistEntry.customerName},</p>
          <p>A spot has become available for your waitlisted item:</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">${itemName}</h2>
            <p><strong>Type:</strong> ${waitlistEntry.itemType}</p>
            <p><strong>Date:</strong> ${new Date(waitlistEntry.preferredDate).toLocaleDateString()}</p>
            <p><strong>Guests:</strong> ${waitlistEntry.guests}</p>
          </div>
          
          <p>Please contact us within 24 hours to secure your booking. After 24 hours, the spot will be offered to the next person on the waitlist.</p>
          
          <p><strong>Contact:</strong> bookings@ojotours.com</p>
          
          <p>Best regards,<br>OJO Tours Team</p>
        </div>
      `,
    });

    if (error) {
      console.error("Email error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send waitlist availability notification:", error);
    return { success: false, error: "Failed to send email" };
  }
}

// Send payment reminder email
export async function sendPaymentReminderEmail(
  bookingId: string,
  installmentNumber: number,
  amount: number,
  dueDate: Date,
) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    const { data, error } = await resend.emails.send({
      from: "OJO Tours <bookings@ojotours.com>",
      to: booking.customerEmail,
      subject: `Payment Reminder - Installment #${installmentNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #ff9800;">Payment Reminder</h1>
          <p>Dear ${booking.customerName},</p>
          <p>This is a friendly reminder that your next payment is due:</p>
          
          <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Installment #${installmentNumber}</h3>
            <p><strong>Amount:</strong> $${amount.toFixed(2)} ${booking.currency}</p>
            <p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
          </div>
          
          <p>Please ensure your payment is made by the due date to avoid any late fees or booking cancellation.</p>
          
          <p><strong>Booking ID:</strong> ${booking.id}</p>
          
          <p>Best regards,<br>OJO Tours Team</p>
        </div>
      `,
    });

    if (error) {
      console.error("Email error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send payment reminder email:", error);
    return { success: false, error: "Failed to send email" };
  }
}
