import Link from "next/link";
import { Compass, Home, Search, ArrowLeft, Heart } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50/60 via-white to-emerald-50/30 px-4 py-12">
      <div className="max-w-2xl w-full text-center">
        {/* Visual: floating mangrove + compass */}
        <div className="relative inline-block mb-8" aria-hidden="true">
          <div className="w-40 h-40 sm:w-48 sm:h-48 mx-auto rounded-full bg-gradient-to-br from-emerald-100 to-teal-50 grid place-items-center shadow-lg shadow-emerald-200/40 ring-1 ring-emerald-100">
            <Compass className="w-20 h-20 sm:w-24 sm:h-24 text-emerald-600 animate-pulse" strokeWidth={1.4} />
          </div>
          <span className="absolute -top-2 -right-2 bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">
            404
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f3d2e] mb-3 tracking-tight">
          Halaman tidak ditemukan
        </h1>
        <p className="text-gray-600 max-w-lg mx-auto mb-8 leading-relaxed">
          Sepertinya halaman yang Anda cari sudah hanyut bersama gelombang.
          Mari kembali ke daratan dan jelajahi proyek pesisir aktif.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#0f3d2e] text-white rounded-xl font-bold hover:bg-[#14523d] transition shadow-lg shadow-emerald-900/20"
          >
            <Home className="w-4 h-4" /> Kembali ke Beranda
          </Link>
          <Link
            href="/proyek"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white border-2 border-emerald-200 text-emerald-700 rounded-xl font-bold hover:bg-emerald-50 transition"
          >
            <Heart className="w-4 h-4" /> Lihat Proyek Aktif
          </Link>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
          {[
            { href: "/jelajahi-peta-mangrove", label: "Peta Restorasi", icon: Compass },
            { href: "/tentang", label: "Tentang Kami", icon: Search },
            { href: "/faq", label: "FAQ", icon: ArrowLeft },
            { href: "/mitra-kami", label: "Mitra", icon: Heart },
          ].map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1.5 px-3 py-3 bg-white border border-gray-100 rounded-xl text-xs font-semibold text-gray-600 hover:border-emerald-200 hover:text-emerald-700 hover:bg-emerald-50/40 transition"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
