"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { requireMinimumRole, AuthorizationError } from "@/lib/authorization";

// 1. Fetch all lodges
export async function getLodges() {
  try {
    const lodges = await prisma.lodge.findMany({
      orderBy: { createdAt: "desc" },
    });
    return lodges;
  } catch (error) {
    console.error("Failed to fetch lodges:", error);
    return [];
  }
}

// 2. Fetch a single lodge by ID
export async function getLodgeById(id: string) {
  try {
    const lodge = await prisma.lodge.findUnique({
      where: { id: id },
    });
    return lodge;
  } catch (error) {
    console.error("Failed to fetch lodge details:", error);
    return null;
  }
}

// 3. Add a new lodge
export async function addLodge(formData: FormData) {
  try {
    await requireMinimumRole("ADMIN");

    // We convert a comma-separated string like "WiFi, Pool, Spa" into an array
    const amenitiesString = formData.get("amenities") as string;
    const amenitiesArray = amenitiesString
      ? amenitiesString.split(",").map((item) => item.trim())
      : [];

    await prisma.lodge.create({
      data: {
        name: formData.get("name") as string,
        location: formData.get("location") as string,
        price: formData.get("price") as string,
        image: formData.get("image") as string,
        description: formData.get("description") as string,
        amenities: amenitiesArray,
      },
    });

    revalidatePath("/dashboard/admin/lodges");
    revalidatePath("/lodges");
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to add lodge:", error);
    throw error;
  }
}

// 4. Update a lodge
export async function updateLodge(id: string, formData: FormData) {
  try {
    await requireMinimumRole("ADMIN");

    const amenitiesString = formData.get("amenities") as string;
    const amenitiesArray = amenitiesString
      ? amenitiesString.split(",").map((item) => item.trim())
      : [];

    await prisma.lodge.update({
      where: { id: id },
      data: {
        name: formData.get("name") as string,
        location: formData.get("location") as string,
        price: formData.get("price") as string,
        image: formData.get("image") as string,
        description: formData.get("description") as string,
        amenities: amenitiesArray,
      },
    });

    revalidatePath("/dashboard/admin/lodges");
    revalidatePath("/dashboard/admin/lodges/[id]");
    revalidatePath("/lodges");
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to update lodge:", error);
    throw error;
  }
}

// 5. Delete a lodge
export async function deleteLodge(id: string) {
  try {
    await requireMinimumRole("ADMIN");

    await prisma.lodge.delete({
      where: { id: id },
    });

    revalidatePath("/dashboard/admin/lodges");
    revalidatePath("/lodges");
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to delete lodge:", error);
    throw error;
  }
}
