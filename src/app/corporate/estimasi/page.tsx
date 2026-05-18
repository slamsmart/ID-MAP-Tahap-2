"use client";

import { useState } from "react";
import { Calculator, AlertTriangle, TrendingUp, Factory, Zap, Truck, Flame, Trash2, Leaf, ArrowRight } from "lucide-react";

// Emission factors (tCO₂e per unit) - based on IPCC & Indonesia KLHK guidelines
const EMISSION_FACTORS = {
  electricity: 0.000794, // tCO₂e per kWh (grid emission factor Indonesia 2023 - ESDM)
  diesel: 0.002676,     // tCO₂e per liter (IPCC 2006)
  gasoline: 0.002315,   // tCO₂e per liter (IPCC 2006)
  naturalGas: 0.00202,  // tCO₂e per m³ (IPCC 2006)
  flight: 0.255,        // tCO₂e per 1000 km (ICAO)
  waste: 0.5,           // tCO₂e per ton waste (IPCC default)
};

// Carbon credit pricing
const CARBON_PRICE_IDR = 65000; // Rp per tCO₂e (Indonesia voluntary market avg)
const CARBON_PRICE_USD = 12;    // USD per tCO₂e

export default function CorporateEstimasiPage() {
  // Input states
  const [electricity, setElectricity] = useState<number>(0);       // kWh/tahun
  const [diesel, setDiesel] = useState<number>(0);                 // liter/tahun
  const [gasoline, setGasoline] = useState<number>(0);             // liter/tahun
  const [naturalGas, setNaturalGas] = useState<number>(0);         // m³/tahun
  const [flightKm, setFlightKm] = useState<number>(0);             // 1000 km/tahun
  const [waste, setWaste] = useState<number>(0);                   // ton/tahun
  const [offsetTarget, setOffsetTarget] = useState<number>(100);   // % target offset

  // Calculations
  const emissionElectricity = electricity * EMISSION_FACTORS.electricity;
  const emissionDiesel = diesel * EMISSION_FACTORS.diesel;
  const emissionGasoline = gasoline * EMISSION_FACTORS.gasoline;
  const emissionGas = naturalGas * EMISSION_FACTORS.naturalGas;
  const emissionFlight = flightKm * EMISSION_FACTORS.flight;
  const emissionWaste = waste * EMISSION_FACTORS.waste;

  const totalEmission = emissionElectricity + emissionDiesel + emissionGasoline + emissionGas + emissionFlight + emissionWaste;
  const requiredOffset = totalEmission * (offsetTarget / 100);
  const costIDR = requiredOffset * CARBON_PRICE_IDR;
  const costUSD = requiredOffset * CARBON_PRICE_USD;
  const mangroveHaNeeded = requiredOffset / 12.5; // avg 12.5 tCO₂e/ha/year sequestration

  const formatNum = (n: number, decimals = 0) => n.toLocaleString("id-ID", { maximumFractionDigits: decimals });

  const sources = [
    { label: "Listrik & Energi", value: emissionElectricity, icon: Zap, color: "bg-yellow-50 text-yellow-600", barColor: "bg-yellow-400" },
    { label: "BBM Diesel", value: emissionDiesel, icon: Truck, color: "bg-blue-50 text-blue-600", barColor: "bg-blue-400" },
    { label: "BBM Bensin", value: emissionGasoline, icon: Truck, color: "bg-indigo-50 text-indigo-600", barColor: "bg-indigo-400" },
    { label: "Gas Alam", value: emissionGas, icon: Flame, color: "bg-orange-50 text-orange-600", barColor: "bg-orange-400" },
    { label: "Penerbangan Bisnis", value: emissionFlight, icon: Factory, color: "bg-sky-50 text-sky-600", barColor: "bg-sky-400" },
    { label: "Limbah", value: emissionWaste, icon: Trash2, color: "bg-red-50 text-red-600", barColor: "bg-red-400" },
  ];

  return (
    <div className="flex-1 p-4 sm:p-6 bg-gray-50 overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900">Kalkulator Emisi & Offset Karbon</h1>
        <p className="text-sm text-gray-500 mt-1">Hitung emisi perusahaan Anda dan estimasi kebutuhan kredit karbon mangrove</p>
      </div>

      {/* Regulatory Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-yellow-800 text-sm">Kewajiban Berdasarkan PP 98/2021 tentang Nilai Ekonomi Karbon</h3>
            <p className="text-xs text-yellow-700 mt-1">
              Perusahaan dengan emisi &gt;100.000 tCO₂e/tahun wajib melaporkan dan melakukan aksi mitigasi. Offset melalui kredit karbon yang terdaftar di SRN KLHK merupakan salah satu mekanisme yang diakui.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Input Form */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-5">
            <Factory className="w-5 h-5 text-gray-700" />
            <h3 className="font-display font-semibold text-gray-900">Input Data Emisi Tahunan</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-yellow-500" /> Konsumsi Listrik (kWh/tahun)</span>
              </label>
              <input type="number" min="0" value={electricity || ""} onChange={(e) => setElectricity(Number(e.target.value))}
                placeholder="Contoh: 500000" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
              <p className="text-[10px] text-gray-400 mt-0.5">Faktor emisi: 0,794 kgCO₂e/kWh (Grid Indonesia, ESDM 2023)</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-blue-500" /> Konsumsi Solar/Diesel (liter/tahun)</span>
              </label>
              <input type="number" min="0" value={diesel || ""} onChange={(e) => setDiesel(Number(e.target.value))}
                placeholder="Contoh: 50000" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
              <p className="text-[10px] text-gray-400 mt-0.5">Faktor emisi: 2,676 kgCO₂e/liter (IPCC 2006)</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-indigo-500" /> Konsumsi Bensin (liter/tahun)</span>
              </label>
              <input type="number" min="0" value={gasoline || ""} onChange={(e) => setGasoline(Number(e.target.value))}
                placeholder="Contoh: 30000" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
              <p className="text-[10px] text-gray-400 mt-0.5">Faktor emisi: 2,315 kgCO₂e/liter (IPCC 2006)</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                <span className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-orange-500" /> Gas Alam (m&sup3;/tahun)</span>
              </label>
              <input type="number" min="0" value={naturalGas || ""} onChange={(e) => setNaturalGas(Number(e.target.value))}
                placeholder="Contoh: 10000" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
              <p className="text-[10px] text-gray-400 mt-0.5">Faktor emisi: 2,02 kgCO₂e/m&sup3; (IPCC 2006)</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                <span className="flex items-center gap-1.5"><Factory className="w-3.5 h-3.5 text-sky-500" /> Penerbangan Bisnis (ribu km/tahun)</span>
              </label>
              <input type="number" min="0" value={flightKm || ""} onChange={(e) => setFlightKm(Number(e.target.value))}
                placeholder="Contoh: 200" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
              <p className="text-[10px] text-gray-400 mt-0.5">Faktor emisi: 0,255 tCO₂e/1000km (ICAO Carbon Calculator)</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                <span className="flex items-center gap-1.5"><Trash2 className="w-3.5 h-3.5 text-red-500" /> Limbah Padat (ton/tahun)</span>
              </label>
              <input type="number" min="0" value={waste || ""} onChange={(e) => setWaste(Number(e.target.value))}
                placeholder="Contoh: 500" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
              <p className="text-[10px] text-gray-400 mt-0.5">Faktor emisi: 0,5 tCO₂e/ton limbah (IPCC default)</p>
            </div>

            <div className="pt-3 border-t border-gray-100">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Target Offset (%)</label>
              <input type="range" min="10" max="100" step="5" value={offsetTarget} onChange={(e) => setOffsetTarget(Number(e.target.value))}
                className="w-full accent-emerald-600" />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10%</span>
                <span className="font-bold text-emerald-700">{offsetTarget}%</span>
                <span>100% (Net Zero)</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Results */}
        <div className="space-y-5">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center"><Factory className="w-4 h-4 text-red-600" /></div>
                <p className="text-xs text-gray-500">Total Emisi</p>
              </div>
              <p className="text-xl font-display font-bold text-gray-900">{formatNum(totalEmission, 1)}</p>
              <p className="text-xs text-gray-500">tCO₂e/tahun</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center"><AlertTriangle className="w-4 h-4 text-yellow-600" /></div>
                <p className="text-xs text-gray-500">Wajib Offset ({offsetTarget}%)</p>
              </div>
              <p className="text-xl font-display font-bold text-gray-900">{formatNum(requiredOffset, 1)}</p>
              <p className="text-xs text-gray-500">tCO₂e kredit karbon</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center"><Leaf className="w-4 h-4 text-emerald-600" /></div>
                <p className="text-xs text-gray-500">Mangrove Dibutuhkan</p>
              </div>
              <p className="text-xl font-display font-bold text-emerald-700">{formatNum(mangroveHaNeeded, 1)}</p>
              <p className="text-xs text-gray-500">Hektar mangrove</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><Calculator className="w-4 h-4 text-blue-600" /></div>
                <p className="text-xs text-gray-500">Estimasi Biaya</p>
              </div>
              <p className="text-xl font-display font-bold text-gray-900">Rp {formatNum(costIDR / 1000000, 1)}jt</p>
              <p className="text-xs text-gray-500">~USD {formatNum(costUSD, 0)}</p>
            </div>
          </div>

          {/* Emission Breakdown */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-display font-semibold text-gray-900 mb-4 text-sm">Breakdown Emisi per Sumber</h3>
            <div className="space-y-3">
              {sources.filter(s => s.value > 0).map((s) => (
                <div key={s.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="flex items-center gap-1.5 text-gray-700 font-medium">
                      <s.icon className="w-3.5 h-3.5" /> {s.label}
                    </span>
                    <span className="text-gray-900 font-semibold">{formatNum(s.value, 1)} tCO₂e</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${s.barColor} rounded-full transition-all duration-500`}
                      style={{ width: `${totalEmission > 0 ? (s.value / totalEmission) * 100 : 0}%` }} />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5 text-right">
                    {totalEmission > 0 ? formatNum((s.value / totalEmission) * 100, 1) : 0}% dari total
                  </p>
                </div>
              ))}
              {sources.every(s => s.value === 0) && (
                <p className="text-sm text-gray-400 text-center py-4">Masukkan data emisi di form sebelah kiri untuk melihat breakdown.</p>
              )}
            </div>
          </div>

          {/* CTA */}
          {totalEmission > 0 && (
            <div className="bg-gradient-to-br from-emerald-900 to-emerald-700 rounded-xl p-5 text-white">
              <h3 className="font-display font-bold text-lg">Solusi Offset via Mangrove Blue Carbon</h3>
              <p className="text-emerald-200 text-xs mt-1 mb-4">
                Offset emisi perusahaan Anda dengan membeli kredit karbon dari proyek mangrove terverifikasi dan terdaftar di SRN KLHK.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-emerald-200 text-[10px]">Kredit Dibutuhkan</p>
                  <p className="text-white font-bold text-lg">{formatNum(requiredOffset, 0)} tCO₂e</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-emerald-200 text-[10px]">Harga per tCO₂e</p>
                  <p className="text-white font-bold text-lg">Rp {formatNum(CARBON_PRICE_IDR)}</p>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 mb-4">
                <p className="text-emerald-200 text-[10px]">Total Investasi Offset</p>
                <p className="text-white font-bold text-2xl">Rp {formatNum(costIDR)}</p>
                <p className="text-emerald-300 text-xs mt-0.5">Setara mendanai restorasi {formatNum(mangroveHaNeeded, 1)} Ha mangrove</p>
              </div>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-emerald-900 rounded-lg text-sm font-bold hover:bg-emerald-50 transition-colors">
                Beli Kredit Karbon Sekarang <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Methodology Note */}
      <div className="mt-6 bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-display font-semibold text-gray-900 mb-3 text-sm">Metodologi Perhitungan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600">
          <div>
            <p className="font-semibold text-gray-800 mb-1">Faktor Emisi:</p>
            <ul className="space-y-0.5 list-disc list-inside">
              <li>Listrik: 0,794 kgCO₂e/kWh (Faktor Emisi Grid Indonesia, Kemen ESDM 2023)</li>
              <li>Solar/Diesel: 2,676 kgCO₂e/liter (IPCC 2006 Guidelines)</li>
              <li>Bensin: 2,315 kgCO₂e/liter (IPCC 2006 Guidelines)</li>
              <li>Gas Alam: 2,02 kgCO₂e/m&sup3; (IPCC 2006 Guidelines)</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-gray-800 mb-1">Asumsi Carbon Credit:</p>
            <ul className="space-y-0.5 list-disc list-inside">
              <li>Harga: Rp 65.000/tCO₂e (rata-rata pasar voluntary Indonesia 2024)</li>
              <li>Serapan mangrove: 12,5 tCO₂e/ha/tahun (Murdiyarso et al., 2015)</li>
              <li>Regulasi acuan: PP 98/2021, Permen LHK 21/2022</li>
              <li>Standar MRV: IPCC 2006 + Wetlands Supplement 2013</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
