"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";

// 1. Fetch all team members for the public page & admin dashboard
export async function getTeam() {
  noStore();
  try {
    const team = await prisma.team.findMany({
      orderBy: { createdAt: "asc" }, // Keeps the founders at the top!
    });
    return team;
  } catch (error) {
    console.error("Failed to fetch team members:", error);
    return [];
  }
}

// 2. Add a new team member from the Admin Dashboard
export async function addTeamMember(formData: FormData) {
  try {
    await prisma.team.create({
      data: {
        name: formData.get("name") as string,
        role: formData.get("role") as string,
        image: formData.get("image") as string,
        bio: formData.get("bio") as string,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/about"); 
  } catch (error) {
    console.error("Failed to add team member:", error);
  }
}

// 3. Delete a team member
export async function deleteTeamMember(id: string) {
  try {
    await prisma.team.delete({
      where: { id: id },
    });
    revalidatePath("/admin");
    revalidatePath("/about");
  } catch (error) {
    console.error("Failed to delete team member:", error);
  }
}