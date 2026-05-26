"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Loader2,
  Pencil,
  Save,
  Upload,
  X,
} from "lucide-react";

type CardForm = {
  key: string;
  titleId: string;
  titleEn: string;
  bullet1Id: string;
  bullet1En: string;
  bullet2Id: string;
  bullet2En: string;
  bullet3Id: string;
  bullet3En: string;
  ctaId: string;
  ctaEn: string;
  href: string;
  image: string;
  order: number;
};

type RolesForm = {
  headlineId: string;
  headlineEn: string;
  subtitleId: string;
  subtitleEn: string;
  cards: CardForm[];
};

const defaults: RolesForm = {
  headlineId: "Tiga Peran, Satu Ekosistem",
  headlineEn: "Three Roles, One Ecosystem",
  subtitleId:
    "ID-MAP menghubungkan tiga pihak untuk menciptakan dampak lingkungan dan nilai ekonomi.",
  subtitleEn:
    "ID-MAP connects three parties to create environmental impact and economic value.",
  cards: [
    {
      key: "sahabat",
      titleId: "Sahabat Pesisir",
      titleEn: "Sahabat Pesisir",
      bullet1Id: "Kontribusi mudah via QRIS",
      bullet1En: "Easy contribution via QRIS",
      bullet2Id: "Pantau dampak real-time",
      bullet2En: "Monitor impact in real-time",
      bullet3Id: "Transparan dan terpercaya",
      bullet3En: "Transparent and trusted",
      ctaId: "Dukung Sekarang",
      ctaEn: "Support Now",
      href: "/daftar?peran=sahabat",
      image:
        "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=700&q=80",
      order: 1,
    },
    {
      key: "mitra",
      titleId: "Mitra Proyek",
      titleEn: "Project Partners",
      bullet1Id: "Pendanaan proyek",
      bullet1En: "Project funding",
      bullet2Id: "Pendampingan teknis",
      bullet2En: "Technical assistance",
      bullet3Id: "MRV & Registrasi SRN",
      bullet3En: "MRV & SRN Registration",
      ctaId: "Daftar sebagai Mitra",
      ctaEn: "Register as Partner",
      href: "/daftar?peran=mitra",
      image:
        "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=700&q=80",
      order: 2,
    },
    {
      key: "perusahaan",
      titleId: "Perusahaan",
      titleEn: "Corporates",
      bullet1Id: "Proyek terverifikasi & SRN ready",
      bullet1En: "Verified projects & SRN ready",
      bullet2Id: "Laporan ESG otomatis",
      bullet2En: "Automated ESG reports",
      bullet3Id: "Dukungan kepatuhan regulasi",
      bullet3En: "Regulatory compliance support",
      ctaId: "Hubungi Kami",
      ctaEn: "Contact Us",
      href: "https://wa.me/6281234561017",
      image:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=700&q=80",
      order: 3,
    },
  ],
};

export default function TigaPeranPage() {
  const data = useQuery(api.rolesSection.get);
  const updateRoles = useMutation(api.rolesSection.update);

  const [form, setForm] = useState<RolesForm>(defaults);
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editKey, setEditKey] = useState<string | null>(null);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hydrated) return;
    if (data === undefined) return;
    if (data) {
      setForm({
        headlineId: data.headlineId,
        headlineEn: data.headlineEn,
        subtitleId: data.subtitleId,
        subtitleEn: data.subtitleEn,
        cards: data.cards.map((c) => ({ ...c })),
      });
    }
    setHydrated(true);
  }, [data, hydrated]);

  const editingCard = useMemo(
    () => form.cards.find((c) => c.key === editKey) ?? null,
    [form.cards, editKey]
  );

  function setHeader<K extends keyof RolesForm>(key: K, value: RolesForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setCardField<K extends keyof CardForm>(
    cardKey: string,
    field: K,
    value: CardForm[K]
  ) {
    setForm((f) => ({
      ...f,
      cards: f.cards.map((c) =>
        c.key === cardKey ? { ...c, [field]: value } : c
      ),
    }));
  }

  function startEdit(key: string) {
    setEditKey(key);
    setError(null);
    setTimeout(() => {
      editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  async function handleUpload(
    cardKey: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingKey(cardKey);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/cloudinary-upload", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (!res.ok || !json.url) {
        throw new Error(json.error ?? "Upload Cloudinary gagal");
      }
      setCardField(cardKey, "image", json.url);
      const next: RolesForm = {
        ...form,
        cards: form.cards.map((c) =>
          c.key === cardKey ? { ...c, image: json.url } : c
        ),
      };
      await updateRoles(next);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload gagal");
    } finally {
      setUploadingKey(null);
      const input = fileRefs.current[cardKey];
      if (input) input.value = "";
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await updateRoles(form);
      setSavedFlash(true);
      setEditKey(null);
      setTimeout(() => setSavedFlash(false), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-bold text-xl text-gray-900">
          Kelola Section Tiga Peran
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Edit headline, sub-judul, konten kartu, dan thumbnail untuk section
          &quot;Tiga Peran, Satu Ekosistem&quot; di halaman utama.
        </p>
      </div>

      <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700">
        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>
          Thumbnail diupload ke Cloudinary, konten tersimpan di Convex.
          Perubahan tampil real-time di landing page.
        </span>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Header / Subtitle editor */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4">
        <h2 className="font-semibold text-sm text-gray-900">
          Headline & Sub-judul
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="space-y-1">
            <span className="text-xs font-semibold text-gray-600">
              Headline (ID)
            </span>
            <input
              value={form.headlineId}
              onChange={(e) => setHeader("headlineId", e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold text-gray-600">
              Headline (EN)
            </span>
            <input
              value={form.headlineEn}
              onChange={(e) => setHeader("headlineEn", e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs font-semibold text-gray-600">
              Sub-judul (ID)
            </span>
            <textarea
              rows={2}
              value={form.subtitleId}
              onChange={(e) => setHeader("subtitleId", e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs font-semibold text-gray-600">
              Sub-judul (EN)
            </span>
            <textarea
              rows={2}
              value={form.subtitleEn}
              onChange={(e) => setHeader("subtitleEn", e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-1">
          {savedFlash && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
              <Check className="w-4 h-4" />
              Tersimpan
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !hydrated}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Simpan & Update Live
          </button>
        </div>
      </div>

      {/* Card editor */}
      {editingCard && (
        <div
          ref={editorRef}
          className="bg-white rounded-xl border border-emerald-100 p-5 shadow-sm scroll-mt-4 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm text-gray-900">
              Edit Kartu: {editingCard.titleId}
            </h2>
            <button
              onClick={() => setEditKey(null)}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-5">
            <div>
              <div className="relative h-40 rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={editingCard.image}
                  alt={editingCard.titleId}
                  className="w-full h-full object-cover"
                />
                {uploadingKey === editingCard.key && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
              </div>
              <input
                ref={(el) => {
                  fileRefs.current[editingCard.key] = el;
                }}
                type="file"
                accept="image/*"
                onChange={(e) => handleUpload(editingCard.key, e)}
                className="hidden"
              />
              <button
                onClick={() => fileRefs.current[editingCard.key]?.click()}
                disabled={uploadingKey === editingCard.key}
                className="mt-3 w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-3 text-sm font-semibold text-gray-500 hover:border-emerald-400 hover:text-emerald-600 disabled:opacity-50"
              >
                {uploadingKey === editingCard.key ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                Upload Thumbnail (Cloudinary)
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="space-y-1">
                <span className="text-xs font-semibold text-gray-600">
                  Judul (ID)
                </span>
                <input
                  value={editingCard.titleId}
                  onChange={(e) =>
                    setCardField(editingCard.key, "titleId", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold text-gray-600">
                  Judul (EN)
                </span>
                <input
                  value={editingCard.titleEn}
                  onChange={(e) =>
                    setCardField(editingCard.key, "titleEn", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </label>

              <label className="space-y-1 md:col-span-2">
                <span className="text-xs font-semibold text-gray-600">
                  URL Thumbnail
                </span>
                <input
                  value={editingCard.image}
                  onChange={(e) =>
                    setCardField(editingCard.key, "image", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </label>

              {[1, 2, 3].map((n) => (
                <div key={n} className="grid grid-cols-2 gap-2 md:col-span-2">
                  <label className="space-y-1">
                    <span className="text-xs font-semibold text-gray-600">
                      Bullet {n} (ID)
                    </span>
                    <input
                      value={
                        editingCard[`bullet${n}Id` as keyof CardForm] as string
                      }
                      onChange={(e) =>
                        setCardField(
                          editingCard.key,
                          `bullet${n}Id` as keyof CardForm,
                          e.target.value as never
                        )
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs font-semibold text-gray-600">
                      Bullet {n} (EN)
                    </span>
                    <input
                      value={
                        editingCard[`bullet${n}En` as keyof CardForm] as string
                      }
                      onChange={(e) =>
                        setCardField(
                          editingCard.key,
                          `bullet${n}En` as keyof CardForm,
                          e.target.value as never
                        )
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    />
                  </label>
                </div>
              ))}

              <label className="space-y-1">
                <span className="text-xs font-semibold text-gray-600">
                  CTA (ID)
                </span>
                <input
                  value={editingCard.ctaId}
                  onChange={(e) =>
                    setCardField(editingCard.key, "ctaId", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold text-gray-600">
                  CTA (EN)
                </span>
                <input
                  value={editingCard.ctaEn}
                  onChange={(e) =>
                    setCardField(editingCard.key, "ctaEn", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </label>
              <label className="space-y-1 md:col-span-2">
                <span className="text-xs font-semibold text-gray-600">
                  Link / Href
                </span>
                <input
                  value={editingCard.href}
                  onChange={(e) =>
                    setCardField(editingCard.key, "href", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving || uploadingKey !== null}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Simpan & Update Live
            </button>
            <button
              onClick={() => setEditKey(null)}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
            >
              <X className="w-4 h-4" />
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Card grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {form.cards.map((card) => (
          <div
            key={card.key}
            className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm"
          >
            <div className="relative h-32 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={card.image}
                alt={card.titleId}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold text-sm text-gray-900">
                    {card.titleId}
                  </h2>
                  <p className="text-[11px] text-gray-400">{card.href}</p>
                </div>
                <button
                  onClick={() => startEdit(card.key)}
                  className="p-2 rounded-lg text-blue-500 hover:bg-blue-50"
                  title="Edit kartu"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
              <ul className="space-y-1.5">
                {[card.bullet1Id, card.bullet2Id, card.bullet3Id].map((b, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-xs text-gray-700"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
              <div className="pt-1">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-[11px] font-semibold">
                  {card.ctaId}
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
