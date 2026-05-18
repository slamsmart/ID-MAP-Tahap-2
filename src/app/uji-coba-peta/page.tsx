"use client";

import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/shared/Navbar";
import { MapPin, RotateCcw, Check, Leaf, Plane, Home, Car } from "lucide-react";

type Point = { x: number; y: number };

export default function InteractiveMapDemo() {
  const [points, setPoints] = useState<Point[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [areaHa, setAreaHa] = useState(0);
  const mapRef = useRef<HTMLDivElement>(null);

  // Shoelace formula to calculate polygon area
  const calculateArea = (pts: Point[]) => {
    if (pts.length < 3) return 0;
    let area = 0;
    for (let i = 0; i < pts.length; i++) {
      const j = (i + 1) % pts.length;
      area += pts[i].x * pts[j].y;
      area -= pts[j].x * pts[i].y;
    }
    area = Math.abs(area) / 2;
    // Asumsi skala: 1 pixel persegi = 0.0005 Hektar (hanya untuk simulasi)
    return area * 0.0005;
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isFinished) return;
    
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newPoints = [...points, { x, y }];
    setPoints(newPoints);
    
    if (newPoints.length >= 3) {
      setAreaHa(calculateArea(newPoints));
    }
  };

  const finishPolygon = () => {
    if (points.length >= 3) {
      setIsFinished(true);
    }
  };

  const resetMap = () => {
    setPoints([]);
    setIsFinished(false);
    setAreaHa(0);
  };

  // Kalkulasi Gamifikasi
  // 1 Ha Mangrove rata-rata menyimpan 800 Ton CO2e
  const totalCarbon = areaHa * 800; 
  
  // Konversi (Asumsi estimasi rata-rata)
  // 1 Sepeda motor = 1 Ton CO2/tahun
  const motorEquivalent = Math.round(totalCarbon / 1);
  // 1 Penerbangan JKT-DPS = 0.2 Ton CO2
  const flightEquivalent = Math.round(totalCarbon / 0.2);
  // 1 Rumah Tangga = 3 Ton CO2/tahun
  const homeEquivalent = Math.round(totalCarbon / 3);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-gray-900">Uji Coba: Kalkulator Poligon Karbon</h1>
            <p className="text-gray-500 mt-2">
              Klik pada peta untuk membuat titik (minimal 3 titik). Area yang dilingkupi akan otomatis dihitung potensi serapan karbonnya.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Map Area */}
            <div className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  Peta Satelit Simulasi
                </h3>
                <div className="flex gap-2">
                  {points.length >= 3 && !isFinished && (
                    <button 
                      onClick={finishPolygon}
                      className="px-3 py-1.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" /> Selesai Gambar
                    </button>
                  )}
                  <button 
                    onClick={resetMap}
                    className="px-3 py-1.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 flex items-center gap-1"
                  >
                    <RotateCcw className="w-4 h-4" /> Ulangi
                  </button>
                </div>
              </div>

              {/* Interactive SVG Map */}
              <div 
                ref={mapRef}
                onClick={handleMapClick}
                className="relative w-full h-[500px] rounded-xl overflow-hidden cursor-crosshair bg-slate-100 border border-gray-200"
                style={{
                  backgroundImage: "url('https://images.unsplash.com/photo-1542301980-60b720b0800b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')",
                  backgroundSize: "cover",
                  backgroundPosition: "center"
                }}
              >
                {/* Overlay Hitam Transparan */}
                <div className="absolute inset-0 bg-black/20 pointer-events-none" />

                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {/* Gambar Poligon */}
                  {points.length > 0 && (
                    <polygon
                      points={points.map(p => `${p.x},${p.y}`).join(" ")}
                      fill={isFinished ? "rgba(16, 185, 129, 0.4)" : "rgba(59, 130, 246, 0.3)"}
                      stroke={isFinished ? "#059669" : "#3b82f6"}
                      strokeWidth="3"
                      strokeDasharray={isFinished ? "0" : "5,5"}
                    />
                  )}
                  
                  {/* Titik-titik Marker */}
                  {points.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="5" fill="#ffffff" stroke="#059669" strokeWidth="2" />
                  ))}
                  
                  {/* Garis pemandu ke mouse (opsional, bisa ditambahkan jika perlu) */}
                </svg>

                {points.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-gray-700 shadow-sm">
                      Klik area ini untuk mulai menggambar poligon
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Results Panel */}
            <div className="w-full lg:w-[400px] flex flex-col gap-4">
              <div className="bg-emerald-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <Leaf className="absolute -bottom-4 -right-4 w-32 h-32 text-emerald-800 opacity-50" />
                <h3 className="text-emerald-100 font-medium mb-1">Total Serapan Karbon</h3>
                <div className="text-4xl font-display font-bold mb-2">
                  {totalCarbon.toLocaleString('id-ID', { maximumFractionDigits: 0 })} <span className="text-xl text-emerald-200">tCO₂e</span>
                </div>
                <div className="text-sm text-emerald-200">
                  Estimasi Luas Area: <strong className="text-white">{areaHa.toLocaleString('id-ID', { maximumFractionDigits: 2 })} Hektar</strong>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex-1">
                <h3 className="font-semibold text-gray-900 mb-4">Setara Dengan Membersihkan:</h3>
                
                <div className="space-y-5">
                  {/* Motor */}
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                      <Car className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {motorEquivalent.toLocaleString('id-ID')} <span className="text-sm font-normal text-gray-500">Motor</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">Asap knalpot sepeda motor selama 1 tahun penuh.</p>
                    </div>
                  </div>

                  {/* Pesawat */}
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Plane className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {flightEquivalent.toLocaleString('id-ID')} <span className="text-sm font-normal text-gray-500">Penerbangan</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">Penerbangan penumpang rute Jakarta - Bali.</p>
                    </div>
                  </div>

                  {/* Rumah Tangga */}
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                      <Home className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {homeEquivalent.toLocaleString('id-ID')} <span className="text-sm font-normal text-gray-500">Rumah</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">Konsumsi listrik rumah tangga rata-rata setahun.</p>
                    </div>
                  </div>
                </div>

                {areaHa === 0 && (
                  <div className="mt-6 p-4 bg-blue-50 text-blue-700 text-sm rounded-xl border border-blue-100">
                    Mulai menggambar poligon di peta untuk melihat hasil kalkulasi secara *real-time*.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
