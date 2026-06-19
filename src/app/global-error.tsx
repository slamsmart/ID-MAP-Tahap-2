"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50/60 via-white to-emerald-50/30 px-4 py-12" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}>
          <div className="max-w-md w-full text-center">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-red-100 to-orange-50 grid place-items-center shadow-lg shadow-red-100/40 ring-1 ring-red-100 mb-6">
              <AlertTriangle className="w-12 h-12 text-red-500" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
              Terjadi kesalahan kritis
            </h2>
            <p className="text-gray-500 mb-8">
              {error.message || "Aplikasi mengalami error yang tidak terduga."}
            </p>
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0f3d2e] text-white rounded-xl font-bold hover:bg-[#14523d] transition shadow-lg"
            >
              <RefreshCw className="w-4 h-4" />
              Muat ulang
            </button>
            {error.digest && (
              <p className="mt-6 text-xs text-gray-400 font-mono">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
