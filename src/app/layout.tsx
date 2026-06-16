import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import LiveChat from "@/components/chat/LiveChat";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
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
        url: "/images/og-image.jpg",
        width: 2400,
        height: 1246,
        alt: "Hutan mangrove pesisir Indonesia - ID-MAP",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ID-MAP - Integrasi Data & Manajemen Pesisir",
    description:
      "Donasi QRIS langsung tersalurkan ke Pokmaswas pelaksana. Sertifikat digital otomatis. Data pesisir Indonesia dalam satu platform.",
    images: ["/images/og-image.jpg"],
  },
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.webmanifest",
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
      </head>
      <body
        className={`${plusJakarta.variable} ${inter.variable} font-sans antialiased`}
      >
        <ConvexClientProvider>
          <LanguageProvider>
            {children}
            <LiveChat />
          </LanguageProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
