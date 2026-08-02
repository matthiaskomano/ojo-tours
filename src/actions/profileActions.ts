"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { getCurrentUserWithRole } from "@/lib/auth";
import { requireMinimumRole, AuthorizationError } from "@/lib/authorization";
import { z } from "zod";

const profileSchema = z.object({
  fullName: z.string().trim().max(100).optional(),
  avatar: z.string().trim().url().max(2_000).optional().or(z.literal("")),
  phone: z.string().trim().max(32).optional(),
  emergencyContact: z.string().trim().max(100).optional(),
  emergencyPhone: z.string().trim().max(32).optional(),
  preferences: z.string().trim().max(2_000).optional(),
});

// 1. Get current user profile
export async function getProfile() {
  noStore();
  try {
    const user = await getCurrentUserWithRole();
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    return null;
  }
}

// 2. Update user profile
export async function updateProfile(formData: FormData) {
  try {
    const user = await getCurrentUserWithRole();
    if (!user) {
      throw new Error("User not found");
    }

    const input = profileSchema.safeParse({
      fullName: formData.get("fullName") || "",
      avatar: formData.get("avatar") || "",
      phone: formData.get("phone") || "",
      emergencyContact: formData.get("emergencyContact") || "",
      emergencyPhone: formData.get("emergencyPhone") || "",
      preferences: formData.get("preferences") || "",
    });
    if (!input.success) throw new Error("Invalid profile details");

    await prisma.user.update({
      where: { id: user.id },
      data: {
        fullName: input.data.fullName || null,
        avatar: input.data.avatar || null,
        phone: input.data.phone || null,
        emergencyContact: input.data.emergencyContact || null,
        emergencyPhone: input.data.emergencyPhone || null,
        preferences: input.data.preferences
          ? { notes: input.data.preferences }
          : Prisma.JsonNull,
      },
    });

    revalidatePath("/dashboard/admin/profile");
    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/tourist/profile");
    revalidatePath("/dashboard/tourist");
  } catch (error) {
    console.error("Failed to update profile:", error);
    throw error;
  }
}
