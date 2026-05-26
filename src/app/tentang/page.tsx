"use client";

import { Leaf, Target, Eye, Shield, Globe, Users, BarChart3, Sprout, Anchor, HeartHandshake, Mail, Phone, MapPin } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

// 6 layanan inti ID-MAP — dipakai di hero misi-visi & section "Mengapa".
// Sumber konten ada di OurServicesSection (verifikator-editable),
// halaman ini hanya menampilkan label statis sebagai cerminan brand.
const SIX_SERVICES = [
  { icon: Sprout, title: "Rehabilitasi Mangrove", desc: "Restorasi ekosistem mangrove pesisir bersama Pokmaswas dan komunitas lokal." },
  { icon: Leaf, title: "Penyulaman Mangrove", desc: "Penanaman ulang bibit pada area yang masih jarang atau gagal tumbuh." },
  { icon: BarChart3, title: "Monev Mangrove", desc: "Jasa pemantauan, pelaporan, dan verifikasi (MRV) data mangrove digital." },
  { icon: Anchor, title: "Decarbonisasi Aquaculture", desc: "Mendukung tambak rendah emisi yang ramah ekosistem pesisir." },
  { icon: Shield, title: "Perbaikan Habitat Penyu", desc: "Konservasi titik peneluran dan penjagaan tukik bersama komunitas." },
  { icon: HeartHandshake, title: "Pemberdayaan Masyarakat Pesisir", desc: "Penguatan ekonomi & kapasitas Pokmaswas dan kelompok nelayan." },
];

export default function TentangPage() {
  const footerData = useQuery(api.footerContent.get);
  const brandName = footerData?.brandName ?? "ID-MAP";
  const descId =
    footerData?.descriptionId ??
    "Platform Integrasi Data dan Manajemen Pesisir. Menghubungkan komunitas, mitra pelaksana, dan donatur untuk pemantauan, rehabilitasi, dan keberlanjutan pesisir nusantara.";
  const email = footerData?.email ?? "info@id-map.co.id";
  const phone = footerData?.phone ?? "+62 21 1234 5678";
  const address = footerData?.address ?? "Jakarta, Indonesia";

  return (
    <>
      <Navbar />
      <main className="bg-white">
        {/* Hero */}
        <section className="bg-[#0f3d2e] text-white py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              Tentang {brandName}
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-emerald-200 max-w-3xl mx-auto">
              Platform Integrasi Data dan Manajemen Pesisir untuk ekosistem pesisir nusantara
            </p>
          </div>
        </section>

        {/* Apa itu + Misi Visi */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Apa itu {brandName}?</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  {descId}
                </p>
                <p className="text-gray-600 leading-relaxed">
                  ID-MAP mengintegrasikan data ekosistem pesisir Indonesia — mangrove, abrasi pantai,
                  habitat penyu, dan jaringan Pokmaswas/Mitra — sehingga komunitas, pemerintah daerah, dan
                  pendukung publik dapat berkolaborasi pada satu platform yang terverifikasi dan transparan.
                </p>
              </div>

              <div className="bg-emerald-50 rounded-2xl p-8 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Misi</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Mengintegrasikan data dan tata kelola pesisir Indonesia melalui enam layanan
                      inti — rehabilitasi mangrove, penyulaman, MRV digital, decarbonisasi aquaculture,
                      perbaikan habitat penyu, dan pemberdayaan masyarakat pesisir — secara transparan,
                      partisipatif, dan berkelanjutan.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Eye className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Visi</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Menjadi platform terpercaya yang mempercepat pemulihan dan keberlanjutan ekosistem
                      pesisir nusantara melalui kolaborasi data, komunitas, dan teknologi.
                    </p>
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
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Enam Layanan Solusi Ekosistem</h2>
              <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
                Cakupan layanan ID-MAP berdasarkan kebutuhan nyata komunitas pesisir, DKP daerah, dan mitra pelaksana.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {SIX_SERVICES.map((item) => (
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

        {/* Mengapa ID-MAP */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">Mengapa {brandName}?</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Shield, title: "Terverifikasi", desc: "Setiap proyek divalidasi tim verifikator dan dapat diaudit oleh DKP daerah." },
                { icon: Globe, title: "Data Spasial Terpadu", desc: "Peta interaktif terintegrasi: mangrove, abrasi, penyu, dan jaringan Pokmaswas/Mitra." },
                { icon: Users, title: "Inklusif & Partisipatif", desc: "Menghubungkan Sahabat Pesisir, Mitra pelaksana, dan komunitas lokal pada satu platform." },
                { icon: BarChart3, title: "MRV Digital", desc: "Dashboard real-time untuk pemantauan, pelaporan, dan verifikasi data lapangan." },
                { icon: HeartHandshake, title: "Dampak Nyata", desc: "Setiap kontribusi tersalurkan langsung ke kelompok masyarakat pesisir pelaksana." },
                { icon: Leaf, title: "Berkelanjutan", desc: "Mendukung pemulihan ekosistem pesisir nusantara secara jangka panjang." },
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

        {/* Kontak Kami */}
        <section className="py-12 sm:py-16 bg-emerald-50/40">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 text-center mb-6">Hubungi Kami</h2>
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
                    <p className="text-gray-400 text-xs">Telepon</p>
                    <p className="text-gray-700 font-medium">{phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-emerald-600 mt-1" />
                  <div className="text-sm">
                    <p className="text-gray-400 text-xs">Alamat</p>
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
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Siap Berkontribusi?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Bergabunglah dengan komunitas yang mendukung pemulihan ekosistem pesisir Indonesia.
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
      <Footer />
    </>
  );
}
