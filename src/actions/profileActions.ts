"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { getCurrentUserWithRole } from "@/lib/auth";
import { requireMinimumRole, AuthorizationError } from "@/lib/authorization";

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

    const fullName = formData.get("fullName") as string;
    const avatar = formData.get("avatar") as string;
    const phone = formData.get("phone") as string;
    const emergencyContact = formData.get("emergencyContact") as string;
    const emergencyPhone = formData.get("emergencyPhone") as string;
    const preferences = formData.get("preferences") as string;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        fullName: fullName || null,
        avatar: avatar || null,
        phone: phone || null,
        emergencyContact: emergencyContact || null,
        emergencyPhone: emergencyPhone || null,
        preferences: (preferences ? JSON.stringify(preferences) : null) as any,
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
