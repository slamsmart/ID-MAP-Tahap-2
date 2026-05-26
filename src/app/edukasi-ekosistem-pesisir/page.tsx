import Link from "next/link";
import {
  Waves,
  TreePine,
  Fish,
  Shield,
  BarChart3,
  Leaf,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Users,
  Sprout,
} from "lucide-react";
import Navbar from "@/components/shared/Navbar";

const pillars = [
  {
    icon: TreePine,
    title: "Rehabilitasi Mangrove",
    desc: "Pemulihan kawasan mangrove terdegradasi melalui penanaman berbasis ekosistem, seleksi jenis lokal, dan keterlibatan masyarakat pesisir sebagai ujung tombak pemulihan.",
    color: "bg-emerald-50 border-emerald-100",
    iconBg: "bg-emerald-700",
  },
  {
    icon: Waves,
    title: "Pengendalian Abrasi Pantai",
    desc: "Strategi perlindungan garis pantai menggunakan kombinasi vegetasi mangrove, terumbu karang buatan, dan struktur bioengineering untuk meredam energi gelombang.",
    color: "bg-blue-50 border-blue-100",
    iconBg: "bg-blue-700",
  },
  {
    icon: Fish,
    title: "Pengelolaan Perikanan Berkelanjutan",
    desc: "Integrasi zona konservasi perikanan dalam kawasan pesisir untuk menjaga keseimbangan antara produktivitas ekonomi dan kelestarian keanekaragaman hayati laut.",
    color: "bg-cyan-50 border-cyan-100",
    iconBg: "bg-cyan-700",
  },
  {
    icon: Shield,
    title: "Perlindungan Habitat Satwa",
    desc: "Pemulihan habitat kritis bagi penyu, burung migran, dan biota pesisir lain melalui zonasi perlindungan, monitoring rutin, dan edukasi komunitas nelayan.",
    color: "bg-orange-50 border-orange-100",
    iconBg: "bg-orange-600",
  },
  {
    icon: BarChart3,
    title: "Pemantauan & MRV",
    desc: "Sistem Monitoring, Reporting, dan Verification berbasis teknologi penginderaan jauh dan survei lapangan untuk memastikan akuntabilitas setiap program restorasi.",
    color: "bg-purple-50 border-purple-100",
    iconBg: "bg-purple-700",
  },
  {
    icon: Users,
    title: "Pemberdayaan Masyarakat Pesisir",
    desc: "Penguatan kapasitas kelompok Pokmaswas, nelayan, dan petambak melalui pelatihan teknis, akses pendanaan, dan integrasi kearifan lokal dalam tata kelola pesisir.",
    color: "bg-teal-50 border-teal-100",
    iconBg: "bg-teal-700",
  },
];

const threats = [
  { label: "Konversi lahan tambak & pertanian", icon: "🌾" },
  { label: "Abrasi & erosi garis pantai", icon: "🌊" },
  { label: "Pencemaran limbah industri & domestik", icon: "🏭" },
  { label: "Penebangan liar mangrove", icon: "🪓" },
  { label: "Perubahan iklim & kenaikan muka laut", icon: "🌡️" },
  { label: "Pendangkalan muara & sungai", icon: "🏞️" },
];

const steps = [
  {
    no: "01",
    title: "Identifikasi & Pemetaan",
    desc: "Survei kondisi eksisting kawasan menggunakan citra satelit, drone, dan survei lapangan untuk menetapkan zona prioritas.",
  },
  {
    no: "02",
    title: "Perencanaan Berbasis Data",
    desc: "Penyusunan rencana aksi restorasi berdasarkan analisis data ekologi, sosial, dan ekonomi kawasan pesisir.",
  },
  {
    no: "03",
    title: "Implementasi Lapangan",
    desc: "Penanaman, penyulaman, dan perbaikan habitat dilaksanakan bersama komunitas lokal dengan pendampingan teknis.",
  },
  {
    no: "04",
    title: "Pemantauan & Evaluasi",
    desc: "Monitoring pertumbuhan, tingkat hidup tanaman, dan kesehatan ekosistem secara berkala menggunakan teknologi MRV.",
  },
  {
    no: "05",
    title: "Pelaporan & Sertifikasi",
    desc: "Penyusunan laporan MRV, registrasi di SRN KLHK, dan sertifikasi karbon biru untuk pasar karbon nasional & internasional.",
  },
];

const stats = [
  { value: "3,36 jt ha", label: "Luas mangrove Indonesia", sub: "Terbesar di dunia (20,4%)" },
  { value: "600+", label: "Ribu ha terdegradasi", sub: "Perlu rehabilitasi segera" },
  { value: "185 ton", label: "CO₂e/ha/tahun", sub: "Kapasitas serapan karbon biru" },
  { value: "34", label: "Provinsi prioritas", sub: "Program PMN & BRGMN" },
];

export default function EdukasiEkosistemPesisirPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white text-slate-900">

        {/* Hero */}
        <section className="relative bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#047857] text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #34d399 0%, transparent 60%), radial-gradient(circle at 80% 20%, #6ee7b7 0%, transparent 50%)" }}
          />
          <div className="relative max-w-5xl mx-auto px-6 py-24 text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold tracking-widest uppercase bg-white/10 rounded-full mb-6 border border-white/20">
              <Leaf className="w-3.5 h-3.5 text-emerald-300" />
              Edukasi Ekosistem Pesisir
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-5">
              Pengelolaan Kawasan<br />
              <span className="text-emerald-300">Ekosistem Pesisir</span>
            </h1>
            <p className="text-lg text-emerald-100 max-w-2xl mx-auto leading-relaxed mb-8">
              Panduan komprehensif memahami ekosistem pesisir Indonesia — ancaman, strategi pengelolaan,
              dan peran komunitas dalam menjaga kekayaan alam garis pantai kita.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#pilar" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-900 font-semibold rounded-full hover:bg-emerald-50 transition-colors text-sm">
                Mulai Belajar <ArrowRight className="w-4 h-4" />
              </a>
              <Link href="/jelajahi-peta-mangrove" className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-full hover:bg-white/20 transition-colors text-sm">
                <Globe className="w-4 h-4" />
                Peta Restorasi Lingkungan
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="bg-[#0f3d2e] text-white py-8">
          <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-extrabold text-emerald-300">{s.value}</p>
                <p className="text-xs font-semibold text-white mt-0.5">{s.label}</p>
                <p className="text-xs text-emerald-400/70 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Apa itu ekosistem pesisir */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <span className="text-xs font-semibold tracking-widest uppercase text-emerald-600">Pengantar</span>
                <h2 className="text-3xl font-extrabold text-[#0f3d2e] mt-2 mb-4 leading-snug">
                  Apa itu Ekosistem Pesisir?
                </h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Ekosistem pesisir adalah zona transisi antara daratan dan lautan yang mencakup
                  hutan mangrove, padang lamun, terumbu karang, estuari, dan pantai berpasir.
                  Area ini menjadi fondasi kehidupan jutaan spesies dan tempat bergantung ratusan
                  juta manusia di seluruh dunia.
                </p>
                <p className="text-slate-600 leading-relaxed mb-6">
                  Indonesia memiliki garis pantai terpanjang kedua di dunia (±99.093 km) dengan
                  kekayaan ekosistem pesisir yang tak tertandingi — namun juga menghadapi tekanan
                  degradasi yang semakin mengkhawatirkan.
                </p>
                <ul className="space-y-2">
                  {["Penyangga bencana: tsunami, badai, abrasi", "Penyerap karbon biru terbesar di bumi", "Habitat pemijahan ikan & biota laut", "Sumber penghidupan 60+ juta nelayan Indonesia"].map((pt) => (
                    <li key={pt} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { emoji: "🌿", label: "Hutan Mangrove", desc: "Pelindung pantai & penyerap karbon" },
                  { emoji: "🪸", label: "Terumbu Karang", desc: "Rumah 25% spesies laut" },
                  { emoji: "🌊", label: "Padang Lamun", desc: "Habitat dugong & penyu" },
                  { emoji: "🐠", label: "Estuari", desc: "Zona pemijahan ikan komersial" },
                ].map((item) => (
                  <div key={item.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
                    <div className="text-3xl mb-2">{item.emoji}</div>
                    <p className="text-sm font-bold text-[#0f3d2e]">{item.label}</p>
                    <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Ancaman */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-10">
              <span className="text-xs font-semibold tracking-widest uppercase text-red-600">Ancaman Utama</span>
              <h2 className="text-3xl font-extrabold text-[#0f3d2e] mt-2">
                Mengapa Ekosistem Pesisir Terancam?
              </h2>
              <p className="text-slate-500 mt-3 max-w-xl mx-auto text-sm">
                Indonesia kehilangan lebih dari 600.000 ha mangrove akibat berbagai tekanan antropogenik dan perubahan iklim.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {threats.map((t) => (
                <div key={t.label} className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl p-4">
                  <span className="text-2xl flex-shrink-0">{t.icon}</span>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-700 font-medium">{t.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6 Pilar Pengelolaan */}
        <section id="pilar" className="py-16 bg-gray-50">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-12">
              <span className="text-xs font-semibold tracking-widest uppercase text-emerald-600">6 Pilar Utama</span>
              <h2 className="text-3xl font-extrabold text-[#0f3d2e] mt-2">
                Strategi Pengelolaan Terpadu
              </h2>
              <p className="text-slate-500 mt-3 max-w-xl mx-auto text-sm">
                Pendekatan holistik yang mengintegrasikan aspek ekologi, sosial, dan ekonomi untuk pengelolaan pesisir berkelanjutan.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pillars.map((p) => {
                const Icon = p.icon;
                return (
                  <div key={p.title} className={`rounded-2xl border p-6 flex flex-col gap-4 bg-white shadow-sm hover:shadow-md transition-shadow ${p.color}`}>
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${p.iconBg}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#0f3d2e] text-base mb-2">{p.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{p.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Tahapan Restorasi */}
        <section className="py-16 bg-[#064e3b] text-white">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-12">
              <span className="text-xs font-semibold tracking-widest uppercase text-emerald-300">Proses</span>
              <h2 className="text-3xl font-extrabold mt-2">
                Tahapan Program Restorasi
              </h2>
              <p className="text-emerald-200 mt-3 max-w-xl mx-auto text-sm">
                Dari pemetaan hingga sertifikasi karbon — setiap langkah terukur dan terdokumentasi.
              </p>
            </div>
            <div className="space-y-4">
              {steps.map((s, i) => (
                <div key={s.no} className="flex gap-5 items-start bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600/40 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-extrabold text-emerald-300">{s.no}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base mb-1">{s.title}</h4>
                    <p className="text-sm text-emerald-200 leading-relaxed">{s.desc}</p>
                  </div>
                  {i < steps.length - 1 && (
                    <ArrowRight className="w-5 h-5 text-emerald-500/40 flex-shrink-0 mt-3 hidden md:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Peran Komunitas */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <span className="text-xs font-semibold tracking-widest uppercase text-emerald-600">Komunitas</span>
                <h2 className="text-3xl font-extrabold text-[#0f3d2e] mt-2 mb-4 leading-snug">
                  Peran Aktif Masyarakat dalam Menjaga Pesisir
                </h2>
                <p className="text-slate-600 leading-relaxed mb-6">
                  Keberhasilan pengelolaan ekosistem pesisir sangat bergantung pada keterlibatan
                  aktif masyarakat lokal. Kelompok Pokmaswas, nelayan, dan petambak adalah garda
                  terdepan dalam deteksi dini ancaman dan pelaksanaan program restorasi.
                </p>
                <div className="space-y-3">
                  {[
                    { icon: Sprout, text: "Berpartisipasi dalam kegiatan penanaman mangrove" },
                    { icon: Shield, text: "Pengawasan kawasan pesisir dari Pokmaswas" },
                    { icon: BarChart3, text: "Pelaporan data kondisi ekosistem secara berkala" },
                    { icon: Users, text: "Edukasi generasi muda tentang pentingnya pesisir" },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.text} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                        <div className="w-8 h-8 bg-emerald-700 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-sm text-slate-700">{item.text}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 p-8 text-center">
                <div className="text-6xl mb-4">🌱</div>
                <h3 className="font-extrabold text-2xl text-[#0f3d2e] mb-2">Bergabung Bersama Kami</h3>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                  ID-MAP menghubungkan Anda dengan proyek restorasi mangrove terverifikasi di seluruh
                  Indonesia. Setiap kontribusi tercatat transparan dan berdampak nyata.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/daftar?peran=sahabat"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-700 text-white font-semibold rounded-full hover:bg-emerald-800 transition-colors text-sm"
                  >
                    <Leaf className="w-4 h-4" />
                    Daftar Sekarang
                  </Link>
                  <Link
                    href="/jelajahi-peta-mangrove"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-emerald-700 text-emerald-700 font-semibold rounded-full hover:bg-emerald-50 transition-colors text-sm"
                  >
                    <Globe className="w-4 h-4" />
                    Jelajahi Peta
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
