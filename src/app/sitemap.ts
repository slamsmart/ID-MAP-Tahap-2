import type { MetadataRoute } from "next";

const BASE_URL = "https://idmap-pesisir.vercel.app";

// Static public routes — dynamic project pages bisa ditambah belakangan
// dengan generateSitemaps + Convex query saat scale up.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes: Array<{
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  }> = [
    { path: "/", priority: 1.0, changeFrequency: "daily" },
    { path: "/proyek", priority: 0.9, changeFrequency: "daily" },
    { path: "/jelajahi-peta-mangrove", priority: 0.8, changeFrequency: "weekly" },
    { path: "/tentang", priority: 0.7, changeFrequency: "monthly" },
    { path: "/faq", priority: 0.7, changeFrequency: "monthly" },
    { path: "/mitra-kami", priority: 0.7, changeFrequency: "monthly" },
    { path: "/edukasi-ekosistem-pesisir", priority: 0.6, changeFrequency: "monthly" },
    { path: "/daftar", priority: 0.5, changeFrequency: "yearly" },
    { path: "/masuk", priority: 0.5, changeFrequency: "yearly" },
  ];

  return staticRoutes.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
