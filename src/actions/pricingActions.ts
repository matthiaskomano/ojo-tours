"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { requireMinimumRole, AuthorizationError } from "@/lib/authorization";

// Calculate final price considering seasonal pricing and group discounts
export async function calculateFinalPrice(
  itemId: string,
  itemType: "Tour" | "Lodge",
  date: Date,
  guests: number,
  basePrice: number
) {
  noStore();
  try {
    let finalPrice = basePrice;
    let adjustments = [];

    // Check for seasonal pricing
    const seasonalPricing = await prisma.seasonalPricing.findFirst({
      where: {
        itemId,
        itemType,
        startDate: { lte: date },
        endDate: { gte: date },
      },
    });

    if (seasonalPricing) {
      const seasonalPrice = basePrice * seasonalPricing.multiplier;
      const priceDiff = seasonalPrice - basePrice;
      finalPrice = seasonalPrice;
      adjustments.push({
        type: "seasonal",
        reason: seasonalPricing.reason || "Seasonal pricing",
        multiplier: seasonalPricing.multiplier,
        originalPrice: basePrice,
        adjustedPrice: seasonalPrice,
        difference: priceDiff,
      });
    }

    // Check for group discounts
    const groupPricing = await prisma.groupPricingRule.findFirst({
      where: {
        itemId,
        itemType,
        minGuests: { lte: guests },
        OR: [
          { maxGuests: null },
          { maxGuests: { gte: guests } },
        ],
      },
      orderBy: {
        minGuests: "desc",
      },
    });

    if (groupPricing) {
      const discountAmount = finalPrice * (groupPricing.discountPercent / 100);
      const discountedPrice = finalPrice - discountAmount;
      finalPrice = discountedPrice;
      adjustments.push({
        type: "group",
        reason: "Group discount",
        discountPercent: groupPricing.discountPercent,
        minGuests: groupPricing.minGuests,
        originalPrice: adjustments.length > 0 ? adjustments[0].adjustedPrice : basePrice,
        adjustedPrice: discountedPrice,
        discountAmount,
      });
    }

    return {
      basePrice,
      finalPrice,
      totalFinalPrice: finalPrice * guests,
      adjustments,
    };
  } catch (error) {
    console.error("Failed to calculate final price:", error);
    return {
      basePrice,
      finalPrice: basePrice,
      totalFinalPrice: basePrice * guests,
      adjustments: [],
    };
  }
}

// Create seasonal pricing rule (admin only)
export async function createSeasonalPricing(data: {
  itemId: string;
  itemType: "Tour" | "Lodge";
  startDate: Date;
  endDate: Date;
  multiplier: number;
  reason?: string;
}) {
  try {
    await requireMinimumRole("STAFF");

    const seasonalPricing = await prisma.seasonalPricing.create({
      data,
    });

    revalidatePath("/dashboard/admin/bookings");
    revalidatePath("/tours/[id]");
    return { success: true, data: seasonalPricing };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to create seasonal pricing:", error);
    return { success: false, error: "Failed to create seasonal pricing" };
  }
}

// Update seasonal pricing rule (admin only)
export async function updateSeasonalPricing(
  id: string,
  data: {
    startDate?: Date;
    endDate?: Date;
    multiplier?: number;
    reason?: string;
  }
) {
  try {
    await requireMinimumRole("STAFF");

    const seasonalPricing = await prisma.seasonalPricing.update({
      where: { id },
      data,
    });

    revalidatePath("/dashboard/admin/bookings");
    revalidatePath("/tours/[id]");
    return { success: true, data: seasonalPricing };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to update seasonal pricing:", error);
    return { success: false, error: "Failed to update seasonal pricing" };
  }
}

// Delete seasonal pricing rule (admin only)
export async function deleteSeasonalPricing(id: string) {
  try {
    await requireMinimumRole("STAFF");

    await prisma.seasonalPricing.delete({
      where: { id },
    });

    revalidatePath("/dashboard/admin/bookings");
    revalidatePath("/tours/[id]");
    return { success: true };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to delete seasonal pricing:", error);
    return { success: false, error: "Failed to delete seasonal pricing" };
  }
}

// Create group pricing rule (admin only)
export async function createGroupPricing(data: {
  itemId: string;
  itemType: "Tour" | "Lodge";
  minGuests: number;
  maxGuests?: number;
  discountPercent: number;
}) {
  try {
    await requireMinimumRole("STAFF");

    const groupPricing = await prisma.groupPricingRule.create({
      data,
    });

    revalidatePath("/dashboard/admin/bookings");
    revalidatePath("/tours/[id]");
    return { success: true, data: groupPricing };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to create group pricing:", error);
    return { success: false, error: "Failed to create group pricing" };
  }
}

// Update group pricing rule (admin only)
export async function updateGroupPricing(
  id: string,
  data: {
    minGuests?: number;
    maxGuests?: number;
    discountPercent?: number;
  }
) {
  try {
    await requireMinimumRole("STAFF");

    const groupPricing = await prisma.groupPricingRule.update({
      where: { id },
      data,
    });

    revalidatePath("/dashboard/admin/bookings");
    revalidatePath("/tours/[id]");
    return { success: true, data: groupPricing };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to update group pricing:", error);
    return { success: false, error: "Failed to update group pricing" };
  }
}

// Delete group pricing rule (admin only)
export async function deleteGroupPricing(id: string) {
  try {
    await requireMinimumRole("STAFF");

    await prisma.groupPricingRule.delete({
      where: { id },
    });

    revalidatePath("/dashboard/admin/bookings");
    revalidatePath("/tours/[id]");
    return { success: true };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to delete group pricing:", error);
    return { success: false, error: "Failed to delete group pricing" };
  }
}

// Get all pricing rules for an item
export async function getItemPricingRules(itemId: string, itemType: "Tour" | "Lodge") {
  noStore();
  try {
    const [seasonalPricing, groupPricing] = await Promise.all([
      prisma.seasonalPricing.findMany({
        where: { itemId, itemType },
        orderBy: { startDate: "asc" },
      }),
      prisma.groupPricingRule.findMany({
        where: { itemId, itemType },
        orderBy: { minGuests: "asc" },
      }),
    ]);

    return {
      seasonalPricing,
      groupPricing,
    };
  } catch (error) {
    console.error("Failed to get item pricing rules:", error);
    return {
      seasonalPricing: [],
      groupPricing: [],
    };
  }
}

// Get all seasonal pricing rules (admin only)
export async function getAllSeasonalPricing() {
  noStore();
  try {
    await requireMinimumRole("STAFF");

    const seasonalPricing = await prisma.seasonalPricing.findMany({
      orderBy: { startDate: "desc" },
    });

    return { success: true, data: seasonalPricing };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to get all seasonal pricing:", error);
    return { success: false, error: "Failed to get all seasonal pricing", data: [] };
  }
}

// Get all group pricing rules (admin only)
export async function getAllGroupPricing() {
  noStore();
  try {
    await requireMinimumRole("STAFF");

    const groupPricing = await prisma.groupPricingRule.findMany({
      orderBy: { minGuests: "asc" },
    });

    return { success: true, data: groupPricing };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to get all group pricing:", error);
    return { success: false, error: "Failed to get all group pricing", data: [] };
  }
}
