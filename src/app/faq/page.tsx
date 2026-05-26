"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

// FAQ ID-MAP — fokus pada layanan integrasi data pesisir + Pokmaswas/Mitra.
// Tidak membahas perdagangan carbon credit / blue carbon karena fokus jangka
// pendek platform adalah penguatan komunitas pesisir, bukan registry karbon.
const faqs = [
  {
    q: "Apa itu ID-MAP?",
    a: "ID-MAP (Integrasi Data dan Manajemen Pesisir) adalah platform digital yang mengintegrasikan data ekosistem pesisir Indonesia — mangrove, abrasi pantai, habitat penyu, dan jaringan Pokmaswas/Mitra. Platform menghubungkan Sahabat Pesisir (donatur publik), Mitra pelaksana proyek lapangan, Verifikator/DKP, dan komunitas pesisir dalam satu sistem yang transparan dan partisipatif.",
  },
  {
    q: "Layanan apa saja yang ditawarkan ID-MAP?",
    a: "ID-MAP menyediakan enam layanan inti solusi ekosistem pesisir: (1) Rehabilitasi Mangrove, (2) Penyulaman Mangrove, (3) Jasa Pemantauan Monev (MRV) Mangrove, (4) Decarbonisasi Aquaculture, (5) Perbaikan Habitat Penyu, dan (6) Pemberdayaan Masyarakat Pesisir. Setiap layanan dilaksanakan oleh kelompok Pokmaswas/mitra terverifikasi.",
  },
  {
    q: "Bagaimana cara mendaftar?",
    a: "Klik tombol 'Daftar' di navbar lalu pilih peran: Sahabat Pesisir (untuk individu yang ingin berdonasi dan ikut memantau dampak), atau Mitra (untuk Pokmaswas, NGO, instansi, akademisi yang menjalankan proyek lapangan). Untuk Sahabat cukup isi nama, email, no HP, dan alamat — tanpa upload KTP.",
  },
  {
    q: "Apa perbedaan peran Sahabat, Mitra, Verifikator, dan Perusahaan?",
    a: "Sahabat: individu yang mendonasi mikro via QRIS dan menerima sertifikat. Mitra: Pokmaswas/NGO/instansi yang mengelola proyek lapangan dan mengisi laporan MRV. Verifikator: tim DKP/auditor yang mengaudit data dan validasi proyek. Perusahaan: korporasi yang mendukung proyek pesisir untuk komitmen ESG/CSR.",
  },
  {
    q: "Apa itu Pokmaswas?",
    a: "Pokmaswas (Kelompok Masyarakat Pengawas) adalah kelompok masyarakat pesisir resmi binaan Ditjen PSDKP — Kementerian Kelautan dan Perikanan. Mereka menjadi mitra utama ID-MAP karena memiliki SK pengukuhan, terlatih dalam pengawasan sumber daya laut, dan paling dekat dengan ekosistem yang dijaga.",
  },
  {
    q: "Bagaimana sistem MRV bekerja di ID-MAP?",
    a: "MRV (Monitoring, Reporting, Verification) di ID-MAP berjalan dalam siklus per proyek: Mitra mengunggah bukti tanam dan pemantauan lapangan → Verifikator memvalidasi data dan dokumen pendukung → status proyek di-update menjadi Selesai dan dapat diaudit. Semua data dapat dipantau real-time di dashboard.",
  },
  {
    q: "Apakah proyek di ID-MAP terverifikasi?",
    a: "Ya. Setiap proyek harus melalui review verifikator sebelum berstatus 'Terverifikasi' dan tampil di halaman publik. Proyek juga dapat diaudit bersama DKP daerah dan instansi terkait untuk memastikan keaslian lokasi, luasan, dan dampak ekosistem.",
  },
  {
    q: "Bagaimana cara berdonasi?",
    a: "Pilih proyek Pokmaswas yang aktif di halaman beranda atau /proyek, klik 'Dukung Proyek (Scan QRIS)', login terlebih dahulu (cukup nama+email+HP+alamat), lalu pilih nominal donasi mulai Rp 10.000. Bayar via QRIS — bisa dari semua bank/e-wallet melalui Mayar.id. Sertifikat digital terbit otomatis setelah pembayaran berhasil.",
  },
  {
    q: "Apakah donasi saya tersalurkan langsung ke komunitas pelaksana?",
    a: "Ya. Setiap donasi tercatat per proyek dan masuk ke fundingRaised proyek tersebut. Mitra pelaksana melihat dana masuk di dashboard /mitra/pendanaan, sementara Sahabat dapat memantau dampak (luasan, bibit, status MRV) dari /user.",
  },
  {
    q: "Bagaimana sertifikat digital saya dapat diverifikasi?",
    a: "Setiap sertifikat memiliki ID unik (mis. IDMAP-DON-XXXXXX), nama lengkap pemegang, dan dapat diunduh sebagai SVG. Sertifikat dapat dibagikan ke WhatsApp, X/Twitter, atau dikirim sebagai bukti partisipasi pemulihan ekosistem pesisir.",
  },
  {
    q: "Bagaimana cara menghubungi tim ID-MAP?",
    a: "Anda dapat menghubungi kami melalui email yang tertera di halaman Tentang Kami atau di footer setiap halaman. Untuk pertanyaan teknis, gunakan menu Pengaturan pada dashboard masing-masing peran.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <>
      <Navbar />
      <main className="bg-white">
        <section className="bg-[#0f3d2e] text-white py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              Pertanyaan Umum (FAQ)
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-emerald-200 max-w-3xl mx-auto">
              Jawaban untuk pertanyaan yang sering diajukan tentang ID-MAP
            </p>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                    aria-expanded={openIndex === i}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition"
                  >
                    <span className="font-semibold text-gray-900 text-sm sm:text-base pr-4">{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                        openIndex === i ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openIndex === i && (
                    <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 bg-gray-50">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Masih ada pertanyaan?</h2>
            <p className="text-gray-600 mb-6">Hubungi tim kami atau daftar untuk mulai berkontribusi.</p>
            <a href="/daftar" className="inline-flex items-center justify-center rounded-xl bg-[#0f3d2e] px-8 py-3.5 text-sm font-bold text-white hover:bg-[#14523d] transition shadow-lg">
              Daftar Sekarang
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
