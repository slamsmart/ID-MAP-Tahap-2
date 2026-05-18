"use client";

import { useState, useEffect } from "react";
import { formatRupiah, formatNumber } from "@/lib/utils";
import { ArrowRight, Download, CheckCircle2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { getSession, User } from "@/lib/auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

export default function CorporateDashboard() {
  const [session, setSession] = useState<User | null>(null);
  const [emission, setEmission] = useState(100);
  const [price, setPrice] = useState(65000);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [isSimulating, setIsSimulating] = useState(false);
  const totalCost = emission * price;

  useEffect(() => {
    setSession(getSession());
  }, []);

  const companyId = session?._id as Id<"users"> | undefined;

  const stats = useQuery(api.transactions.getPortfolioStats, companyId ? { companyId } : "skip");
  const transactions = useQuery(api.transactions.listByCompany, companyId ? { companyId } : "skip");
  const projects = useQuery(api.projects.list);
  const createTransaction = useMutation(api.transactions.create);

  // Set default project when projects load
  useEffect(() => {
    if (projects && projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0]._id);
    }
  }, [projects, selectedProjectId]);

  const totalCo2Claimed = stats?.totalCo2Claimed || 0;
  const totalCertificates = stats?.totalCertificates || 0;
  
  // Calculate remaining emission obligations (Dummy total emission for now = 12450)
  const totalEmissionObligation = 12450;
  const remainingObligation = Math.max(0, totalEmissionObligation - totalCo2Claimed);

  // Group portfolio data for Pie chart
  const portfolioDataMap = new Map<string, number>();
  if (transactions && projects) {
    transactions.forEach(tx => {
      if (tx.status === "Selesai" && tx.projectId) {
        const proj = projects.find(p => p._id === tx.projectId);
        const type = proj?.title.includes("Mangrove") ? "Blue Carbon" 
                   : proj?.title.includes("Hutan") || proj?.title.includes("Agroforestry") ? "Hutan & Reboisasi"
                   : proj?.title.includes("PLTS") ? "Energi Terbarukan" : "Lainnya";
        portfolioDataMap.set(type, (portfolioDataMap.get(type) || 0) + tx.co2Amount);
      }
    });
  }

  let portfolioData = Array.from(portfolioDataMap.entries()).map(([name, value]) => ({ name, value }));
  if (portfolioData.length === 0) {
    portfolioData = [{ name: "Belum Ada", value: 1 }]; // Placeholder
  }

  const COLORS = ["#064E3B", "#059669", "#34D399", "#A7F3D0"];

  const handleDownloadESG = () => {
    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="100%" stop-color="#f0fdf4"/>
          </linearGradient>
        </defs>
        
        <rect width="800" height="600" fill="url(#bg)"/>
        
        <rect x="0" y="0" width="800" height="15" fill="#064E3B"/>
        <rect x="0" y="585" width="800" height="15" fill="#064E3B"/>
        
        <g transform="translate(50, 60)">
          <text x="0" y="0" font-family="Arial, sans-serif" font-weight="bold" font-size="28" fill="#064E3B">LAPORAN ESG &amp; OFFSET KARBON</text>
          <text x="0" y="25" font-family="Arial, sans-serif" font-size="14" fill="#6B7280">Diterbitkan oleh ID-MAP untuk ${session?.name || "Perusahaan"}</text>
          <text x="0" y="45" font-family="Arial, sans-serif" font-size="12" fill="#6B7280">Tanggal: ${new Date().toLocaleDateString('id-ID')}</text>
        </g>
        
        <rect x="50" y="140" width="700" height="1" fill="#E5E7EB"/>
        
        <g transform="translate(50, 180)">
          <text x="0" y="0" font-family="Arial, sans-serif" font-weight="bold" font-size="16" fill="#111827">Ringkasan Emisi</text>
          
          <rect x="0" y="20" width="220" height="100" fill="#ffffff" stroke="#E5E7EB" rx="8"/>
          <text x="20" y="50" font-family="Arial, sans-serif" font-size="12" fill="#6B7280">Total Kewajiban Emisi</text>
          <text x="20" y="85" font-family="Arial, sans-serif" font-weight="bold" font-size="24" fill="#111827">${formatNumber(totalEmissionObligation)} tCO2e</text>
          
          <rect x="240" y="20" width="220" height="100" fill="#ffffff" stroke="#E5E7EB" rx="8"/>
          <text x="260" y="50" font-family="Arial, sans-serif" font-size="12" fill="#6B7280">Emisi Telah Diklaim</text>
          <text x="260" y="85" font-family="Arial, sans-serif" font-weight="bold" font-size="24" fill="#047857">${formatNumber(totalCo2Claimed)} tCO2e</text>
          
          <rect x="480" y="20" width="220" height="100" fill="#ffffff" stroke="#E5E7EB" rx="8"/>
          <text x="500" y="50" font-family="Arial, sans-serif" font-size="12" fill="#6B7280">Sisa Kewajiban Offset</text>
          <text x="500" y="85" font-family="Arial, sans-serif" font-weight="bold" font-size="24" fill="#DC2626">${formatNumber(remainingObligation)} tCO2e</text>
        </g>

        <g transform="translate(50, 340)">
          <text x="0" y="0" font-family="Arial, sans-serif" font-weight="bold" font-size="16" fill="#111827">Progress Keberlanjutan</text>
          <rect x="0" y="20" width="700" height="30" fill="#F3F4F6" rx="15"/>
          <rect x="0" y="20" width="${Math.min(700, (totalCo2Claimed / totalEmissionObligation) * 700)}" height="30" fill="#059669" rx="15"/>
          <text x="350" y="40" font-family="Arial, sans-serif" font-weight="bold" font-size="12" fill="${totalCo2Claimed / totalEmissionObligation > 0.5 ? '#ffffff' : '#111827'}" text-anchor="middle">${((totalCo2Claimed / totalEmissionObligation) * 100).toFixed(1)}% Terpenuhi</text>
        </g>
        
        <g transform="translate(50, 430)">
          <text x="0" y="0" font-family="Arial, sans-serif" font-weight="bold" font-size="16" fill="#111827">Portofolio Proyek Didukung</text>
          ${portfolioData.map((d, i) => `
            <circle cx="10" cy="${30 + (i * 25)}" r="5" fill="${COLORS[i % COLORS.length]}"/>
            <text x="25" y="${34 + (i * 25)}" font-family="Arial, sans-serif" font-size="12" fill="#374151">${d.name}: ${formatNumber(d.value)} tCO2e</text>
          `).join('')}
        </g>

        <g transform="translate(750, 560)">
          <text x="0" y="0" font-family="Arial, sans-serif" font-weight="bold" font-size="24" fill="#064E3B" text-anchor="end" opacity="0.1">ID-MAP</text>
        </g>
      </svg>
    `;

    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Laporan_ESG_${session?.name?.replace(/\s/g, "_") || "Perusahaan"}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSimulatePurchase = async () => {
    if (!companyId || !selectedProjectId || emission <= 0) return;
    
    try {
      setIsSimulating(true);
      await createTransaction({
        companyName: session?.name || "Perusahaan",
        companyId: companyId,
        projectId: selectedProjectId as Id<"projects">,
        co2Amount: emission,
        pricePerTon: price,
      });
      // Reset form slightly to indicate success
      setEmission(100);
      alert("Simulasi pembelian berhasil! Portofolio Anda telah diperbarui.");
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat simulasi.");
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900">
          Halo, {session?.name || "Perusahaan"}
        </h1>
        <p className="text-sm text-gray-500">
          Kelola jejak karbon dan penuhi kewajiban emisi perusahaan.
        </p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Total Emisi (tCO₂e)</p>
          <p className="font-display font-bold text-xl text-gray-900">{formatNumber(totalEmissionObligation)}</p>
          <p className="text-[10px] text-gray-400">Tahun 2026</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Kewajiban Ganti Emisi</p>
          <p className="font-display font-bold text-xl text-gray-900">{formatNumber(emission)}</p>
          <p className="text-[10px] text-gray-400">tCO₂e</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Telah Diklaim</p>
          <p className="font-display font-bold text-xl text-emerald-700">{formatNumber(totalCo2Claimed)}</p>
          <p className="text-[10px] text-gray-400">tCO₂e</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Sisa Kewajiban</p>
          <p className="font-display font-bold text-xl text-orange-600">{formatNumber(remainingObligation)}</p>
          <p className="text-[10px] text-gray-400">tCO₂e</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Carbon Converter */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-display font-semibold text-gray-800 mb-4">
            Estimasi Konversi Carbon ke Rupiah
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1">
                Input Emisi yang Harus Dikompensasi
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formatNumber(emission)}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setEmission(Number(val) || 0);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg font-display font-semibold text-sm"
                />
                <span className="text-xs text-gray-500">tCO₂e</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">
                Harga Carbon (IDR/CO₂e)
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg font-display font-semibold text-sm"
                >
                  <option value={65000}>Rp 65.000</option>
                  <option value={75000}>Rp 75.000</option>
                  <option value={85000}>Rp 85.000</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">
                Pilih Proyek (Simulasi)
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg font-display font-semibold text-sm"
              >
                {projects?.map(p => (
                  <option key={p._id} value={p._id}>{p.title}</option>
                ))}
              </select>
            </div>
            <div className="bg-emerald-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Estimasi Biaya</p>
              <p className="font-display font-bold text-2xl text-emerald-900">
                {formatRupiah(totalCost)}
              </p>
              <p className="text-[10px] text-gray-400 mt-1">
                *Harga dapat berubah sewaktu-waktu
              </p>
            </div>
            <button 
              onClick={handleSimulatePurchase}
              disabled={isSimulating || emission <= 0 || !selectedProjectId}
              className="w-full py-2.5 bg-[#0f3d2e] text-white font-display font-semibold rounded-lg hover:bg-[#14523d] transition-colors text-sm disabled:opacity-50"
            >
              {isSimulating ? "Memproses..." : "Simulasikan Pembelian Kredit"}
            </button>
          </div>
        </div>

        {/* Portfolio Chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-display font-semibold text-gray-800 mb-4">
            Portofolio Karbon
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={portfolioData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {portfolioData.map((entry, i) => (
                  <Cell key={i} fill={portfolioData.length === 1 && entry.name === "Belum Ada" ? "#E5E7EB" : COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => name === "Belum Ada" ? "" : `${formatNumber(Number(value))} tCO₂e`} />
              <Legend
                verticalAlign="middle"
                align="right"
                layout="vertical"
                iconType="circle"
                iconSize={8}
                formatter={(value: string) => (
                  <span className="text-xs text-gray-600">{value}</span>
                )}
              />
              <text
                x="38%"
                y="48%"
                textAnchor="middle"
                className="font-display font-bold text-xl"
                fill="#064E3B"
              >
                {formatNumber(totalCo2Claimed)}
              </text>
              <text
                x="38%"
                y="58%"
                textAnchor="middle"
                className="text-[10px]"
                fill="#6B7280"
              >
                tCO₂e
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Portfolio Table */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-display font-semibold text-gray-800 mb-4">
          Ringkasan Portofolio
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="pb-3 font-medium">Proyek</th>
                <th className="pb-3 font-medium">Jumlah (tCO₂e)</th>
                <th className="pb-3 font-medium">Tanggal Klaim</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions && transactions.length > 0 ? (
                transactions.map((row) => {
                  const proj = projects?.find(p => p._id === row.projectId);
                  return (
                    <tr
                      key={row._id}
                      className="border-b border-gray-50 last:border-0"
                    >
                      <td className="py-3 font-medium text-gray-800">{proj ? proj.title : "Proyek Karbon"}</td>
                      <td className="py-3 text-gray-700">{formatNumber(row.co2Amount)}</td>
                      <td className="py-3 text-gray-500">{new Date(row.createdAt).toLocaleDateString('id-ID')}</td>
                      <td className="py-3">
                        <span className={`flex items-center gap-1 ${row.status === "Selesai" ? "text-emerald-600" : "text-amber-600"}`}>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-500 text-sm border-b border-gray-50">
                    Belum ada portofolio klaim karbon.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <button className="flex items-center gap-1 text-sm text-emerald-600 font-medium mt-4 hover:text-emerald-700">
          Lihat Semua Portofolio <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-display font-semibold text-gray-800 mb-4">
            Transaksi Terbaru
          </h3>
          <div className="space-y-3">
            {transactions && transactions.length > 0 ? (
              transactions.slice(0, 3).map((tx) => {
                const proj = projects?.find(p => p._id === tx.projectId);
                return (
                  <div key={tx._id} className="flex gap-3 p-2">
                    <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${tx.status === "Selesai" ? "bg-emerald-500" : "bg-amber-500"}`} />
                    <div className="flex-1">
                      <p className="text-xs text-gray-700">Beli {formatNumber(tx.co2Amount)} tCO₂e di {proj ? proj.title : "Proyek"}</p>
                      <p className="text-[10px] text-gray-400">{new Date(tx.createdAt).toLocaleDateString('id-ID')}</p>
                    </div>
                    <p className="text-xs font-display font-semibold text-gray-800 whitespace-nowrap">
                      {formatRupiah(tx.totalAmount)}
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500">Belum ada transaksi</p>
            )}
          </div>
          <button className="flex items-center gap-1 text-sm text-emerald-600 font-medium mt-4 hover:text-emerald-700">
            Lihat Semua Transaksi <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Claims & Certificates */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-display font-semibold text-gray-800 mb-4">
            Klaim & Sertifikat
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Total Diklaim</span>
              <div className="flex items-baseline gap-1">
                <span className="font-display font-bold text-xl text-emerald-900">
                  {formatNumber(totalCo2Claimed)}
                </span>
                <span className="text-xs text-gray-400">tCO₂e</span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Total Sertifikat</span>
              <div className="flex items-baseline gap-1">
                <span className="font-display font-bold text-xl text-emerald-900">
                  {formatNumber(totalCertificates)}
                </span>
              </div>
            </div>
          </div>
          <button className="flex items-center gap-1 text-sm text-emerald-600 font-medium mt-4 hover:text-emerald-700">
            Lihat Semua Sertifikat <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ESG Report */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-display font-semibold text-gray-800 mb-4">
            Laporan ESG
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Unduh laporan ESG dan pantau dampak lingkungan perusahaan Anda.
          </p>
          <button 
            onClick={handleDownloadESG}
            className="w-full py-2.5 bg-emerald-700 text-white font-display font-semibold rounded-lg hover:bg-emerald-600 transition-colors text-sm flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Unduh Laporan ESG
          </button>
        </div>
      </div>
    </div>
  );
}
