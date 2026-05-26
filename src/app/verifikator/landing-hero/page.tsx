"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ImageIcon,
  Loader2,
  Save,
  ShieldCheck,
  Upload,
} from "lucide-react";

type HeroForm = {
  image: string;
  badgeId: string;
  badgeEn: string;
  headlineLine1Id: string;
  headlineLine1En: string;
  headlineLine2Id: string;
  headlineLine2En: string;
  headlineAccentId: string;
  headlineAccentEn: string;
  subheadId: string;
  subheadEn: string;
  primaryCtaLabelId: string;
  primaryCtaLabelEn: string;
  primaryCtaHref: string;
  secondaryCtaLabelId: string;
  secondaryCtaLabelEn: string;
  secondaryCtaHref: string;
};

const defaults: HeroForm = {
  image: "/images/hero-mangrove.webp",
  badgeId: "Platform Integrasi Data Ekosistem Pesisir Berkelanjutan",
  badgeEn: "Integrated Coastal Ecosystem Data Platform for Sustainability",
  headlineLine1Id: "Satu Platform.",
  headlineLine1En: "One Platform.",
  headlineLine2Id: "Seluruh Ekosistem Mangrove & Pesisir",
  headlineLine2En: "The Entire Mangrove & Coastal Ecosystem",
  headlineAccentId: "Indonesia.",
  headlineAccentEn: "Indonesia.",
  subheadId:
    "Data terintegrasi untuk pemantauan restorasi lingkungan, rehabilitasi, dan keberlanjutan pesisir nusantara.",
  subheadEn:
    "Integrated data for environmental restoration monitoring, rehabilitation, and coastal sustainability of the archipelago.",
  primaryCtaLabelId: "Mulai Berkontribusi",
  primaryCtaLabelEn: "Start Contributing",
  primaryCtaHref: "/daftar",
  secondaryCtaLabelId: "Jelajahi Peta Restorasi Lingkungan",
  secondaryCtaLabelEn: "Explore Environmental Restoration Map",
  secondaryCtaHref: "/jelajahi-peta-mangrove",
};

export default function VerifikatorLandingHeroPage() {
  const data = useQuery(api.landingHero.get);
  const updateHero = useMutation(api.landingHero.update);

  const [form, setForm] = useState<HeroForm>(defaults);
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (data && !hydrated) {
      setForm({
        image: data.image,
        badgeId: data.badgeId,
        badgeEn: data.badgeEn,
        headlineLine1Id: data.headlineLine1Id,
        headlineLine1En: data.headlineLine1En,
        headlineLine2Id: data.headlineLine2Id,
        headlineLine2En: data.headlineLine2En,
        headlineAccentId: data.headlineAccentId,
        headlineAccentEn: data.headlineAccentEn,
        subheadId: data.subheadId,
        subheadEn: data.subheadEn,
        primaryCtaLabelId: data.primaryCtaLabelId,
        primaryCtaLabelEn: data.primaryCtaLabelEn,
        primaryCtaHref: data.primaryCtaHref,
        secondaryCtaLabelId: data.secondaryCtaLabelId,
        secondaryCtaLabelEn: data.secondaryCtaLabelEn,
        secondaryCtaHref: data.secondaryCtaHref,
      });
      setHydrated(true);
    } else if (data === null && !hydrated) {
      setHydrated(true);
    }
  }, [data, hydrated]);

  function field<K extends keyof HeroForm>(key: K, value: HeroForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleImageUpload(file: File) {
    if (file.size > 8 * 1024 * 1024) {
      setUploadError("Ukuran maksimal 8 MB.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setUploadError("File harus berupa gambar.");
      return;
    }
    setUploadError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/cloudinary-upload", { method: "POST", body: fd });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error ?? "Upload gagal");
      field("image", json.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload gagal");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await updateHero(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-bold text-xl text-gray-900">Kelola Hero Beranda</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Edit gambar latar, badge, headline, sub-headline, dan tombol CTA pada hero halaman beranda. Perubahan tampil real-time lewat Convex.
        </p>
      </div>

      <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700">
        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>Gambar diunggah ke Cloudinary, copy disimpan di Convex. Begitu klik <strong>Simpan Perubahan</strong>, hero homepage langsung ter-update untuk semua pengunjung tanpa redeploy.</span>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-5">
        {/* Form */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-5">
          {/* Image */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Gambar Hero
            </label>
            <div className="flex items-start gap-3">
              <div className="relative w-40 h-28 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                {form.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
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
                      : "bg-white border-emerald-100 text-emerald-700 hover:bg-emerald-50"
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
                <input
                  type="text"
                  value={form.image}
                  onChange={(e) => field("image", e.target.value)}
                  placeholder="https://res.cloudinary.com/..."
                  className="w-full mt-2 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-gray-400 mt-1.5 leading-snug">
                  Format JPG/PNG/WebP, maks. 8 MB. Pilih foto landscape resolusi tinggi (≥1920px) untuk tampilan crisp di layar lebar.
                </p>
                {uploadError && <p className="text-[11px] text-red-600 mt-1">{uploadError}</p>}
              </div>
            </div>
          </div>

          {/* Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Badge (Indonesia)
              </label>
              <input
                type="text"
                value={form.badgeId}
                onChange={(e) => field("badgeId", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Badge (English)
              </label>
              <input
                type="text"
                value={form.badgeEn}
                onChange={(e) => field("badgeEn", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Headline 3 baris */}
          <div className="space-y-3 border-t border-gray-100 pt-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Headline (3 baris)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={form.headlineLine1Id}
                onChange={(e) => field("headlineLine1Id", e.target.value)}
                placeholder="Baris 1 ID"
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <input
                type="text"
                value={form.headlineLine1En}
                onChange={(e) => field("headlineLine1En", e.target.value)}
                placeholder="Line 1 EN"
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <input
                type="text"
                value={form.headlineLine2Id}
                onChange={(e) => field("headlineLine2Id", e.target.value)}
                placeholder="Baris 2 ID"
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <input
                type="text"
                value={form.headlineLine2En}
                onChange={(e) => field("headlineLine2En", e.target.value)}
                placeholder="Line 2 EN"
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <input
                type="text"
                value={form.headlineAccentId}
                onChange={(e) => field("headlineAccentId", e.target.value)}
                placeholder="Accent ID (warna emerald)"
                className="px-3 py-2 text-sm border border-emerald-100 bg-emerald-50/40 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <input
                type="text"
                value={form.headlineAccentEn}
                onChange={(e) => field("headlineAccentEn", e.target.value)}
                placeholder="Accent EN"
                className="px-3 py-2 text-sm border border-emerald-100 bg-emerald-50/40 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Subhead */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-gray-100 pt-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Subhead (Indonesia)
              </label>
              <textarea
                rows={3}
                value={form.subheadId}
                onChange={(e) => field("subheadId", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Subhead (English)
              </label>
              <textarea
                rows={3}
                value={form.subheadEn}
                onChange={(e) => field("subheadEn", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
              />
            </div>
          </div>

          {/* CTA Primer */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tombol Utama</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={form.primaryCtaLabelId}
                onChange={(e) => field("primaryCtaLabelId", e.target.value)}
                placeholder="Label ID"
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <input
                type="text"
                value={form.primaryCtaLabelEn}
                onChange={(e) => field("primaryCtaLabelEn", e.target.value)}
                placeholder="Label EN"
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <input
                type="text"
                value={form.primaryCtaHref}
                onChange={(e) => field("primaryCtaHref", e.target.value)}
                placeholder="/daftar"
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* CTA Sekunder */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tombol Sekunder</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={form.secondaryCtaLabelId}
                onChange={(e) => field("secondaryCtaLabelId", e.target.value)}
                placeholder="Label ID"
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <input
                type="text"
                value={form.secondaryCtaLabelEn}
                onChange={(e) => field("secondaryCtaLabelEn", e.target.value)}
                placeholder="Label EN"
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <input
                type="text"
                value={form.secondaryCtaHref}
                onChange={(e) => field("secondaryCtaHref", e.target.value)}
                placeholder="/jelajahi-peta-mangrove"
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                <Check className="w-4 h-4" /> Tersimpan
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving || uploading || !hydrated}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Simpan Perubahan
            </button>
          </div>
        </div>

        {/* Live Preview */}
        <div
          className="rounded-xl shadow-sm h-fit sticky top-4 overflow-hidden bg-cover bg-center"
          style={{
            backgroundImage: form.image
              ? `linear-gradient(90deg, rgba(16, 64, 48, 0.85) 0%, rgba(16, 64, 48, 0.65) 60%, rgba(16, 64, 48, 0.4) 100%), url('${form.image}')`
              : undefined,
            backgroundColor: "#0f3d2e",
          }}
        >
          <div className="p-5 min-h-[420px] flex flex-col">
            <div className="text-xs font-semibold text-emerald-300/80 uppercase tracking-wider mb-3">
              Preview
            </div>
            <div className="inline-flex self-start items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-white/90 backdrop-blur-md text-[11px] font-medium mb-4">
              <ShieldCheck className="h-3 w-3" /> {form.badgeId || "—"}
            </div>
            <h2 className="text-xl font-extrabold leading-[1.15] tracking-tight text-white drop-shadow">
              {form.headlineLine1Id || "—"}
              <br />
              {form.headlineLine2Id || "—"}
              <br />
              <span className="text-[#6ee7b7]">{form.headlineAccentId || "—"}</span>
            </h2>
            <p className="mt-3 text-xs text-white/80 leading-relaxed">{form.subheadId || "—"}</p>
            <div className="mt-4 flex flex-wrap gap-2 mt-auto pt-4">
              <span className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-[11px] font-bold text-[#0f3d2e]">
                {form.primaryCtaLabelId || "—"}
                <ArrowRight className="h-3 w-3" />
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg border border-white/40 px-3 py-2 text-[11px] font-bold text-white">
                {form.secondaryCtaLabelId || "—"}
                <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
