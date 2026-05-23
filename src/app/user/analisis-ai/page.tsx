"use client";

import MangroveAIPanel from "@/components/dashboard/MangroveAIPanel";
import EkosistemPanel from "@/components/dashboard/EkosistemPanel";

export default function UserAnalisisAIPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900">Analisis AI Mangrove</h1>
        <p className="text-sm text-gray-500">Data nasional PMN · KKMD · BRGMN 2025</p>
      </div>
      <MangroveAIPanel role="sahabat" defaultExpanded />
      <EkosistemPanel />
    </div>
  );
}
