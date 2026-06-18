import { Handshake, Building2, Shield, Leaf, Users } from "lucide-react";
import Navbar from "@/components/shared/Navbar";
import ScrollReveal from "@/components/shared/ScrollReveal";

const partners = [
  {
    name: "Bank Indonesia",
    category: "Lembaga Keuangan",
    desc: "Mendukung pengembangan pasar karbon dan instrumen keuangan hijau untuk proyek mangrove melalui kebijakan moneter dan stabilitas sistem keuangan.",
    icon: Building2,
    color: "bg-blue-50 text-blue-700",
  },
  {
    name: "Kementerian LHK (KLHK)",
    category: "Pemerintah",
    desc: "Regulator utama ekosistem karbon Indonesia. Mengelola Sistem Registri Nasional (SRN) dan menetapkan standar MRV sesuai PP 98/2021 dan Permen LHK 21/2022.",
    icon: Shield,
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    name: "KKPD",
    category: "Pemerintah",
    desc: "Kementerian Kelautan, Perikanan, dan Desa mendukung pengelolaan kawasan pesisir dan konservasi mangrove sebagai bagian dari ekosistem laut Indonesia.",
    icon: Leaf,
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    name: "Pegiat Konservasi Mangrove",
    category: "Komunitas & NGO",
    desc: "Jaringan komunitas, LSM, dan kelompok masyarakat yang aktif dalam restorasi, konservasi, dan pengelolaan ekosistem mangrove di seluruh Indonesia.",
    icon: Users,
    color: "bg-amber-50 text-amber-700",
  },
];

export default function MitraKamiPage() {
  return (
    <>
      <Navbar />
      <main className="bg-white">
        <section className="bg-[#0f3d2e] text-white py-16 sm:py-20">
          <ScrollReveal className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              Mitra Kami
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-emerald-200 max-w-3xl mx-auto">
              Kolaborasi strategis dengan lembaga utama untuk ekosistem karbon mangrove Indonesia
            </p>
          </ScrollReveal>
        </section>

        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <ScrollReveal className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full text-sm font-medium text-emerald-700 mb-4">
                <Handshake className="w-4 h-4" />
                Kemitraan Strategis
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Didukung oleh Lembaga Terpercaya
              </h2>
            </ScrollReveal>

            <div className="grid sm:grid-cols-2 gap-6">
              {partners.map((p, i) => (
                <ScrollReveal key={p.name} delay={i * 90} className="h-full">
                <div className="h-full bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${p.color}`}>
                      <p.icon className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider mb-2 ${p.color}`}>
                        {p.category}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900">{p.name}</h3>
                      <p className="text-sm text-gray-600 mt-2 leading-relaxed">{p.desc}</p>
                    </div>
                  </div>
                </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 bg-gray-50">
          <ScrollReveal className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ingin Menjadi Mitra?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Bergabunglah sebagai mitra ID-MAP dan dukung pengembangan ekosistem karbon mangrove Indonesia.
              Kami terbuka untuk kolaborasi dengan berbagai lembaga dan organisasi.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/daftar" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f3d2e] px-8 py-3.5 text-sm font-bold text-white hover:bg-[#14523d] transition shadow-lg">
                Daftar sebagai Mitra
              </a>
              <a href="/" className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#0f3d2e] px-8 py-3.5 text-sm font-bold text-[#0f3d2e] hover:bg-emerald-50 transition">
                Kembali ke Beranda
              </a>
            </div>
          </ScrollReveal>
        </section>
      </main>
    </>
  );
}
