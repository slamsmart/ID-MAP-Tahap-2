"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ID-MAP Error]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50/60 via-white to-emerald-50/30 px-4 py-12">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="relative inline-block mb-6" aria-hidden="true">
          <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-red-100 to-orange-50 grid place-items-center shadow-lg shadow-red-100/40 ring-1 ring-red-100">
            <AlertTriangle className="w-14 h-14 text-red-500" strokeWidth={1.5} />
          </div>
          <span className="absolute -top-1 -right-1 bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full border border-red-200">
            Error
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
          Terjadi kesalahan
        </h2>
        <p className="text-gray-500 max-w-sm mx-auto mb-8 leading-relaxed">
          {error.message || "Sesuatu tidak berjalan sesuai harapan. Tim kami sudah diberitahu."}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0f3d2e] text-white rounded-xl font-bold hover:bg-[#14523d] transition shadow-lg shadow-emerald-900/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <RefreshCw className="w-4 h-4" />
            Coba lagi
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-emerald-200 text-emerald-700 rounded-xl font-bold hover:bg-emerald-50 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <Home className="w-4 h-4" />
            Ke Beranda
          </a>
        </div>

        {error.digest && (
          <p className="mt-6 text-xs text-gray-400 font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
