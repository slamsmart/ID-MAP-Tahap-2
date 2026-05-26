"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Navbar from "@/components/shared/Navbar";

const faqs = [
  {
    q: "Apa itu ID-MAP?",
    a: "ID-MAP (Integrasi Data dan Manajemen Pesisir) adalah platform digital yang mengintegrasikan data ekosistem pesisir Indonesia — mangrove, abrasi, habitat penyu, dan jaringan Pokmaswas/mitra. Platform ini menghubungkan kontribusi masyarakat, pelaksana proyek lapangan, dan kebutuhan ESG/CSR perusahaan dalam satu sistem MRV terverifikasi.",
  },
  {
    q: "Bagaimana cara mendaftar?",
    a: "Klik tombol 'Daftar' di navbar, lalu pilih peran Anda: Komunitas (untuk individu/masyarakat), Mitra (untuk NGO, developer proyek, instansi), atau Perusahaan (untuk corporate yang ingin membeli carbon credit). Isi formulir pendaftaran dan Anda akan diarahkan ke dashboard sesuai peran.",
  },
  {
    q: "Apa perbedaan peran Komunitas, Mitra, dan Perusahaan?",
    a: "Komunitas: individu yang ingin berkontribusi pada proyek mangrove. Mitra: organisasi yang mengembangkan proyek mangrove (NGO, project developer, instansi pemerintah, akademisi). Perusahaan: corporate yang ingin membeli carbon credit untuk offset emisi dan meningkatkan ESG score.",
  },
  {
    q: "Apa itu Carbon Credit?",
    a: "Carbon credit adalah sertifikat yang mewakili pengurangan 1 ton CO₂ dari atmosfer. Proyek mangrove menghasilkan carbon credit karena mangrove menyerap dan menyimpan karbon (Blue Carbon). Perusahaan membeli carbon credit untuk mengoffset emisi mereka.",
  },
  {
    q: "Bagaimana sistem MRV bekerja?",
    a: "MRV (Monitoring, Reporting, Verification) adalah sistem 3 tahap: Monitoring (pengumpulan data lapangan dan satelit), Reporting (pelaporan serapan karbon), dan Verification (verifikasi oleh pihak ketiga independen). Semua data terintegrasi dengan dashboard ID-MAP.",
  },
  {
    q: "Apa itu SRN dan mengapa penting?",
    a: "SRN (Sistem Registri Nasional) adalah sistem registrasi yang dikelola KLHK sesuai PP 98/2021 dan Permen LHK 21/2022. Registrasi SRN wajib untuk semua proyek karbon di Indonesia agar diakui secara legal dan bisa diperdagangkan.",
  },
  {
    q: "Bagaimana data serapan karbon dihitung?",
    a: "Data serapan karbon dihitung menggunakan estimasi AI dan citra satelit (Copernicus/LAPAN), dikombinasikan dengan data pengukuran lapangan. Metodologi mengacu pada standar internasional (VCS, Gold Standard) dan pedoman KLHK.",
  },
  {
    q: "Siapa mitra ID-MAP?",
    a: "Mitra utama ID-MAP meliputi Bank Indonesia, Kementerian LHK (KLHK), KKPD, dan berbagai komunitas pegiat konservasi mangrove di seluruh Indonesia.",
  },
  {
    q: "Apakah proyek mangrove di ID-MAP terverifikasi?",
    a: "Ya, setiap proyek melalui proses MRV (Monitoring, Reporting, Verification) dan diregistrasi di SRN KLHK. Proyek yang sudah terverifikasi ditandai dengan badge 'Terverifikasi' di dashboard.",
  },
  {
    q: "Bagaimana cara menghubungi tim ID-MAP?",
    a: "Anda dapat menghubungi kami melalui halaman Pengaturan di dashboard masing-masing peran, atau melalui email yang tercantum di footer website.",
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
    </>
  );
}
