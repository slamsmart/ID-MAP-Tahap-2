"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import {
  MapPin,
  Calendar,
  Loader2,
  AlertTriangle,
  Pencil,
  X,
  Search,
  ShieldCheck,
  Upload,
  ImageIcon,
} from "lucide-react";
import { getSession, User } from "@/lib/auth";

type ProjectStatus = "Draft" | "Dalam Proses" | "Terverifikasi";

interface Project {
  _id: Id<"projects">;
  title: string;
  location: string;
  province: string;
  image: string;
  status: ProjectStatus;
  co2Absorption: number;
  area?: number;
  seedsPlanted?: number;
  mitraId?: Id<"users">;
  progress?: number;
  serviceType?: string;
  description?: string;
  fundingTarget?: number;
  fundingRaised?: number;
  createdAt: number;
}

const statusBadgeClass: Record<ProjectStatus, string> = {
  "Terverifikasi": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Dalam Proses": "bg-amber-50 text-amber-700 border-amber-200",
  "Draft": "bg-gray-100 text-gray-600 border-gray-200",
};

export default function VerifikatorProyekAuditPage() {
  const [session, setSession] = useState<User | null>(null);
  useEffect(() => {
    setSession(getSession());
  }, []);

  const projects = useQuery(api.projects.list, {});
  const updateProject = useMutation(api.projects.update);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ProjectStatus>("all");
  const [editing, setEditing] = useState<Project | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [form, setForm] = useState<Partial<Project>>({});

  const isVerifikator = session?.role === "verifikator";

  const filtered = (projects ?? []).filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openEdit = (p: Project) => {
    setEditing(p);
    setForm({
      title: p.title,
      location: p.location,
      province: p.province,
      description: p.description ?? "",
      serviceType: p.serviceType ?? "",
      status: p.status,
      co2Absorption: p.co2Absorption,
      progress: p.progress ?? 0,
      image: p.image,
    });
    setConfirmed(false);
    setUploadError("");
  };

  const closeEdit = () => {
    if (saving || uploading) return;
    setEditing(null);
    setForm({});
    setConfirmed(false);
    setUploadError("");
  };

  const handleImageUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Ukuran maksimal 5 MB.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setUploadError("File harus berupa gambar.");
      return;
    }
    setUploadError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/cloudinary-upload", { method: "POST", body: fd });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Upload gagal");
      }
      setForm((f) => ({ ...f, image: data.url }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload gagal");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!editing || !isVerifikator || !confirmed) return;
    setSaving(true);
    try {
      await updateProject({
        projectId: editing._id,
        title: form.title,
        location: form.location,
        province: form.province,
        description: form.description,
        serviceType: form.serviceType,
        status: form.status as ProjectStatus | undefined,
        co2Absorption: form.co2Absorption,
        progress: form.progress,
        image: form.image,
      });
      closeEdit();
    } catch (err) {
      console.error("Gagal update proyek:", err);
      alert("Gagal menyimpan perubahan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString("id-ID", { month: "short", year: "numeric" });
  const formatNumber = (n: number) => n.toLocaleString("id-ID");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Audit Proyek</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Daftar seluruh proyek mitra. Verifikator hanya boleh mengubah informasi atas konfirmasi pemilik proyek.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-amber-900">
            Perubahan oleh Verifikator hanya untuk kondisi mendesak
          </p>
          <p className="text-amber-700 mt-1">
            Pastikan sudah berkoordinasi dan mendapat konfirmasi dari pemilik mitra
            proyek sebelum menyimpan perubahan. Centang konfirmasi di modal edit
            sebagai bukti persetujuan.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul atau lokasi proyek..."
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | ProjectStatus)}
          className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">Semua Status</option>
          <option value="Terverifikasi">Terverifikasi</option>
          <option value="Dalam Proses">Dalam Proses</option>
          <option value="Draft">Draft</option>
        </select>
      </div>

      {projects === undefined && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
      )}

      {projects !== undefined && filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <p className="text-sm text-gray-500">Tidak ada proyek yang cocok dengan filter.</p>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="grid gap-4">
          {filtered.map((p) => (
            <div key={p._id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-44 lg:w-52 h-36 md:h-auto md:flex-shrink-0 bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-gray-900">{p.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusBadgeClass[p.status]}`}>
                          {p.status}
                        </span>
                        {p.serviceType && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            {p.serviceType}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {p.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(p.createdAt)}
                        </span>
                        {p.area !== undefined && <span>Luas: {p.area} Ha</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => openEdit(p as Project)}
                      disabled={!isVerifikator}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-900 hover:bg-emerald-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition whitespace-nowrap"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit Informasi
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500">Bibit Ditanam</p>
                      <p className="font-semibold text-gray-900">
                        {p.seedsPlanted !== undefined ? formatNumber(p.seedsPlanted) : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Serapan CO₂e</p>
                      <p className="font-semibold text-gray-900">{formatNumber(p.co2Absorption)} t</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Progress</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${p.progress ?? 0}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{p.progress ?? 0}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div
          className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeEdit}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900">Edit Informasi Proyek</h3>
                <p className="text-xs text-gray-500 mt-0.5">{editing.title}</p>
              </div>
              <button
                onClick={closeEdit}
                disabled={saving || uploading}
                className="p-1.5 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                aria-label="Tutup"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  Perubahan ini akan tersimpan permanen. Pastikan sudah dikonfirmasi
                  pemilik mitra proyek.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                  Gambar Proyek
                </label>
                <div className="flex items-start gap-3">
                  <div className="relative w-32 h-24 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                    {form.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={form.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <label
                      className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border cursor-pointer transition ${
                        uploading
                          ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {uploading ? "Mengunggah..." : "Ganti Gambar"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploading}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleImageUpload(f);
                          e.target.value = "";
                        }}
                      />
                    </label>
                    <p className="text-[11px] text-gray-400 mt-1.5 leading-snug">
                      Format JPG/PNG/WebP, maks. 5 MB. Pilih foto landscape (rasio 3:2 / 16:9) agar tampil rapi pada kartu proyek.
                    </p>
                    {uploadError && (
                      <p className="text-[11px] text-red-600 mt-1">{uploadError}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Judul Proyek
                </label>
                <input
                  type="text"
                  value={form.title ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Lokasi
                  </label>
                  <input
                    type="text"
                    value={form.location ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Provinsi
                  </label>
                  <input
                    type="text"
                    value={form.province ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Jenis Layanan
                </label>
                <input
                  type="text"
                  value={form.serviceType ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, serviceType: e.target.value }))}
                  placeholder="contoh: Rehabilitasi Mangrove"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Deskripsi
                </label>
                <textarea
                  value={form.description ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Status
                  </label>
                  <select
                    value={form.status ?? "Draft"}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, status: e.target.value as ProjectStatus }))
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Dalam Proses">Dalam Proses</option>
                    <option value="Terverifikasi">Terverifikasi</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Serapan CO₂ (t)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.co2Absorption ?? 0}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, co2Absorption: Number(e.target.value) }))
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Progress (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form.progress ?? 0}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        progress: Math.max(0, Math.min(100, Number(e.target.value))),
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <label className="flex items-start gap-2 cursor-pointer pt-2 border-t border-gray-100">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs text-gray-700">
                  Saya menyatakan perubahan ini sudah <strong>dikoordinasikan dan
                  dikonfirmasi</strong> oleh pemilik mitra proyek.
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={closeEdit}
                disabled={saving || uploading}
                className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={!confirmed || saving || uploading || !isVerifikator}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-900 hover:bg-emerald-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
