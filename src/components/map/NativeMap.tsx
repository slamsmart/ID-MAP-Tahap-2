"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Polygon, useMapEvents, CircleMarker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import area from "@turf/area";

interface NativeMapProps {
  onAreaCalculated: (areaHa: number) => void;
  transparent?: boolean;
  carbonStock?: number;
}

function MapEvents({
  points,
  setPoints,
  isFinished,
}: {
  points: [number, number][];
  setPoints: React.Dispatch<React.SetStateAction<[number, number][]>>;
  isFinished: boolean;
}) {
  useMapEvents({
    click(e) {
      if (isFinished) return;
      const { lat, lng } = e.latlng;
      setPoints((prev) => [...prev, [lat, lng]]);
    },
  });
  return null;
}

function CarbonLabel({ points, carbonStock }: { points: [number, number][]; carbonStock: number }) {
  const map = useMap();
  const markerRef = useRef<L.Marker | null>(null);
  const [fontSize, setFontSize] = useState(14);

  // Calculate centroid of polygon
  const centroid: [number, number] = points.length >= 3
    ? [
        points.reduce((sum, p) => sum + p[0], 0) / points.length,
        points.reduce((sum, p) => sum + p[1], 0) / points.length,
      ]
    : [0, 0];

  // Adjust font size based on zoom level
  useEffect(() => {
    const updateFontSize = () => {
      const zoom = map.getZoom();
      const size = Math.max(10, Math.min(28, zoom * 2.2));
      setFontSize(size);
    };
    updateFontSize();
    map.on("zoomend", updateFontSize);
    return () => { map.off("zoomend", updateFontSize); };
  }, [map]);

  useEffect(() => {
    if (points.length < 3 || carbonStock <= 0) {
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
      return;
    }

    const formattedStock = carbonStock.toLocaleString("id-ID", { maximumFractionDigits: 0 });

    const icon = L.divIcon({
      className: "carbon-label-icon",
      html: `<div style="
        font-size: ${fontSize}px;
        font-weight: 800;
        color: #ffffff;
        text-shadow: 0 2px 8px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.5);
        white-space: nowrap;
        text-align: center;
        pointer-events: none;
        line-height: 1.2;
      ">
        <div>${formattedStock}</div>
        <div style="font-size: ${Math.max(8, fontSize * 0.5)}px; font-weight: 600; opacity: 0.85;">tCO₂e</div>
      </div>`,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });

    if (markerRef.current) {
      markerRef.current.setLatLng(centroid);
      markerRef.current.setIcon(icon);
    } else {
      markerRef.current = L.marker(centroid, { icon, interactive: false }).addTo(map);
    }

    return () => {
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
    };
  }, [points, carbonStock, fontSize, map, centroid]);

  return null;
}

export default function NativeMap({ onAreaCalculated, transparent, carbonStock = 0 }: NativeMapProps) {
  const [points, setPoints] = useState<[number, number][]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const center: [number, number] = [-7.45, 112.85];
  const defaultZoom = transparent ? 16 : 13;

  useEffect(() => {
    if (!transparent && typeof window !== "undefined") {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });
    }
  }, [transparent]);

  useEffect(() => {
    if (transparent && typeof document !== "undefined") {
      const style = document.createElement("style");
      style.id = "leaflet-transparent-style";
      style.textContent = `
        .leaflet-container.leaflet-transparent-map,
        .leaflet-container.leaflet-transparent-map .leaflet-pane,
        .leaflet-container.leaflet-transparent-map .leaflet-map-pane,
        .leaflet-container.leaflet-transparent-map .leaflet-shadow-pane,
        .leaflet-container.leaflet-transparent-map .leaflet-overlay-pane,
        .leaflet-container.leaflet-transparent-map .leaflet-marker-pane {
          background: transparent !important;
          background-color: transparent !important;
        }
        .leaflet-container.leaflet-transparent-map .leaflet-tile-pane { display: none !important; }
        .leaflet-container.leaflet-transparent-map .leaflet-control-attribution { display: none !important; }
        .leaflet-container.leaflet-transparent-map .leaflet-control-zoom { display: none !important; }
      `;
      document.head.appendChild(style);
      return () => {
        const el = document.getElementById("leaflet-transparent-style");
        if (el) el.remove();
      };
    }
  }, [transparent]);

  useEffect(() => {
    if (points.length >= 3) {
      const ring = [...points.map(p => [p[1], p[0]]), [points[0][1], points[0][0]]];
      const areaSqMeters = area({ type: "Polygon", coordinates: [ring] });
      const areaHa = areaSqMeters / 10000;
      onAreaCalculated(areaHa);
    } else if (points.length === 0) {
      onAreaCalculated(0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points]);

  return (
    <div className="relative w-full h-full" style={{ background: "transparent" }}>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-gray-100 flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700">
          {isFinished
            ? "Area Terukur. Hapus untuk mengulang."
            : points.length === 0
              ? "Scroll untuk zoom, drag untuk geser, klik untuk tandai titik."
              : `${points.length} titik — klik lanjut, atau tekan SELESAI (min. 3 titik).`}
        </span>
        <div className="flex gap-2">
          {points.length >= 3 && !isFinished && (
            <button
              onClick={() => setIsFinished(true)}
              className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-md hover:bg-emerald-700"
            >
              SELESAI
            </button>
          )}
          <button
            onClick={() => {
              setPoints([]);
              setIsFinished(false);
              onAreaCalculated(0);
            }}
            className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-bold rounded-md hover:bg-gray-300"
          >
            ULANGI
          </button>
        </div>
      </div>

      <MapContainer
        center={center}
        zoom={defaultZoom}
        className={`w-full h-full ${transparent ? "leaflet-transparent-map" : ""}`}
        style={{ width: "100%", height: "100%", background: "transparent", backgroundColor: "transparent" }}
        zoomControl={!transparent}
        dragging={true}
        scrollWheelZoom={true}
        doubleClickZoom={false}
        touchZoom={true}
        boxZoom={false}
        keyboard={false}
      >
        {!transparent && (
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles &copy; Esri"
          />
        )}

        <MapEvents points={points} setPoints={setPoints} isFinished={isFinished} />

        {points.length > 0 && (
          <Polygon
            positions={points}
            pathOptions={{
              color: "#ffffff",
              weight: 3,
              fillColor: isFinished ? "#10b981" : "#3b82f6",
              fillOpacity: isFinished ? 0.35 : 0.25,
              dashArray: isFinished ? undefined : "8, 8",
            }}
          />
        )}

        {points.map((p, i) => (
          <CircleMarker
            key={i}
            center={p}
            radius={6}
            pathOptions={{ color: "#059669", fillColor: "#ffffff", fillOpacity: 1, weight: 2 }}
          />
        ))}

        {/* Carbon Stock Label on polygon - value shown only in calculator panel */}
      </MapContainer>
    </div>
  );
}
