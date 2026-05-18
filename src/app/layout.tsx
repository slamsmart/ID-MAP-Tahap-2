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
  title: "ID-MAP | Pre-Market Carbon Infrastructure Platform",
  description:
    "Platform pre-market carbon terintegrasi MRV, SRN, dan pembelian carbon credit untuk kebutuhan ESG perusahaan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
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
