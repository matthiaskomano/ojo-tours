import Hero from "@/components/hero/Hero";
import FeaturedTours from "@/components/tours/FeaturedTours";
import WhyChooseUs from "@/components/features/WhyChooseUs";
import Gallery from "@/components/gallery/Gallery";
import Testimonials from "@/components/testimonials/Testimonials";
import Cta from "@/components/cta/Cta";

export default function Home() {
  return (
    <>
      <div className="grow w-full relative z-0">
        <Hero />
        <FeaturedTours />
        <WhyChooseUs />
        <Gallery />
        <Gallery />
        <Testimonials />
        <Cta />
      </div>
    </>
  );
}
