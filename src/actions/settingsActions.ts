"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, unstable_cache } from "next/cache";
import { requireMinimumRole, AuthorizationError } from "@/lib/authorization";

// 1. Fetch settings (singleton - always returns the first/only record)
export const getSettings = unstable_cache(
  async () => {
    try {
      let settings = await prisma.settings.findFirst();
      
      // If no settings exist, create default settings
      if (!settings) {
        settings = await prisma.settings.create({
          data: {
            siteName: "OJO Tours",
            siteDescription: "Experience the beauty of nature with OJO Tours",
            contactEmail: "info@ojotours.com",
            contactPhone: "",
            contactAddress: "",
            socialLinks: {},
            seoKeywords: "",
            maintenanceMode: false,
          },
        });
      }
      
      return settings;
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      return null;
    }
  },
  ["site-settings"],
  { revalidate: 1800 }
);

// 2. Update settings
export async function updateSettings(formData: FormData) {
  try {
    await requireMinimumRole("ADMIN");

    const settings = await prisma.settings.findFirst();
    
    if (!settings) {
      throw new Error("Settings not found");
    }

    const socialLinks = {
      facebook: formData.get("facebook") as string || "",
      twitter: formData.get("twitter") as string || "",
      instagram: formData.get("instagram") as string || "",
      linkedin: formData.get("linkedin") as string || "",
    };

    await prisma.settings.update({
      where: { id: settings.id },
      data: {
        siteName: formData.get("siteName") as string,
        siteDescription: formData.get("siteDescription") as string,
        contactEmail: formData.get("contactEmail") as string,
        contactPhone: formData.get("contactPhone") as string,
        contactAddress: formData.get("contactAddress") as string,
        socialLinks: socialLinks,
        seoKeywords: formData.get("seoKeywords") as string,
        maintenanceMode: formData.get("maintenanceMode") === "on",
      },
    });

    revalidatePath("/dashboard/admin/settings");
    revalidatePath("/");
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to update settings:", error);
    throw error;
  }
}
