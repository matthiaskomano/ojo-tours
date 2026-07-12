"use server";

import { prisma } from "@/lib/prisma";
import { checkAuthStatus } from "./authActions";

// Create a new contact submission
export async function createContactSubmission(data: {
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  try {
    // Check if user is authenticated
    const authResult = await checkAuthStatus();
    const userId = authResult.authenticated && authResult.user ? authResult.user.id : null;

    // Get client IP (basic implementation)
    const ipAddress = "unknown"; // In production, you'd get this from headers

    const contact = await prisma.contact.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || null,
        subject: data.subject,
        message: data.message,
        userId: userId,
        ipAddress: ipAddress,
      },
    });

    return { success: true, contact };
  } catch (error: any) {
    console.error("Error creating contact submission:", error);
    return { success: false, error: "Failed to submit contact form" };
  }
}

// Get all contact submissions (for admin)
export async function getContactSubmissions(filters?: {
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
        { fullName: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
        { subject: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const contacts = await prisma.contact.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    return contacts;
  } catch (error: any) {
    console.error("Error fetching contact submissions:", error);
    return [];
  }
}

// Get a single contact submission by ID
export async function getContactById(id: string) {
  try {
    const contact = await prisma.contact.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    return contact;
  } catch (error: any) {
    console.error("Error fetching contact:", error);
    return null;
  }
}

// Update contact status
export async function updateContactStatus(id: string, status: string) {
  try {
    const contact = await prisma.contact.update({
      where: { id },
      data: { status },
    });

    return { success: true, contact };
  } catch (error: any) {
    console.error("Error updating contact status:", error);
    return { success: false, error: "Failed to update contact status" };
  }
}

// Delete a contact submission
export async function deleteContact(id: string) {
  try {
    await prisma.contact.delete({
      where: { id },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting contact:", error);
    return { success: false, error: "Failed to delete contact" };
  }
}

// Get contact statistics for admin dashboard
export async function getContactStats() {
  try {
    const total = await prisma.contact.count();
    const newCount = await prisma.contact.count({ where: { status: "New" } });
    const inProgressCount = await prisma.contact.count({
      where: { status: "In Progress" },
    });
    const resolvedCount = await prisma.contact.count({
      where: { status: "Resolved" },
    });

    return {
      total,
      new: newCount,
      inProgress: inProgressCount,
      resolved: resolvedCount,
    };
  } catch (error: any) {
    console.error("Error fetching contact stats:", error);
    return {
      total: 0,
      new: 0,
      inProgress: 0,
      resolved: 0,
    };
  }
}
