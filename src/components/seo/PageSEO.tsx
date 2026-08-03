import type { Metadata } from "next";
import JsonLd, { tourJsonLd, lodgeJsonLd, articleJsonLd } from "./JsonLd";

interface PageSEOProps {
  structuredData?: Record<string, any>;
}

export default function PageSEO({ structuredData }: PageSEOProps) {
  return <JsonLd data={structuredData || {}} />;
}

// Helper function to generate metadata for specific page types
export function generatePageMetadata({
  title,
  description,
  path,
  images = [],
  type = "website",
  noIndex = false,
}: {
  title: string;
  description: string;
  path: string;
  images?: string[];
  type?: "website" | "article" | "tour" | "lodge";
  noIndex?: boolean;
}): Metadata {
  const baseUrl = "https://ojotours.com";
  const url = `${baseUrl}${path}`;
  const defaultImage = "https://ojotours.com/og-image.jpg";
  const ogImage = images[0] || defaultImage;

  return {
    title,
    description,
    openGraph: {
      type: type as any,
      url,
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      siteName: "OJO Tours",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
      creator: "@ojotours",
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
    },
    alternates: {
      canonical: url,
    },
  };
}
