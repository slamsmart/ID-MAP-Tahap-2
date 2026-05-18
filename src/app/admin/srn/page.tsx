"use client";

import { Globe, CheckCircle, Clock, FileText, Shield, AlertTriangle } from "lucide-react";

const srnEntries = [
  { srnId: "SRN-2024-MG-001", project: "Reboisasi Mangrove Banyuwangi", type: "Mangrove Restoration", credits: "100.000 tCO₂e", registrationDate: "15 Jan 2024", status: "Terdaftar", klhkApproval: "Disetujui" },
  { srnId: "SRN-2024-MG-002", project: "Konservasi Mangrove Kalimantan", type: "Mangrove Conservation", credits: "350.000 tCO₂e", registrationDate: "22 Feb 2024", status: "Proses Review", klhkApproval: "Menunggu" },
  { srnId: "SRN-2024-MG-003", project: "Mangrove Pantai Utara", type: "Mangrove Restoration", credits: "80.000 tCO₂e", registrationDate: "10 Mar 2024", status: "Terdaftar", klhkApproval: "Disetujui" },
  { srnId: "SRN-2024-BC-001", project: "Blue Carbon Mangrove Sumba", type: "Blue Carbon", credits: "120.000 tCO₂e", registrationDate: "5 Apr 2024", status: "Terdaftar", klhkApproval: "Disetujui" },
  { srnId: "SRN-2024-MG-004", project: "Mangrove Delta Mahakam", type: "Mangrove Conservation", credits: "210.000 tCO₂e", registrationDate: "28 Apr 2024", status: "Pengajuan", klhkApproval: "Belum Diajukan" },
];

export default function SRNRegistryPage() {
  return (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900">SRN Registry</h1>
        <p className="text-sm text-gray-500 mt-1">Sistem Registri Nasional sesuai pedoman KLHK (PP No. 98/2021 & Permen LHK No. 21/2022)</p>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-emerald-700 mt-0.5" />
          <div>
            <h3 className="font-semibold text-emerald-900 text-sm">Pedoman KLHK - Sistem Registri Nasional (SRN)</h3>
            <p className="text-xs text-emerald-700 mt-1">
              SRN mengacu pada Peraturan Presiden No. 98 Tahun 2021 tentang Penyelenggaraan Nilai Ekonomi Karbon
              dan Peraturan Menteri LHK No. 21 Tahun 2022 tentang Tata Laksana Penerapan Nilai Ekonomi Karbon.
              Setiap proyek karbon wajib terdaftar di SRN sebelum dapat menerbitkan Sertifikat Pengurangan Emisi (SPE).
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Terdaftar SRN", value: "98", sub: "Proyek", icon: Globe, color: "text-emerald-600 bg-emerald-50" },
          { label: "Disetujui KLHK", value: "72", sub: "Proyek", icon: CheckCircle, color: "text-blue-600 bg-blue-50" },
          { label: "Menunggu Approval", value: "18", sub: "Proyek", icon: Clock, color: "text-yellow-600 bg-yellow-50" },
          { label: "SPE Diterbitkan", value: "856.000", sub: "tCO₂e", icon: FileText, color: "text-purple-600 bg-purple-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-2xl font-display font-bold text-gray-900 mt-1">{s.value}</p>
                <p className="text-xs text-gray-400">{s.sub}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 mb-6">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-display font-semibold text-gray-900">Alur Registrasi SRN (Pedoman KLHK)</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between gap-2">
            {[
              { step: "1", title: "Pengajuan", desc: "Pengembang proyek mengajukan ke SRN" },
              { step: "2", title: "Validasi Dokumen", desc: "KLHK memvalidasi kelengkapan dokumen" },
              { step: "3", title: "Verifikasi MRV", desc: "Lembaga MRV melakukan verifikasi lapangan" },
              { step: "4", title: "Approval KLHK", desc: "Dirjen PPI KLHK memberikan persetujuan" },
              { step: "5", title: "Penerbitan SPE", desc: "Sertifikat Pengurangan Emisi diterbitkan" },
            ].map((s, i) => (
              <div key={s.step} className="flex items-center gap-2 flex-1">
                <div className="text-center flex-1">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto font-bold text-sm">{s.step}</div>
                  <p className="text-xs font-semibold text-gray-800 mt-2">{s.title}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{s.desc}</p>
                </div>
                {i < 4 && <div className="w-8 h-px bg-emerald-300 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-display font-semibold text-gray-900">Daftar Registrasi SRN</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">SRN ID</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Proyek</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tipe</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Credits</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status SRN</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Approval KLHK</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {srnEntries.map((e) => (
              <tr key={e.srnId} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-mono text-emerald-600">{e.srnId}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{e.project}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{e.type}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-700">{e.credits}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{e.registrationDate}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    e.status === "Terdaftar" ? "bg-emerald-100 text-emerald-700" :
                    e.status === "Proses Review" ? "bg-blue-100 text-blue-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>{e.status}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
                    e.klhkApproval === "Disetujui" ? "bg-emerald-100 text-emerald-700" :
                    e.klhkApproval === "Menunggu" ? "bg-yellow-100 text-yellow-700" :
                    "bg-gray-100 text-gray-500"
                  }`}>
                    {e.klhkApproval === "Disetujui" && <CheckCircle className="w-3 h-3" />}
                    {e.klhkApproval === "Menunggu" && <Clock className="w-3 h-3" />}
                    {e.klhkApproval === "Belum Diajukan" && <AlertTriangle className="w-3 h-3" />}
                    {e.klhkApproval}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
