"use client";

import { useState } from "react";
import {
  Brain,
  Leaf,
  TrendingUp,
  AlertTriangle,
  Users,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  BarChart3,
  ScrollText,
} from "lucide-react";
import {
  DATA_PROVINSI,
  PROGRAM_RESTORASI,
  RINGKASAN_NASIONAL,
} from "@/lib/mangroveNasionalData";

type Fokus = "umum" | "restorasi" | "ancaman" | "kkmd" | "kebijakan";

interface MangroveAIPanelProps {
  role?: string;
  defaultExpanded?: boolean;
}

const fokusOptions: { value: Fokus; label: string; icon: React.ElementType }[] = [
  { value: "umum", label: "Analisis Umum", icon: Brain },
  { value: "restorasi", label: "Progress Restorasi", icon: TrendingUp },
  { value: "ancaman", label: "Peta Ancaman", icon: AlertTriangle },
  { value: "kkmd", label: "Penguatan KKMD", icon: Users },
  { value: "kebijakan", label: "Kebijakan & Program", icon: ScrollText },
];

// Quick stat cards
const STATS = [
  {
    label: "Total Mangrove",
    value: `${(RINGKASAN_NASIONAL.totalLuasMangrove / 1_000_000).toFixed(2)} jt ha`,
    sub: `${RINGKASAN_NASIONAL.persentaseDunia}% mangrove dunia`,
    color: "bg-emerald-50 text-emerald-700",
    border: "border-emerald-200",
  },
  {
    label: "Realisasi PMN",
    value: `${RINGKASAN_NASIONAL.persenRealisasi}%`,
    sub: `${(RINGKASAN_NASIONAL.realisasiRestorasi / 1000).toFixed(0)}k ha dari ${(RINGKASAN_NASIONAL.targetRestorasiTotal / 1000).toFixed(0)}k ha`,
    color: "bg-blue-50 text-blue-700",
    border: "border-blue-200",
  },
  {
    label: "Provinsi Kritis",
    value: String(DATA_PROVINSI.filter((p) => p.kondisi === "kritis").length),
    sub: `dari ${DATA_PROVINSI.length} provinsi`,
    color: "bg-red-50 text-red-700",
    border: "border-red-200",
  },
];

function MarkdownText({ text }: { text: string }) {
  // Simple markdown renderer for the AI output
  const lines = text.split("\n");
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith("## ")) {
          return (
            <h3 key={i} className="text-sm font-bold text-gray-900 mt-4 mb-1 first:mt-0">
              {line.slice(3)}
            </h3>
          );
        }
        if (line.startsWith("### ")) {
          return (
            <h4 key={i} className="text-sm font-semibold text-gray-800 mt-2 mb-0.5">
              {line.slice(4)}
            </h4>
          );
        }
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return (
            <li key={i} className="text-xs text-gray-600 ml-4 list-disc leading-relaxed">
              {line.slice(2)}
            </li>
          );
        }
        if (line.startsWith("**") && line.endsWith("**")) {
          return (
            <p key={i} className="text-xs font-semibold text-gray-700">
              {line.slice(2, -2)}
            </p>
          );
        }
        if (line.trim() === "") return <div key={i} className="h-1" />;
        // Bold inline
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={i} className="text-xs text-gray-600 leading-relaxed">
            {parts.map((part, j) =>
              part.startsWith("**") && part.endsWith("**") ? (
                <strong key={j}>{part.slice(2, -2)}</strong>
              ) : (
                part
              )
            )}
          </p>
        );
      })}
    </div>
  );
}

export default function MangroveAIPanel({
  role = "admin",
  defaultExpanded = false,
}: MangroveAIPanelProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [fokus, setFokus] = useState<Fokus>("umum");
  const [aiText, setAiText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setIsLoading(true);
    setAiText("");
    setError("");
    setHasGenerated(true);

    try {
      const res = await fetch("/api/mangrove-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fokus, role }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Gagal mengambil analisis");
      }

      if (!res.body) throw new Error("No stream body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setAiText(accumulated);
      }
    } catch (err: any) {
      setError(err.message ?? "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  const topKritis = DATA_PROVINSI.filter((p) => p.kondisi === "kritis")
    .sort((a, b) => b.luasDegradasi - a.luasDegradasi)
    .slice(0, 5);

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-sm">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-900">Analisis AI Mangrove Nasional</p>
            <p className="text-xs text-gray-500">PMN · KKMD · BRGMN 2025</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
            Indonesia
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-100">
          <div className="p-4 space-y-4">
            {/* AI Section — di atas stats */}
            <div className="border border-dashed border-emerald-200 rounded-xl p-4 bg-emerald-50/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-emerald-600" />
                  <p className="text-xs font-semibold text-emerald-800">Rekomendasi AI</p>
                </div>
                {hasGenerated && !isLoading && (
                  <button
                    onClick={handleGenerate}
                    className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Perbarui
                  </button>
                )}
              </div>

              {/* Fokus selector */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {fokusOptions.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setFokus(opt.value);
                        if (hasGenerated) {
                          setHasGenerated(false);
                          setAiText("");
                        }
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        fokus === opt.value
                          ? "bg-emerald-700 text-white"
                          : "bg-white text-gray-600 border border-gray-200 hover:border-emerald-300"
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              {/* Generate button / result */}
              {!hasGenerated ? (
                <button
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-70"
                >
                  <Brain className="w-4 h-4" />
                  Generate Analisis AI
                </button>
              ) : (
                <div className="bg-white rounded-lg border border-emerald-100 p-3 min-h-[80px] relative">
                  {isLoading && aiText === "" ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-6">
                      <div className="w-8 h-8 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin" style={{ borderWidth: "3px" }} />
                      <div className="text-center">
                        <p className="text-sm font-semibold text-emerald-700">Mohon Menunggu...</p>
                        <p className="text-xs text-gray-400 mt-0.5">Sedang menganalisis data mangrove nasional</p>
                      </div>
                      <div className="flex gap-1 mt-1">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  ) : error ? (
                    <p className="text-xs text-red-600">{error}</p>
                  ) : (
                    <div className="relative">
                      <MarkdownText text={aiText} />
                      {isLoading && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-emerald-600">
                          <div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                          <span>Sedang menulis...</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Stats Mangrove Nasional */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-gray-50/50 rounded-lg p-3">
              {STATS.map((s) => (
                <div
                  key={s.label}
                  className={`rounded-lg border p-3 ${s.border} bg-white`}
                >
                  <p className="text-xs text-gray-500 mb-0.5">{s.label}</p>
                  <p className={`text-base font-bold ${s.color.split(" ")[1]}`}>{s.value}</p>
                  <p className="text-xs text-gray-400">{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Program Overview */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Progress Program Restorasi
                </p>
              </div>
              <div className="space-y-2">
                {PROGRAM_RESTORASI.slice(0, 3).map((p) => {
                  const pct = Math.round((p.realisasiHektar / p.targetHektar) * 100);
                  return (
                    <div key={p.nama}>
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-xs text-gray-600 truncate max-w-[60%]">{p.nama}</p>
                        <p className="text-xs font-semibold text-gray-800">{pct}%</p>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            pct >= 60
                              ? "bg-emerald-500"
                              : pct >= 40
                              ? "bg-amber-400"
                              : "bg-red-400"
                          }`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top kritis */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Provinsi Kondisi Kritis
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {topKritis.map((p) => (
                  <span
                    key={p.provinsi}
                    className="px-2 py-0.5 text-xs bg-red-50 text-red-700 border border-red-100 rounded-full"
                  >
                    {p.provinsi} ({p.persenRealisasi}%)
                  </span>
                ))}
              </div>
            </div>

            <p className="text-xs text-gray-400 text-right">
              Sumber: PMN, KKMD, BRGMN 2025 · Analisis oleh Claude AI
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
