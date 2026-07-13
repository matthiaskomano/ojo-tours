import type { Metadata } from "next";
import "../globals.css";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import Chatbot from "@/components/chatbot/Chatbot";

// Premium SEO Metadata
export const metadata: Metadata = {
  title: "OJO Tours | Luxury Rwanda Safaris",
  description:
    "Experience the ultimate African adventure with our premium safaris, luxury lodges, and exclusive gorilla trekking expeditions in the heart of Rwanda.",
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
