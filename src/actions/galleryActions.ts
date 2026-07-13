"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { requireMinimumRole, AuthorizationError } from "@/lib/authorization";

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

// 2. Fetch a single gallery image by ID
export async function getGalleryImageById(id: string) {
  noStore();
  try {
    const image = await prisma.gallery.findUnique({
      where: { id: id },
    });
    return image;
  } catch (error) {
    console.error("Failed to fetch gallery image details:", error);
    return null;
  }
}

// 3. Add a new image from the Admin Dashboard
export async function addGalleryImage(formData: FormData) {
  try {
    await requireMinimumRole("ADMIN");

    await prisma.gallery.create({
      data: {
        title: formData.get("title") as string,
        category: formData.get("category") as string,
        image: formData.get("image") as string,
        className: formData.get("className") as string,
      },
    });

    revalidatePath("/dashboard/admin/gallery");
    revalidatePath("/");
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to add gallery image:", error);
    throw error;
  }
}

// 4. Update a gallery image
export async function updateGalleryImage(id: string, formData: FormData) {
  try {
    await requireMinimumRole("ADMIN");

    await prisma.gallery.update({
      where: { id: id },
      data: {
        title: formData.get("title") as string,
        category: formData.get("category") as string,
        image: formData.get("image") as string,
        className: formData.get("className") as string,
      },
    });

    revalidatePath("/dashboard/admin/gallery");
    revalidatePath("/dashboard/admin/gallery/[id]");
    revalidatePath("/");
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to update gallery image:", error);
    throw error;
  }
}

// 5. Delete an image from the Admin Dashboard
export async function deleteGalleryImage(id: string) {
  try {
    await requireMinimumRole("ADMIN");

    await prisma.gallery.delete({
      where: { id: id },
    });
    revalidatePath("/dashboard/admin/gallery");
    revalidatePath("/");
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to delete gallery image:", error);
    throw error;
  }
}
