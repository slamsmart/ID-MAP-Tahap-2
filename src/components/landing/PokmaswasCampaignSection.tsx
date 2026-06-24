"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { Heart, MapPin, Leaf, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { getSession } from "@/lib/auth";
import TiltCard from "@/components/shared/TiltCard";
import ScrollReveal from "@/components/shared/ScrollReveal";

const FUNDING_PROJECT_TITLES = [
  "Pokmaswas GOAL — Rehabilitasi Mangrove",
  "Pokmaswas Pilar Harapan — Konservasi Habitat Penyu",
  "Pokmaswas Mina Mulya — Pemberdayaan Nelayan Pesisir",
];

// Some project titles may have been renamed by mitra/verifikator after seed
// (e.g. "Rehabilitasi Mangrove (Pokmaswas X)"). Match by substring so the
// filter stays robust across renames; cap the result to 3 cards.
const isPokmaswasProject = (title: string) =>
  /pokmaswas/i.test(title) || FUNDING_PROJECT_TITLES.includes(title.trim());

const fmtRp = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

export default function PokmaswasCampaignSection() {
  const allProjects = useQuery(api.projects.listVerified);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    setHasSession(!!getSession());
  }, []);

  // Filter only Pokmaswas funding campaign projects (substring match on title)
  const campaigns = (allProjects ?? [])
    .filter((p) => isPokmaswasProject(p.title))
    .slice(0, 3);

  // Build donate href: if not logged in, redirect to register first
  const donateHref = (projectId: string) =>
    hasSession
      ? `/donasi-cepat/${projectId}`
      : `/daftar?peran=sahabat&next=${encodeURIComponent(`/donasi-cepat/${projectId}`)}`;

  return (
    <section className="bg-gradient-to-b from-white via-emerald-50/30 to-white py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <ScrollReveal className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold tracking-widest uppercase text-emerald-700 bg-emerald-100 rounded-full mb-3">
            <Heart className="w-3 h-3" />
            Dukung Proyek Aktif
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0f3d2e]">
            Dukung via QRIS untuk Pokmaswas / Mitra
          </h2>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto text-sm">
            3 proyek mangrove terverifikasi siap menerima dukungan.
            Scan QRIS, dananya langsung tersalurkan ke kelompok masyarakat pesisir & mitra pelaksana.
          </p>
        </ScrollReveal>

        {/* Loading state */}
        {allProjects === undefined && (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        )}

        {/* Cards */}
        {allProjects !== undefined && campaigns.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto perspective-1500">
            {campaigns.map((p, i) => {
              const raised = p.fundingRaised ?? 0;
              const target = p.fundingTarget ?? 100_000_000;
              const pct = Math.min(100, Math.round((raised / target) * 100));

              return (
                <ScrollReveal key={p._id} delay={i * 110} className="h-full">
                <TiltCard maxTilt={9} liftZ={28} glare={false} className="h-full rounded-2xl">
                <article
                  className="group shine bg-white rounded-2xl border border-gray-100 hover:border-emerald-200 overflow-hidden shadow-[0_20px_50px_-22px_rgba(15,61,46,0.25)] hover:shadow-[0_32px_70px_-22px_rgba(15,61,46,0.4)] transition-all duration-300 flex flex-col h-full"
                >
                  {/* Thumbnail */}
                  <div className="relative h-44 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.image}
                      alt={p.title}
                      className="card-zoom w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <span className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 text-[10px] font-bold text-white bg-emerald-600 px-2.5 py-1 rounded-full">
                      <ShieldCheck className="w-3 h-3" />
                      Terverifikasi
                    </span>
                    <div className="absolute bottom-3 left-4 z-10 text-white">
                      <div className="flex items-center gap-1 text-[11px] opacity-90">
                        <MapPin className="w-3 h-3" />
                        {p.province}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1 gap-3 bg-[#0f3d2e]">
                    <h3 className="font-bold text-white text-base leading-snug line-clamp-2 group-hover:text-lime-300 transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-xs text-white/80 leading-relaxed line-clamp-2 flex-1">
                      {p.description}
                    </p>

                    {/* Funding bar */}
                    <div>
                      <div className="flex items-baseline justify-between mb-1.5">
                        <span className="text-xs font-medium text-emerald-100">
                          Terkumpul
                        </span>
                        <span className="text-xs font-bold text-lime-300">
                          {pct}%
                        </span>
                      </div>
                      <div className="h-2 bg-white/15 rounded-full overflow-hidden">
                        <div
                          className="bar-grow h-full bg-gradient-to-r from-lime-400 to-emerald-400"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex items-baseline justify-between mt-2">
                        <p className="text-sm font-bold text-white">
                          {fmtRp(raised)}
                        </p>
                        <p className="text-[11px] text-emerald-200">
                          dari {fmtRp(target)}
                        </p>
                      </div>
                    </div>

                    {/* Stats mini */}
                    <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-white/10">
                      <div>
                        <p className="text-sm font-bold text-white">
                          {p.area ?? "-"}
                        </p>
                        <p className="text-[10px] text-emerald-200">Hektare</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white flex items-center justify-center gap-0.5">
                          <Leaf className="w-3 h-3" />
                          {(p.co2Absorption / 1000).toFixed(0)}k
                        </p>
                        <p className="text-[10px] text-emerald-200">tCO₂e/thn</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">
                          {((p.seedsPlanted ?? 0) / 1000).toFixed(0)}k
                        </p>
                        <p className="text-[10px] text-emerald-200">Bibit</p>
                      </div>
                    </div>

                    {/* CTA: scan QRIS donate */}
                    <Link
                      href={donateHref(p._id)}
                      className="mt-2 inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-black text-sm font-bold py-2.5 rounded-lg transition-colors border border-gray-200"
                    >
                      <Heart className="w-4 h-4" />
                      Dukung Proyek (Scan QRIS)
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    {!hasSession && (
                      <p className="text-[11px] text-center text-emerald-200 -mt-1">
                        Daftar gratis untuk lanjut donasi
                      </p>
                    )}
                  </div>
                </article>
                </TiltCard>
                </ScrollReveal>
              );
            })}
          </div>
        )}

        {/* Empty state (shouldn't happen post-seed, but safe) */}
        {allProjects !== undefined && campaigns.length === 0 && (
          <p className="text-center text-sm text-slate-400 py-8">
            Belum ada kampanye Pokmaswas aktif.
          </p>
        )}
      </div>
    </section>
  );
}
