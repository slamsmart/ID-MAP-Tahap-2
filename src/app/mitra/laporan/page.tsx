"use client";

import { useState } from "react";
import { FileText, Download, Plus, Upload, X } from "lucide-react";

const initialReports = [
  { id: 1, name: "Laporan Monitoring Q1 2026", type: "MRV", date: "15 Mar 2026", status: "Final" },
  { id: 2, name: "Laporan Tahunan 2025", type: "Annual", date: "31 Jan 2026", status: "Final" },
  { id: 3, name: "Progress Report Q4 2025", type: "Progress", date: "15 Dec 2025", status: "Final" },
  { id: 4, name: "Baseline Study - Delta Mahakam", type: "Baseline", date: "01 Sep 2025", status: "Final" },
  { id: 5, name: "Laporan Monitoring Q2 2026 (Draft)", type: "MRV", date: "Draft", status: "Draft" },
];

export default function MitraLaporanPage() {
  const [reports, setReports] = useState(initialReports);
  const [showForm, setShowForm] = useState(false);
  const [reportName, setReportName] = useState("");
  const [reportType, setReportType] = useState("MRV");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!reportName.trim()) return;
    setIsSubmitting(true);
    
    // Simulate upload delay
    setTimeout(() => {
      const newReport = {
        id: Date.now(),
        name: reportName,
        type: reportType,
        date: new Date().toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }),
        status: "Menunggu Review"
      };
      
      setReports([newReport, ...reports]);
      setReportName("");
      setShowForm(false);
      setIsSubmitting(false);
      alert("Laporan berhasil diupload!");
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Laporan</h1>
        {!showForm && (
          <div className="flex gap-3">
            <a 
              href="/docs/Template_Laporan_MRV_IDMAP.txt" 
              download
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-emerald-100 text-emerald-700 text-sm font-semibold rounded-lg hover:bg-emerald-50 transition"
            >
              <Download className="w-4 h-4" /> Template MRV
            </a>
            <button 
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-900 text-white text-sm font-semibold rounded-lg hover:bg-emerald-800 transition"
            >
              <Plus className="w-4 h-4" /> Buat Laporan
            </button>
          </div>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-sm relative">
          <button 
            onClick={() => setShowForm(false)} 
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="font-semibold text-gray-900 mb-4">Upload Laporan Baru</h3>
          
          <div className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Jenis Laporan</label>
                <select 
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="MRV">Laporan MRV</option>
                  <option value="Annual">Laporan Tahunan</option>
                  <option value="Progress">Progress Report</option>
                  <option value="Baseline">Baseline Study</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Judul Laporan</label>
                <input 
                  type="text" 
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="Contoh: Laporan Monitoring Q3"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="relative border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-emerald-300 transition-colors group cursor-pointer">
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && !reportName) {
                    setReportName(file.name.replace(/\.[^/.]+$/, ""));
                  }
                }}
              />
              <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2 group-hover:text-emerald-500 transition-colors" />
              <p className="text-sm text-gray-500">Klik untuk pilih file atau drag & drop</p>
              <p className="text-xs text-gray-400 mt-1">PDF, DOCX (Maks. 10MB)</p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting || !reportName}
                className="px-4 py-2 bg-emerald-900 text-white text-sm font-medium rounded-lg hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? "Mengupload..." : "Submit Laporan"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 sm:px-5 py-3 text-xs font-medium text-gray-500 uppercase">Nama Laporan</th>
                <th className="text-left px-4 sm:px-5 py-3 text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Jenis</th>
                <th className="text-left px-4 sm:px-5 py-3 text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Tanggal</th>
                <th className="text-left px-4 sm:px-5 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 sm:px-5 py-3 text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 sm:px-5 py-3 font-medium text-gray-900">{r.name}</td>
                  <td className="px-4 sm:px-5 py-3 text-gray-500 hidden sm:table-cell">{r.type}</td>
                  <td className="px-4 sm:px-5 py-3 text-gray-500 hidden sm:table-cell">{r.date}</td>
                  <td className="px-4 sm:px-5 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      r.status === "Final" ? "bg-emerald-50 text-emerald-700" : 
                      r.status === "Menunggu Review" ? "bg-yellow-50 text-yellow-700" : 
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 sm:px-5 py-3">
                    <button className="inline-flex items-center gap-1 text-sm text-emerald-600 font-medium hover:text-emerald-700">
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
