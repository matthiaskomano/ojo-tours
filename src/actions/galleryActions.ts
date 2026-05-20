"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";

// 1. Fetch all images for the public page & admin dashboard
export async function getGalleryImages() {
  noStore();
  try {
    const images = await prisma.gallery.findMany({
      orderBy: { createdAt: "desc" },
    });
    return images;
  } catch (error) {
    console.error("Failed to fetch gallery images:", error);
    return [];
  }
}

// 2. Add a new image from the Admin Dashboard
export async function addGalleryImage(formData: FormData) {
  try {
    await prisma.gallery.create({
      data: {
        title: formData.get("title") as string,
        category: formData.get("category") as string,
        image: formData.get("image") as string,
        className: formData.get("className") as string,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/"); // Refreshes the homepage gallery!
  } catch (error) {
    console.error("Failed to add gallery image:", error);
  }
}

// 3. Delete an image from the Admin Dashboard
export async function deleteGalleryImage(id: string) {
  try {
    await prisma.gallery.delete({
      where: { id: id },
    });
    revalidatePath("/admin");
    revalidatePath("/");
  } catch (error) {
    console.error("Failed to delete gallery image:", error);
  }
}