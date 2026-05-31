"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Upload, FileText, CheckCircle, Clock, XCircle, AlertCircle, Trash2, Plus } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { getSession } from "@/lib/auth";
import { Id } from "../../../../convex/_generated/dataModel";

const kycStatusConfig = {
  terverifikasi: {
    icon: ShieldCheck,
    title: "Identitas Terverifikasi ✓",
    desc: "KTP Anda telah diverifikasi oleh tim ID-MAP.",
    card: "bg-emerald-50 border-emerald-100",
    icon_bg: "bg-emerald-100",
    icon_color: "text-emerald-600",
    title_color: "text-emerald-800",
  },
  menunggu: {
    icon: Clock,
    title: "Verifikasi Sedang Diproses",
    desc: "Dokumen Anda sedang direview. Biasanya 1–2 hari kerja.",
    card: "bg-yellow-50 border-yellow-200",
    icon_bg: "bg-yellow-100",
    icon_color: "text-yellow-600",
    title_color: "text-yellow-800",
  },
  ditolak: {
    icon: XCircle,
    title: "Verifikasi Ditolak",
    desc: "Dokumen ditolak. Silakan upload ulang KTP yang valid.",
    card: "bg-red-50 border-red-100",
    icon_bg: "bg-red-100",
    icon_color: "text-red-600",
    title_color: "text-red-800",
  },
  belum: {
    icon: AlertCircle,
    title: "Belum Terverifikasi",
    desc: "Upload KTP untuk memverifikasi identitas Anda.",
    card: "bg-gray-50 border-gray-200",
    icon_bg: "bg-gray-100",
    icon_color: "text-gray-400",
    title_color: "text-gray-700",
  },
};

const docStatusBadge = {
  Menunggu: { icon: Clock, label: "Menunggu", cls: "bg-yellow-100 text-yellow-700" },
  Disetujui: { icon: CheckCircle, label: "Disetujui", cls: "bg-emerald-100 text-emerald-700" },
  Ditolak: { icon: XCircle, label: "Ditolak", cls: "bg-red-100 text-red-700" },
};

export default function LengkapiKycPage() {
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const [showKtpForm, setShowKtpForm] = useState(false);
  const [docName, setDocName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const s = getSession();
    if (s) setUserId(s._id as Id<"users">);
  }, []);

  const kycDocs = useQuery(api.kyc.listByUser, userId ? { userId } : "skip");
  const kycStatus = useQuery(api.kyc.getUserKycStatus, userId ? { userId } : "skip");
  const submitDocument = useMutation(api.kyc.submitDocument);
  const deleteDocument = useMutation(api.kyc.deleteDocument);

  const overallStatus = kycStatus?.status ?? "belum";
  const cfg = kycStatusConfig[overallStatus];
  const StatusIcon = cfg.icon;

  const ktpDocs = (kycDocs ?? []).filter((d) => d.type === "KTP");
  const hasActiveKtp = ktpDocs.some((d) => d.status === "Menunggu" || d.status === "Disetujui");

  const handleKtpSubmit = async () => {
    if (!userId || !docName.trim()) return;
    setIsSubmitting(true);
    try {
      await submitDocument({ actorId: userId, userId, type: "KTP", documentName: docName.trim() });
      setDocName("");
      setShowKtpForm(false);
      setSuccessMsg("KTP berhasil dikirim! Admin akan mereview dalam 1–2 hari kerja.");
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err) {
      console.error(err);
      alert("Gagal mengirim dokumen. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (docId: Id<"kycDocuments">) => {
    if (!confirm("Hapus dokumen ini?")) return;
    if (!userId) return;
    try {
      await deleteDocument({ actorId: userId, documentId: docId });
    } catch {
      alert("Gagal menghapus dokumen.");
    }
  };

  return (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900">Verifikasi KYC</h1>
        <p className="text-sm text-gray-500 mt-1">Upload KTP untuk memverifikasi identitas Anda</p>
      </div>

      <div className="max-w-xl">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          {/* Header with status badge */}
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cfg.icon_bg}`}>
              <StatusIcon className={`w-5 h-5 ${cfg.icon_color}`} />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-semibold text-gray-900">Status KYC</h3>
              <p className="text-xs text-gray-500">Verifikasi identitas dengan KTP</p>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.card} ${cfg.title_color}`}>
              {overallStatus === "terverifikasi" ? "Terverifikasi" :
               overallStatus === "menunggu" ? "Menunggu" :
               overallStatus === "ditolak" ? "Ditolak" : "Belum diverifikasi"}
            </span>
          </div>

          {/* Success toast */}
          {successMsg && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-lg text-sm mb-4">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              {successMsg}
            </div>
          )}

          {/* Status banner */}
          <div className={`rounded-xl border p-4 mb-5 flex items-start gap-3 ${cfg.card}`}>
            <StatusIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${cfg.icon_color}`} />
            <div>
              <p className={`text-sm font-semibold ${cfg.title_color}`}>{cfg.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{cfg.desc}</p>
            </div>
          </div>

          {/* Existing KTP docs */}
          {ktpDocs.length > 0 && (
            <div className="space-y-3 mb-4">
              {ktpDocs.map((doc) => {
                const s = docStatusBadge[doc.status];
                const SIcon = s.icon;
                return (
                  <div key={doc._id} className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      doc.status === "Disetujui" ? "bg-emerald-100" :
                      doc.status === "Ditolak" ? "bg-red-100" : "bg-yellow-100"
                    }`}>
                      <FileText className={`w-4 h-4 ${
                        doc.status === "Disetujui" ? "text-emerald-600" :
                        doc.status === "Ditolak" ? "text-red-600" : "text-yellow-600"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-800">KTP</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>
                          <SIcon className="w-3 h-3" />{s.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{doc.documentName}</p>
                      {doc.reviewNote && (
                        <p className="text-xs text-red-600 mt-1 bg-red-50 px-2 py-1 rounded">
                          Catatan: {doc.reviewNote}
                        </p>
                      )}
                    </div>
                    {doc.status === "Menunggu" && (
                      <button
                        onClick={() => handleDelete(doc._id)}
                        aria-label={`Hapus dokumen ${doc.documentName}`}
                        className="p-1.5 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Upload button */}
          {!hasActiveKtp && !showKtpForm && overallStatus !== "terverifikasi" && (
            <button
              onClick={() => setShowKtpForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-900 text-white text-sm font-medium rounded-lg hover:bg-emerald-800 transition"
            >
              <Plus className="w-4 h-4" /> Upload KTP
            </button>
          )}

          {/* Upload form */}
          {showKtpForm && (
            <div className="border border-gray-200 rounded-xl p-4 space-y-4 bg-gray-50">
              <p className="text-sm font-semibold text-gray-800">Upload KTP</p>

              <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-5 text-center hover:border-emerald-400 transition-colors cursor-pointer group">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setDocName(file.name);
                  }}
                />
                <Upload className="w-7 h-7 text-gray-300 group-hover:text-emerald-500 transition mx-auto mb-2" />
                {docName ? (
                  <p className="text-sm text-emerald-700 font-medium">{docName}</p>
                ) : (
                  <>
                    <p className="text-sm text-gray-500">Klik untuk pilih file KTP</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, atau PDF · maks. 5 MB</p>
                  </>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Nama File / Keterangan</label>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="KTP_NamaLengkap.jpg"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowKtpForm(false); setDocName(""); }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleKtpSubmit}
                  disabled={isSubmitting || !docName.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-900 text-white text-sm font-medium rounded-lg hover:bg-emerald-800 transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Mengirim...</>
                  ) : (
                    <><Upload className="w-4 h-4" /> Kirim KTP</>
                  )}
                </button>
              </div>
            </div>
          )}

          <p className="text-xs text-gray-400 mt-4">
            Dokumen KTP digunakan hanya untuk verifikasi identitas dan tidak dibagikan ke pihak ketiga.
          </p>
        </div>
      </div>
    </div>
  );
}
