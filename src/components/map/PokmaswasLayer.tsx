"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { DATA_POKMASWAS, KABKOTA_WARNA, type DataPokmaswas } from "@/lib/pokmaswasData";
import { X, MapPin, Phone, Users } from "lucide-react";

const STORAGE_KEY = "idmap_pokmaswas_override";

function loadData(): DataPokmaswas[] {
  if (typeof window === "undefined") return DATA_POKMASWAS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DATA_POKMASWAS;
  } catch {
    return DATA_POKMASWAS;
  }
}

function createPersonIcon(warna: string) {
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
    ">👤</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -22],
  });
}

function FitBounds({ data }: { data: DataPokmaswas[] }) {
  const map = useMap();
  useEffect(() => {
    if (data.length === 0) return;
    const bounds = L.latLngBounds(data.map((d) => [d.lat, d.lon] as [number, number]));
    map.fitBounds(bounds, { padding: [60, 60] });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

interface PokmaswasLayerProps {
  onClose: () => void;
}

export default function PokmaswasLayer({ onClose }: PokmaswasLayerProps) {
  const [data, setData] = useState<DataPokmaswas[]>([]);
  const [filterKab, setFilterKab] = useState<string | null>(null);

  useEffect(() => {
    setData(loadData());
  }, []);

  const kabList = Array.from(new Set(data.map((d) => d.kabKota)));
  const filtered = filterKab ? data.filter((d) => d.kabKota === filterKab) : data;

  return (
    <div className="absolute inset-0 z-[400] flex flex-col">
      {/* Header */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[600] bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 min-w-max">
        <Users className="w-5 h-5 text-emerald-600" />
        <div>
          <p className="text-sm font-bold text-gray-900">Pokmaswas Jawa Timur</p>
          <p className="text-[10px] text-gray-500">{data.length} kelompok · Kelompok Masyarakat Pengawas</p>
        </div>

        {/* Filter kabupaten */}
        <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-gray-200">
          <button
            onClick={() => setFilterKab(null)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
              filterKab === null
                ? "bg-gray-800 text-white border-gray-800"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
            }`}
          >
            Semua
          </button>
          {kabList.map((kab) => {
            const warna = KABKOTA_WARNA[kab] ?? "#6b7280";
            return (
              <button
                key={kab}
                onClick={() => setFilterKab(kab === filterKab ? null : kab)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                  filterKab === kab
                    ? "text-white border-transparent"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                }`}
                style={filterKab === kab ? { backgroundColor: warna, borderColor: warna } : {}}
              >
                {kab.replace("Kab. ", "")}
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
        center={[-8.2, 112.6]}
        zoom={9}
        className="w-full h-full"
        style={{ width: "100%", height: "100%", zIndex: 0 }}
        zoomControl={true}
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles &copy; Esri"
        />

        <FitBounds data={data} />

        {filtered.map((item) => {
          const warna = KABKOTA_WARNA[item.kabKota] ?? "#6b7280";
          return (
            <Marker
              key={item.no}
              position={[item.lat, item.lon]}
              icon={createPersonIcon(warna)}
            >
              <Popup maxWidth={260}>
                <div className="p-1 space-y-2 text-xs">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-gray-100">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-base flex-shrink-0"
                      style={{ backgroundColor: warna }}
                    >
                      👤
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{item.namaKelompok}</p>
                      <p className="text-[10px] font-semibold" style={{ color: warna }}>
                        #{item.no} · {item.kabKota}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">{item.alamat}</span>
                  </div>

                  <div className="flex items-start gap-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 font-medium">Ketua: {item.ketua}</span>
                  </div>

                  {item.noHp && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                      <span className="text-gray-600">{item.noHp}</span>
                    </div>
                  )}

                  <div className="pt-1 border-t border-gray-100 text-[10px] text-gray-400">
                    {item.lat.toFixed(4)}, {item.lon.toFixed(4)}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-6 left-6 z-[500] bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 px-4 py-3 space-y-1.5">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Kabupaten/Kota</p>
        {Object.entries(KABKOTA_WARNA).map(([kab, warna]) => (
          <div key={kab} className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] border-2 border-white shadow"
              style={{ backgroundColor: warna }}
            >
              👤
            </div>
            <span className="text-xs text-gray-700 font-medium">{kab}</span>
          </div>
        ))}
        <div className="pt-1.5 border-t border-gray-100">
          <p className="text-[10px] text-gray-400">
            Total: <strong className="text-gray-700">{data.length} kelompok</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
