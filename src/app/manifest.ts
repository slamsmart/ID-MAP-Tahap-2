import type { MetadataRoute } from "next";

// PWA manifest — install-able sebagai app di Android/Desktop.
// Standalone display agar status bar pakai brand color.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ID-MAP — Integrasi Data dan Manajemen Pesisir",
    short_name: "ID-MAP",
    description:
      "Platform integrasi data ekosistem pesisir Indonesia. Donasi QRIS langsung ke Pokmaswas, sertifikat digital otomatis.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#0f3d2e",
    lang: "id-ID",
    categories: ["education", "social", "lifestyle", "utilities"],
    icons: [
      // ?v=2 busts Vercel's immutable edge cache after the logo rebrand —
      // the bare paths stayed cached on old (white) icons otherwise.
      { src: "/icon-192.png?v=2", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png?v=2", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png?v=2", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/apple-icon.png?v=2", sizes: "180x180", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      {
        name: "Jelajahi Peta",
        short_name: "Peta",
        description: "Peta restorasi lingkungan pesisir Indonesia",
        url: "/jelajahi-peta-mangrove",
      },
      {
        name: "Lihat Proyek",
        short_name: "Proyek",
        description: "Daftar proyek mangrove terverifikasi",
        url: "/proyek",
      },
    ],
  };
}
