import dynamic from "next/dynamic";
import Navbar from "@/components/shared/Navbar";
import HeroSection from "@/components/landing/HeroSection";

const ThreeRolesSection = dynamic(() => import("@/components/landing/ThreeRolesSection"), { ssr: true });
const OurServicesSection = dynamic(() => import("@/components/landing/OurServicesSection"), { ssr: true });
const CarbonCalculatorSection = dynamic(() => import("@/components/landing/CarbonCalculatorSection"), { ssr: true });
const PokmaswasCampaignSection = dynamic(() => import("@/components/landing/PokmaswasCampaignSection"), { ssr: false });
const TestimonialsSection = dynamic(() => import("@/components/landing/TestimonialsSection"), { ssr: true });
const Footer = dynamic(() => import("@/components/shared/Footer"), { ssr: true });

export default function Home() {
  return (
    <main className="min-h-screen bg-white font-sans text-slate-900">
      <Navbar />
      <HeroSection />
      <ThreeRolesSection />
      <OurServicesSection />
      <CarbonCalculatorSection />
      <PokmaswasCampaignSection />
      <TestimonialsSection />
      <Footer />
    </main>
  );
}
