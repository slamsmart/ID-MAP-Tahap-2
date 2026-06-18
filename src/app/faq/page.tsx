"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import ScrollReveal from "@/components/shared/ScrollReveal";
import { useLanguage } from "@/contexts/LanguageContext";

// Default 11 FAQ — dipakai sebelum verifikator publish konten Convex.
// Fokus pada layanan integrasi data pesisir + Pokmaswas/Mitra.
const FALLBACK = {
  heroTitleId: "Pertanyaan Umum (FAQ)",
  heroTitleEn: "Frequently Asked Questions (FAQ)",
  heroSubtitleId: "Jawaban untuk pertanyaan yang sering diajukan tentang ID-MAP",
  heroSubtitleEn: "Answers to common questions about ID-MAP",
  items: [
    {
      questionId: "Apa itu ID-MAP?",
      questionEn: "What is ID-MAP?",
      answerId: "ID-MAP (Integrasi Data dan Manajemen Pesisir) adalah platform digital yang mengintegrasikan data ekosistem pesisir Indonesia — mangrove, abrasi pantai, habitat penyu, dan jaringan Pokmaswas/Mitra. Platform menghubungkan Sahabat Pesisir, Mitra pelaksana proyek, Verifikator/DKP, dan komunitas pesisir dalam satu sistem yang transparan dan partisipatif.",
      answerEn: "ID-MAP is an integrated coastal data and management platform that connects mangroves, coastal abrasion, sea-turtle habitat, and the Pokmaswas/partner network. It brings Sahabat Pesisir, executing partners, verifiers/DKP, and coastal communities together on one transparent platform.",
    },
    {
      questionId: "Layanan apa saja yang ditawarkan ID-MAP?",
      questionEn: "What services does ID-MAP offer?",
      answerId: "Enam layanan inti: (1) Rehabilitasi Mangrove, (2) Penyulaman Mangrove, (3) Jasa Pemantauan Monev (MRV) Mangrove, (4) Decarbonisasi Aquaculture, (5) Perbaikan Habitat Penyu, dan (6) Pemberdayaan Masyarakat Pesisir. Setiap layanan dilaksanakan oleh kelompok Pokmaswas/mitra terverifikasi.",
      answerEn: "Six core services: Mangrove Rehabilitation, Mangrove Replanting, Monitoring & Evaluation (MRV), Aquaculture Decarbonisation, Sea-Turtle Habitat Restoration, and Coastal Community Empowerment. Each service is delivered by verified Pokmaswas/partner groups.",
    },
    {
      questionId: "Bagaimana cara mendaftar?",
      questionEn: "How do I sign up?",
      answerId: "Klik 'Daftar' di navbar lalu pilih peran: Sahabat Pesisir (untuk individu yang berdonasi & memantau dampak) atau Mitra (untuk Pokmaswas/NGO yang menjalankan proyek lapangan). Untuk Sahabat cukup isi nama, email, no HP, dan alamat — tanpa upload KTP.",
      answerEn: "Click 'Daftar' on the navbar and choose your role: Sahabat Pesisir (for individuals who donate and track impact) or Mitra (for Pokmaswas/NGOs that run projects). Sahabat onboarding only needs name, email, phone, and address — no KTP upload.",
    },
    {
      questionId: "Apa perbedaan peran Sahabat, Mitra, Verifikator, dan Perusahaan?",
      questionEn: "What are the roles of Sahabat, Mitra, Verifikator, and Corporate?",
      answerId: "Sahabat: individu yang berdonasi mikro via QRIS dan menerima sertifikat. Mitra: Pokmaswas/NGO/instansi yang mengelola proyek lapangan dan mengisi laporan MRV. Verifikator: tim DKP/auditor yang mengaudit data dan validasi proyek. Perusahaan: korporasi yang mendukung proyek pesisir untuk komitmen ESG/CSR.",
      answerEn: "Sahabat: individual donors via QRIS who receive certificates. Mitra: Pokmaswas/NGOs/agencies that manage field projects and submit MRV reports. Verifikator: DKP/auditor team that audits data and validates projects. Corporate: companies supporting coastal projects for ESG/CSR.",
    },
    {
      questionId: "Apa itu Pokmaswas?",
      questionEn: "What is Pokmaswas?",
      answerId: "Pokmaswas (Kelompok Masyarakat Pengawas) adalah kelompok masyarakat pesisir resmi binaan Ditjen PSDKP — Kementerian Kelautan dan Perikanan. Mereka menjadi mitra utama ID-MAP karena memiliki SK pengukuhan, terlatih dalam pengawasan sumber daya laut, dan paling dekat dengan ekosistem yang dijaga.",
      answerEn: "Pokmaswas (Coastal Community Watch Group) are official coastal communities under Indonesia's Ministry of Marine Affairs (PSDKP). They are ID-MAP's primary partners because they hold formal status, are trained in marine resource oversight, and are closest to the ecosystems they protect.",
    },
    {
      questionId: "Bagaimana sistem MRV bekerja di ID-MAP?",
      questionEn: "How does MRV work in ID-MAP?",
      answerId: "MRV (Monitoring, Reporting, Verification) di ID-MAP berjalan dalam siklus per proyek: Mitra mengunggah bukti tanam dan pemantauan lapangan → Verifikator memvalidasi data dan dokumen pendukung → status proyek di-update menjadi Selesai dan dapat diaudit. Semua data dapat dipantau real-time di dashboard.",
      answerEn: "MRV in ID-MAP runs in cycles per project: Mitra uploads planting and field-monitoring evidence → Verifikator validates data and supporting documents → project status moves to Selesai and is auditable. All data is visible real-time on the dashboard.",
    },
    {
      questionId: "Apakah proyek di ID-MAP terverifikasi?",
      questionEn: "Are ID-MAP projects verified?",
      answerId: "Ya. Setiap proyek harus melalui review verifikator sebelum berstatus 'Terverifikasi' dan tampil di halaman publik. Proyek juga dapat diaudit bersama DKP daerah dan instansi terkait untuk memastikan keaslian lokasi, luasan, dan dampak ekosistem.",
      answerEn: "Yes. Every project must pass verifier review before being marked 'Verified' and shown publicly. Projects can also be audited with regional DKP and relevant agencies to confirm location, area, and ecosystem impact.",
    },
    {
      questionId: "Bagaimana cara berdonasi?",
      questionEn: "How do I donate?",
      answerId: "Pilih proyek Pokmaswas yang aktif di halaman beranda atau /proyek, klik 'Dukung Proyek (Scan QRIS)', login terlebih dahulu (nama, email, HP, alamat), lalu pilih nominal donasi mulai Rp 10.000. Bayar via QRIS — bisa dari semua bank/e-wallet melalui Mayar.id. Sertifikat digital terbit otomatis setelah pembayaran berhasil.",
      answerEn: "Pick an active Pokmaswas project from the home page or /proyek, click 'Dukung Proyek (Scan QRIS)', sign in (name, email, phone, address), and choose a donation amount starting from Rp 10,000. Pay via QRIS — all banks/e-wallets via Mayar.id. A digital certificate is issued automatically after successful payment.",
    },
    {
      questionId: "Apakah donasi saya tersalurkan langsung ke komunitas pelaksana?",
      questionEn: "Does my donation go directly to the executing community?",
      answerId: "Ya. Setiap donasi tercatat per proyek dan masuk ke fundingRaised proyek tersebut. Mitra pelaksana melihat dana masuk di dashboard /mitra/pendanaan, sementara Sahabat dapat memantau dampak (luasan, bibit, status MRV) dari /user.",
      answerEn: "Yes. Every donation is recorded per project and added to that project's funding. Executing partners see incoming funds in /mitra/pendanaan, while Sahabat can track impact (area, seedlings, MRV status) from /user.",
    },
    {
      questionId: "Bagaimana sertifikat digital saya dapat diverifikasi?",
      questionEn: "How can my digital certificate be verified?",
      answerId: "Setiap sertifikat memiliki ID unik (mis. IDMAP-DON-XXXXXX), nama lengkap pemegang, dan dapat diunduh sebagai SVG. Sertifikat dapat dibagikan ke WhatsApp, X/Twitter, atau dikirim sebagai bukti partisipasi pemulihan ekosistem pesisir.",
      answerEn: "Every certificate has a unique ID (e.g. IDMAP-DON-XXXXXX), the holder's full name, and is downloadable as SVG. It can be shared to WhatsApp, X/Twitter, or sent as proof of participation in coastal restoration.",
    },
    {
      questionId: "Bagaimana cara menghubungi tim ID-MAP?",
      questionEn: "How do I contact the ID-MAP team?",
      answerId: "Anda dapat menghubungi kami melalui email yang tertera di halaman Tentang Kami atau di footer setiap halaman. Untuk pertanyaan teknis, gunakan menu Pengaturan pada dashboard masing-masing peran.",
      answerEn: "Reach us through the email on the About page or the footer of every page. For technical questions, use the Pengaturan menu in your role dashboard.",
    },
  ],
};

export default function FAQPage() {
  const data = useQuery(api.faqContent.get);
  const { language } = useLanguage();
  const isEn = language === "en";
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const c = data ?? FALLBACK;
  const pick = (id: string, en: string) => (isEn ? en : id);

  return (
    <>
      <Navbar />
      <main className="bg-white">
        <section className="bg-[#0f3d2e] text-white py-16 sm:py-20">
          <ScrollReveal className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              {pick(c.heroTitleId, c.heroTitleEn)}
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-emerald-200 max-w-3xl mx-auto">
              {pick(c.heroSubtitleId, c.heroSubtitleEn)}
            </p>
          </ScrollReveal>
        </section>

        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="space-y-3">
              {c.items.map((faq, i) => {
                const q = pick(faq.questionId, faq.questionEn);
                const a = pick(faq.answerId, faq.answerEn);
                return (
                  <ScrollReveal key={i} delay={Math.min(i, 6) * 70}>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenIndex(openIndex === i ? null : i)}
                      aria-expanded={openIndex === i}
                      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition"
                    >
                      <span className="font-semibold text-gray-900 text-sm sm:text-base pr-4">{q}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                          openIndex === i ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {openIndex === i && (
                      <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3 whitespace-pre-line">
                        {a}
                      </div>
                    )}
                  </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 bg-gray-50">
          <ScrollReveal className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              {isEn ? "Still have questions?" : "Masih ada pertanyaan?"}
            </h2>
            <p className="text-gray-600 mb-6">
              {isEn
                ? "Reach our team or sign up to start contributing."
                : "Hubungi tim kami atau daftar untuk mulai berkontribusi."}
            </p>
            <a href="/daftar" className="inline-flex items-center justify-center rounded-xl bg-[#0f3d2e] px-8 py-3.5 text-sm font-bold text-white hover:bg-[#14523d] transition shadow-lg">
              {isEn ? "Register Now" : "Daftar Sekarang"}
            </a>
          </ScrollReveal>
        </section>
      </main>
      <Footer />
    </>
  );
}
