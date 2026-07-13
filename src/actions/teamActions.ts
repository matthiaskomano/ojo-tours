"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { requireMinimumRole, AuthorizationError } from "@/lib/authorization";

// 1. Fetch all team members for the public page & admin dashboard
export async function getTeam() {
  noStore();
  try {
    const team = await prisma.team.findMany({
      orderBy: { createdAt: "asc" },
    });
    return team;
  } catch (error) {
    console.error("Failed to fetch team members:", error);
    return [];
  }
}

// 2. Fetch a single team member by ID
export async function getTeamMemberById(id: string) {
  noStore();
  try {
    const member = await prisma.team.findUnique({
      where: { id: id },
    });
    return member;
  } catch (error) {
    console.error("Failed to fetch team member details:", error);
    return null;
  }
}

// 3. Add a new team member from the Admin Dashboard
export async function addTeamMember(formData: FormData) {
  try {
    await requireMinimumRole("ADMIN");

    await prisma.team.create({
      data: {
        name: formData.get("name") as string,
        role: formData.get("role") as string,
        image: formData.get("image") as string,
        bio: formData.get("bio") as string,
      },
    });

    revalidatePath("/dashboard/admin/team");
    revalidatePath("/about");
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to add team member:", error);
    throw error;
  }
}

// 4. Update a team member
export async function updateTeamMember(id: string, formData: FormData) {
  try {
    await requireMinimumRole("ADMIN");

    await prisma.team.update({
      where: { id: id },
      data: {
        name: formData.get("name") as string,
        role: formData.get("role") as string,
        image: formData.get("image") as string,
        bio: formData.get("bio") as string,
      },
    });

    revalidatePath("/dashboard/admin/team");
    revalidatePath("/dashboard/admin/team/[id]");
    revalidatePath("/about");
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to update team member:", error);
    throw error;
  }
}

// 5. Delete a team member
export async function deleteTeamMember(id: string) {
  try {
    await requireMinimumRole("ADMIN");

    await prisma.team.delete({
      where: { id: id },
    });
    revalidatePath("/dashboard/admin/team");
    revalidatePath("/about");
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to delete team member:", error);
    throw error;
  }
}
