"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}

export default function SplashScreen() {
  const [phase, setPhase] = useState<"hidden" | "visible" | "fading">("hidden");

  useEffect(() => {
    if (!isStandalone()) return;
    // Show once per session so navigation doesn't re-trigger it
    if (sessionStorage.getItem("idmap-splash") === "1") return;
    sessionStorage.setItem("idmap-splash", "1");

    setPhase("visible");
    const t1 = setTimeout(() => setPhase("fading"), 2400);
    const t2 = setTimeout(() => setPhase("hidden"), 2900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (phase === "hidden") return null;

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-hidden"
      style={{
        opacity: phase === "fading" ? 0 : 1,
        transition: "opacity 500ms ease-out",
        pointerEvents: phase === "fading" ? "none" : "auto",
      }}
    >
      {/* Background: hero photo + dark green overlay */}
      <div className="absolute inset-0 bg-[#062d22]">
        <Image
          src="/images/hero-mangrove.webp"
          alt=""
          fill
          className="object-cover opacity-55"
          priority
        />
        {/* gradient: dark top + dark bottom, clear middle so photo shows */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(6,45,34,0.82) 0%, rgba(15,61,46,0.55) 50%, rgba(26,92,68,0.40) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(6,45,34,0.70) 0%, transparent 40%, transparent 60%, rgba(6,45,34,0.85) 100%)",
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-5 px-8 text-center">
        {/* Logo */}
        <Image
          src="/images/logo-white.png"
          alt="ID-MAP"
          width={470}
          height={428}
          className="h-14 w-auto drop-shadow-xl"
          priority
        />

        {/* Big title */}
        <div>
          <h1 className="text-6xl font-black tracking-tight leading-none">
            <span className="text-white">ID-</span>
            <span className="text-lime-400">MAP</span>
          </h1>
          <p className="mt-3 text-sm font-medium text-emerald-100 leading-relaxed max-w-xs">
            Satu Platform, Seluruh Ekosistem
            <br />
            Mangrove &amp; Pesisir Indonesia
          </p>
        </div>

        {/* Tags pill */}
        <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 rounded-full border border-white/20 bg-white/5 px-5 py-2 text-xs font-medium text-white/80 backdrop-blur-sm">
          <span>Data</span>
          <span className="text-white/30">|</span>
          <span>Restorasi</span>
          <span className="text-white/30">|</span>
          <span>Rehabilitasi</span>
          <span className="text-white/30">|</span>
          <span>Keberlanjutan</span>
        </div>

        {/* Bouncing dots loader */}
        <div className="flex gap-2 mt-1">
          {[0, 140, 280].map((delay) => (
            <div
              key={delay}
              className="h-2 w-2 rounded-full bg-lime-400 animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      </div>

      {/* Bottom domain */}
      <div className="absolute bottom-8 left-0 right-0 text-center text-xs font-medium text-white/40 tracking-widest">
        id-map.app
      </div>
    </div>
  );
}
