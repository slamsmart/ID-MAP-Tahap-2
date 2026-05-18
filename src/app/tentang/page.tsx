import { Leaf, Target, Eye, Shield, Globe, Users, BarChart3 } from "lucide-react";
import Navbar from "@/components/shared/Navbar";

export default function TentangPage() {
  return (
    <>
      <Navbar />
      <main className="bg-white">
        <section className="bg-[#0f3d2e] text-white py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              Tentang ID-MAP
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-emerald-200 max-w-3xl mx-auto">
              Pre-Market Carbon Infrastructure Platform untuk ekosistem karbon mangrove Indonesia
            </p>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Apa itu ID-MAP?</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  ID-MAP (Indonesia Mangrove Action Platform) adalah platform infrastruktur digital yang menghubungkan
                  kontribusi masyarakat, pengembangan proyek mangrove, dan kebutuhan carbon credit perusahaan.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Platform ini dirancang untuk mendukung perdagangan karbon mangrove di Indonesia melalui
                  sistem MRV (Monitoring, Reporting, Verification) yang terintegrasi dengan Sistem Registri
                  Nasional (SRN) KLHK sesuai PP 98/2021 dan Permen LHK 21/2022.
                </p>
              </div>
              <div className="bg-emerald-50 rounded-2xl p-8 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Misi</h3>
                    <p className="text-sm text-gray-600 mt-1">Mempercepat restorasi mangrove Indonesia melalui mekanisme pasar karbon yang transparan dan inklusif.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Eye className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Visi</h3>
                    <p className="text-sm text-gray-600 mt-1">Menjadi platform infrastruktur karbon terdepan yang mendukung target Indonesia dalam Net Zero Emission 2060.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 bg-gray-50">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">Mengapa ID-MAP?</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Shield, title: "Terverifikasi & Terpercaya", desc: "Sistem MRV terintegrasi memastikan setiap proyek terverifikasi dengan standar internasional." },
                { icon: Globe, title: "Teregistrasi SRN KLHK", desc: "Sesuai regulasi PP 98/2021, semua proyek terdaftar di Sistem Registri Nasional KLHK." },
                { icon: Users, title: "Inklusif", desc: "Menghubungkan komunitas, mitra proyek, dan perusahaan dalam satu ekosistem terpadu." },
                { icon: Leaf, title: "Fokus Mangrove", desc: "Spesialisasi pada ekosistem Blue Carbon mangrove dan pesisir Indonesia." },
                { icon: BarChart3, title: "Data Transparan", desc: "Dashboard real-time dengan data estimasi AI/Satelit untuk monitoring serapan karbon." },
                { icon: Target, title: "Dampak Nyata", desc: "Setiap kontribusi langsung terhubung ke proyek restorasi mangrove di lapangan." },
              ].map((item) => (
                <div key={item.title} className="bg-white rounded-xl border border-gray-100 p-6">
                  <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mb-4">
                    <item.icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Siap Berkontribusi?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Bergabunglah dengan ribuan kontributor yang telah mendukung proyek mangrove Indonesia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/daftar" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f3d2e] px-8 py-3.5 text-sm font-bold text-white hover:bg-[#14523d] transition shadow-lg">
                Daftar Sekarang
              </a>
              <a href="/" className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#0f3d2e] px-8 py-3.5 text-sm font-bold text-[#0f3d2e] hover:bg-emerald-50 transition">
                Kembali ke Beranda
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
