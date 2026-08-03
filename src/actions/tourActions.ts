"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, unstable_cache } from "next/cache";
import { requireMinimumRole, AuthorizationError } from "@/lib/authorization";

// 1. Fetch all tours from the database (public - no auth required)
export const getTours = unstable_cache(
  async () => {
    try {
      const tours = await prisma.tour.findMany({
        orderBy: { createdAt: "desc" },
      });
      return tours;
    } catch (error) {
      console.error("Failed to fetch tours:", error);
      return [];
    }
  },
  ["tours-list"],
  { revalidate: 1800 },
);

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
export const getTourById = async (id: string) =>
  unstable_cache(
    async () => {
      try {
        const tour = await prisma.tour.findUnique({
          where: { id: id },
        });
        return tour;
      } catch (error) {
        console.error("Failed to fetch tour details:", error);
        return null;
      }
    },
    [`tour-${id}`],
    { revalidate: 1800 },
  )();

// 4. Update a Tour by ID (requires ADMIN or higher)
export async function updateTour(id: string, formData: FormData) {
  try {
    // Authorization check - requires ADMIN or SUPER_ADMIN
    await requireMinimumRole("ADMIN");

    await prisma.tour.update({
      where: { id: id },
      data: {
        title: formData.get("title") as string,
        location: formData.get("location") as string,
        duration: formData.get("duration") as string,
        price: formData.get("price") as string,
        category: formData.get("category") as string,
        image: formData.get("image") as string,
        description: formData.get("description") as string,
        rating: parseFloat(formData.get("rating") as string) || 5.0,
      },
    });

    revalidatePath("/dashboard/admin/expeditions");
    revalidatePath("/dashboard/admin/expeditions/[id]");
    revalidatePath("/tours");
    revalidatePath("/");
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to update tour:", error);
    throw error;
  }
}

// 5. Delete a Tour by ID (requires ADMIN or higher)
export async function deleteTour(id: string) {
  try {
    // Authorization check - requires ADMIN or SUPER_ADMIN
    await requireMinimumRole("ADMIN");

    await prisma.tour.delete({
      where: { id: id },
    });

    // Refresh the pages so the item disappears instantly!
    revalidatePath("/dashboard/admin/expeditions");
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
