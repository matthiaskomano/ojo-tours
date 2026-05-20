"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";

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
    await prisma.journal.create({
      data: {
        title: formData.get("title") as string,
        category: formData.get("category") as string,
        author: formData.get("author") as string,
        readTime: formData.get("readTime") as string,
        image: formData.get("image") as string,
        excerpt: formData.get("excerpt") as string,
        // If the checkbox is checked, it sends "on"
        featured: formData.get("featured") === "on", 
      },
    });

    revalidatePath("/admin");
    revalidatePath("/journal");
  } catch (error) {
    console.error("Failed to add journal:", error);
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

// 4. Delete a Journal post by ID (NEW!)
export async function deleteJournal(id: string) {
  try {
    await prisma.journal.delete({
      where: { id: id },
    });

    // Refresh the pages so the item disappears instantly!
    revalidatePath("/admin");
    revalidatePath("/journal");
    revalidatePath("/");
  } catch (error) {
    console.error("Failed to delete journal post:", error);
  }
}