"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { Loader2 } from "lucide-react";
import "leaflet/dist/leaflet.css";

/**
 * Single shared Leaflet map host.
 * Stripe animation matches landing: rise-fade.
 * Avoids manual leaflet DOM cleanup — react-leaflet handles its own.
 */
export default function SharedInteractiveMap({
  children,
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);

  useEffect(() => {
    setReady(true);
    const t = window.setTimeout(() => setMapVisible(true), 80);
    return () => {
      window.clearTimeout(t);
      setReady(false);
      setMapVisible(false);
    };
  }, []);

  return (
    <div ref={hostRef} className={`w-full h-full relative ${className}`}>
      <style>{`
        .leaflet-container {
          cursor: default !important;
        }
        .leaflet-container.leaflet-grab {
          cursor: default !important;
        }
        .leaflet-container.leaflet-dragging,
        .leaflet-container.leaflet-drag-target {
          cursor: grabbing !important;
        }
        .leaflet-popup-content,
        .leaflet-popup-content-wrapper,
        .mhi-leaflet-popup .leaflet-popup-content,
        .mhi-popup {
          font-family: Arial, Helvetica, sans-serif !important;
        }
        .leaflet-popup-content {
          margin: 10px 12px !important;
          line-height: 1.35 !important;
        }
      `}</style>

      {/* Landing-style loading shell */}
      {!mapVisible && (
        <div className="absolute inset-0 z-[5] flex flex-col items-center justify-center gap-3 bg-[#0F2E2A] animate-rise-fade">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-rise">
            <Loader2 className="h-6 w-6 text-emerald-300 animate-spin" />
          </div>
          <p className="text-sm font-semibold text-emerald-50/90 text-rise" style={{ animationDelay: "90ms" }}>
            Memuat peta interaktif…
          </p>
          <p className="text-[11px] text-emerald-100/50 text-rise" style={{ animationDelay: "160ms" }}>
            Satellite · MHI · RTRW · PRL
          </p>
        </div>
      )}

      {ready && (
        <div
          className={`w-full h-full ${mapVisible ? "animate-rise-fade" : "opacity-0"}`}
        >
          <MapContainer
            key={`shared-map`}
            center={[-7.4, 113.2]}
            zoom={8}
            className="w-full h-full"
            style={{ width: "100%", height: "100%", zIndex: 0 }}
            zoomControl
            preferCanvas
          >
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="Tiles &copy; Esri"
              maxZoom={19}
            />
            {children}
          </MapContainer>
        </div>
      )}
    </div>
  );
}
