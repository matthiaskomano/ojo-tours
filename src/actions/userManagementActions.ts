"use server";

import { prisma } from "@/lib/prisma";
import { unstable_noStore as noStore } from "next/cache";
import { requireAnyRole, AuthorizationError } from "@/lib/authorization";
import { revalidatePath } from "next/cache";

// Get all users with filtering and pagination
export async function getAllUsers(params: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}) {
  noStore();
  try {
    await requireAnyRole(["ADMIN", "SUPER_ADMIN"]);

    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.search) {
      where.OR = [
        { email: { contains: params.search, mode: "insensitive" } },
        { fullName: { contains: params.search, mode: "insensitive" } },
      ];
    }

    if (params.role) {
      where.role = { name: params.role };
    }

    if (params.status === "active") {
      where.isActive = true;
    } else if (params.status === "inactive") {
      where.isActive = false;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          role: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          _count: {
            select: {
              bookings: true,
              reviews: true,
              wishlist: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }) as any,
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to fetch users:", error);
    return {
      users: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    };
  }
}

// Get user by ID with detailed information
export async function getUserById(id: string) {
  noStore();
  try {
    await requireAnyRole(["ADMIN", "SUPER_ADMIN"]);

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            description: true,
            permissions: true,
          },
        },
        bookings: {
          include: {
            payments: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        reviews: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        wishlist: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        authEvents: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        _count: {
          select: {
            bookings: true,
            reviews: true,
            wishlist: true,
          },
        },
      },
    });

    if (!user) {
      throw new AuthorizationError("User not found");
    }

    return user as any;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to fetch user:", error);
    throw error;
  }
}

// Update user role
export async function updateUserRole(formData: FormData) {
  try {
    await requireAnyRole(["SUPER_ADMIN"]);

    const userId = formData.get("userId") as string;
    const roleId = formData.get("roleId") as string;

    if (!userId || !roleId) {
      throw new Error("User ID and Role ID are required");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AuthorizationError("User not found");
    }

    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new AuthorizationError("Role not found");
    }

    await prisma.user.update({
      where: { id: userId },
      data: { roleId },
    });

    revalidatePath("/dashboard/admin/users");
    revalidatePath(`/dashboard/admin/users/${userId}`);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to update user role:", error);
    throw error;
  }
}

// Update user status (active/inactive)
export async function updateUserStatus(formData: FormData) {
  try {
    await requireAnyRole(["ADMIN", "SUPER_ADMIN"]);

    const userId = formData.get("userId") as string;
    const isActive = formData.get("isActive") === "true";

    if (!userId) {
      throw new Error("User ID is required");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AuthorizationError("User not found");
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });

    revalidatePath("/dashboard/admin/users");
    revalidatePath(`/dashboard/admin/users/${userId}`);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to update user status:", error);
    throw error;
  }
}

// Update user profile
export async function updateUserProfile(formData: FormData) {
  try {
    await requireAnyRole(["ADMIN", "SUPER_ADMIN"]);

    const userId = formData.get("userId") as string;
    const fullName = formData.get("fullName") as string | null;
    const phone = formData.get("phone") as string | null;
    const avatar = formData.get("avatar") as string | null;

    if (!userId) {
      throw new Error("User ID is required");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AuthorizationError("User not found");
    }

    const data: any = {};
    if (fullName !== null) data.fullName = fullName;
    if (phone !== null) data.phone = phone;
    if (avatar !== null) data.avatar = avatar;

    await prisma.user.update({
      where: { id: userId },
      data,
    });

    revalidatePath("/dashboard/admin/users");
    revalidatePath(`/dashboard/admin/users/${userId}`);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to update user profile:", error);
    throw error;
  }
}

// Delete user
export async function deleteUser(formData: FormData) {
  try {
    await requireAnyRole(["SUPER_ADMIN"]);

    const userId = formData.get("userId") as string;

    if (!userId) {
      throw new Error("User ID is required");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AuthorizationError("User not found");
    }

    // Check if user has bookings
    const bookingCount = await prisma.booking.count({
      where: { userId },
    });

    if (bookingCount > 0) {
      throw new AuthorizationError(
        "Cannot delete user with existing bookings. Please cancel bookings first.",
      );
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    revalidatePath("/dashboard/admin/users");
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to delete user:", error);
    throw error;
  }
}

// Get all roles
export async function getAllRoles() {
  noStore();
  try {
    await requireAnyRole(["ADMIN", "SUPER_ADMIN"]);

    const roles = await prisma.role.findMany({
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return roles;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to fetch roles:", error);
    return [];
  }
}

// Get user statistics
export async function getUserStats() {
  noStore();
  try {
    await requireAnyRole(["ADMIN", "SUPER_ADMIN"]);

    const [totalUsers, activeUsers, inactiveUsers, usersByRole, recentUsers] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { isActive: true } }),
        prisma.user.count({ where: { isActive: false } }),
        prisma.role.findMany({
          select: {
            name: true,
            _count: {
              select: {
                users: true,
              },
            },
          },
        }),
        prisma.user.findMany({
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            email: true,
            fullName: true,
            createdAt: true,
            role: {
              select: {
                name: true,
              },
            },
          },
        }),
      ]);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      usersByRole,
      recentUsers,
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to fetch user stats:", error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      inactiveUsers: 0,
      usersByRole: [],
      recentUsers: [],
    };
  }
}
