import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://ojotours.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/admin/", "/auth/", "/verify/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
