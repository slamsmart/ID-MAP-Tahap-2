"use client";

import {
  Leaf,
  Target,
  Eye,
  Shield,
  Globe,
  Users,
  BarChart3,
  Sprout,
  Anchor,
  HeartHandshake,
  Mail,
  Phone,
  MapPin,
  Award,
  type LucideIcon,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import ScrollReveal from "@/components/shared/ScrollReveal";
import { useLanguage } from "@/contexts/LanguageContext";

// Mapping nama icon (string yang disimpan di Convex) ke komponen Lucide
// supaya verifikator bisa pilih icon dari dashboard tanpa import dinamis.
const ICON_MAP: Record<string, LucideIcon> = {
  Sprout,
  Leaf,
  BarChart3,
  Anchor,
  Shield,
  HeartHandshake,
  Globe,
  Users,
  Target,
  Eye,
  Award,
};

const FALLBACK = {
  heroImage: undefined as string | undefined,
  heroTitleId: "Tentang ID-MAP",
  heroTitleEn: "About ID-MAP",
  heroSubtitleId:
    "Platform Integrasi Data dan Manajemen Pesisir untuk ekosistem pesisir nusantara",
  heroSubtitleEn:
    "Integrated Coastal Data & Management Platform for Indonesia's coastal ecosystem",
  apaItuTitleId: "Apa itu ID-MAP?",
  apaItuTitleEn: "What is ID-MAP?",
  apaItuParagraph1Id:
    "ID-MAP merupakan platform integrasi data dan manajemen pesisir demi keberlanjutan ekosistem mangrove dan pesisir dan pemberdayaan masyarakat pesisir seluruh Indonesia.",
  apaItuParagraph1En:
    "ID-MAP is an integrated coastal data and management platform for the sustainability of mangrove and coastal ecosystems and the empowerment of coastal communities across Indonesia.",
  apaItuParagraph2Id:
    "ID-MAP mengintegrasikan data ekosistem pesisir Indonesia — mangrove, abrasi pantai, habitat penyu, dan jaringan Pokmaswas/Mitra — sehingga komunitas, pemerintah daerah, dan pendukung publik dapat berkolaborasi pada satu platform yang terverifikasi dan transparan.",
  apaItuParagraph2En:
    "ID-MAP brings together coastal ecosystem data — mangroves, abrasion, sea-turtle habitats, and the Pokmaswas/partner network — so communities, regional governments, and public supporters can collaborate on one verified, transparent platform.",
  missionId:
    "Mengintegrasikan data dan tata kelola pesisir Indonesia melalui enam layanan inti — rehabilitasi mangrove, penyulaman, MRV digital, decarbonisasi aquaculture, perbaikan habitat penyu, dan pemberdayaan masyarakat pesisir — secara transparan, partisipatif, dan berkelanjutan.",
  missionEn:
    "Integrate coastal data and governance through six core services — mangrove rehabilitation, replanting, digital MRV, aquaculture decarbonisation, sea-turtle habitat restoration, and coastal community empowerment — transparently, participatively, and sustainably.",
  visionId:
    "Menjadi platform terpercaya yang mempercepat pemulihan dan keberlanjutan ekosistem pesisir nusantara melalui kolaborasi data, komunitas, dan teknologi.",
  visionEn:
    "Become the trusted platform that accelerates the recovery and sustainability of Indonesia's coastal ecosystems through data, community, and technology.",
  services: [
    { iconKey: "Sprout", titleId: "Rehabilitasi Mangrove", titleEn: "Mangrove Rehabilitation", descId: "Restorasi ekosistem mangrove pesisir bersama Pokmaswas dan komunitas lokal.", descEn: "Restoring coastal mangrove ecosystems with Pokmaswas and local communities." },
    { iconKey: "Leaf", titleId: "Penyulaman Mangrove", titleEn: "Mangrove Replanting", descId: "Penanaman ulang bibit pada area yang masih jarang atau gagal tumbuh.", descEn: "Replanting on areas that remain sparse or failed to grow." },
    { iconKey: "BarChart3", titleId: "Monev Mangrove", titleEn: "Mangrove M&E", descId: "Jasa pemantauan, pelaporan, dan verifikasi (MRV) data mangrove digital.", descEn: "Digital monitoring, reporting and verification (MRV) services for mangrove data." },
    { iconKey: "Anchor", titleId: "Decarbonisasi Aquaculture", titleEn: "Aquaculture Decarbonisation", descId: "Mendukung tambak rendah emisi yang ramah ekosistem pesisir.", descEn: "Supporting low-emission aquaculture friendly to coastal ecosystems." },
    { iconKey: "Shield", titleId: "Perbaikan Habitat Penyu", titleEn: "Sea-Turtle Habitat Restoration", descId: "Konservasi titik peneluran dan penjagaan tukik bersama komunitas.", descEn: "Conserving nesting points and protecting hatchlings with communities." },
    { iconKey: "HeartHandshake", titleId: "Pemberdayaan Masyarakat Pesisir", titleEn: "Coastal Community Empowerment", descId: "Penguatan ekonomi & kapasitas Pokmaswas dan kelompok nelayan.", descEn: "Strengthening the economy and capacity of Pokmaswas and fisher groups." },
  ],
  whyCards: [
    { iconKey: "Shield", titleId: "Terverifikasi", titleEn: "Verified", descId: "Setiap proyek divalidasi tim verifikator dan dapat diaudit oleh DKP daerah.", descEn: "Every project validated by the verifier team, auditable by regional DKP." },
    { iconKey: "Globe", titleId: "Data Spasial Terpadu", titleEn: "Integrated Spatial Data", descId: "Peta interaktif terintegrasi: mangrove, abrasi, penyu, dan jaringan Pokmaswas/Mitra.", descEn: "Integrated interactive map: mangrove, abrasion, sea turtle, and the Pokmaswas/partner network." },
    { iconKey: "Users", titleId: "Inklusif & Partisipatif", titleEn: "Inclusive & Participatory", descId: "Menghubungkan Sahabat Pesisir, Mitra pelaksana, dan komunitas lokal pada satu platform.", descEn: "Connecting Sahabat Pesisir, executing partners, and local communities on one platform." },
    { iconKey: "BarChart3", titleId: "MRV Digital", titleEn: "Digital MRV", descId: "Dashboard real-time untuk pemantauan, pelaporan, dan verifikasi data lapangan.", descEn: "Real-time dashboards for monitoring, reporting, and verifying field data." },
    { iconKey: "HeartHandshake", titleId: "Dampak Nyata", titleEn: "Real Impact", descId: "Setiap kontribusi tersalurkan langsung ke kelompok masyarakat pesisir pelaksana.", descEn: "Every contribution flows directly to the executing coastal community group." },
    { iconKey: "Leaf", titleId: "Berkelanjutan", titleEn: "Sustainable", descId: "Mendukung pemulihan ekosistem pesisir nusantara secara jangka panjang.", descEn: "Supporting long-term recovery of Indonesia's coastal ecosystems." },
  ],
};

export default function TentangPage() {
  const data = useQuery(api.aboutContent.get);
  const footerData = useQuery(api.footerContent.get);
  const { language } = useLanguage();
  const isEn = language === "en";

  const c = data ?? FALLBACK;
  const brandName = footerData?.brandName ?? "ID-MAP";
  const email = footerData?.email ?? "info@id-map.co.id";
  const phone = footerData?.phone ?? "+62 21 1234 5678";
  const address = footerData?.address ?? "Jakarta, Indonesia";

  const pick = (id: string, en: string) => (isEn ? en : id);

  return (
    <>
      <Navbar />
      <main className="bg-white">
        {/* Hero */}
        <section
          className={`relative ${c.heroImage ? "bg-cover bg-center" : "bg-[#0f3d2e]"} text-white py-16 sm:py-20`}
          style={c.heroImage ? { backgroundImage: `linear-gradient(rgba(15, 61, 46, 0.85), rgba(15, 61, 46, 0.85)), url('${c.heroImage}')` } : undefined}
        >
          <ScrollReveal className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              {pick(c.heroTitleId, c.heroTitleEn)}
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-emerald-200 max-w-3xl mx-auto">
              {pick(c.heroSubtitleId, c.heroSubtitleEn)}
            </p>
          </ScrollReveal>
        </section>

        {/* Apa itu + Misi Visi */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                  {pick(c.apaItuTitleId, c.apaItuTitleEn)}
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  {pick(c.apaItuParagraph1Id, c.apaItuParagraph1En)}
                </p>
                <p className="text-gray-600 leading-relaxed">
                  {pick(c.apaItuParagraph2Id, c.apaItuParagraph2En)}
                </p>
              </div>

              <div className="bg-emerald-50 rounded-2xl p-8 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{isEn ? "Mission" : "Misi"}</h3>
                    <p className="text-sm text-gray-600 mt-1">{pick(c.missionId, c.missionEn)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Eye className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{isEn ? "Vision" : "Visi"}</h3>
                    <p className="text-sm text-gray-600 mt-1">{pick(c.visionId, c.visionEn)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6 Layanan Inti */}
        <section className="py-12 sm:py-16 bg-gray-50">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {isEn ? "Six Core Ecosystem Services" : "Enam Layanan Solusi Ekosistem"}
              </h2>
              <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
                {isEn
                  ? "ID-MAP services aligned with the real needs of coastal communities, regional DKP, and executing partners."
                  : "Cakupan layanan ID-MAP berdasarkan kebutuhan nyata komunitas pesisir, DKP daerah, dan mitra pelaksana."}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {c.services.map((svc, idx) => {
                const Icon = ICON_MAP[svc.iconKey] ?? Sprout;
                const svcImage = "image" in svc ? svc.image : undefined;
                return (
                  <ScrollReveal key={idx} delay={idx * 90} className="h-full">
                  <div className="group h-full bg-white rounded-xl border border-gray-100 hover:border-emerald-200 p-6 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                    {svcImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={svcImage} alt={svc.titleId} className="w-full h-32 object-cover rounded-lg mb-4 -mt-2" />
                    )}
                    <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                      <Icon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{pick(svc.titleId, svc.titleEn)}</h3>
                    <p className="text-sm text-gray-600">{pick(svc.descId, svc.descEn)}</p>
                  </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* Mengapa */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">
              {isEn ? `Why ${brandName}?` : `Mengapa ${brandName}?`}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {c.whyCards.map((item, idx) => {
                const Icon = ICON_MAP[item.iconKey] ?? Shield;
                return (
                  <ScrollReveal key={idx} delay={idx * 90} className="h-full">
                  <div className="group h-full bg-white rounded-xl border border-gray-100 hover:border-emerald-200 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                    <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                      <Icon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{pick(item.titleId, item.titleEn)}</h3>
                    <p className="text-sm text-gray-600">{pick(item.descId, item.descEn)}</p>
                  </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* Kontak */}
        <section className="py-12 sm:py-16 bg-emerald-50/40">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 text-center mb-6">
                {isEn ? "Contact Us" : "Hubungi Kami"}
              </h2>
              <div className="grid sm:grid-cols-3 gap-5">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-emerald-600 mt-1" />
                  <div className="text-sm">
                    <p className="text-gray-400 text-xs">Email</p>
                    <a href={`mailto:${email}`} className="text-gray-700 font-medium hover:text-emerald-700 break-all">
                      {email}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-emerald-600 mt-1" />
                  <div className="text-sm">
                    <p className="text-gray-400 text-xs">{isEn ? "Phone" : "Telepon"}</p>
                    <p className="text-gray-700 font-medium">{phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-emerald-600 mt-1" />
                  <div className="text-sm">
                    <p className="text-gray-400 text-xs">{isEn ? "Address" : "Alamat"}</p>
                    <p className="text-gray-700 font-medium">{address}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              {isEn ? "Ready to Contribute?" : "Siap Berkontribusi?"}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              {isEn
                ? "Join the community supporting the recovery of Indonesia's coastal ecosystems."
                : "Bergabunglah dengan komunitas yang mendukung pemulihan ekosistem pesisir Indonesia."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/daftar" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f3d2e] px-8 py-3.5 text-sm font-bold text-white hover:bg-[#14523d] transition shadow-lg">
                {isEn ? "Register Now" : "Daftar Sekarang"}
              </a>
              <a href="/" className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#0f3d2e] px-8 py-3.5 text-sm font-bold text-[#0f3d2e] hover:bg-emerald-50 transition">
                {isEn ? "Back to Home" : "Kembali ke Beranda"}
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
