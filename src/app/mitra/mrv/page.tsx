"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Clock, AlertCircle, Upload, Loader2, FileText, Plus, Sprout } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { getSession, User } from "@/lib/auth";
import { Id } from "../../../../convex/_generated/dataModel";
import Link from "next/link";

export default function MitraMRVPage() {
  const [session, setSession] = useState<User | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  useEffect(() => {
    setSession(getSession());
  }, []);

  const mitraId = session?._id as Id<"users"> | undefined;

  const projects = useQuery(api.projects.listByMitra, mitraId ? { mitraId } : "skip");
  const updateReportStatus = useMutation(api.mrvReports.updateStatus);
  
  // Ambil proyek pertama sebagai contoh (di dunia nyata ini mungkin ada dropdown untuk memilih proyek)
  const selectedProject = projects?.[0];
  const mrvReports = useQuery(api.mrvReports.listByProject, selectedProject ? { projectId: selectedProject._id } : "skip");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, reportId: Id<"mrvReports">) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadingId(reportId);
      
      // Simulasi proses upload file (2 detik)
      setTimeout(async () => {
        try {
          await updateReportStatus({ reportId, status: "Selesai" });
          alert(`File ${e.target.files![0].name} berhasil diunggah! Laporan MRV diperbarui.`);
        } catch (error) {
          alert("Terjadi kesalahan saat menyimpan status.");
        } finally {
          setUploadingId(null);
        }
      }, 2000);
    }
  };

  const statusIcons = {
    "Selesai": <CheckCircle className="w-5 h-5 text-emerald-600" />,
    "Dalam Proses": <Clock className="w-5 h-5 text-amber-600" />,
    "Menunggu": <AlertCircle className="w-5 h-5 text-gray-400" />
  };

  const statusBg = {
    "Selesai": "bg-emerald-50 border-emerald-100",
    "Dalam Proses": "bg-amber-50 border-amber-100",
    "Menunggu": "bg-gray-50 border-gray-100"
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900">MRV &amp; Verifikasi</h1>
      
      {!selectedProject ? (
        <div className="bg-white rounded-card border border-gray-100 p-8 text-center">
          <Sprout className="w-10 h-10 text-emerald-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-700">Belum ada proyek terdaftar</p>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            Tambahkan proyek mangrove dulu agar Anda bisa menjadwalkan dan mengelola laporan MRV-nya di sini.
          </p>
          <Link
            href="/mitra/proyek"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-button transition-colors"
          >
            <Plus className="w-4 h-4" /> Tambah Proyek
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Alur MRV - {selectedProject.title}</h3>
            <div className="space-y-4">
              {mrvReports === undefined ? (
                <div className="text-center py-4 text-gray-500 animate-pulse">Memuat data MRV...</div>
              ) : mrvReports.length === 0 ? (
                <div className="text-center py-6">
                  <Clock className="w-8 h-8 text-amber-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-700 font-medium">Belum ada jadwal laporan MRV</p>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                    Hubungi tim verifikator untuk membuatkan jadwal MRV agar proyek ini siap dikejar serapan karbonnya.
                  </p>
                  <a
                    href="mailto:id.map.admin@gmail.com?subject=Permohonan%20Jadwal%20MRV"
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold rounded-button border border-amber-200 transition-colors"
                  >
                    Hubungi Verifikator
                  </a>
                </div>
              ) : (
                mrvReports.map((report, i) => (
                  <div key={report._id} className={`flex gap-4 p-4 rounded-lg border ${statusBg[report.status as keyof typeof statusBg]}`}>
                    <div className="flex-shrink-0 mt-0.5">
                      {statusIcons[report.status as keyof typeof statusIcons]}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <h4 className="font-medium text-gray-900">Tahap {i + 1}: {report.type}</h4>
                        <span className="text-xs font-semibold px-2 py-1 bg-white rounded-full text-gray-600">{report.period}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Status saat ini: {report.status}</p>
                      
                      {report.status === "Dalam Proses" && (
                        <div className="mt-4">
                          <input 
                            type="file" 
                            id={`upload-${report._id}`} 
                            className="hidden" 
                            onChange={(e) => handleFileUpload(e, report._id)} 
                            disabled={uploadingId === report._id}
                          />
                          <button 
                            onClick={() => document.getElementById(`upload-${report._id}`)?.click()} 
                            disabled={uploadingId === report._id}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {uploadingId === report._id ? (
                              <><Loader2 className="w-4 h-4 animate-spin" /> Mengunggah...</>
                            ) : (
                              <><Upload className="w-4 h-4" /> Upload Laporan MRV</>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Arsip Dokumen MRV Tersimpan</h3>
            <div className="space-y-2">
              {mrvReports?.filter(r => r.status === "Selesai").length === 0 ? (
                <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-card text-center">
                  <FileText className="w-6 h-6 text-gray-300 mx-auto mb-1.5" />
                  <p className="font-medium text-gray-600">Belum ada dokumen final</p>
                  <p className="text-xs mt-0.5">Dokumen tersimpan otomatis saat status laporan menjadi <strong>Selesai</strong>.</p>
                </div>
              ) : (
                mrvReports?.filter(r => r.status === "Selesai").map((doc) => (
                  <div key={doc._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm text-gray-700 font-medium">Laporan {doc.type} - {doc.period}.pdf</span>
                    </div>
                    <button className="text-xs text-emerald-600 font-medium hover:text-emerald-800">Download</button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
