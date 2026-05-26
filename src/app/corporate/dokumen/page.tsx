"use client";

import { FileText, Download, Award, Eye, Shield } from "lucide-react";

const documents = [
  { id: "DOC-001", title: "Sertifikat Carbon Offset Q1 2024", type: "Sertifikat", project: "Reboisasi Mangrove Banyuwangi", credits: "10.000 tCO₂e", date: "31 Mar 2024", verified: true },
  { id: "DOC-002", title: "Sertifikat Carbon Offset Q2 2024", type: "Sertifikat", project: "Konservasi Mangrove Kalimantan", credits: "10.000 tCO₂e", date: "30 Jun 2024", verified: true },
  { id: "DOC-003", title: "Laporan Verifikasi MRV", type: "Laporan", project: "Mangrove Pantai Utara", credits: "5.000 tCO₂e", date: "15 Mei 2024", verified: true },
  { id: "DOC-004", title: "Invoice Pembelian CC-038", type: "Invoice", project: "Blue Carbon Mangrove Sumba", credits: "8.000 tCO₂e", date: "1 Apr 2024", verified: false },
  { id: "DOC-005", title: "Registrasi SRN KLHK", type: "Regulasi", project: "All Projects", credits: "-", date: "15 Jan 2024", verified: true },
];

export default function DokumenPage() {
  return (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900">Dokumen & Sertifikat</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola semua dokumen dan sertifikat carbon credit perusahaan</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Sertifikat", value: "12", icon: Award, color: "text-yellow-600 bg-yellow-50" },
          { label: "Laporan MRV", value: "8", icon: FileText, color: "text-blue-600 bg-blue-50" },
          { label: "Invoice", value: "15", icon: FileText, color: "text-purple-600 bg-purple-50" },
          { label: "Dokumen SRN", value: "4", icon: Shield, color: "text-emerald-600 bg-emerald-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-2xl font-display font-bold text-gray-900 mt-1">{s.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}><s.icon className="w-5 h-5" /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-display font-semibold text-gray-900">Daftar Dokumen</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {documents.map((doc) => (
            <div key={doc.id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  doc.type === "Sertifikat" ? "bg-yellow-50" :
                  doc.type === "Laporan" ? "bg-blue-50" :
                  doc.type === "Invoice" ? "bg-purple-50" : "bg-emerald-50"
                }`}>
                  {doc.type === "Sertifikat" ? <Award className="w-5 h-5 text-yellow-600" /> :
                   doc.type === "Regulasi" ? <Shield className="w-5 h-5 text-emerald-600" /> :
                   <FileText className={`w-5 h-5 ${doc.type === "Laporan" ? "text-blue-600" : "text-purple-600"}`} />}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{doc.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{doc.project} · {doc.credits} · {doc.date}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      doc.type === "Sertifikat" ? "bg-yellow-100 text-yellow-700" :
                      doc.type === "Laporan" ? "bg-blue-100 text-blue-700" :
                      doc.type === "Invoice" ? "bg-purple-100 text-purple-700" : "bg-emerald-100 text-emerald-700"
                    }`}>{doc.type}</span>
                    {doc.verified && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-medium flex items-center gap-0.5"><Shield className="w-2.5 h-2.5" /> Terverifikasi</span>}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button aria-label={`Lihat dokumen ${doc.title}`} className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"><Eye className="w-4 h-4" /></button>
                <button aria-label={`Unduh dokumen ${doc.title}`} className="flex items-center gap-1 px-3 py-2 text-sm bg-emerald-900 text-white rounded-lg hover:bg-emerald-800"><Download className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
