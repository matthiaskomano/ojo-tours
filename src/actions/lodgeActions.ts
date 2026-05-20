"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";

// 1. Fetch all lodges
export async function getLodges() {
  noStore();
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

// 2. Add a new lodge
export async function addLodge(formData: FormData) {
  try {
    // We convert a comma-separated string like "WiFi, Pool, Spa" into an array
    const amenitiesString = formData.get("amenities") as string;
    const amenitiesArray = amenitiesString 
      ? amenitiesString.split(",").map(item => item.trim()) 
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

    revalidatePath("/admin");
    revalidatePath("/lodges");
  } catch (error) {
    console.error("Failed to add lodge:", error);
  }
}

// 3. Delete a lodge
export async function deleteLodge(id: string) {
  try {
    await prisma.lodge.delete({
      where: { id: id },
    });

    revalidatePath("/admin");
    revalidatePath("/lodges");
  } catch (error) {
    console.error("Failed to delete lodge:", error);
  }
}