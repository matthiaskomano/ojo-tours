import type { Metadata } from "next";
import "../globals.css";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import Chatbot from "@/components/chatbot/Chatbot";

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
    <main className="min-h-screen flex flex-col bg-[#040C08] selection:bg-gold selection:text-[#040C08] scroll-smooth">
      <Navbar />
      {children}
      <Footer />
      <Chatbot />
    </main>
  );
}
