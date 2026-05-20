import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Preloader from "@/components/preloader/Preloader";

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
  title: "OJO Tours | Luxury Rwanda Safaris",
  description: "Experience the ultimate African adventure with our premium safaris, luxury lodges, and exclusive gorilla trekking expeditions in the heart of Rwanda.",
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
      <body className="min-h-screen flex flex-col bg-[#0A1A12] text-white overflow-x-hidden">
        {/* The cinematic entrance animation */}
        <Preloader />
        
        {/* The rest of the app */}
        {children}
      </body>
    </html>
  );
}