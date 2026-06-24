"use client";

import { Shield, Database, Lock, Eye, UserCheck, Mail, Phone, MapPin, ChevronRight } from "lucide-react";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import ScrollReveal from "@/components/shared/ScrollReveal";
import { useLanguage } from "@/contexts/LanguageContext";

const sections = [
  {
    iconKey: "Database",
    titleId: "Data yang Kami Kumpulkan",
    titleEn: "Data We Collect",
    items: [
      { id: "Informasi identitas: nama lengkap, alamat email, nomor telepon.", en: "Identity information: full name, email address, phone number." },
      { id: "Informasi akun: nama pengguna, kata sandi terenkripsi, foto profil.", en: "Account information: username, encrypted password, profile photo." },
      { id: "Data transaksi: riwayat donasi, ID pembayaran, nominal kontribusi.", en: "Transaction data: donation history, payment ID, contribution amounts." },
      { id: "Data lokasi (opsional): koordinat GPS saat pelaporan kegiatan lapangan.", en: "Location data (optional): GPS coordinates when reporting field activities." },
      { id: "Data teknis: alamat IP, jenis perangkat, browser, dan log aktivitas.", en: "Technical data: IP address, device type, browser, and activity logs." },
    ],
  },
  {
    iconKey: "Eye",
    titleId: "Bagaimana Kami Menggunakan Data",
    titleEn: "How We Use Your Data",
    items: [
      { id: "Mengelola akun dan autentikasi pengguna di platform ID-MAP.", en: "Managing your account and user authentication on the ID-MAP platform." },
      { id: "Memproses transaksi donasi dan penerbitan sertifikat dampak.", en: "Processing donation transactions and issuing impact certificates." },
      { id: "Mengirimkan notifikasi terkait proyek yang Anda dukung.", en: "Sending notifications related to projects you support." },
      { id: "Meningkatkan kualitas layanan platform melalui analisis data agregat.", en: "Improving platform service quality through aggregated data analysis." },
      { id: "Memenuhi kewajiban hukum dan regulasi yang berlaku di Indonesia.", en: "Complying with applicable laws and regulations in Indonesia." },
    ],
  },
  {
    iconKey: "UserCheck",
    titleId: "Berbagi Data dengan Pihak Ketiga",
    titleEn: "Sharing Data with Third Parties",
    items: [
      { id: "Mayar.id: penyedia layanan pembayaran untuk memproses transaksi.", en: "Mayar.id: payment service provider to process transactions." },
      { id: "Cloudinary: penyimpanan media foto dan dokumen verifikasi proyek.", en: "Cloudinary: media storage for photos and project verification documents." },
      { id: "Convex: platform backend dan basis data real-time terenkripsi.", en: "Convex: backend platform and encrypted real-time database." },
      { id: "Pihak pemerintah (DKP/KLHK) bila diwajibkan oleh hukum.", en: "Government entities (DKP/KLHK) when required by law." },
      { id: "Kami tidak pernah menjual data pribadi Anda kepada pihak ketiga manapun.", en: "We never sell your personal data to any third party." },
    ],
  },
  {
    iconKey: "Lock",
    titleId: "Keamanan Data",
    titleEn: "Data Security",
    items: [
      { id: "Enkripsi HTTPS/TLS untuk semua transmisi data antara browser dan server.", en: "HTTPS/TLS encryption for all data transmissions between browser and server." },
      { id: "Kata sandi disimpan dalam bentuk hash bcrypt — kami tidak pernah melihat kata sandi asli Anda.", en: "Passwords stored as bcrypt hashes — we never see your plain password." },
      { id: "Kontrol akses berbasis peran (RBAC) membatasi akses internal ke data sensitif.", en: "Role-based access control (RBAC) restricts internal access to sensitive data." },
      { id: "Audit log otomatis untuk setiap perubahan data kritis di platform.", en: "Automated audit logs for every critical data change on the platform." },
    ],
  },
  {
    iconKey: "Shield",
    titleId: "Hak Anda sebagai Pengguna",
    titleEn: "Your Rights as a User",
    items: [
      { id: "Hak akses: meminta salinan data pribadi yang kami simpan.", en: "Right of access: request a copy of personal data we store." },
      { id: "Hak koreksi: memperbarui data yang tidak akurat melalui pengaturan akun.", en: "Right of correction: update inaccurate data via account settings." },
      { id: "Hak penghapusan: meminta penghapusan akun dan data terkait.", en: "Right to erasure: request deletion of your account and associated data." },
      { id: "Hak portabilitas: mengekspor riwayat donasi Anda dalam format CSV.", en: "Right to portability: export your donation history in CSV format." },
      { id: "Untuk menggunakan hak-hak di atas, hubungi kami di official@id-map.app.", en: "To exercise these rights, contact us at official@id-map.app." },
    ],
  },
];

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Database,
  Eye,
  UserCheck,
  Lock,
  Shield,
};

export default function KebijakanPrivasiPage() {
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
              <Shield className="w-3.5 h-3.5" />
              {pick("Perlindungan Data", "Data Protection")}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              {pick("Kebijakan Privasi", "Privacy Policy")}
            </h1>
            <p className="mt-4 text-lg text-emerald-200 max-w-2xl mx-auto">
              {pick(
                "Kami berkomitmen melindungi privasi dan keamanan data pribadi Anda. Halaman ini menjelaskan cara kami mengumpulkan, menggunakan, dan menjaga data Anda.",
                "We are committed to protecting your privacy and personal data security. This page explains how we collect, use, and safeguard your data."
              )}
            </p>
            <p className="mt-3 text-sm text-emerald-300">
              {pick("Terakhir diperbarui: 22 Juni 2025", "Last updated: June 22, 2025")}
            </p>
          </ScrollReveal>
        </section>

        {/* Sections */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-10">
            {sections.map((sec, idx) => {
              const Icon = ICON_MAP[sec.iconKey] ?? Shield;
              return (
                <ScrollReveal key={idx} delay={idx * 80}>
                  <div className="bg-white rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all duration-300 p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-5">
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

            {/* Cookie section */}
            <ScrollReveal delay={sections.length * 80}>
              <div className="bg-emerald-50 rounded-2xl p-6 sm:p-8">
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                  {pick("Cookie & Pelacakan", "Cookies & Tracking")}
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {pick(
                    "Kami menggunakan cookie sesi untuk menjaga status login Anda dan cookie analitik anonim untuk memahami pola penggunaan platform. Anda dapat menonaktifkan cookie melalui pengaturan browser, namun beberapa fitur platform mungkin tidak berfungsi optimal.",
                    "We use session cookies to maintain your login state and anonymous analytics cookies to understand platform usage patterns. You can disable cookies through browser settings, though some platform features may not work optimally."
                  )}
                </p>
              </div>
            </ScrollReveal>

            {/* Contact */}
            <ScrollReveal delay={(sections.length + 1) * 80}>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
                <h2 className="text-lg font-bold text-gray-900 mb-5">
                  {pick("Hubungi Kami", "Contact Us")}
                </h2>
                <p className="text-sm text-gray-600 mb-5">
                  {pick(
                    "Jika Anda memiliki pertanyaan tentang kebijakan privasi ini atau ingin menggunakan hak-hak Anda, silakan hubungi kami:",
                    "If you have questions about this privacy policy or wish to exercise your rights, please contact us:"
                  )}
                </p>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="text-gray-400 text-xs">Email</p>
                      <a href="mailto:official@id-map.app" className="text-gray-700 font-medium hover:text-emerald-700">official@id-map.app</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="text-gray-400 text-xs">{pick("Telepon", "Phone")}</p>
                      <p className="text-gray-700 font-medium">+6281234561017</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="text-gray-400 text-xs">{pick("Alamat", "Address")}</p>
                      <p className="text-gray-700 font-medium">Malang, Indonesia</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* CTA */}
        <section className="py-10 sm:py-14">
          <ScrollReveal className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
            <a href="/" className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#0f3d2e] px-8 py-3 text-sm font-bold text-[#0f3d2e] hover:bg-emerald-50 transition">
              {pick("Kembali ke Beranda", "Back to Home")}
            </a>
          </ScrollReveal>
        </section>
      </main>
      <Footer />
    </>
  );
}
