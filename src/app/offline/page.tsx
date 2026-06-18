import type { Metadata } from "next";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Offline",
  robots: { index: false, follow: false },
};

// Branded offline fallback — served by the service worker when a navigation
// fails and no cached copy exists.
export default function OfflinePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0f3d2e] px-6 text-center">
      <div className="max-w-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
          {/* Wifi-off glyph (inline SVG, no client deps) */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-lime-300"
            aria-hidden="true"
          >
            <path d="M12 20h.01" />
            <path d="M8.5 16.4a5 5 0 0 1 7 0" />
            <path d="M5 12.9a10 10 0 0 1 3.3-2.2" />
            <path d="M15.7 10.7A10 10 0 0 1 19 12.9" />
            <path d="M2 8.8a15 15 0 0 1 4.2-2.5" />
            <path d="M17.8 6.3A15 15 0 0 1 22 8.8" />
            <line x1="2" y1="2" x2="22" y2="22" />
          </svg>
        </div>
        <h1 className="text-2xl font-extrabold text-white">Kamu sedang offline</h1>
        <p className="mt-2 text-sm text-emerald-100/80">
          Sambungan internet terputus. Periksa koneksimu lalu coba lagi. Halaman
          yang sudah pernah dibuka tetap bisa diakses.
        </p>
        <a
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-lime-400 px-6 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-lime-300"
        >
          Coba Lagi
        </a>
      </div>
    </main>
  );
}
