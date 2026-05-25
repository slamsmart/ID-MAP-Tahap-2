"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { MapPin, Leaf, Heart, Search, Loader2 } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { getSession, User } from "@/lib/auth";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1596123068611-c89d6aef1cfe?w=600&q=80&auto=format&fit=crop";

export default function UserProyekPage() {
  const [user, setUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setUser(getSession());
  }, []);

  const projects = useQuery(api.projects.listVerified);
  const myContribs = useQuery(
    api.contributions.listByUser,
    user?._id ? { userId: user._id as Id<"users"> } : "skip"
  );

  const supportedSet = useMemo(() => {
    const s = new Set<string>();
    myContribs?.forEach((c) => {
      if (c.paymentStatus === "paid") s.add(String(c.projectId));
    });
    return s;
  }, [myContribs]);

  const filtered = useMemo(() => {
    if (!projects) return [];
    if (!search.trim()) return projects;
    const q = search.toLowerCase();
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.province.toLowerCase().includes(q)
    );
  }, [projects, search]);

  return (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900">
          Jelajahi Proyek Mangrove
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Temukan proyek mangrove yang bisa Anda dukung melalui QRIS Mayar.id
        </p>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            placeholder="Cari proyek mangrove..."
          />
        </div>
      </div>

      {projects === undefined ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          <span className="text-sm">Memuat proyek...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <p className="text-sm text-gray-500">
            {search
              ? "Tidak ada proyek yang cocok dengan pencarian Anda."
              : "Belum ada proyek terverifikasi tersedia."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((p) => {
            const supported = supportedSet.has(String(p._id));
            const co2 = (p.co2Absorption ?? 0).toFixed(1);
            const seeds = p.seedsPlanted
              ? `${p.seedsPlanted.toLocaleString("id-ID")} bibit`
              : "—";
            const area = p.area ? `${p.area.toLocaleString("id-ID")} Ha` : "—";

            return (
              <div
                key={p._id}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="h-48 bg-emerald-100 relative">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url('${p.image || FALLBACK_IMAGE}')`,
                    }}
                  />
                  {supported && (
                    <div className="absolute top-3 right-3 px-2 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                      <Heart className="w-3 h-3" /> Anda mendukung
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-display font-semibold text-gray-900">
                    {p.title}
                  </h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {p.location}
                  </p>
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="text-center p-2 bg-emerald-50 rounded-lg">
                      <p className="text-xs text-gray-500">Luas</p>
                      <p className="text-sm font-bold text-emerald-700">
                        {area}
                      </p>
                    </div>
                    <div className="text-center p-2 bg-emerald-50 rounded-lg">
                      <p className="text-xs text-gray-500">Bibit</p>
                      <p className="text-sm font-bold text-emerald-700">
                        {seeds}
                      </p>
                    </div>
                    <div className="text-center p-2 bg-emerald-50 rounded-lg">
                      <p className="text-xs text-gray-500">CO₂e</p>
                      <p className="text-sm font-bold text-emerald-700">
                        {co2} tCO₂e
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/donasi-cepat/${p._id}`}
                    className="w-full mt-4 px-4 py-2.5 bg-emerald-900 text-white rounded-lg text-sm font-semibold hover:bg-emerald-800 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Leaf className="w-4 h-4" /> Dukung Proyek Ini
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
