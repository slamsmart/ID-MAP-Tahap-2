import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Halaman tidak ditemukan</h2>
        <p className="text-sm text-gray-600 mb-6">
          Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-5 py-2.5 bg-emerald-700 text-white rounded-lg font-semibold hover:bg-emerald-800 transition"
        >
          Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}
