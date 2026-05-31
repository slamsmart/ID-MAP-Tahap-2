/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer, dev }) => {
    if (isServer && !dev) {
      config.output.chunkFilename = "chunks/[id].js";
    }
    return config;
  },
  images: {
    // Aktifkan optimasi Next.js (WebP/AVIF auto-convert + resize on demand)
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 hari cache
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "media.mayar.id" },
      { protocol: "https", hostname: "**.convex.cloud" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  async headers() {
    // Security headers — defense in depth.
    // CSP sengaja tidak di-set strict di sini supaya tidak block live-edit
    // dashboard yang inject lib eksternal (NVIDIA chat stream, Mayar JS).
    // Untuk tahap pilot/produksi: tambahkan Content-Security-Policy yang
    // diinventarisasi dari domain yang benar-benar dipakai.
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self), payment=()",
          },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
    ];
  },
};

export default nextConfig;

