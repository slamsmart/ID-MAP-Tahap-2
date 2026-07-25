"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useMap } from "react-leaflet";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import L from "leaflet";
import {
  ABRASION_SITES,
  PRIORITAS_CONFIG,
  type AbrasionSite,
} from "@/lib/abrasionData";

function makeIcon(color: string, no: number) {
  return L.divIcon({
    className: "",
    html: `<div style="width:28px;height:28px;background:${color};border:2px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:#fff;">${no}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

export default function AbrasionOverlay({ fitOnLoad = false }: { fitOnLoad?: boolean }) {
  const map = useMap();
  const convexSites = useQuery(api.abrasionSites.list);
  const [count, setCount] = useState(0);

  const sites: AbrasionSite[] =
    convexSites && convexSites.length > 0
      ? (convexSites as unknown as AbrasionSite[])
      : ABRASION_SITES;

  useEffect(() => {
    setCount(sites.length);
    const group = L.featureGroup();
    sites.forEach((site) => {
      const cfg = PRIORITAS_CONFIG[site.prioritas as keyof typeof PRIORITAS_CONFIG];
      if (!cfg) return;
      const m = L.marker([site.lat, site.lng], {
        icon: makeIcon(cfg.dot, site.no),
      });
      m.bindPopup(
        `<div style="font-family:Arial,Helvetica,sans-serif;min-width:160px"><strong>${site.namaPantai}</strong><br/><span style="font-size:11px;color:#666">${site.kecamatanKab}</span><br/><span style="font-size:10px;font-weight:700;color:${cfg.dot}">${site.prioritas}</span></div>`
      );
      m.addTo(group);
    });
    group.addTo(map);
    if (fitOnLoad && sites.length) {
      const b = group.getBounds();
      if (b.isValid()) map.fitBounds(b, { padding: [60, 60], maxZoom: 10 });
    }
    return () => {
      map.removeLayer(group);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convexSites, map, fitOnLoad]);

  const container = map.getContainer();
  if (typeof document === "undefined" || !container) return null;
  return createPortal(
    <div className="absolute bottom-40 right-4 z-[450] pointer-events-none bg-white/95 rounded-xl shadow border border-gray-100 px-3 py-2" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      <p className="text-[10px] font-bold text-orange-700">🌊 Abrasi · {count} lokasi</p>
    </div>,
    container
  );
}
