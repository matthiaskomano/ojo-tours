"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { Resend } from "resend";
import { requireMinimumRole, AuthorizationError } from "@/lib/authorization";

// Initialize the Resend client with your secure environment variable
const resend = new Resend(process.env.RESEND_API_KEY);

// 1. Fetch all bookings for the Admin Dashboard (requires STAFF or higher)
export async function getBookings() {
  noStore();
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Fetch item names for each booking
    const bookingIds = bookings.map((b) => b.itemId);
    const tours = await prisma.tour.findMany({
      where: { id: { in: bookingIds } },
      select: { id: true, title: true },
    });
    const lodges = await prisma.lodge.findMany({
      where: { id: { in: bookingIds } },
      select: { id: true, name: true },
    });

    const tourMap = new Map(tours.map((t) => [t.id, t.title]));
    const lodgeMap = new Map(lodges.map((l) => [l.id, l.name]));

    // Add itemName to each booking
    return bookings.map((booking) => ({
      ...booking,
      itemName:
        booking.itemType === "Tour"
          ? tourMap.get(booking.itemId) || "Unknown Tour"
          : lodgeMap.get(booking.itemId) || "Unknown Lodge",
    }));
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
    return [];
  }
}

// 1.5. Fetch bookings with pagination, sort, and filter (requires STAFF or higher)
export async function getBookingsWithPagination(params: {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: string;
  itemType?: string;
  search?: string;
}) {
  noStore();
  try {
    // Authorization check - requires STAFF or higher
    await requireMinimumRole("STAFF");

    const {
      page = 1,
      pageSize = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      status,
      itemType,
      search,
    } = params;

    // Build where clause for filters
    const where: any = {};

    if (status && status !== "all") {
      where.status = status;
    }

    if (itemType && itemType !== "all") {
      where.itemType = itemType;
    }

    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: "insensitive" } },
        { customerEmail: { contains: search, mode: "insensitive" } },
        { itemId: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get total count for pagination
    const total = await prisma.booking.count({ where });

    // Get paginated data
    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // Fetch item names for each booking
    const bookingIds = bookings.map((b) => b.itemId);
    const tours = await prisma.tour.findMany({
      where: { id: { in: bookingIds } },
      select: { id: true, title: true },
    });
    const lodges = await prisma.lodge.findMany({
      where: { id: { in: bookingIds } },
      select: { id: true, name: true },
    });

    const tourMap = new Map(tours.map((t) => [t.id, t.title]));
    const lodgeMap = new Map(lodges.map((l) => [l.id, l.name]));

    // Add itemName to each booking
    const bookingsWithNames = bookings.map((booking) => ({
      ...booking,
      itemName:
        booking.itemType === "Tour"
          ? tourMap.get(booking.itemId) || "Unknown Tour"
          : lodgeMap.get(booking.itemId) || "Unknown Lodge",
    }));

    return {
      bookings: bookingsWithNames,
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
    console.error("Failed to fetch bookings with pagination:", error);
    return {
      bookings: [],
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0,
    };
  }
}

// 1.6. Fetch confirmed bookings for payment selection (requires STAFF or higher)
export async function getConfirmedBookings() {
  noStore();
  try {
    // Authorization check - requires STAFF or higher
    await requireMinimumRole("STAFF");

    const bookings = await prisma.booking.findMany({
      where: { status: "Confirmed" },
      orderBy: { createdAt: "desc" },
    });

    // Fetch item names for each booking
    const bookingIds = bookings.map((b) => b.itemId);
    const tours = await prisma.tour.findMany({
      where: { id: { in: bookingIds } },
      select: { id: true, title: true },
    });
    const lodges = await prisma.lodge.findMany({
      where: { id: { in: bookingIds } },
      select: { id: true, name: true },
    });

    const tourMap = new Map(tours.map((t) => [t.id, t.title]));
    const lodgeMap = new Map(lodges.map((l) => [l.id, l.name]));

    // Add itemName to each booking
    return bookings.map((booking) => ({
      id: booking.id,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      itemType: booking.itemType,
      itemId: booking.itemId,
      itemName:
        booking.itemType === "Tour"
          ? tourMap.get(booking.itemId) || "Unknown Tour"
          : lodgeMap.get(booking.itemId) || "Unknown Lodge",
      date: booking.date,
      totalPrice: booking.totalPrice,
      status: booking.status,
    }));
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to fetch confirmed bookings:", error);
    return [];
  }
}

// 2. Add a new booking & Trigger Email Notification (For Standard Tours/Lodges)
export async function addBooking(formData: FormData) {
  try {
    // Extract data from the form
    const itemId = formData.get("itemId") as string;
    const itemType = formData.get("itemType") as "Tour" | "Lodge";
    const customerName = formData.get("customerName") as string;
    const customerEmail = formData.get("customerEmail") as string;
    const customerPhone = formData.get("customerPhone") as string;
    const date = formData.get("date") as string;
    const guests = parseInt(formData.get("guests") as string);
    const totalPrice = parseFloat(formData.get("totalPrice") as string);
    const paymentType = formData.get("paymentType") as "Full" | "Deposit";
    const depositAmount = formData.get("depositAmount")
      ? parseFloat(formData.get("depositAmount") as string)
      : null;
    const specialRequests = formData.get("specialRequests") as string;

    // Get current user if authenticated
    const { getCurrentUserWithRole } = await import("@/lib/auth");
    const user = await getCurrentUserWithRole();

    // Check availability
    const { checkAvailability, updateBookedSlots } =
      await import("./availabilityActions");
    const availabilityCheck = await checkAvailability(
      itemId,
      itemType,
      new Date(date),
      guests,
    );

    if (!availabilityCheck.available) {
      throw new Error(
        availabilityCheck.reason || "No availability for this date",
      );
    }

    // A. Save to Database
    const booking = await prisma.booking.create({
      data: {
        itemId,
        itemType,
        customerName,
        customerEmail,
        customerPhone,
        date: new Date(date),
        guests,
        totalPrice,
        paymentType,
        depositAmount,
        depositPaid: false,
        remainingAmount:
          paymentType === "Deposit" ? totalPrice - (depositAmount || 0) : 0,
        currency: "USD",
        specialRequests,
        status: "Pending", // Always starts as pending
        userId: user?.id || null, // Link to user if authenticated
      },
    });

    // Update booked slots
    await updateBookedSlots(itemId, itemType, new Date(date), guests, true);

    // Get item name for notifications
    const item =
      itemType === "Tour"
        ? await prisma.tour.findUnique({ where: { id: itemId } })
        : await prisma.lodge.findUnique({ where: { id: itemId } });

    const itemName =
      itemType === "Tour" ? (item as any)?.title : (item as any)?.name;

    // B. Create notification for authenticated user (tourist)
    if (user?.id) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "Booking Received",
          message: `Your booking has been received and is pending confirmation.`,
          type: "booking",
        },
      });
    }

    // C. Create notification for admins about new booking
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
          title: "New Booking Received",
          message: `A new booking has been received from ${customerName} for ${itemName}.`,
          type: "booking",
        },
      });
    }

    // B. FIRE THE EMAIL NOTIFICATION!

    await resend.emails.send({
      from: "OJO Tours <onboarding@resend.dev>", // Resend's default testing address
      to: "komanomatthias9@gmail.com", // ⚠️ CHANGE THIS to the email you used to create your Resend account!
      subject: `🚨 New Booking Alert: ${itemName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #D4AF37;">New Reservation Request</h2>
          <p>You just received a new booking request from your website!</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Client:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${customerName}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${customerEmail}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${customerPhone || "N/A"}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Expedition:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${itemName}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Date:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${date}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Guests:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${guests}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Payment Type:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${paymentType}</td></tr>
            ${depositAmount ? `<tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Deposit Required:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">$${depositAmount.toFixed(2)}</td></tr>` : ""}
            ${paymentType === "Deposit" ? `<tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Remaining Balance:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">$${(totalPrice - (depositAmount || 0)).toFixed(2)}</td></tr>` : ""}
            <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Est. Total:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee; color: #D4AF37; font-weight: bold;">$${totalPrice.toFixed(2)}</td></tr>
          </table>

          <p style="margin-top: 30px; font-size: 12px; color: #888;">Log in to your Command Center to Confirm or Decline this request.</p>
        </div>
      `,
    });

    // Refresh the admin dashboard so the new booking shows up instantly
    revalidatePath("/admin");
    revalidatePath("/dashboard/admin/bookings");
    revalidatePath("/tours/[id]");

    return { success: true, booking };
  } catch (error) {
    console.error("Failed to submit booking or send email:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to submit booking",
    };
  }
}

// 3. Update the status (Pending -> Confirmed -> Declined) - requires STAFF or higher
export async function updateBookingStatus(id: string, newStatus: string) {
  try {
    // Authorization check - requires STAFF or higher
    await requireMinimumRole("STAFF");

    // Get the booking first to get userId and itemId
    const booking = await prisma.booking.findUnique({
      where: { id: id },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    // Get item name for notification
    const item =
      booking.itemType === "Tour"
        ? await prisma.tour.findUnique({ where: { id: booking.itemId } })
        : await prisma.lodge.findUnique({ where: { id: booking.itemId } });

    const itemName =
      booking.itemType === "Tour"
        ? (item as any)?.title
        : (item as any)?.name || "Unknown";

    // Update the booking status
    const updateData: any = { status: newStatus };

    if (newStatus === "Confirmed") {
      updateData.confirmedAt = new Date();
    }

    await prisma.booking.update({
      where: { id: id },
      data: updateData,
    });

    // Create notification for the user if they have an account
    if (booking.userId) {
      await prisma.notification.create({
        data: {
          userId: booking.userId,
          title: `Booking ${newStatus}`,
          message: `Your booking for ${itemName} has been ${newStatus.toLowerCase()}.`,
          type: "booking",
        },
      });
      console.log(
        `[Notification] Created notification for user ${booking.userId} for booking status change to ${newStatus}`,
      );
    }

    // Create notification for admins about booking status change
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
          title: `Booking Status Updated`,
          message: `Booking for ${itemName} has been ${newStatus.toLowerCase()} by ${booking.customerName}.`,
          type: "booking",
        },
      });
    }

    // Send payment reminder email if booking is confirmed and payment is pending
    if (
      newStatus === "Confirmed" &&
      !booking.depositPaid &&
      booking.paymentType === "Deposit"
    ) {
      const { sendPaymentReminderEmail } = await import("./paymentActions");
      await sendPaymentReminderEmail(booking.id);
    }

    // Send confirmation email if status is Confirmed
    if (newStatus === "Confirmed" && !booking.confirmationSent) {
      const { sendBookingConfirmationEmail } = await import("./emailActions");
      await sendBookingConfirmationEmail(id);
    }

    revalidatePath("/admin");
    revalidatePath("/dashboard/tourist/notifications");
    revalidatePath("/dashboard/admin/bookings");
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to update booking status:", error);
    throw error;
  }
}

// 4. Delete a spam/old booking - requires ADMIN or higher
export async function deleteBooking(id: string) {
  try {
    // Authorization check - requires ADMIN or higher
    await requireMinimumRole("ADMIN");

    await prisma.booking.delete({
      where: { id: id },
    });
    revalidatePath("/admin");
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to delete booking:", error);
    throw error;
  }
}

// 🚀 5. NEW: Handle Custom Itinerary Requests from the Modal
export async function createItineraryBooking(data: any) {
  try {
    // Get current user if authenticated
    const { getCurrentUserWithRole } = await import("@/lib/auth");
    const user = await getCurrentUserWithRole();

    // A. Save to Database
    const booking = await prisma.booking.create({
      data: {
        itemId: "custom", // Use a placeholder ID for custom requests
        itemType: "Custom Itinerary", // Tells the admin page what kind of request this is
        customerName: data.fullName,
        customerEmail: data.email,
        date: data.date,
        guests: data.guests,
        totalPrice: 0, // Since it's a custom request, price is TBD
        status: "Pending",
        userId: user?.id || null, // Link to user if authenticated
      },
    });

    // B. Create notification for authenticated user
    if (user?.id) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "Custom Itinerary Request Received",
          message: `Your custom itinerary request for ${data.experience} has been received and is pending review.`,
          type: "booking",
        },
      });
    }

    // C. Create notification for admins about custom itinerary request
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
          title: "New Custom Itinerary Request",
          message: `Custom itinerary request received from ${data.fullName} for ${data.experience}.`,
          type: "booking",
        },
      });
    }

    // B. FIRE THE EMAIL NOTIFICATION!
    await resend.emails.send({
      from: "OJO Tours <onboarding@resend.dev>",
      to: "komanomatthias9@gmail.com", // ⚠️ MAKE SURE THIS MATCHES YOUR RESEND ACCOUNT EMAIL
      subject: `✨ New Custom Itinerary Request: ${data.experience}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #D4AF37;">New Custom Itinerary Request</h2>
          <p>A client wants to plan a bespoke adventure!</p>

          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Client:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.fullName}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.email}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.phone}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Experience:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.experience}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Date:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.date}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Guests:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.guests}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Special Requests:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.specialRequests || "None provided"}</td></tr>
          </table>

          <p style="margin-top: 30px; font-size: 12px; color: #888;">Log in to your Command Center to view this request.</p>
        </div>
      `,
    });

    // Instantly refresh the admin dashboard so the new request appears
    revalidatePath("/admin");
  } catch (error) {
    console.error("Failed to create itinerary booking:", error);
  }
}
