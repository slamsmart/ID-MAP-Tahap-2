import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import LiveChat from "@/components/chat/LiveChat";
import ServiceWorkerRegistrar from "@/components/pwa/ServiceWorkerRegistrar";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import SplashScreen from "@/components/pwa/SplashScreen";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ID-MAP - Integrasi Data & Manajemen Pesisir",
    template: "%s | ID-MAP",
  },
  description:
    "Platform integrasi data ekosistem pesisir Indonesia: mangrove, abrasi, habitat penyu, dan jaringan Pokmaswas/mitra dalam satu sistem MRV terverifikasi.",
  keywords: [
    "ID-MAP",
    "Integrasi Data Pesisir",
    "Pokmaswas",
    "mangrove Indonesia",
    "DKP",
    "KKP",
    "donasi mangrove",
    "QRIS pesisir",
    "konservasi penyu",
    "abrasi pantai",
    "MRV",
    "blue carbon",
  ],
  metadataBase: new URL("https://www.id-map.app"),
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "ID-MAP",
    title: "ID-MAP - Integrasi Data & Manajemen Pesisir",
    description:
      "Satu platform untuk seluruh ekosistem mangrove & pesisir Indonesia. Donasi QRIS langsung tersalurkan ke Pokmaswas pelaksana, dengan sertifikat digital yang dapat dibagikan.",
    url: "https://www.id-map.app",
    images: [
      {
        url: "/screenshot-wide.jpeg",
        width: 1005,
        height: 711,
        alt: "Hutan mangrove pesisir Indonesia - ID-MAP",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ID-MAP - Integrasi Data & Manajemen Pesisir",
    description:
      "Donasi QRIS langsung tersalurkan ke Pokmaswas pelaksana. Sertifikat digital otomatis. Data pesisir Indonesia dalam satu platform.",
    images: ["/screenshot-wide.jpeg"],
  },
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ID-MAP",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#0f3d2e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link
          rel="preload"
          as="image"
          href="/images/hero-mangrove.webp"
          type="image/webp"
        />
        {/* Resource hints — mempercepat koneksi awal peta interaktif (Earth Engine iframe + tile satelit) */}
        <link
          rel="preconnect"
          href="https://ee-dimassyarifworkspace.projects.earthengine.app"
        />
        <link rel="dns-prefetch" href="https://earthengine.googleapis.com" />
        <link rel="dns-prefetch" href="https://server.arcgisonline.com" />
        <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com" />
      </head>
      <body
        className={`${instrumentSans.variable} ${fraunces.variable} font-sans antialiased`}
      >
        <ConvexClientProvider>
          <LanguageProvider>
            <SplashScreen />
            {children}
            <LiveChat />
            <InstallPrompt />
            <ServiceWorkerRegistrar />
          </LanguageProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
