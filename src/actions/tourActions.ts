"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { requireMinimumRole, AuthorizationError } from "@/lib/authorization";

// 1. Fetch all tours from the database (public - no auth required)
export async function getTours() {
  noStore();

  try {
    const tours = await prisma.tour.findMany({
      orderBy: { createdAt: "desc" },
    });
    return tours;
  } catch (error) {
    console.error("Failed to fetch tours:", error);
    return [];
  }
}

// 2. Add a new tour to the database (requires ADMIN or higher)
export async function addTour(formData: FormData) {
  try {
    // Authorization check - requires ADMIN or SUPER_ADMIN
    await requireMinimumRole("ADMIN");

    await prisma.tour.create({
      data: {
        title: formData.get("title") as string,
        location: formData.get("location") as string,
        duration: formData.get("duration") as string,
        price: formData.get("price") as string,
        category: formData.get("category") as string,
        image: formData.get("image") as string,
        description: formData.get("description") as string,
        rating: 5.0,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/tours");
    revalidatePath("/");
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error; // Re-throw to let the UI handle it
    }
    console.error("Failed to add tour:", error);
    throw error;
  }
}

// 3. Fetch a SINGLE tour by its ID (public - no auth required)
export async function getTourById(id: string) {
  noStore();
  try {
    const tour = await prisma.tour.findUnique({
      where: { id: id },
    });
    return tour;
  } catch (error) {
    console.error("Failed to fetch tour details:", error);
    return null;
  }
}

// 4. Delete a Tour by ID (requires ADMIN or higher)
export async function deleteTour(id: string) {
  try {
    // Authorization check - requires ADMIN or SUPER_ADMIN
    await requireMinimumRole("ADMIN");

    await prisma.tour.delete({
      where: { id: id },
    });

    // Refresh the pages so the item disappears instantly!
    revalidatePath("/admin");
    revalidatePath("/tours");
    revalidatePath("/");
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error; // Re-throw to let the UI handle it
    }
    console.error("Failed to delete tour:", error);
    throw error;
  }
}
