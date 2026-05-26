import dynamic from "next/dynamic";
import Navbar from "@/components/shared/Navbar";
import HeroSection from "@/components/landing/HeroSection";

const ThreeRolesSection = dynamic(() => import("@/components/landing/ThreeRolesSection"), { ssr: true });
const OurServicesSection = dynamic(() => import("@/components/landing/OurServicesSection"), { ssr: true });
const PokmaswasCampaignSection = dynamic(() => import("@/components/landing/PokmaswasCampaignSection"), { ssr: false });
const Footer = dynamic(() => import("@/components/shared/Footer"), { ssr: true });

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <HeroSection />
      <ThreeRolesSection />
      <OurServicesSection />
      <PokmaswasCampaignSection />
      <Footer />
    </main>
  );
}
