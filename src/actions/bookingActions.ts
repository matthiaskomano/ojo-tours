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
    // Authorization check - requires STAFF or higher
    await requireMinimumRole("STAFF");

    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
    });
    return bookings;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
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
        { itemName: { contains: search, mode: "insensitive" } },
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

    return {
      bookings,
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

// 2. Add a new booking & Trigger Email Notification (For Standard Tours/Lodges)
export async function addBooking(formData: FormData) {
  try {
    // Extract data from the form
    const itemName = formData.get("itemName") as string;
    const itemType = formData.get("itemType") as string;
    const customerName = formData.get("customerName") as string;
    const customerEmail = formData.get("customerEmail") as string;
    const date = formData.get("date") as string;
    const guests = formData.get("guests") as string;
    const totalPrice = formData.get("totalPrice") as string;

    // Get current user if authenticated
    const { getCurrentUserWithRole } = await import("@/lib/auth");
    const user = await getCurrentUserWithRole();

    // A. Save to Database
    const booking = await prisma.booking.create({
      data: {
        itemName,
        itemType,
        customerName,
        customerEmail,
        date,
        guests,
        totalPrice,
        status: "Pending", // Always starts as pending
        userId: user?.id || null, // Link to user if authenticated
      },
    });

    // B. Create notification for authenticated user
    if (user?.id) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "Booking Received",
          message: `Your booking for ${itemName} has been received and is pending confirmation.`,
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
            <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Expedition:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${itemName}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Date:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${date}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Guests:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${guests}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Est. Total:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee; color: #D4AF37; font-weight: bold;">${totalPrice}</td></tr>
          </table>

          <p style="margin-top: 30px; font-size: 12px; color: #888;">Log in to your Command Center to Confirm or Decline this request.</p>
        </div>
      `,
    });

    // Refresh the admin dashboard so the new booking shows up instantly
    revalidatePath("/admin");
  } catch (error) {
    console.error("Failed to submit booking or send email:", error);
  }
}

// 3. Update the status (Pending -> Confirmed -> Declined) - requires STAFF or higher
export async function updateBookingStatus(id: string, newStatus: string) {
  try {
    // Authorization check - requires STAFF or higher
    await requireMinimumRole("STAFF");

    await prisma.booking.update({
      where: { id: id },
      data: { status: newStatus },
    });
    revalidatePath("/admin");
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
        itemName: data.experience, // e.g., "Silverback Gorilla Trekking"
        itemType: "Custom Itinerary", // Tells the admin page what kind of request this is
        customerName: data.fullName,
        customerEmail: data.email,
        date: data.date,
        guests: data.guests,
        totalPrice: "Pending Quote", // Since it's a custom request, price is TBD
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
