"use client";

import { TreePine, Sprout, BarChart3, Fish, Shield, Users, CheckCircle2 } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useLanguage } from "@/contexts/LanguageContext";

const services = [
  {
    key: "rehabilitasi-mangrove",
    iconName: "TreePine",
    icon: TreePine,
    title: ["Rehabilitasi Mangrove", "Mangrove Rehabilitation"],
    desc: [
      "Penanaman dan pemulihan kawasan mangrove terdegradasi dengan pendekatan berbasis ekosistem dan partisipasi masyarakat lokal.",
      "Planting and restoring degraded mangrove areas using ecosystem-based approaches with local community participation.",
    ],
    image: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=800&q=80",
    values: [
      ["600.000 ha", "Target PMN Nasional"],
      ["47,8%", "Realisasi s/d 2024"],
      ["9 Provinsi", "Prioritas Restorasi"],
    ],
    iconBg: "bg-emerald-700",
    badge: "bg-emerald-600",
    badgeText: "Ekosistem",
  },
  {
    key: "penyulaman-mangrove",
    iconName: "Sprout",
    icon: Sprout,
    title: ["Penyulaman Mangrove", "Mangrove Replanting"],
    desc: [
      "Pengisian kembali tanaman yang mati atau rusak untuk memastikan kepadatan tegakan dan keberhasilan tumbuh jangka panjang.",
      "Refilling dead or damaged plants to ensure stand density and long-term growth success.",
    ],
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80",
    values: [
      ["85%+", "Survival Rate Target"],
      ["120+ Spesies", "Mangrove Lokal"],
      ["Monitoring", "Rutin Berkala"],
    ],
    iconBg: "bg-teal-700",
    badge: "bg-teal-600",
    badgeText: "Revegetasi",
  },
  {
    key: "monev-mangrove",
    iconName: "BarChart3",
    icon: BarChart3,
    title: ["Jasa Pemantauan Monev Mangrove", "Mangrove Monitoring & Evaluation"],
    desc: [
      "Pemantauan, evaluasi, dan pelaporan MRV berkala menggunakan teknologi penginderaan jauh dan survei lapangan terstandar.",
      "Periodic monitoring, evaluation, and MRV reporting using remote sensing technology and standardized field surveys.",
    ],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    values: [
      ["Citra 10m", "Resolusi Satelit"],
      ["MRV Ready", "SRN KLHK"],
      ["Laporan ESG", "Otomatis"],
    ],
    iconBg: "bg-blue-700",
    badge: "bg-blue-600",
    badgeText: "Teknologi",
  },
  {
    key: "decarbonisasi-aquaculture",
    iconName: "Fish",
    icon: Fish,
    title: ["Decarbonisasi Aquaculture", "Aquaculture Decarbonization"],
    desc: [
      "Integrasi mangrove pada tambak budidaya untuk mereduksi emisi karbon dan meningkatkan produktivitas ekosistem pesisir secara berkelanjutan.",
      "Integrating mangroves into aquaculture ponds to reduce carbon emissions and sustainably enhance coastal ecosystem productivity.",
    ],
    image: "https://images.unsplash.com/photo-1559825481-12a05cc00344?auto=format&fit=crop&w=800&q=80",
    values: [
      ["185 tCO₂", "Serapan/ha/tahun"],
      ["Blue Carbon", "Credit Eligible"],
      ["USD 345 Juta", "Potensi/tahun"],
    ],
    iconBg: "bg-cyan-700",
    badge: "bg-cyan-600",
    badgeText: "Carbon Credit",
  },
  {
    key: "habitat-penyu",
    iconName: "Shield",
    icon: Shield,
    title: ["Perbaikan Habitat Penyu", "Sea Turtle Habitat Restoration"],
    desc: [
      "Pemulihan kawasan pantai bersarang penyu melalui rehabilitasi vegetasi pesisir dan pengelolaan kawasan berbasis konservasi.",
      "Restoring sea turtle nesting beaches through coastal vegetation rehabilitation and conservation-based area management.",
    ],
    image: "https://images.unsplash.com/photo-1559827291-72ee739d0d9a?auto=format&fit=crop&w=800&q=80",
    values: [
      ["5 Spesies", "Penyu Dilindungi"],
      ["Patroli 24/7", "Pantai Bersarang"],
      ["Zero Poaching", "Target Program"],
    ],
    iconBg: "bg-orange-600",
    badge: "bg-orange-500",
    badgeText: "Konservasi",
  },
  {
    key: "pemberdayaan-pesisir",
    iconName: "Users",
    icon: Users,
    title: ["Pemberdayaan Masyarakat Pesisir", "Coastal Community Empowerment"],
    desc: [
      "Penguatan kapasitas Pokmaswas dan masyarakat pesisir melalui pelatihan, pendampingan, dan sistem informasi pengawasan ekosistem mandiri.",
      "Strengthening Pokmaswas and coastal community capacity through training, mentoring, and independent ecosystem monitoring information systems.",
    ],
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80",
    values: [
      ["500+ Kelompok", "Pokmaswas Aktif"],
      ["Bersertifikat", "Training Resmi"],
      ["Dashboard", "Pelaporan Digital"],
    ],
    iconBg: "bg-purple-700",
    badge: "bg-purple-600",
    badgeText: "Komunitas",
  },
];

const iconMap = {
  TreePine,
  Sprout,
  BarChart3,
  Fish,
  Shield,
  Users,
};

export default function OurServicesSection() {
  const { t } = useLanguage();
  const editableServices = useQuery(api.serviceContent.list);
  const savedByKey = new Map((editableServices ?? []).map((svc) => [svc.key, svc]));
  const displayServices = services.map((svc) => {
    const saved = savedByKey.get(svc.key);
    if (!saved) return svc;
    return {
      key: saved.key,
      iconName: saved.iconName,
      icon: iconMap[saved.iconName as keyof typeof iconMap] ?? svc.icon,
      title: [saved.titleId, saved.titleEn],
      desc: [saved.descriptionId, saved.descriptionEn],
      image: saved.image,
      values: [
        [saved.value1, saved.label1],
        [saved.value2, saved.label2],
        [saved.value3, saved.label3],
      ],
      iconBg: saved.iconBgClass,
      badge: saved.badgeClass,
      badgeText: saved.badgeText,
    };
  });

  return (
    <section className="py-16 bg-gray-50">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 text-xs font-semibold tracking-widest uppercase text-emerald-700 bg-emerald-100 rounded-full mb-3">
            {t("Layanan Kami", "Our Services")}
          </span>
          <h2 className="text-4xl font-extrabold tracking-tight text-[#0f3d2e]">
            {t("Solusi Ekosistem Pesisir", "Coastal Ecosystem Solutions")}
          </h2>
          <p className="mt-3 text-slate-500 max-w-2xl mx-auto text-sm">
            {t(
              "ID-MAP menyediakan layanan komprehensif untuk pemulihan, pemantauan, dan perlindungan ekosistem mangrove dan pesisir Indonesia.",
              "ID-MAP provides comprehensive services for the restoration, monitoring, and protection of Indonesia's mangrove and coastal ecosystems."
            )}
          </p>
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayServices.map((svc) => {
            const Icon = svc.icon;
            return (
              <div
                key={svc.key}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex flex-col"
              >
                {/* Thumbnail */}
                <div className="relative h-44 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={svc.image}
                    alt={svc.title[0]}
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  {/* Badge top-right */}
                  <span className={`absolute top-3 right-3 text-[10px] font-bold text-white px-2.5 py-1 rounded-full ${svc.badge}`}>
                    {svc.badgeText}
                  </span>
                  {/* Icon bottom-left */}
                  <div className={`absolute bottom-3 left-4 z-10 w-12 h-12 rounded-xl flex items-center justify-center ${svc.iconBg} shadow-lg border-2 border-white`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1 gap-3">
                  <h3 className="font-bold text-[#0f3d2e] text-base leading-snug">
                    {t(svc.title[0], svc.title[1])}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed flex-1">
                    {t(svc.desc[0], svc.desc[1])}
                  </p>

                  {/* Value Points */}
                  <div className="grid grid-cols-3 gap-1.5 pt-3 border-t border-gray-100">
                    {svc.values.map(([val, lbl]) => (
                      <div key={lbl} className="text-center">
                        <p className="text-sm font-extrabold text-[#0f3d2e] leading-tight">{val}</p>
                        <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{lbl}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
