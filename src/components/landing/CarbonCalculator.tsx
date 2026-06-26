"use client";

import { useState } from "react";
import { Calculator, Leaf, Car, Plane, Home } from "lucide-react";

export default function CarbonCalculator() {
  const [hectares, setHectares] = useState<string>("");

  // Logic calculation constants
  const TONS_PER_HECTARE = 15; // Example: 1 hectare absorbs 15 tons CO2e / year
  const MOTOR_PER_TON = 1.2; // 1 ton CO2e = ~1.2 motorcycles per year
  const FLIGHT_PER_TON = 5.5; // 1 ton CO2e = ~5.5 flights JKT-Bali
  const HOME_PER_TON = 0.25; // 1 ton CO2e = ~0.25 homes electricity per year

  const area = Number(hectares) || 0;
  const tons = Math.floor(area * TONS_PER_HECTARE);
  const motor = Math.floor(tons * MOTOR_PER_TON);
  const flight = Math.floor(tons * FLIGHT_PER_TON);
  const home = Math.floor(tons * HOME_PER_TON);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("id-ID").format(num);
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 p-5 max-w-sm w-full font-sans">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
          <Calculator className="w-5 h-5 text-emerald-600" />
        </div>
        <h3 className="font-semibold text-gray-900 text-sm">Kalkulator Karbon</h3>
      </div>

      {/* Input Section */}
      <div>
        <label className="text-xs font-semibold text-gray-800 block mb-1.5">
          Masukkan Luas Area (Hektar)
        </label>
        <input
          type="number"
          min="0"
          step="0.1"
          value={hectares}
          onChange={(e) => setHectares(e.target.value)}
          placeholder="Contoh: 150"
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-gray-400 placeholder:font-normal"
        />
        <p className="text-[10px] text-gray-500 mt-1.5 leading-relaxed">
          Masukkan luas area mangrove yang diamati pada peta MHI.
        </p>
      </div>

      {/* Result Section */}
      <div className="mt-4 mb-2 relative overflow-hidden bg-gray-50/50 rounded-2xl p-5 border border-gray-100">
        <Leaf className="absolute -right-4 -bottom-4 w-24 h-24 text-emerald-100/50 -rotate-12 pointer-events-none" />
        <div className="relative z-10">
          <p className="text-[13px] font-semibold text-gray-700 mb-1">
            Potensi Serapan CO₂e
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[42px] font-bold text-emerald-500 leading-none">
              {formatNumber(tons)}
            </span>
            <span className="text-lg font-bold text-gray-700">Ton</span>
          </div>
        </div>
      </div>

      {/* Equivalencies Section */}
      <div className="space-y-3 mt-4">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          Setara Menetralkan:
        </h4>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
            <Car className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-800 leading-tight">
              {formatNumber(motor)} <span className="text-xs font-medium text-gray-500">Motor</span>
            </div>
            <p className="text-[10px] text-gray-500">Asap knalpot / tahun</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Plane className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-800 leading-tight">
              {formatNumber(flight)} <span className="text-xs font-medium text-gray-500">Penerbangan</span>
            </div>
            <p className="text-[10px] text-gray-500">Pesawat JKT-Bali</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
            <Home className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-800 leading-tight">
              {formatNumber(home)} <span className="text-xs font-medium text-gray-500">Rumah</span>
            </div>
            <p className="text-[10px] text-gray-500">Listrik rumah / tahun</p>
          </div>
        </div>
      </div>
    </div>
  );
}
