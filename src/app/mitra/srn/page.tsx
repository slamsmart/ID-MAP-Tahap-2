"use client";

import { Globe, CheckCircle, Clock, FileText } from "lucide-react";

const srnSteps = [
  { step: "Registrasi Akun SRN", status: "complete" },
  { step: "Pengisian Data Proyek (PDD)", status: "complete" },
  { step: "Validasi Dokumen KLHK", status: "active" },
  { step: "Verifikasi Lapangan", status: "pending" },
  { step: "Penerbitan Sertifikat Karbon", status: "pending" },
];

export default function MitraSRNPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Registrasi SRN</h1>
      <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Globe className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Sistem Registri Nasional (SRN)</h3>
            <p className="text-xs text-gray-500">Mengacu PP 98/2021 &amp; Permen LHK 21/2022</p>
          </div>
        </div>
        <div className="space-y-3">
          {srnSteps.map((s, i) => (
            <div key={s.step} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                s.status === "complete" ? "bg-emerald-100 text-emerald-700" : s.status === "active" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-400"
              }`}>
                {s.status === "complete" ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${s.status === "pending" ? "text-gray-400" : "text-gray-900"}`}>{s.step}</p>
              </div>
              {s.status === "active" && <Clock className="w-4 h-4 text-amber-500" />}
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Dokumen SRN</h3>
        <div className="space-y-2">
          {[
            { name: "Project Design Document (PDD)", status: "Submitted" },
            { name: "Izin Lingkungan", status: "Submitted" },
            { name: "Baseline Study", status: "Dalam Proses" },
          ].map((doc) => (
            <div key={doc.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700">{doc.name}</span>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded ${doc.status === "Submitted" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{doc.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
