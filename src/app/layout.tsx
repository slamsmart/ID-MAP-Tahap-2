import type { Metadata } from "next";
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
  title: "ID-MAP — Integrasi Data & Manajemen Pesisir",
  description:
    "Platform integrasi data ekosistem pesisir Indonesia: mangrove, abrasi, habitat penyu, dan jaringan Pokmaswas/mitra dalam satu sistem MRV terverifikasi.",
  icons: {
    icon: [
      { url: "/images/logo2.webp", type: "image/webp" },
      { url: "/images/logo2.png", type: "image/png" },
    ],
    shortcut: "/images/logo2.png",
    apple: "/images/logo2.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        {/* Preload hero image — LCP optimization */}
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
