"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { TITIK_PENDARATAN_PENYU, PENYU_WARNA, type TitikPenyu } from "@/lib/penyuData";
import { X } from "lucide-react";

const STORAGE_KEY = "idmap_penyu_override";

function loadData(): TitikPenyu[] {
  if (typeof window === "undefined") return TITIK_PENDARATAN_PENYU;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : TITIK_PENDARATAN_PENYU;
  } catch {
    return TITIK_PENDARATAN_PENYU;
  }
}

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

function FitBounds({ data }: { data: TitikPenyu[] }) {
  const map = useMap();
  useEffect(() => {
    if (data.length === 0) return;
    const bounds = L.latLngBounds(
      data.map((t) => [t.lat, t.lon] as [number, number])
    );
    map.fitBounds(bounds, { padding: [60, 60] });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

interface TurtleLayerProps {
  onClose: () => void;
}

export default function TurtleLayer({ onClose }: TurtleLayerProps) {
  const [data, setData] = useState<TitikPenyu[]>([]);
  const [selectedPantai, setSelectedPantai] = useState<string | null>(null);

  useEffect(() => {
    setData(loadData());
  }, []);

  const pantaiList = Array.from(new Set(data.map((t) => t.pantai)));

  const filtered = selectedPantai
    ? data.filter((t) => t.pantai === selectedPantai)
    : data;

  const totalSarang = data.length;

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
            const jenis = data.find((t) => t.pantai === p)?.namaIkon ?? "Penyu Lekang";
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

        <FitBounds data={data} />

        {filtered.map((titik) => {
          const warna = PENYU_WARNA[titik.namaIkon] ?? "#6b7280";
          return (
            <Marker
              key={titik.id}
              position={[titik.lat, titik.lon]}
              icon={createTurtleIcon(warna)}
            />
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
