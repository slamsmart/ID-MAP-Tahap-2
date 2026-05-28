"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Heart, MapPin, Award, X, Sparkles } from "lucide-react";

const STORAGE_KEY = "idmap_user_onboard_dismissed";

interface Step {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  cta: { label: string; href: string };
}

const STEPS: Step[] = [
  {
    icon: MapPin,
    title: "Jelajahi proyek pesisir aktif",
    desc: "Lihat 3 kampanye Pokmaswas yang sedang berjalan di Jawa Timur dan area lain.",
    cta: { label: "Lihat Proyek", href: "/proyek" },
  },
  {
    icon: Heart,
    title: "Donasi mulai dari Rp 10.000",
    desc: "Pilih nominal, scan QRIS, dana langsung tersalurkan ke kelompok pelaksana.",
    cta: { label: "Donasi Sekarang", href: "/proyek" },
  },
  {
    icon: Award,
    title: "Klaim & bagikan sertifikat",
    desc: "Sertifikat digital terbit otomatis dengan nama Anda — dapat diunduh dan dibagikan ke media sosial.",
    cta: { label: "Lihat Sertifikat", href: "/user/sertifikat" },
  },
];

export default function OnboardingTour({ name }: { name?: string }) {
  const [dismissed, setDismissed] = useState<boolean | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  // Cek localStorage sekali saat mount. State `null` = belum di-cek;
  // `true` = sudah dismiss (jangan render); `false` = belum (render).
  useEffect(() => {
    if (typeof window === "undefined") return;
    setDismissed(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  function dismiss() {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "1");
    }
    setDismissed(true);
  }

  if (dismissed !== false) return null;

  const step = STEPS[activeStep];
  const Icon = step.icon;
  const isLast = activeStep === STEPS.length - 1;

  return (
    <div className="relative bg-gradient-to-br from-emerald-50 via-white to-teal-50 rounded-2xl border border-emerald-100 p-5 sm:p-6 shadow-sm overflow-hidden">
      {/* Decorative bg blob */}
      <div
        className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
          <Sparkles className="w-3 h-3" />
          Selamat datang{name ? `, ${name.split(" ")[0]}` : ""}!
        </div>
        <button
          onClick={dismiss}
          aria-label="Tutup panduan"
          className="p-1 -mt-1 -mr-1 rounded-lg text-gray-400 hover:bg-white hover:text-gray-700 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="relative mt-4 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
        <div className="w-12 h-12 rounded-xl bg-white shadow-sm grid place-items-center text-emerald-700 flex-shrink-0">
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-[#0f3d2e] text-base sm:text-lg">
            {step.title}
          </h3>
          <p className="text-sm text-gray-600 mt-1 leading-relaxed">{step.desc}</p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Link
              href={step.cta.href}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition shadow-sm"
            >
              {step.cta.label}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            {!isLast && (
              <button
                onClick={() => setActiveStep((s) => s + 1)}
                className="px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-white rounded-lg transition"
              >
                Berikutnya →
              </button>
            )}
            {isLast && (
              <button
                onClick={dismiss}
                className="px-3 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 transition"
              >
                Selesai
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Step dots */}
      <div className="relative mt-5 flex items-center gap-1.5">
        {STEPS.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveStep(i)}
            aria-label={`Langkah ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === activeStep
                ? "w-8 bg-emerald-600"
                : "w-1.5 bg-emerald-200 hover:bg-emerald-300"
            }`}
          />
        ))}
        <span className="ml-auto text-[11px] text-gray-400 font-mono">
          {activeStep + 1} / {STEPS.length}
        </span>
      </div>
    </div>
  );
}
