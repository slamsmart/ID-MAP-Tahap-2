"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Sprout, MapPin, Calendar, ImageIcon, X, Check, Upload, Link as LinkIcon, Loader2 } from "lucide-react";
import { getSession, User } from "@/lib/auth";
import { useEscapeKey } from "@/lib/useEscapeKey";

interface Project {
  _id: Id<"projects">;
  title: string;
  location: string;
  province: string;
  image: string;
  status: "Draft" | "Dalam Proses" | "Terverifikasi";
  co2Absorption: number;
  area?: number;
  seedsPlanted?: number;
  mitraId?: Id<"users">;
  progress?: number;
  serviceType?: string;
  fundingTarget?: number;
  fundingRaised?: number;
  createdAt: number;
}

const defaultThumbnails = [
  "https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1573655349936-de6bed86f839?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1565118531796-763e5082d113?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1559827291-bac2de0b2c0b?w=600&q=80&auto=format&fit=crop",
];

const statusBadgeClass: Record<Project["status"], string> = {
  "Terverifikasi": "bg-emerald-50 text-emerald-700",
  "Dalam Proses": "bg-amber-50 text-amber-700",
  "Draft": "bg-gray-100 text-gray-600",
};

export default function MitraProyekPage() {
  const [session, setSession] = useState<User | null>(null);

  useEffect(() => {
    setSession(getSession());
  }, []);

  // Filter: only show projects owned by this mitra
  const mitraId = session?._id as Id<"users"> | undefined;
  const projects = useQuery(
    api.projects.listByMitra,
    mitraId ? { mitraId } : "skip"
  );
  const updateProject = useMutation(api.projects.update);

  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [customUrl, setCustomUrl] = useState("");
  const [tab, setTab] = useState<"preset" | "url" | "upload">("preset");
  const [saving, setSaving] = useState(false);

  // Esc closes the thumbnail-edit modal (matches outside-click + close button).
  useEscapeKey(!!editingProject && !saving, () => setEditingProject(null));

  // Authorization check: only mitra role can access this page
  const isMitra = session?.role === "mitra";

  const handleSaveThumbnail = async (newThumbnail: string) => {
    if (!editingProject || !newThumbnail) return;
    if (!isMitra) {
      alert("Hanya mitra proyek yang dapat mengubah thumbnail.");
      return;
    }
    // Verify ownership: ensure the project belongs to this mitra
    if (editingProject.mitraId !== mitraId) {
      alert("Anda hanya dapat mengubah thumbnail proyek milik Anda sendiri.");
      return;
    }
    setSaving(true);
    try {
      await updateProject({
        projectId: editingProject._id,
        image: newThumbnail,
      });
      setEditingProject(null);
      setCustomUrl("");
      setTab("preset");
    } catch (err) {
      console.error("Gagal update thumbnail:", err);
      alert("Gagal menyimpan thumbnail. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      handleSaveThumbnail(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString("id-ID", { month: "short", year: "numeric" });
  };

  const formatNumber = (n: number) => n.toLocaleString("id-ID");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Proyek Saya</h1>
          <p className="text-xs text-gray-500 mt-0.5">Sinkron dengan data proyek di landing page</p>
        </div>
        <Link href="/mitra/proyek-baru" className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-900 text-white text-sm font-semibold rounded-lg hover:bg-emerald-800 transition">
          <Sprout className="w-4 h-4" /> Tambah Proyek
        </Link>
      </div>

      {/* Loading state */}
      {projects === undefined && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {projects !== undefined && projects.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Sprout className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900">Belum ada proyek</h3>
          <p className="text-sm text-gray-500 mt-1">Tambahkan proyek mangrove pertama Anda.</p>
        </div>
      )}

      {/* Projects list */}
      {projects && projects.length > 0 && (
        <div className="grid gap-4">
          {projects.map((p) => (
            <div key={p._id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* Thumbnail */}
                <div className="relative md:w-48 lg:w-56 h-40 md:h-auto md:flex-shrink-0 bg-gray-100 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt={p.title} className="w-full h-full object-cover" />

                  {/* Always-visible edit icon button (top-right corner) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingProject(p as Project);
                    }}
                    className="absolute top-2 right-2 z-10 w-9 h-9 bg-white/95 hover:bg-white text-emerald-700 rounded-lg shadow-lg flex items-center justify-center transition-all hover:scale-110 border border-white/50"
                    aria-label="Edit thumbnail"
                    title="Edit thumbnail"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>

                  {/* Hover overlay (desktop only) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingProject(p as Project);
                    }}
                    className="hidden md:flex absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center text-white text-sm font-semibold gap-2"
                    aria-label="Edit thumbnail"
                  >
                    <ImageIcon className="w-4 h-4" />
                    Edit Thumbnail
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-gray-900">{p.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass[p.status]}`}>{p.status}</span>
                        {p.serviceType && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">{p.serviceType}</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.location}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(p.createdAt)}</span>
                        {p.area !== undefined && <span>Luas: {p.area} Ha</span>}
                      </div>
                    </div>
                    <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium whitespace-nowrap">Lihat Detail</button>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500">Bibit Ditanam</p>
                      <p className="font-semibold text-gray-900">{p.seedsPlanted !== undefined ? formatNumber(p.seedsPlanted) : "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Serapan CO₂e</p>
                      <p className="font-semibold text-gray-900">{formatNumber(p.co2Absorption)} t</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Progress</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${p.progress ?? 0}%` }} />
                        </div>
                        <span className="text-xs font-medium">{p.progress ?? 0}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Funding row (Pokmaswas campaign) */}
                  {typeof p.fundingTarget === "number" && p.fundingTarget > 0 && (() => {
                    const raised = p.fundingRaised ?? 0;
                    const target = p.fundingTarget;
                    const pct = Math.min(100, Math.round((raised / target) * 100));
                    const fmtRp = (n: number) =>
                      new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        maximumFractionDigits: 0,
                      }).format(n);
                    return (
                      <div className="mt-3 pt-3 border-t border-emerald-100 bg-emerald-50/50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3">
                        <div className="flex items-baseline justify-between mb-1">
                          <p className="text-xs font-medium text-emerald-700">Pendanaan</p>
                          <p className="text-xs font-semibold text-emerald-700">{pct}%</p>
                        </div>
                        <div className="h-1.5 bg-emerald-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-xs text-gray-600 mt-1.5">
                          <span className="font-semibold text-emerald-800">{fmtRp(raised)}</span>
                          <span className="text-gray-400"> dari {fmtRp(target)}</span>
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== EDIT THUMBNAIL MODAL ===== */}
      {editingProject && (
        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => !saving && setEditingProject(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900">Edit Thumbnail Proyek</h3>
                <p className="text-xs text-gray-500 mt-0.5">{editingProject.title}</p>
              </div>
              <button
                onClick={() => !saving && setEditingProject(null)}
                disabled={saving}
                className="p-1.5 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                aria-label="Tutup"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 px-5">
              <button onClick={() => setTab("preset")} className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${tab === "preset" ? "border-emerald-600 text-emerald-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                Pilih Preset
              </button>
              <button onClick={() => setTab("url")} className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${tab === "url" ? "border-emerald-600 text-emerald-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                <LinkIcon className="w-3.5 h-3.5" /> URL
              </button>
              <button onClick={() => setTab("upload")} className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${tab === "upload" ? "border-emerald-600 text-emerald-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                <Upload className="w-3.5 h-3.5" /> Upload
              </button>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto">
              {/* Saving overlay */}
              {saving && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                    <p className="text-sm text-gray-600">Menyimpan...</p>
                  </div>
                </div>
              )}

              {tab === "preset" && (
                <div>
                  <p className="text-sm text-gray-600 mb-4">Pilih thumbnail dari gallery mangrove yang tersedia:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {defaultThumbnails.map((url, i) => {
                      const isSelected = url === editingProject.image;
                      return (
                        <button
                          key={i}
                          onClick={() => handleSaveThumbnail(url)}
                          disabled={saving}
                          className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all ${isSelected ? "border-emerald-600 ring-2 ring-emerald-200" : "border-transparent hover:border-emerald-300"} disabled:opacity-50`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt={`Preset ${i + 1}`} className="w-full h-full object-cover" />
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {tab === "url" && (
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">URL Gambar</label>
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://example.com/gambar-mangrove.jpg"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <p className="text-xs text-gray-500 mt-2">Masukkan URL gambar yang dapat diakses publik (HTTPS).</p>

                  {customUrl && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Preview:</p>
                      <div className="aspect-video rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={customUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => handleSaveThumbnail(customUrl)}
                    disabled={!customUrl || saving}
                    className="mt-4 w-full px-4 py-2.5 bg-emerald-900 text-white text-sm font-semibold rounded-lg hover:bg-emerald-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                  >
                    Simpan Thumbnail
                  </button>
                </div>
              )}

              {tab === "upload" && (
                <div>
                  <label className="block">
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-emerald-400 hover:bg-emerald-50/30 transition-colors cursor-pointer">
                      <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-gray-700">Klik untuk upload gambar</p>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG, atau WebP (maks. 5MB)</p>
                    </div>
                    <input type="file" accept="image/*" onChange={handleFileUpload} disabled={saving} className="hidden" />
                  </label>
                  <p className="text-xs text-gray-400 mt-3">Gambar akan disimpan sebagai data URL di Convex database.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
