"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { TITIK_PENDARATAN_PENYU, PENYU_WARNA, type TitikPenyu } from "@/lib/penyuData";
import { X, Shell, AlertTriangle, Calendar, MapPin } from "lucide-react";

function createTurtleIcon(warna: string) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width: 36px; height: 36px;
      background: ${warna};
      border: 3px solid white;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      cursor: pointer;
    ">🐢</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

function FitBounds() {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLngBounds(
      TITIK_PENDARATAN_PENYU.map((t) => [t.lat, t.lon] as [number, number])
    );
    map.fitBounds(bounds, { padding: [60, 60] });
  }, [map]);
  return null;
}

interface TurtleLayerProps {
  onClose: () => void;
}

export default function TurtleLayer({ onClose }: TurtleLayerProps) {
  const [selectedPantai, setSelectedPantai] = useState<string | null>(null);

  const pantaiList = Array.from(new Set(TITIK_PENDARATAN_PENYU.map((t) => t.pantai)));

  const filtered = selectedPantai
    ? TITIK_PENDARATAN_PENYU.filter((t) => t.pantai === selectedPantai)
    : TITIK_PENDARATAN_PENYU;

  const totalSarang = TITIK_PENDARATAN_PENYU.length;

  return (
    <div className="absolute inset-0 z-[400] flex flex-col">
      {/* Header */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[600] bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 min-w-max">
        <span className="text-xl">🐢</span>
        <div>
          <p className="text-sm font-bold text-gray-900">Titik Pendaratan Penyu</p>
          <p className="text-[10px] text-gray-500">{totalSarang} sarang · Jawa Timur</p>
        </div>

        {/* Filter pantai */}
        <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-gray-200">
          <button
            onClick={() => setSelectedPantai(null)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
              selectedPantai === null
                ? "bg-gray-800 text-white border-gray-800"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
            }`}
          >
            Semua
          </button>
          {pantaiList.map((p) => {
            const jenis = TITIK_PENDARATAN_PENYU.find((t) => t.pantai === p)?.namaIkon ?? "Penyu Lekang";
            const warna = PENYU_WARNA[jenis] ?? "#6b7280";
            return (
              <button
                key={p}
                onClick={() => setSelectedPantai(p === selectedPantai ? null : p)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                  selectedPantai === p
                    ? "text-white border-transparent"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                }`}
                style={selectedPantai === p ? { backgroundColor: warna, borderColor: warna } : {}}
              >
                {p.replace("Pantai ", "")}
              </button>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="ml-2 p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Map */}
      <MapContainer
        center={[-8.35, 112.6]}
        zoom={10}
        className="w-full h-full"
        style={{ width: "100%", height: "100%", zIndex: 0 }}
        zoomControl={true}
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles &copy; Esri"
        />

        <FitBounds />

        {filtered.map((titik) => {
          const warna = PENYU_WARNA[titik.namaIkon] ?? "#6b7280";
          return (
            <Marker
              key={titik.id}
              position={[titik.lat, titik.lon]}
              icon={createTurtleIcon(warna)}
            >
              <Popup className="turtle-popup" maxWidth={260}>
                <div className="p-1 space-y-2 text-xs">
                  {/* Header popup */}
                  <div className="flex items-center gap-2 pb-1.5 border-b border-gray-100">
                    <span className="text-2xl">🐢</span>
                    <div>
                      <p className="font-bold text-gray-900">{titik.pantai}</p>
                      <p className="text-[10px]" style={{ color: warna }}>
                        Sarang #{titik.noSarang} · {titik.namaIkon}
                      </p>
                    </div>
                  </div>

                  {/* Jenis */}
                  <div className="flex items-start gap-1.5">
                    <Shell className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 italic">{titik.jenisPenyu}</span>
                  </div>

                  {/* Catatan */}
                  {titik.catatan && (
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{titik.catatan}</span>
                    </div>
                  )}

                  {/* Ancaman */}
                  <div className="flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-orange-400 flex-shrink-0 mt-0.5" />
                    <div className="flex flex-wrap gap-1">
                      {titik.ancaman.map((a) => (
                        <span
                          key={a}
                          className="px-1.5 py-0.5 bg-orange-50 text-orange-700 rounded text-[10px] font-medium"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tanggal */}
                  <div className="flex items-center gap-1.5 pt-1 border-t border-gray-100">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-gray-500 text-[10px]">Survei: {titik.tanggalSurvei}</span>
                    <span className="ml-auto px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold">
                      {titik.statusPerlindungan}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Legend bawah kiri */}
      <div className="absolute bottom-6 left-6 z-[500] bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 px-4 py-3 space-y-1.5">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Jenis Penyu</p>
        {Object.entries(PENYU_WARNA).map(([jenis, warna]) => (
          <div key={jenis} className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] border-2 border-white shadow"
              style={{ backgroundColor: warna }}
            >
              🐢
            </div>
            <span className="text-xs text-gray-700 font-medium">{jenis}</span>
          </div>
        ))}
        <div className="pt-1.5 border-t border-gray-100">
          <p className="text-[10px] text-gray-400">
            Total: <strong className="text-gray-700">{totalSarang} sarang</strong>
          </p>
          <p className="text-[10px] text-gray-400">
            {pantaiList.length} pantai · Jawa Timur
          </p>
        </div>
      </div>
    </div>
  );
}
