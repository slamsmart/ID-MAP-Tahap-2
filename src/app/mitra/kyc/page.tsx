"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { getSession } from "@/lib/auth";
import {
  ShieldCheck,
  Upload,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Plus,
  Trash2,
  Info,
} from "lucide-react";

type DocType = "KTP" | "NIB" | "NPWP" | "Akta" | "SIUP" | "Lainnya";

const docTypeLabels: Record<DocType, string> = {
  KTP: "KTP (Kartu Tanda Penduduk)",
  NIB: "NIB (Nomor Induk Berusaha)",
  NPWP: "NPWP (Nomor Pokok Wajib Pajak)",
  Akta: "Akta Pendirian Perusahaan",
  SIUP: "SIUP (Surat Izin Usaha Perdagangan)",
  Lainnya: "Dokumen Lainnya",
};

const statusConfig = {
  Menunggu: {
    icon: Clock,
    label: "Menunggu Review",
    bg: "bg-yellow-50 border-yellow-200",
    text: "text-yellow-700",
    badge: "bg-yellow-100 text-yellow-700",
  },
  Disetujui: {
    icon: CheckCircle,
    label: "Disetujui",
    bg: "bg-emerald-50 border-emerald-100",
    text: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-700",
  },
  Ditolak: {
    icon: XCircle,
    label: "Ditolak",
    bg: "bg-red-50 border-red-100",
    text: "text-red-700",
    badge: "bg-red-100 text-red-700",
  },
};

export default function MitraKYCPage() {
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState<DocType>("KTP");
  const [documentName, setDocumentName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const session = getSession();
    if (session?._id) {
      setUserId(session._id as Id<"users">);
    }
  }, []);

  const kycDocs = useQuery(api.kyc.listByUser, userId ? { userId } : "skip");
  const kycStatus = useQuery(
    api.kyc.getUserKycStatus,
    userId ? { userId } : "skip"
  );
  const submitDocument = useMutation(api.kyc.submitDocument);
  const deleteDocument = useMutation(api.kyc.deleteDocument);

  const handleSubmit = async () => {
    if (!userId || !documentName.trim()) return;

    setIsSubmitting(true);
    try {
      await submitDocument({
        actorId: userId,
        userId,
        type: selectedType,
        documentName: documentName.trim(),
      });
      setDocumentName("");
      setShowForm(false);
      setSuccessMsg("Dokumen berhasil disubmit! Admin akan mereview dalam 1-2 hari kerja.");
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err) {
      console.error("Submit error:", err);
      alert("Gagal mengirim dokumen. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (docId: Id<"kycDocuments">) => {
    if (!confirm("Yakin ingin menghapus dokumen ini?")) return;
    if (!userId) return;
    try {
      await deleteDocument({ actorId: userId, documentId: docId });
    } catch (err) {
      console.error("Delete error:", err);
      alert("Gagal menghapus dokumen.");
    }
  };

  // Determine which required docs are missing
  const submittedTypes = new Set((kycDocs ?? []).map((d) => d.type));
  const requiredDocs: DocType[] = ["KTP", "NIB"];
  const missingRequired = requiredDocs.filter((t) => !submittedTypes.has(t));

  const overallStatus = kycStatus?.status ?? "belum";

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Verifikasi KYC
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload dokumen legalitas untuk verifikasi akun mitra Anda
        </p>
      </div>

      {/* Success Message */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          {successMsg}
        </div>
      )}

      {/* KYC Status Banner */}
      <div
        className={`rounded-xl border p-5 ${
          overallStatus === "terverifikasi"
            ? "bg-emerald-50 border-emerald-100"
            : overallStatus === "menunggu"
            ? "bg-yellow-50 border-yellow-200"
            : overallStatus === "ditolak"
            ? "bg-red-50 border-red-100"
            : "bg-gray-50 border-gray-200"
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
              overallStatus === "terverifikasi"
                ? "bg-emerald-100"
                : overallStatus === "menunggu"
                ? "bg-yellow-100"
                : overallStatus === "ditolak"
                ? "bg-red-100"
                : "bg-gray-100"
            }`}
          >
            {overallStatus === "terverifikasi" ? (
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            ) : overallStatus === "menunggu" ? (
              <Clock className="w-6 h-6 text-yellow-600" />
            ) : overallStatus === "ditolak" ? (
              <XCircle className="w-6 h-6 text-red-600" />
            ) : (
              <AlertCircle className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <h3
              className={`font-semibold ${
                overallStatus === "terverifikasi"
                  ? "text-emerald-800"
                  : overallStatus === "menunggu"
                  ? "text-yellow-800"
                  : overallStatus === "ditolak"
                  ? "text-red-800"
                  : "text-gray-700"
              }`}
            >
              {overallStatus === "terverifikasi"
                ? "Akun Terverifikasi ✓"
                : overallStatus === "menunggu"
                ? "Verifikasi Dalam Proses"
                : overallStatus === "ditolak"
                ? "Verifikasi Ditolak"
                : "Belum Melakukan Verifikasi"}
            </h3>
            <p className="text-sm mt-1 opacity-80">
              {overallStatus === "terverifikasi"
                ? "Dokumen Anda telah diverifikasi. Anda dapat membuat dan mengelola proyek mangrove."
                : overallStatus === "menunggu"
                ? "Dokumen Anda sedang direview oleh tim kami. Proses biasanya memakan 1-2 hari kerja."
                : overallStatus === "ditolak"
                ? "Beberapa dokumen ditolak. Silakan perbaiki dan upload ulang dokumen yang ditolak."
                : "Silakan upload dokumen KTP dan NIB (minimum) untuk memulai verifikasi akun Anda."}
            </p>
            {kycStatus && kycStatus.totalDocuments > 0 && (
              <div className="flex gap-4 mt-3 text-xs font-medium">
                <span className="text-emerald-600">
                  {kycStatus.approved} Disetujui
                </span>
                <span className="text-yellow-600">
                  {kycStatus.pending} Menunggu
                </span>
                <span className="text-red-600">
                  {kycStatus.rejected} Ditolak
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Required Documents Info */}
      {missingRequired.length > 0 && overallStatus !== "terverifikasi" && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Dokumen wajib yang belum diupload:</p>
            <ul className="mt-1 space-y-0.5">
              {missingRequired.map((type) => (
                <li key={type}>• {docTypeLabels[type]}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Documents List */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Dokumen Saya</h3>
          {overallStatus !== "terverifikasi" && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-900 text-white text-sm font-medium rounded-lg hover:bg-emerald-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Tambah Dokumen
            </button>
          )}
        </div>

        {/* Upload Form */}
        {showForm && (
          <div className="p-4 sm:p-5 bg-gray-50 border-b border-gray-100">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  Tipe Dokumen
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as DocType)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {(Object.entries(docTypeLabels) as [DocType, string][]).map(
                    ([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    )
                  )}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  Nama File / Keterangan
                </label>
                <input
                  type="text"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="Contoh: KTP_Ahmad_Fauzi.pdf"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="relative border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-emerald-300 transition-colors cursor-pointer group">
                <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setDocumentName(file.name);
                    }
                  }}
                />
                <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2 group-hover:text-emerald-500 transition-colors" />
                <p className="text-sm text-gray-500">
                  Klik untuk upload file atau drag & drop
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PDF, JPG, PNG (maks. 5MB)
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowForm(false);
                    setDocumentName("");
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !documentName.trim()}
                  className="flex-1 px-4 py-2.5 bg-emerald-900 text-white text-sm font-medium rounded-lg hover:bg-emerald-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Submit Dokumen
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Documents Table */}
        <div className="divide-y divide-gray-50">
          {kycDocs === undefined ? (
            <div className="p-8 text-center text-gray-400">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Memuat dokumen...
            </div>
          ) : kycDocs.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Belum ada dokumen yang diupload</p>
              <p className="text-xs text-gray-400 mt-1">
                Klik &quot;Tambah Dokumen&quot; untuk mulai verifikasi
              </p>
            </div>
          ) : (
            kycDocs.map((doc) => {
              const config = statusConfig[doc.status];
              const StatusIcon = config.icon;
              return (
                <div
                  key={doc._id}
                  className={`p-4 sm:p-5 flex items-start gap-4 ${
                    doc.status === "Ditolak" ? "bg-red-50/30" : ""
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      doc.status === "Disetujui"
                        ? "bg-emerald-100"
                        : doc.status === "Ditolak"
                        ? "bg-red-100"
                        : "bg-yellow-100"
                    }`}
                  >
                    <FileText
                      className={`w-5 h-5 ${
                        doc.status === "Disetujui"
                          ? "text-emerald-600"
                          : doc.status === "Ditolak"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {doc.type}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.badge}`}>
                        <StatusIcon className="w-3 h-3" />
                        {config.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5 truncate">
                      {doc.documentName}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Disubmit:{" "}
                      {new Date(doc.submittedAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    {doc.reviewNote && (
                      <div className="mt-2 p-2.5 bg-white rounded-lg border border-gray-100">
                        <p className="text-xs text-gray-500 font-medium mb-0.5">
                          Catatan Admin:
                        </p>
                        <p className="text-sm text-gray-700">{doc.reviewNote}</p>
                      </div>
                    )}
                  </div>
                  {doc.status === "Menunggu" && (
                    <button
                      onClick={() => handleDelete(doc._id)}
                      className="p-2 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                      title="Hapus dokumen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 sm:p-5">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">
          💡 Tips Verifikasi
        </h4>
        <ul className="space-y-1.5 text-xs text-gray-500">
          <li>• Pastikan dokumen yang diupload jelas dan tidak buram</li>
          <li>• KTP dan NIB adalah dokumen wajib minimum untuk verifikasi</li>
          <li>• Dokumen tambahan (NPWP, Akta, SIUP) akan mempercepat proses</li>
          <li>• Proses verifikasi biasanya memakan 1-2 hari kerja</li>
          <li>
            • Jika dokumen ditolak, perbaiki sesuai catatan admin dan upload
            ulang
          </li>
        </ul>
      </div>
    </div>
  );
}
