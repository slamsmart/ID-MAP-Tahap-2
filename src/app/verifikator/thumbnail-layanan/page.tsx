"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import {
  Pencil, Save, X, Upload, Link as LinkIcon, Loader2,
  AlertTriangle, Check, ImageIcon, MapPin, Tag, FileText,
} from "lucide-react";

type Project = {
  _id: Id<"projects">;
  title: string;
  location: string;
  province: string;
  image: string;
  status: string;
  co2Absorption: number;
  serviceType?: string;
  description?: string;
  progress?: number;
};

type EditForm = {
  title: string;
  location: string;
  province: string;
  description: string;
  serviceType: string;
  image: string;
};

const SERVICE_COLORS: Record<string, string> = {
  "Rehabilitasi Mangrove": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Penyulaman Mangrove": "bg-green-50 text-green-700 border-green-200",
  "Jasa Pemantauan Monev Mangrove": "bg-blue-50 text-blue-700 border-blue-200",
  "Decarbonisasi Aquaculture": "bg-cyan-50 text-cyan-700 border-cyan-200",
  "Perbaikan Habitat Penyu": "bg-teal-50 text-teal-700 border-teal-200",
  "Pemberdayaan Masyarakat Pesisir": "bg-purple-50 text-purple-700 border-purple-200",
};

const STATUS_COLORS: Record<string, string> = {
  "Terverifikasi": "bg-emerald-100 text-emerald-700",
  "Dalam Proses": "bg-amber-100 text-amber-700",
  "Draft": "bg-gray-100 text-gray-600",
};

export default function ThumbnailLayananPage() {
  const projects = useQuery(api.projects.list);
  const updateProject = useMutation(api.projects.update);

  const [editId, setEditId] = useState<Id<"projects"> | null>(null);
  const [form, setForm] = useState<EditForm>({ title: "", location: "", province: "", description: "", serviceType: "", image: "" });
  const [imgTab, setImgTab] = useState<"upload" | "url">("upload");
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<Id<"projects"> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function startEdit(p: Project) {
    setEditId(p._id);
    setForm({
      title: p.title,
      location: p.location,
      province: p.province,
      description: p.description ?? "",
      serviceType: p.serviceType ?? "",
      image: p.image,
    });
    setUrlInput(p.image);
    setImgTab("upload");
    setError(null);
  }

  function cancelEdit() {
    setEditId(null);
    setError(null);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/cloudinary-upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload gagal");
      setForm((f) => ({ ...f, image: data.url }));
      setUrlInput(data.url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload gagal");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!editId) return;
    setSaving(true);
    setError(null);
    try {
      await updateProject({
        projectId: editId,
        title: form.title || undefined,
        location: form.location || undefined,
        province: form.province || undefined,
        description: form.description || undefined,
        serviceType: form.serviceType || undefined,
        image: form.image || undefined,
      });
      setSavedId(editId);
      setTimeout(() => setSavedId(null), 2500);
      setEditId(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="font-bold text-xl text-gray-900">Kelola Konten Layanan ID-MAP</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Edit thumbnail, judul, lokasi, dan deskripsi setiap layanan. Perubahan langsung update live.
        </p>
      </div>

      {/* Info */}
      <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700">
        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>Perubahan tersimpan ke Convex dan langsung tampil di halaman publik, peta, dan dashboard.</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left text-xs text-gray-400 font-semibold px-4 py-3 w-52">Thumbnail</th>
                <th className="text-left text-xs text-gray-400 font-semibold px-3 py-3">Judul & Layanan</th>
                <th className="text-left text-xs text-gray-400 font-semibold px-3 py-3 hidden md:table-cell">Lokasi</th>
                <th className="text-left text-xs text-gray-400 font-semibold px-3 py-3 hidden lg:table-cell">Deskripsi</th>
                <th className="text-left text-xs text-gray-400 font-semibold px-3 py-3 w-14">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {projects === undefined
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-50 animate-pulse">
                      <td className="px-4 py-3"><div className="h-16 w-28 bg-gray-200 rounded-lg" /></td>
                      <td className="px-3 py-3"><div className="space-y-2"><div className="h-3 bg-gray-200 rounded w-32" /><div className="h-3 bg-gray-200 rounded w-20" /></div></td>
                      <td className="px-3 py-3 hidden md:table-cell"><div className="h-3 bg-gray-200 rounded w-24" /></td>
                      <td className="px-3 py-3 hidden lg:table-cell"><div className="h-3 bg-gray-200 rounded w-40" /></td>
                      <td className="px-3 py-3" />
                    </tr>
                  ))
                : projects.map((p) => {
                    const colorClass = p.serviceType ? (SERVICE_COLORS[p.serviceType] ?? "bg-gray-50 text-gray-600 border-gray-200") : "";
                    const isEditing = editId === p._id;
                    const justSaved = savedId === p._id;

                    if (isEditing) {
                      return (
                        <tr key={p._id} className="border-b border-emerald-50 bg-emerald-50/30">
                          <td colSpan={5} className="px-4 py-4">
                            <div className="space-y-4">
                              {/* Image editor */}
                              <div className="flex gap-4 flex-col sm:flex-row">
                                {/* Preview */}
                                <div className="relative w-36 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={form.image} alt="preview" className="w-full h-full object-cover" />
                                  {uploading && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                                    </div>
                                  )}
                                </div>
                                {/* Image tabs */}
                                <div className="flex-1 space-y-2">
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => setImgTab("upload")}
                                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${imgTab === "upload" ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300"}`}
                                    >
                                      <Upload className="w-3 h-3" /> Upload
                                    </button>
                                    <button
                                      onClick={() => setImgTab("url")}
                                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${imgTab === "url" ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300"}`}
                                    >
                                      <LinkIcon className="w-3 h-3" /> URL
                                    </button>
                                  </div>
                                  {imgTab === "upload" ? (
                                    <div>
                                      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                                      <button
                                        onClick={() => fileRef.current?.click()}
                                        disabled={uploading}
                                        className="w-full border border-dashed border-gray-300 hover:border-emerald-400 rounded-lg py-3 text-xs text-gray-500 hover:text-emerald-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                      >
                                        {uploading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Mengupload...</> : <><ImageIcon className="w-3.5 h-3.5" /> Pilih foto (Cloudinary)</>}
                                      </button>
                                    </div>
                                  ) : (
                                    <input
                                      type="url"
                                      value={urlInput}
                                      onChange={(e) => { setUrlInput(e.target.value); setForm((f) => ({ ...f, image: e.target.value })); }}
                                      placeholder="https://..."
                                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400"
                                    />
                                  )}
                                </div>
                              </div>

                              {/* Text fields */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                <div>
                                  <label className="flex items-center gap-1 text-xs font-semibold text-gray-600 mb-1"><Tag className="w-3 h-3" /> Judul Proyek</label>
                                  <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400" />
                                </div>
                                <div>
                                  <label className="flex items-center gap-1 text-xs font-semibold text-gray-600 mb-1"><MapPin className="w-3 h-3" /> Lokasi</label>
                                  <input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="Kota, Provinsi" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400" />
                                </div>
                                <div>
                                  <label className="flex items-center gap-1 text-xs font-semibold text-gray-600 mb-1"><MapPin className="w-3 h-3" /> Provinsi</label>
                                  <input value={form.province} onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400" />
                                </div>
                                <div>
                                  <label className="flex items-center gap-1 text-xs font-semibold text-gray-600 mb-1"><Tag className="w-3 h-3" /> Jenis Layanan</label>
                                  <select value={form.serviceType} onChange={(e) => setForm((f) => ({ ...f, serviceType: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400">
                                    <option value="">— Pilih Layanan —</option>
                                    {Object.keys(SERVICE_COLORS).map((s) => <option key={s} value={s}>{s}</option>)}
                                  </select>
                                </div>
                                <div className="sm:col-span-2 lg:col-span-2">
                                  <label className="flex items-center gap-1 text-xs font-semibold text-gray-600 mb-1"><FileText className="w-3 h-3" /> Deskripsi</label>
                                  <textarea
                                    value={form.description}
                                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400 resize-none"
                                  />
                                </div>
                              </div>

                              {error && <p className="text-xs text-red-600 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> {error}</p>}

                              <div className="flex gap-2">
                                <button onClick={handleSave} disabled={saving || uploading} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition-colors">
                                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Simpan & Update Live
                                </button>
                                <button onClick={cancelEdit} className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition-colors">
                                  <X className="w-3.5 h-3.5" /> Batal
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        {/* Thumbnail */}
                        <td className="px-4 py-3">
                          <div className="relative w-28 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                            {justSaved && (
                              <div className="absolute inset-0 bg-emerald-600/80 flex items-center justify-center">
                                <Check className="w-5 h-5 text-white" />
                              </div>
                            )}
                          </div>
                        </td>
                        {/* Title + service */}
                        <td className="px-3 py-3">
                          <p className="font-medium text-gray-900 text-sm leading-snug">{p.title}</p>
                          {p.serviceType && (
                            <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${colorClass}`}>
                              {p.serviceType}
                            </span>
                          )}
                          <span className={`inline-block mt-1 ml-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status] ?? "bg-gray-100 text-gray-600"}`}>
                            {p.status}
                          </span>
                        </td>
                        {/* Location */}
                        <td className="px-3 py-3 hidden md:table-cell">
                          <div className="flex items-start gap-1 text-xs text-gray-500">
                            <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <span>{p.location}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">{p.province}</p>
                        </td>
                        {/* Description */}
                        <td className="px-3 py-3 hidden lg:table-cell">
                          <p className="text-xs text-gray-500 line-clamp-2 max-w-xs">{p.description ?? "—"}</p>
                        </td>
                        {/* Actions */}
                        <td className="px-3 py-3">
                          <button
                            onClick={() => startEdit(p as Project)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-50 text-xs text-gray-400">
          {projects ? `${projects.length} layanan terdaftar` : "Memuat..."}
        </div>
      </div>
    </div>
  );
}
