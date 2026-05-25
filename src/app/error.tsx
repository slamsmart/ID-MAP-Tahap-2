"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Terjadi kesalahan</h2>
        <p className="text-sm text-gray-600 mb-6">
          {error.message || "Sesuatu tidak berjalan sesuai harapan."}
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center justify-center px-5 py-2.5 bg-emerald-700 text-white rounded-lg font-semibold hover:bg-emerald-800 transition"
        >
          Coba lagi
        </button>
      </div>
    </div>
  );
}
