import type { MetadataRoute } from "next";

// Robots.txt — public crawlable, dashboard role di-block dari index.
// Sitemap dirujuk supaya search engine cepat discover route.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/admin",
          "/admin/*",
          "/mitra",
          "/mitra/*",
          "/verifikator",
          "/verifikator/*",
          "/user",
          "/user/*",
          "/corporate",
          "/corporate/*",
          "/api/*",
          "/donasi-cepat/*",
          "/daftar",
          "/masuk",
        ],
      },
    ],
    sitemap: "https://idmap-pesisir.vercel.app/sitemap.xml",
  };
}
