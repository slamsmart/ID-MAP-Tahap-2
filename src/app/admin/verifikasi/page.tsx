"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { getSession } from "@/lib/auth";
import {
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  FileCheck,
  ShieldCheck,
  FileText,
  X,
  AlertTriangle,
} from "lucide-react";
import { useState } from "react";

type TabFilter = "semua" | "Menunggu" | "Disetujui" | "Ditolak";

export default function VerifikasiPage() {
  const kycStats = useQuery(api.kyc.getStats);
  const allDocs = useQuery(api.kyc.listAll);
  const reviewDocument = useMutation(api.kyc.reviewDocument);

  const [activeTab, setActiveTab] = useState<TabFilter>("Menunggu");
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoading = kycStats === undefined || allDocs === undefined;

  const filteredDocs = (allDocs ?? []).filter(
    (item) => activeTab === "semua" || item.doc.status === activeTab
  );

  const handleReview = async (
    docId: Id<"kycDocuments">,
    status: "Disetujui" | "Ditolak"
  ) => {
    const session = getSession();
    if (!session?._id) {
      alert("Sesi admin tidak ditemukan. Silakan login ulang.");
      return;
    }

    setIsSubmitting(true);
    try {
      await reviewDocument({
        actorId: session._id as Id<"users">,
        documentId: docId,
        status,
        reviewNote: reviewNote || undefined,
      });
      setSelectedDoc(null);
      setReviewNote("");
    } catch (err) {
      console.error("Review error:", err);
      alert("Gagal memproses review. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const statsCards = [
    {
      label: "Total Pengajuan",
      value: kycStats?.totalSubmissions ?? 0,
      icon: FileCheck,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Menunggu Review",
      value: kycStats?.pending ?? 0,
      icon: Clock,
      color: "text-yellow-600 bg-yellow-50",
    },
    {
      label: "Disetujui",
      value: kycStats?.approved ?? 0,
      icon: CheckCircle,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Ditolak",
      value: kycStats?.rejected ?? 0,
      icon: XCircle,
      color: "text-red-600 bg-red-50",
    },
  ];

  const tabs: { key: TabFilter; label: string; count?: number }[] = [
    { key: "Menunggu", label: "Menunggu Review", count: kycStats?.pending },
    { key: "Disetujui", label: "Disetujui", count: kycStats?.approved },
    { key: "Ditolak", label: "Ditolak", count: kycStats?.rejected },
    { key: "semua", label: "Semua" },
  ];

  const statusBadge = (status: string) => {
    switch (status) {
      case "Menunggu":
        return "bg-yellow-100 text-yellow-700";
      case "Disetujui":
        return "bg-emerald-100 text-emerald-700";
      case "Ditolak":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">
          Verifikasi KYC & Dokumen
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Review dan verifikasi dokumen legalitas mitra & perusahaan
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsCards.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-2xl font-display font-bold text-gray-900 mt-1">
                  {s.value}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                  activeTab === tab.key
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Document List */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Memuat data verifikasi...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Pengguna
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Tipe Dokumen
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Nama File
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Tanggal Submit
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredDocs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">
                      Tidak ada dokumen yang cocok
                    </td>
                  </tr>
                ) : (
                  filteredDocs.map((item) => (
                    <tr key={item.doc._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {item.userName}
                          </p>
                          <p className="text-xs text-gray-400">{item.userEmail}</p>
                          {item.userOrganization && (
                            <p className="text-xs text-gray-400">
                              {item.userOrganization}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                            item.userRole === "mitra"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {item.userRole}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">
                            {item.doc.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 max-w-[200px] truncate">
                        {item.doc.documentName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(item.doc.submittedAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge(item.doc.status)}`}
                        >
                          {item.doc.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {item.doc.status === "Menunggu" ? (
                          <button
                            onClick={() => setSelectedDoc(item.doc._id)}
                            className="flex items-center gap-1 text-emerald-600 text-sm font-medium hover:text-emerald-700 transition-colors"
                          >
                            <Eye className="w-4 h-4" /> Review
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">
                            {item.doc.reviewNote ?? "—"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedDoc && (() => {
        const item = (allDocs ?? []).find((d) => d.doc._id === selectedDoc);
        if (!item) return null;

        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-gray-900">
                      Review Dokumen KYC
                    </h3>
                    <p className="text-xs text-gray-500">
                      Verifikasi dokumen legalitas
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedDoc(null);
                    setReviewNote("");
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Pengguna</p>
                    <p className="text-sm font-medium text-gray-900">
                      {item.userName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Role</p>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        item.userRole === "mitra"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {item.userRole}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Organisasi</p>
                    <p className="text-sm text-gray-700">
                      {item.userOrganization ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="text-sm text-gray-700">{item.userEmail}</p>
                  </div>
                </div>

                <hr className="border-gray-100" />

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <p className="text-sm font-semibold text-gray-700">
                      {item.doc.type}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600">
                    {item.doc.documentName}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Disubmit:{" "}
                    {new Date(item.doc.submittedAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>

                {/* Review Note */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">
                    Catatan Review (opsional)
                  </label>
                  <textarea
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    placeholder="Tambahkan catatan jika diperlukan..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Warning */}
                <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-700">
                    Pastikan dokumen telah diperiksa dengan teliti. Status KYC pengguna
                    akan otomatis diperbarui setelah review.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 p-5 border-t border-gray-100">
                <button
                  onClick={() => handleReview(item.doc._id as Id<"kycDocuments">, "Ditolak")}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-red-100 text-red-700 text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Tolak
                </button>
                <button
                  onClick={() => handleReview(item.doc._id as Id<"kycDocuments">, "Disetujui")}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Setujui
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
