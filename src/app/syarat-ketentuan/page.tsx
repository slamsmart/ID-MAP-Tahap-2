"use client";

import { FileText, UserCheck, CreditCard, AlertTriangle, Scale, ShieldOff, RefreshCw, ChevronRight } from "lucide-react";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import ScrollReveal from "@/components/shared/ScrollReveal";
import { useLanguage } from "@/contexts/LanguageContext";

const sections = [
  {
    iconKey: "UserCheck",
    titleId: "Penerimaan Syarat",
    titleEn: "Acceptance of Terms",
    items: [
      { id: "Dengan mengakses atau menggunakan platform ID-MAP, Anda menyetujui syarat dan ketentuan ini.", en: "By accessing or using the ID-MAP platform, you agree to these terms and conditions." },
      { id: "Jika Anda tidak setuju dengan syarat ini, harap hentikan penggunaan platform.", en: "If you do not agree to these terms, please discontinue use of the platform." },
      { id: "Kami berhak memperbarui syarat ini sewaktu-waktu dengan pemberitahuan melalui email.", en: "We reserve the right to update these terms at any time with notice via email." },
      { id: "Penggunaan platform setelah pembaruan berarti Anda menerima syarat yang diperbarui.", en: "Continued use of the platform after an update means you accept the revised terms." },
    ],
  },
  {
    iconKey: "FileText",
    titleId: "Ketentuan Pendaftaran Akun",
    titleEn: "Account Registration Terms",
    items: [
      { id: "Anda harus berusia minimal 17 tahun atau mendapatkan persetujuan wali untuk mendaftar.", en: "You must be at least 17 years old or have guardian consent to register." },
      { id: "Data yang Anda berikan saat mendaftar harus akurat, lengkap, dan terkini.", en: "Data you provide when registering must be accurate, complete, and up to date." },
      { id: "Anda bertanggung jawab menjaga kerahasiaan kata sandi akun Anda.", en: "You are responsible for maintaining the confidentiality of your account password." },
      { id: "Satu pengguna hanya diperbolehkan memiliki satu akun aktif di platform.", en: "One user is allowed only one active account on the platform." },
      { id: "Kami berhak menangguhkan akun yang terbukti menggunakan identitas palsu.", en: "We reserve the right to suspend accounts proven to use false identities." },
    ],
  },
  {
    iconKey: "CreditCard",
    titleId: "Ketentuan Pembayaran & Donasi",
    titleEn: "Payment & Donation Terms",
    items: [
      { id: "Semua donasi diproses melalui Mayar.id selaku penyedia layanan pembayaran resmi.", en: "All donations are processed through Mayar.id as the official payment service provider." },
      { id: "Nominal donasi minimum Rp 10.000 per transaksi untuk semua metode pembayaran.", en: "Minimum donation amount is IDR 10,000 per transaction for all payment methods." },
      { id: "Donasi yang telah diproses bersifat final dan tidak dapat dikembalikan kecuali terdapat kegagalan teknis.", en: "Processed donations are final and non-refundable except in cases of technical failure." },
      { id: "Sertifikat dampak diterbitkan otomatis setelah pembayaran berhasil dikonfirmasi.", en: "Impact certificates are automatically issued after payment is successfully confirmed." },
      { id: "ID-MAP tidak menyimpan data kartu kredit/debit Anda — semua data sensitif dikelola langsung oleh Mayar.id.", en: "ID-MAP does not store your credit/debit card data — all sensitive data is managed directly by Mayar.id." },
    ],
  },
  {
    iconKey: "AlertTriangle",
    titleId: "Larangan Penggunaan",
    titleEn: "Prohibited Activities",
    items: [
      { id: "Dilarang menggunakan platform untuk tujuan penipuan, pencucian uang, atau kegiatan ilegal.", en: "Prohibited from using the platform for fraud, money laundering, or illegal activities." },
      { id: "Dilarang mengunggah konten berbahaya, mengandung kebencian, atau melanggar hak cipta.", en: "Prohibited from uploading harmful, hateful, or copyright-infringing content." },
      { id: "Dilarang melakukan scraping, crawling, atau eksploitasi teknis terhadap sistem platform.", en: "Prohibited from scraping, crawling, or technically exploiting platform systems." },
      { id: "Dilarang menduplikasi, menjual, atau mendistribusikan konten platform tanpa izin tertulis.", en: "Prohibited from duplicating, selling, or distributing platform content without written permission." },
      { id: "Pelanggaran akan mengakibatkan penangguhan akun permanen dan potensi tindakan hukum.", en: "Violations will result in permanent account suspension and potential legal action." },
    ],
  },
  {
    iconKey: "Scale",
    titleId: "Hak Kekayaan Intelektual",
    titleEn: "Intellectual Property",
    items: [
      { id: "Logo, merek dagang, dan nama ID-MAP adalah milik eksklusif PT Solusi Pesisir Nusantara.", en: "Logo, trademarks, and the ID-MAP name are the exclusive property of PT Solusi Pesisir Nusantara." },
      { id: "Konten yang Anda unggah tetap menjadi milik Anda, namun Anda memberikan lisensi penggunaan kepada ID-MAP.", en: "Content you upload remains your property, but you grant ID-MAP a usage license." },
      { id: "Data geospasial dan peta interaktif di platform dilindungi oleh hak cipta.", en: "Geospatial data and interactive maps on the platform are protected by copyright." },
      { id: "Laporan MRV dan sertifikat dampak tidak boleh dimodifikasi setelah diterbitkan.", en: "MRV reports and impact certificates may not be modified after issuance." },
    ],
  },
  {
    iconKey: "ShieldOff",
    titleId: "Batasan Tanggung Jawab",
    titleEn: "Limitation of Liability",
    items: [
      { id: "ID-MAP tidak bertanggung jawab atas kerugian tidak langsung akibat gangguan layanan.", en: "ID-MAP is not liable for indirect losses resulting from service disruptions." },
      { id: "Platform disediakan 'sebagaimana adanya' tanpa jaminan ketersediaan 100%.", en: "The platform is provided 'as is' without 100% availability guarantee." },
      { id: "Kami berupaya menjaga akurasi data namun tidak menjamin ketepatan data real-time dari sumber pihak ketiga.", en: "We strive to maintain data accuracy but cannot guarantee real-time data from third-party sources." },
      { id: "Tanggung jawab maksimal ID-MAP terbatas pada nilai donasi yang Anda lakukan dalam 30 hari terakhir.", en: "ID-MAP's maximum liability is limited to the value of your donations in the last 30 days." },
    ],
  },
  {
    iconKey: "RefreshCw",
    titleId: "Penghentian & Pembaruan Layanan",
    titleEn: "Service Termination & Updates",
    items: [
      { id: "Anda dapat menghapus akun kapan saja melalui menu Pengaturan Akun.", en: "You may delete your account at any time through the Account Settings menu." },
      { id: "Kami berhak menghentikan layanan dengan pemberitahuan minimal 30 hari sebelumnya.", en: "We reserve the right to terminate services with at least 30 days prior notice." },
      { id: "Syarat dan ketentuan ini diatur oleh hukum Republik Indonesia.", en: "These terms and conditions are governed by the law of the Republic of Indonesia." },
      { id: "Sengketa diselesaikan melalui mediasi, atau Pengadilan Negeri Jakarta Selatan sebagai pilihan terakhir.", en: "Disputes are resolved through mediation, or South Jakarta District Court as a last resort." },
    ],
  },
];

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  FileText,
  UserCheck,
  CreditCard,
  AlertTriangle,
  Scale,
  ShieldOff,
  RefreshCw,
};

export default function SyaratKetentuanPage() {
  const { language } = useLanguage();
  const isEn = language === "en";
  const pick = (id: string, en: string) => (isEn ? en : id);

  return (
    <>
      <Navbar />
      <main className="bg-white">
        {/* Hero */}
        <section className="relative bg-[#0f3d2e] text-white py-16 sm:py-20">
          <ScrollReveal className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-800/60 text-emerald-200 text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
              <FileText className="w-3.5 h-3.5" />
              {pick("Perjanjian Pengguna", "User Agreement")}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              {pick("Syarat & Ketentuan", "Terms & Conditions")}
            </h1>
            <p className="mt-4 text-lg text-emerald-200 max-w-2xl mx-auto">
              {pick(
                "Harap baca syarat dan ketentuan penggunaan platform ID-MAP secara seksama sebelum menggunakan layanan kami.",
                "Please read the terms and conditions of using the ID-MAP platform carefully before using our services."
              )}
            </p>
            <p className="mt-3 text-sm text-emerald-300">
              {pick("Terakhir diperbarui: 22 Juni 2025", "Last updated: June 22, 2025")}
            </p>
          </ScrollReveal>
        </section>

        {/* Sections */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-8">
            {sections.map((sec, idx) => {
              const Icon = ICON_MAP[sec.iconKey] ?? FileText;
              return (
                <ScrollReveal key={idx} delay={idx * 70}>
                  <div className="bg-white rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all duration-300 p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 flex-shrink-0">
                        <span className="text-xs font-bold text-emerald-700">{idx + 1}</span>
                      </div>
                      <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-emerald-600" />
                      </div>
                      <h2 className="text-lg font-bold text-gray-900">
                        {pick(sec.titleId, sec.titleEn)}
                      </h2>
                    </div>
                    <ul className="space-y-3">
                      {sec.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                          <ChevronRight className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          {pick(item.id, item.en)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </ScrollReveal>
              );
            })}

            {/* Governing Law note */}
            <ScrollReveal delay={sections.length * 70}>
              <div className="bg-emerald-50 rounded-2xl p-6 sm:p-8">
                <p className="text-sm text-gray-700 leading-relaxed text-center">
                  {pick(
                    "Dengan menggunakan platform ID-MAP, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh Syarat & Ketentuan yang berlaku. Untuk pertanyaan lebih lanjut, hubungi kami di ",
                    "By using the ID-MAP platform, you declare that you have read, understood, and agreed to all applicable Terms & Conditions. For further questions, contact us at "
                  )}
                  <a href="mailto:info@id-map.co.id" className="text-emerald-700 font-semibold underline">info@id-map.co.id</a>.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* CTA */}
        <section className="py-10 sm:py-14">
          <ScrollReveal className="mx-auto max-w-4xl px-4 sm:px-6 flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/kebijakan-privasi" className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#0f3d2e] px-8 py-3 text-sm font-bold text-[#0f3d2e] hover:bg-emerald-50 transition">
              {pick("Kebijakan Privasi", "Privacy Policy")}
            </a>
            <a href="/" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f3d2e] px-8 py-3 text-sm font-bold text-white hover:bg-[#14523d] transition shadow-lg">
              {pick("Kembali ke Beranda", "Back to Home")}
            </a>
          </ScrollReveal>
        </section>
      </main>
      <Footer />
    </>
  );
}
