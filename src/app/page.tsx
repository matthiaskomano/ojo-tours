import Navbar from "@/components/navbar/Navbar";
import Hero from "@/components/hero/Hero";
import FeaturedTours from "@/components/tours/FeaturedTours";
import WhyChooseUs from "@/components/features/WhyChooseUs";
import Gallery from "@/components/gallery/Gallery";
import Testimonials from "@/components/testimonials/Testimonials";
import Cta from "@/components/cta/Cta";
import Footer from "@/components/footer/Footer";

export default function Home() {
  return (
    // Added scroll-smooth for a premium modern feel when navigating the page
    <main className="min-h-screen flex flex-col bg-[#040C08] selection:bg-gold selection:text-[#040C08] scroll-smooth">
      
      {/* 0. The Navigation Bar (Fixed at the top) */}
      <Navbar />

      {/* Main Content Wrapper */}
      <div className="flex-grow w-full relative z-0">
        
        {/* 1. The Cinematic Hero (THIS IS WHERE THE BUTTONS ARE!) */}
        <Hero />
        
        {/* 2. The Featured Tours */}
        <FeaturedTours />

        {/* 3. Why Choose Us */}
        <WhyChooseUs />

        {/* 4. Gallery Preview */}
        <Gallery />

        {/* 5. Testimonials Slider */}
        <Testimonials />

        {/* 6. Call To Action */}
        <Cta />
      </div>

      {/* 7. The Premium Footer */}
      <Footer />
    </main>
  );
}