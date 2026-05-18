"use client";

import { MapPin, Leaf, Heart, Search } from "lucide-react";

const projects = [
  { name: "Reboisasi Mangrove Banyuwangi", location: "Banyuwangi, Jawa Timur", area: "450 Ha", trees: "125.000 bibit", co2: "12.5 tCO₂e", image: "https://images.unsplash.com/photo-1596123068611-c89d6aef1cfe?w=400&q=80&auto=format&fit=crop", donated: true },
  { name: "Konservasi Mangrove Kalimantan", location: "Kapuas Hulu, Kalimantan Barat", area: "1.200 Ha", trees: "350.000 bibit", co2: "35.0 tCO₂e", image: "https://images.unsplash.com/photo-1623212712512-6e3e5e6e1f55?w=400&q=80&auto=format&fit=crop", donated: false },
  { name: "Mangrove Pantai Utara", location: "Demak, Jawa Tengah", area: "320 Ha", trees: "80.000 bibit", co2: "8.0 tCO₂e", image: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=400&q=80&auto=format&fit=crop", donated: true },
  { name: "Blue Carbon Mangrove Sumba", location: "Sumba, NTT", area: "560 Ha", trees: "145.000 bibit", co2: "14.5 tCO₂e", image: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400&q=80&auto=format&fit=crop", donated: false },
];

export default function UserProyekPage() {
  return (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900">Jelajahi Proyek Mangrove</h1>
        <p className="text-sm text-gray-500 mt-1">Temukan proyek mangrove yang bisa Anda dukung</p>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm" placeholder="Cari proyek mangrove..." />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((p) => (
          <div key={p.name} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-48 bg-emerald-100 relative">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${p.image}')` }} />
              {p.donated && (
                <div className="absolute top-3 right-3 px-2 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                  <Heart className="w-3 h-3" /> Anda mendukung
                </div>
              )}
            </div>
            <div className="p-5">
              <h3 className="font-display font-semibold text-gray-900">{p.name}</h3>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" />{p.location}</p>
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="text-center p-2 bg-emerald-50 rounded-lg">
                  <p className="text-xs text-gray-500">Luas</p>
                  <p className="text-sm font-bold text-emerald-700">{p.area}</p>
                </div>
                <div className="text-center p-2 bg-emerald-50 rounded-lg">
                  <p className="text-xs text-gray-500">Bibit</p>
                  <p className="text-sm font-bold text-emerald-700">{p.trees}</p>
                </div>
                <div className="text-center p-2 bg-emerald-50 rounded-lg">
                  <p className="text-xs text-gray-500">CO₂e</p>
                  <p className="text-sm font-bold text-emerald-700">{p.co2}</p>
                </div>
              </div>
              <button className="w-full mt-4 px-4 py-2.5 bg-emerald-900 text-white rounded-lg text-sm font-semibold hover:bg-emerald-800 flex items-center justify-center gap-2">
                <Leaf className="w-4 h-4" /> Dukung Proyek Ini
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
