/** @type {import('next').NextConfig} */
const strictBuild = process.env.NEXT_STRICT_BUILD === "true";

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: !strictBuild,
  },
  typescript: {
    ignoreBuildErrors: !strictBuild,
  },
  experimental: {
    // Tree-shake import ikon/komponen besar Ã¢â€ â€™ bundle peta & halaman lebih ringan
    optimizePackageImports: ["lucide-react", "recharts", "motion"],
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
    const isDev = process.env.NODE_ENV !== "production";
    // Security headers Ã¢â‚¬â€ defense in depth.
    // CSP: script-src/connect-src/img-src sengaja longgar (https:) supaya
    // lib eksternal (Mayar JS, NVIDIA chat stream) & tile peta Leaflet tetap
    // jalan. Yang di-lock adalah vektor yang tidak dipakai app: object-src,
    // base-uri, frame-ancestors (anti-clickjacking), form-action.
    // TODO pilot: inventaris host script eksternal Ã¢â€ â€™ ganti 'unsafe-inline'
    // /'unsafe-eval' dengan nonce untuk proteksi XSS penuh.
    const csp = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https:`,
      "style-src 'self' 'unsafe-inline' https:",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https:",
      "connect-src 'self' https: wss:",
      "frame-src 'self' https:",
      "media-src 'self' https: data: blob:",
      "worker-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https:",
      "frame-ancestors 'self'",
      ...(isDev ? [] : ["upgrade-insecure-requests"]),
    ].join("; ");

    // Staged strict CSP candidate. Report-only prevents payment/map/chat
    // breakage while we inventory every external host.
    const cspReportOnly = [
      "default-src 'self'",
      "script-src 'self' https://*.mayar.id https://*.convex.cloud",
      "style-src 'self' 'unsafe-inline' https:",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https:",
      "connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.mayar.id https://api.mayar.id https://api.openai.com https://integrate.api.nvidia.com",
      "frame-src 'self' https://*.mayar.id",
      "media-src 'self' https: data: blob:",
      "worker-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "report-uri /api/security/csp-report",
    ].join("; ");
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "Content-Security-Policy-Report-Only", value: cspReportOnly },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-XSS-Protection", value: "0" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self), payment=()",
          },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
      {
        // Service worker must always revalidate so SW updates ship instantly.
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;

