"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  AlertTriangle,
  Check,
  Leaf,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
} from "lucide-react";

type FooterForm = {
  brandName: string;
  descriptionId: string;
  descriptionEn: string;
  email: string;
  phone: string;
  address: string;
};

const defaults: FooterForm = {
  brandName: "ID-MAP",
  descriptionId:
    "Pre-Market Carbon Infrastructure Platform. Menghubungkan aksi iklim dengan teknologi dan transparansi.",
  descriptionEn:
    "Pre-Market Carbon Infrastructure Platform. Connecting climate action with technology and transparency.",
  email: "info@id-map.co.id",
  phone: "+62 21 1234 5678",
  address: "Jakarta, Indonesia",
};

export default function VerifikatorFooterPage() {
  const data = useQuery(api.footerContent.get);
  const updateFooter = useMutation(api.footerContent.update);

  const [form, setForm] = useState<FooterForm>(defaults);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (data && !hydrated) {
      setForm({
        brandName: data.brandName,
        descriptionId: data.descriptionId,
        descriptionEn: data.descriptionEn,
        email: data.email,
        phone: data.phone,
        address: data.address,
      });
      setHydrated(true);
    } else if (data === null && !hydrated) {
      setHydrated(true);
    }
  }, [data, hydrated]);

  function field<K extends keyof FooterForm>(key: K, value: FooterForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await updateFooter(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-bold text-xl text-gray-900">Kelola Footer Brand</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Edit konten brand di footer halaman publik: nama brand, deskripsi, dan info kontak. Perubahan tampil real-time lewat Convex.
        </p>
      </div>

      <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700">
        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>Perubahan tersimpan ke Convex dan langsung tampil di section brand pada footer seluruh halaman publik.</span>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5">
        {/* Form */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Nama Brand
            </label>
            <input
              type="text"
              value={form.brandName}
              onChange={(e) => field("brandName", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="ID-MAP"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Deskripsi (Indonesia)
            </label>
            <textarea
              rows={3}
              value={form.descriptionId}
              onChange={(e) => field("descriptionId", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Description (English)
            </label>
            <textarea
              rows={3}
              value={form.descriptionEn}
              onChange={(e) => field("descriptionEn", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Email Kontak
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => field("email", e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Telepon
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => field("phone", e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Alamat
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={form.address}
                onChange={(e) => field("address", e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                <Check className="w-4 h-4" />
                Tersimpan
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !hydrated}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Simpan Perubahan
            </button>
          </div>
        </div>

        {/* Live Preview */}
        <div className="bg-[#0a1c15] rounded-xl p-5 shadow-sm h-fit sticky top-4">
          <div className="text-xs font-semibold text-emerald-300/70 uppercase tracking-wider mb-3">
            Preview
          </div>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-emerald-800 rounded-full flex items-center justify-center">
              <Leaf className="w-5 h-5 text-emerald-300" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-white">
              {form.brandName || "—"}
            </span>
          </div>
          <p className="text-sm text-gray-400 mb-5 leading-relaxed">
            {form.descriptionId || "—"}
          </p>
          <div className="space-y-3 text-sm text-emerald-100 font-medium">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="truncate">{form.email || "—"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="truncate">{form.phone || "—"}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="truncate">{form.address || "—"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
