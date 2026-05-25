import dynamic from "next/dynamic";
import Navbar from "@/components/shared/Navbar";
import HeroSection from "@/components/landing/HeroSection";

const InteractiveMapSection = dynamic(() => import("@/components/landing/InteractiveMapSection"), { ssr: false, loading: () => <div className="h-[600px] flex items-center justify-center bg-gray-50"><div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div></div> });
const ThreeRolesSection = dynamic(() => import("@/components/landing/ThreeRolesSection"), { ssr: true });
const OurServicesSection = dynamic(() => import("@/components/landing/OurServicesSection"), { ssr: true });
const Footer = dynamic(() => import("@/components/shared/Footer"), { ssr: true });

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <HeroSection />
      <InteractiveMapSection />
      <ThreeRolesSection />
      <OurServicesSection />
      <Footer />
    </main>
  );
}
