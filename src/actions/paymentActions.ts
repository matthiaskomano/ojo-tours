"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import {
  requireAuth,
  requireMinimumRole,
  AuthorizationError,
} from "@/lib/authorization";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Record a manual payment (admin/staff marking payment as received)
export async function recordPayment(data: {
  bookingId: string;
  amount: number;
  paymentMethod: string;
  paymentType: "Full" | "Deposit" | "Installment";
  transactionId?: string;
  notes?: string;
}) {
  noStore();
  try {
    await requireMinimumRole("STAFF");

    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: data.bookingId },
      include: { user: true },
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId: booking.userId || "system",
        bookingId: data.bookingId,
        amount: data.amount,
        currency: booking.currency,
        status: "Completed",
        paymentMethod: data.paymentMethod,
        paymentType: data.paymentType,
        transactionId: data.transactionId || `MANUAL-${Date.now()}`,
        metadata: {
          notes: data.notes,
          recordedBy: "staff",
          recordedAt: new Date().toISOString(),
        },
      },
    });

    // Update booking deposit status if this is a deposit payment
    if (data.paymentType === "Deposit") {
      await prisma.booking.update({
        where: { id: data.bookingId },
        data: {
          depositPaid: true,
          remainingAmount: booking.totalPrice - data.amount,
        },
      });
    }

    // Send payment confirmation email
    await sendPaymentConfirmationEmail(payment.id);

    // Create notification for user
    if (booking.userId) {
      await prisma.notification.create({
        data: {
          userId: booking.userId,
          title: "Payment Received",
          message: `Your payment of $${data.amount.toFixed(2)} has been received and confirmed.`,
          type: "payment",
        },
      });
    }

    // Create notification for admins about payment
    const admins = await prisma.user.findMany({
      where: {
        role: {
          name: {
            in: ["ADMIN", "SUPER_ADMIN"],
          },
        },
      },
      select: { id: true },
    });

    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: "Payment Received",
          message: `Payment of $${data.amount.toFixed(2)} received from ${booking.customerName} for booking #${booking.id}.`,
          type: "payment",
        },
      });
    }

    revalidatePath("/dashboard/admin/bookings");
    revalidatePath("/dashboard/tourist/payments");
    revalidatePath("/dashboard/tourist/bookings");

    return { success: true, payment };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to record payment:", error);
    return { success: false, error: "Failed to record payment" };
  }
}

// Record a refund (manual refund processing)
export async function recordRefund(data: {
  paymentId: string;
  refundAmount: number;
  refundReason: string;
  processedBy: string;
}) {
  noStore();
  try {
    await requireMinimumRole("STAFF");

    // Get payment details
    const payment = await prisma.payment.findUnique({
      where: { id: data.paymentId },
      include: { booking: true, user: true },
    });

    if (!payment) {
      return { success: false, error: "Payment not found" };
    }

    if (payment.status !== "Completed") {
      return { success: false, error: "Can only refund completed payments" };
    }

    if (data.refundAmount > payment.amount) {
      return {
        success: false,
        error: "Refund amount cannot exceed payment amount",
      };
    }

    // Update payment as refunded
    const updatedPayment = await prisma.payment.update({
      where: { id: data.paymentId },
      data: {
        status: "Refunded",
        refundedAt: new Date(),
        refundReason: data.refundReason,
        metadata: {
          ...((payment.metadata as Record<string, any>) || {}),
          refundAmount: data.refundAmount,
          processedBy: data.processedBy,
          processedAt: new Date().toISOString(),
        },
      },
    });

    // Send refund notification email
    await sendRefundNotificationEmail(
      payment.id,
      data.refundAmount,
      data.refundReason,
    );

    // Create notification for user
    if (payment.userId) {
      await prisma.notification.create({
        data: {
          userId: payment.userId,
          title: "Refund Processed",
          message: `Your refund of $${data.refundAmount.toFixed(2)} has been processed.`,
          type: "payment",
        },
      });
    }

    // Create notification for admins about refund
    const admins = await prisma.user.findMany({
      where: {
        role: {
          name: {
            in: ["ADMIN", "SUPER_ADMIN"],
          },
        },
      },
      select: { id: true },
    });

    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: "Refund Processed",
          message: `Refund of $${data.refundAmount.toFixed(2)} processed for payment #${payment.id}.`,
          type: "payment",
        },
      });
    }

    revalidatePath("/dashboard/admin/bookings");
    revalidatePath("/dashboard/tourist/payments");

    return { success: true, payment: updatedPayment };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to record refund:", error);
    return { success: false, error: "Failed to record refund" };
  }
}

// Get payment history for a booking
export async function getBookingPayments(bookingId: string) {
  noStore();
  try {
    await requireAuth();

    const payments = await prisma.payment.findMany({
      where: { bookingId },
      orderBy: { createdAt: "desc" },
    });

    return payments;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to get booking payments:", error);
    return [];
  }
}

// Get all payments (admin/staff)
export async function getAllPayments(params: {
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
}) {
  noStore();
  try {
    await requireMinimumRole("STAFF");

    const { page = 1, pageSize = 20, status, search } = params;

    const where: any = {};

    if (status && status !== "all") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { transactionId: { contains: search, mode: "insensitive" } },
        { paymentMethod: { contains: search, mode: "insensitive" } },
      ];
    }

    const total = await prisma.payment.count({ where });

    const payments = await prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        booking: {
          select: {
            id: true,
            customerName: true,
            customerEmail: true,
            itemType: true,
            itemId: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    return {
      payments,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to get all payments:", error);
    return {
      payments: [],
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 0,
    };
  }
}

// Get payment statistics
export async function getPaymentStats() {
  noStore();
  try {
    await requireMinimumRole("STAFF");

    const [
      totalPayments,
      completedPayments,
      pendingPayments,
      refundedPayments,
      totalRevenue,
    ] = await Promise.all([
      prisma.payment.count(),
      prisma.payment.count({ where: { status: "Completed" } }),
      prisma.payment.count({ where: { status: "Pending" } }),
      prisma.payment.count({ where: { status: "Refunded" } }),
      prisma.payment.aggregate({
        where: { status: "Completed" },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalPayments,
      completedPayments,
      pendingPayments,
      refundedPayments,
      totalRevenue: totalRevenue._sum.amount || 0,
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to get payment stats:", error);
    return {
      totalPayments: 0,
      completedPayments: 0,
      pendingPayments: 0,
      refundedPayments: 0,
      totalRevenue: 0,
    };
  }
}

// Send payment confirmation email
async function sendPaymentConfirmationEmail(paymentId: string) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: true,
        user: true,
      },
    });

    if (!payment || !payment.booking) {
      return { success: false, error: "Payment or booking not found" };
    }

    const item =
      payment.booking.itemType === "Tour"
        ? await prisma.tour.findUnique({
            where: { id: payment.booking.itemId },
          })
        : await prisma.lodge.findUnique({
            where: { id: payment.booking.itemId },
          });

    const itemName =
      payment.booking.itemType === "Tour"
        ? (item as any)?.title
        : (item as any)?.name;

    const { data, error } = await resend.emails.send({
      from: "OJO Tours <payments@ojotours.com>",
      to: payment.booking.customerEmail,
      subject: `Payment Confirmation - ${itemName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a5f2a;">Payment Received!</h1>
          <p>Dear ${payment.booking.customerName},</p>
          <p>We have successfully received your payment. Here are the details:</p>

          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">${itemName}</h2>
            <p><strong>Payment Amount:</strong> $${payment.amount.toFixed(2)} ${payment.currency}</p>
            <p><strong>Payment Type:</strong> ${payment.paymentType}</p>
            <p><strong>Payment Method:</strong> ${payment.paymentMethod}</p>
            <p><strong>Transaction ID:</strong> ${payment.transactionId}</p>
            <p><strong>Date:</strong> ${new Date(payment.createdAt).toLocaleDateString()}</p>
          </div>
          
          <p><strong>Booking ID:</strong> ${payment.bookingId}</p>
          <p><strong>Payment Status:</strong> ${payment.status}</p>
          
          <p>Thank you for your payment!</p>
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
    console.error("Failed to send payment confirmation email:", error);
    return { success: false, error: "Failed to send email" };
  }
}

// Send refund notification email
async function sendRefundNotificationEmail(
  paymentId: string,
  refundAmount: number,
  refundReason: string,
) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: true,
        user: true,
      },
    });

    if (!payment || !payment.booking) {
      return { success: false, error: "Payment or booking not found" };
    }

    const item =
      payment.booking.itemType === "Tour"
        ? await prisma.tour.findUnique({
            where: { id: payment.booking.itemId },
          })
        : await prisma.lodge.findUnique({
            where: { id: payment.booking.itemId },
          });

    const itemName =
      payment.booking.itemType === "Tour"
        ? (item as any)?.title
        : (item as any)?.name;

    const { data, error } = await resend.emails.send({
      from: "OJO Tours <payments@ojotours.com>",
      to: payment.booking.customerEmail,
      subject: `Refund Processed - ${itemName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #d32f2f;">Refund Processed</h1>
          <p>Dear ${payment.booking.customerName},</p>
          <p>We have processed your refund. Here are the details:</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">${itemName}</h2>
            <p><strong>Original Payment:</strong> $${payment.amount.toFixed(2)} ${payment.currency}</p>
            <p><strong>Refund Amount:</strong> $${refundAmount.toFixed(2)} ${payment.currency}</p>
            <p><strong>Refund Reason:</strong> ${refundReason}</p>
            <p><strong>Transaction ID:</strong> ${payment.transactionId}</p>
          </div>
          
          <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p>Your refund will be processed within 5-7 business days to your original payment method.</p>
          </div>
          
          <p><strong>Booking ID:</strong> ${payment.bookingId}</p>
          
          <p>We apologize for any inconvenience and hope to see you again in the future!</p>
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
    console.error("Failed to send refund notification email:", error);
    return { success: false, error: "Failed to send email" };
  }
}

// Send payment reminder email
export async function sendPaymentReminderEmail(bookingId: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    const item =
      booking.itemType === "Tour"
        ? await prisma.tour.findUnique({ where: { id: booking.itemId } })
        : await prisma.lodge.findUnique({ where: { id: booking.itemId } });

    const itemName =
      booking.itemType === "Tour" ? (item as any)?.title : (item as any)?.name;

    const { data, error } = await resend.emails.send({
      from: "OJO Tours <payments@ojotours.com>",
      to: booking.customerEmail,
      subject: `Payment Reminder - ${itemName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f57c00;">Payment Reminder</h1>
          <p>Dear ${booking.customerName},</p>
          <p>This is a friendly reminder about your upcoming payment:</p>

          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">${itemName}</h2>
            <p><strong>Booking Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong> $${booking.totalPrice.toFixed(2)} ${booking.currency}</p>
            <p><strong>Payment Type:</strong> ${booking.paymentType}</p>
            ${booking.depositAmount ? `<p><strong>Deposit Amount:</strong> $${booking.depositAmount.toFixed(2)}</p>` : ""}
            ${booking.remainingAmount && booking.remainingAmount > 0 ? `<p><strong>Remaining Amount:</strong> $${booking.remainingAmount.toFixed(2)}</p>` : ""}
          </div>

          <p><strong>Booking ID:</strong> ${booking.id}</p>
          <p><strong>Status:</strong> ${booking.status}</p>

          <p>Please complete your payment to confirm your booking.</p>
          <p>If you have any questions, please don't hesitate to contact us.</p>
          
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
