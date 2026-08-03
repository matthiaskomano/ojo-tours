import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://ojotours.com";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tours`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/lodges`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/journal`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
  ];

  try {
    // Dynamic pages from database
    const [tours, lodges, journals] = await Promise.all([
      prisma.tour.findMany({
        select: { id: true, updatedAt: true },
      }),
      prisma.lodge.findMany({
        select: { id: true, updatedAt: true },
      }),
      prisma.journal.findMany({
        where: { status: "published" },
        select: { id: true, updatedAt: true },
      }),
    ]);

    const tourPages: MetadataRoute.Sitemap = tours.map((tour) => ({
      url: `${baseUrl}/tours/${tour.id}`,
      lastModified: tour.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    const lodgePages: MetadataRoute.Sitemap = lodges.map((lodge) => ({
      url: `${baseUrl}/lodges/${lodge.id}`,
      lastModified: lodge.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    const journalPages: MetadataRoute.Sitemap = journals.map((journal) => ({
      url: `${baseUrl}/journal/${journal.id}`,
      lastModified: journal.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

    return [...staticPages, ...tourPages, ...lodgePages, ...journalPages];
  } catch (error) {
    // If database is not available, return static pages only
    console.error("Error generating dynamic sitemap:", error);
    return staticPages;
  }
}
