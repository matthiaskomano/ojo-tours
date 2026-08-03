import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Preloader from "@/components/preloader/Preloader";
import { TooltipProvider } from "@/components/ui/tooltip";
import JsonLd, { organizationJsonLd } from "@/components/seo/JsonLd";
import { ErrorBoundary } from "@/components/error/error-boundary";
import { Toaster } from "@/components/ui/sonner";

// Configure luxury fonts
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
});

// Premium SEO Metadata
export const metadata: Metadata = {
  title: {
    default: "OJO Tours | Luxury Rwanda Safaris",
    template: "%s | OJO Tours",
  },
  description:
    "Experience the ultimate African adventure with our premium safaris, luxury lodges, and exclusive gorilla trekking expeditions in the heart of Rwanda.",
  keywords: [
    "Rwanda safaris",
    "gorilla trekking",
    "luxury African tours",
    "Rwanda tourism",
    "African adventure",
    "safari tours",
    "luxury lodges",
    "gorilla tracking",
    "Volcanoes National Park",
    "Akagera National Park",
    "Nyungwe Forest",
    "Rwanda safari packages",
    "premium African holidays",
    "wildlife tours",
    "eco tourism Rwanda",
  ],
  authors: [{ name: "OJO Tours" }],
  creator: "OJO Tours",
  publisher: "OJO Tours",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ojotours.com",
    siteName: "OJO Tours",
    title: "OJO Tours | Luxury Rwanda Safaris",
    description:
      "Experience the ultimate African adventure with our premium safaris, luxury lodges, and exclusive gorilla trekking expeditions in the heart of Rwanda.",
    images: [
      {
        url: "https://ojotours.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "OJO Tours - Luxury Rwanda Safaris",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OJO Tours | Luxury Rwanda Safaris",
    description:
      "Experience the ultimate African adventure with our premium safaris, luxury lodges, and exclusive gorilla trekking expeditions in the heart of Rwanda.",
    images: ["https://ojotours.com/twitter-image.jpg"],
    creator: "@ojotours",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <JsonLd data={organizationJsonLd()} />
      </head>
      <body className="min-h-screen flex flex-col bg-[#0A1A12] text-white overflow-x-hidden">
        {/* The cinematic entrance animation */}
        <Preloader />

        {/* Global error boundary */}
        <ErrorBoundary>
          {/* Toast notifications */}
          <Toaster />

          {/* The rest of the app */}
          <TooltipProvider>{children}</TooltipProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
