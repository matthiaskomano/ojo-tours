"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { requireMinimumRole, AuthorizationError } from "@/lib/authorization";

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .substring(0, 100);
}

// 1. Fetch all journal posts
export async function getJournals() {
  noStore();
  try {
    const posts = await prisma.journal.findMany({
      orderBy: { createdAt: "desc" },
    });
    return posts;
  } catch (error) {
    console.error("Failed to fetch journals:", error);
    return [];
  }
}

// 2. Add a new journal post
export async function addJournal(formData: FormData) {
  try {
    await requireMinimumRole("ADMIN");

    const title = formData.get("title") as string;
    const slug = (formData.get("slug") as string) || generateSlug(title);
    const gallery = formData.get("gallery") as string;
    const galleryArray = gallery ? JSON.parse(gallery) : [];

    await prisma.journal.create({
      data: {
        title: title,
        slug: slug,
        category: formData.get("category") as string,
        author: formData.get("author") as string,
        readTime: formData.get("readTime") as string,
        image: formData.get("image") as string,
        excerpt: formData.get("excerpt") as string,
        content: (formData.get("content") as string) || null,
        gallery: galleryArray,
        status: (formData.get("status") as string) || "draft",
        featured: formData.get("featured") === "on",
      },
    });

    revalidatePath("/dashboard/admin/journals");
    revalidatePath("/journal");
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to add journal:", error);
    throw error;
  }
}

// 3. Fetch a SINGLE journal post by its ID
export async function getJournalById(id: string) {
  noStore();
  try {
    const post = await prisma.journal.findUnique({
      where: { id: id },
    });
    return post;
  } catch (error) {
    console.error("Failed to fetch journal post:", error);
    return null;
  }
}

// 4. Update a journal post
export async function updateJournal(id: string, formData: FormData) {
  try {
    await requireMinimumRole("ADMIN");

    const title = formData.get("title") as string;
    const slug = (formData.get("slug") as string) || generateSlug(title);
    const gallery = formData.get("gallery") as string;
    const galleryArray = gallery ? JSON.parse(gallery) : [];

    await prisma.journal.update({
      where: { id: id },
      data: {
        title: title,
        slug: slug,
        category: formData.get("category") as string,
        author: formData.get("author") as string,
        readTime: formData.get("readTime") as string,
        image: formData.get("image") as string,
        excerpt: formData.get("excerpt") as string,
        content: (formData.get("content") as string) || null,
        gallery: galleryArray,
        status: (formData.get("status") as string) || "draft",
        featured: formData.get("featured") === "on",
      },
    });

    revalidatePath("/dashboard/admin/journals");
    revalidatePath("/dashboard/admin/journals/[id]");
    revalidatePath("/journal");
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to update journal post:", error);
    throw error;
  }
}

// 5. Delete a Journal post by ID
export async function deleteJournal(id: string) {
  try {
    await requireMinimumRole("ADMIN");

    await prisma.journal.delete({
      where: { id: id },
    });

    revalidatePath("/dashboard/admin/journals");
    revalidatePath("/journal");
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to delete journal post:", error);
    throw error;
  }
}
