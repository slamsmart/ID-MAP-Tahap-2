"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getSession, getDashboardPath } from "@/lib/auth";

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}

const DISPLAY_MS = 2800;
const FADE_MS = 600;

export default function SplashScreen() {
  const [phase, setPhase] = useState<"hidden" | "enter" | "visible" | "fading">("hidden");
  const router = useRouter();

  useEffect(() => {
    if (!isStandalone()) return;
    if (sessionStorage.getItem("idmap-splash") === "1") return;
    sessionStorage.setItem("idmap-splash", "1");

    // stagger: hidden → enter (animate in) → visible → fading → redirect
    const t0 = setTimeout(() => setPhase("enter"), 60);
    const t1 = setTimeout(() => setPhase("visible"), 400);
    const t2 = setTimeout(() => setPhase("fading"), DISPLAY_MS);
    const t3 = setTimeout(() => {
      setPhase("hidden");
      const session = getSession();
      if (session) {
        router.replace(getDashboardPath(session.role));
      } else {
        router.replace("/"); // → landing page, user pilih Daftar atau Masuk
      }
    }, DISPLAY_MS + FADE_MS);

    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [router]);

  if (phase === "hidden") return null;

  const contentVisible = phase === "visible" || phase === "fading";
  const fading = phase === "fading";

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-hidden"
      style={{
        opacity: fading ? 0 : 1,
        transition: `opacity ${FADE_MS}ms cubic-bezier(0.4,0,0.2,1)`,
        pointerEvents: fading ? "none" : "auto",
      }}
    >
      {/* ── Background ─────────────────────────────────────────── */}
      <div className="absolute inset-0 bg-[#051e15]">
        <Image
          src="/images/hero-mangrove2.webp"
          alt=""
          fill
          className="object-cover"
          style={{ opacity: contentVisible ? 0.45 : 0, transition: "opacity 600ms ease" }}
          priority
        />
        {/* cinematic vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 30%, rgba(5,30,21,0.65) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(5,30,21,0.80) 0%, rgba(5,30,21,0.10) 35%, rgba(5,30,21,0.10) 60%, rgba(5,30,21,0.92) 100%)",
          }}
        />
      </div>

      {/* ── Main content ───────────────────────────────────────── */}
      <div
        className="relative z-10 flex h-full flex-col items-center justify-center px-8 text-center"
        style={{
          opacity: contentVisible ? 1 : 0,
          transform: contentVisible ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 500ms ease, transform 500ms ease",
        }}
      >
        {/* Logo */}
        <Image
          src="/images/logo-white.png"
          alt="ID-MAP"
          width={470}
          height={428}
          className="h-16 w-auto drop-shadow-2xl mb-6"
          priority
        />

        {/* Title */}
        <h1 className="text-5xl font-black tracking-tight leading-none mb-3">
          <span className="text-white">ID</span>
          <span className="text-lime-400">-MAP</span>
        </h1>

        {/* Tagline */}
        <p className="text-sm font-medium text-white/70 leading-relaxed max-w-[260px] mb-8">
          Platform Integrasi Data Ekosistem
          <br />
          Mangrove &amp; Pesisir Indonesia
        </p>

        {/* Feature chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {["Restorasi", "Rehabilitasi", "Carbon Credit", "MRV"].map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-semibold text-white/60 border border-white/15 rounded-full px-3 py-1 bg-white/5 backdrop-blur-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* ── Progress bar ───────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="h-[2px] bg-white/10">
          <div
            className="h-full bg-lime-400"
            style={{
              width: contentVisible ? "100%" : "0%",
              transition: `width ${DISPLAY_MS - 400}ms linear`,
              transitionDelay: "400ms",
            }}
          />
        </div>
        <p className="text-center text-[11px] font-semibold tracking-[0.2em] text-white/30 py-5">
          ID-MAP.APP
        </p>
      </div>
    </div>
  );
}
