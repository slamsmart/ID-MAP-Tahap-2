"use client";

import { useMemo, useRef, useState } from "react";
import { useConvex, useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  AlertTriangle,
  BarChart3,
  Check,
  Fish,
  ImageIcon,
  Loader2,
  Pencil,
  Save,
  Shield,
  Sprout,
  TreePine,
  Upload,
  Users,
  X,
} from "lucide-react";

type ServiceForm = {
  key: string;
  titleId: string;
  titleEn: string;
  descriptionId: string;
  descriptionEn: string;
  image: string;
  badgeText: string;
  badgeClass: string;
  iconBgClass: string;
  iconName: string;
  value1: string;
  label1: string;
  value2: string;
  label2: string;
  value3: string;
  label3: string;
  order: number;
};

const defaultServices: ServiceForm[] = [
  {
    key: "rehabilitasi-mangrove",
    titleId: "Rehabilitasi Mangrove",
    titleEn: "Mangrove Rehabilitation",
    descriptionId: "Penanaman dan pemulihan kawasan mangrove terdegradasi dengan pendekatan berbasis ekosistem dan partisipasi masyarakat lokal.",
    descriptionEn: "Planting and restoring degraded mangrove areas using ecosystem-based approaches with local community participation.",
    image: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=800&q=80",
    badgeText: "Ekosistem",
    badgeClass: "bg-emerald-600",
    iconBgClass: "bg-emerald-700",
    iconName: "TreePine",
    value1: "600.000 ha",
    label1: "Target PMN Nasional",
    value2: "47,8%",
    label2: "Realisasi s/d 2024",
    value3: "9 Provinsi",
    label3: "Prioritas Restorasi",
    order: 1,
  },
  {
    key: "penyulaman-mangrove",
    titleId: "Penyulaman Mangrove",
    titleEn: "Mangrove Replanting",
    descriptionId: "Pengisian kembali tanaman yang mati atau rusak untuk memastikan kepadatan tegakan dan keberhasilan tumbuh jangka panjang.",
    descriptionEn: "Refilling dead or damaged plants to ensure stand density and long-term growth success.",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80",
    badgeText: "Revegetasi",
    badgeClass: "bg-teal-600",
    iconBgClass: "bg-teal-700",
    iconName: "Sprout",
    value1: "85%+",
    label1: "Survival Rate Target",
    value2: "120+ Spesies",
    label2: "Mangrove Lokal",
    value3: "Monitoring",
    label3: "Rutin Berkala",
    order: 2,
  },
  {
    key: "monev-mangrove",
    titleId: "Jasa Pemantauan Monev Mangrove",
    titleEn: "Mangrove Monitoring & Evaluation",
    descriptionId: "Pemantauan, evaluasi, dan pelaporan MRV berkala menggunakan teknologi penginderaan jauh dan survei lapangan terstandar.",
    descriptionEn: "Periodic monitoring, evaluation, and MRV reporting using remote sensing technology and standardized field surveys.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    badgeText: "Teknologi",
    badgeClass: "bg-blue-600",
    iconBgClass: "bg-blue-700",
    iconName: "BarChart3",
    value1: "Citra 10m",
    label1: "Resolusi Satelit",
    value2: "MRV Ready",
    label2: "SRN KLHK",
    value3: "Laporan ESG",
    label3: "Otomatis",
    order: 3,
  },
  {
    key: "decarbonisasi-aquaculture",
    titleId: "Decarbonisasi Aquaculture",
    titleEn: "Aquaculture Decarbonization",
    descriptionId: "Integrasi mangrove pada tambak budidaya untuk mereduksi emisi karbon dan meningkatkan produktivitas ekosistem pesisir secara berkelanjutan.",
    descriptionEn: "Integrating mangroves into aquaculture ponds to reduce carbon emissions and sustainably enhance coastal ecosystem productivity.",
    image: "https://images.unsplash.com/photo-1559825481-12a05cc00344?auto=format&fit=crop&w=800&q=80",
    badgeText: "Carbon Credit",
    badgeClass: "bg-cyan-600",
    iconBgClass: "bg-cyan-700",
    iconName: "Fish",
    value1: "185 tCO2",
    label1: "Serapan/ha/tahun",
    value2: "Blue Carbon",
    label2: "Credit Eligible",
    value3: "USD 345 Juta",
    label3: "Potensi/tahun",
    order: 4,
  },
  {
    key: "habitat-penyu",
    titleId: "Perbaikan Habitat Penyu",
    titleEn: "Sea Turtle Habitat Restoration",
    descriptionId: "Pemulihan kawasan pantai bersarang penyu melalui rehabilitasi vegetasi pesisir dan pengelolaan kawasan berbasis konservasi.",
    descriptionEn: "Restoring sea turtle nesting beaches through coastal vegetation rehabilitation and conservation-based area management.",
    image: "https://images.unsplash.com/photo-1559827291-72ee739d0d9a?auto=format&fit=crop&w=800&q=80",
    badgeText: "Konservasi",
    badgeClass: "bg-orange-500",
    iconBgClass: "bg-orange-600",
    iconName: "Shield",
    value1: "5 Spesies",
    label1: "Penyu Dilindungi",
    value2: "Patroli 24/7",
    label2: "Pantai Bersarang",
    value3: "Zero Poaching",
    label3: "Target Program",
    order: 5,
  },
  {
    key: "pemberdayaan-pesisir",
    titleId: "Pemberdayaan Masyarakat Pesisir",
    titleEn: "Coastal Community Empowerment",
    descriptionId: "Penguatan kapasitas Pokmaswas dan masyarakat pesisir melalui pelatihan, pendampingan, dan sistem informasi pengawasan ekosistem mandiri.",
    descriptionEn: "Strengthening Pokmaswas and coastal community capacity through training, mentoring, and independent ecosystem monitoring information systems.",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80",
    badgeText: "Komunitas",
    badgeClass: "bg-purple-600",
    iconBgClass: "bg-purple-700",
    iconName: "Users",
    value1: "500+ Kelompok",
    label1: "Pokmaswas Aktif",
    value2: "Bersertifikat",
    label2: "Training Resmi",
    value3: "Dashboard",
    label3: "Pelaporan Digital",
    order: 6,
  },
];

const iconOptions = [
  { name: "TreePine", icon: TreePine },
  { name: "Sprout", icon: Sprout },
  { name: "BarChart3", icon: BarChart3 },
  { name: "Fish", icon: Fish },
  { name: "Shield", icon: Shield },
  { name: "Users", icon: Users },
];

const colorOptions = [
  { label: "Emerald", badgeClass: "bg-emerald-600", iconBgClass: "bg-emerald-700" },
  { label: "Teal", badgeClass: "bg-teal-600", iconBgClass: "bg-teal-700" },
  { label: "Blue", badgeClass: "bg-blue-600", iconBgClass: "bg-blue-700" },
  { label: "Cyan", badgeClass: "bg-cyan-600", iconBgClass: "bg-cyan-700" },
  { label: "Orange", badgeClass: "bg-orange-500", iconBgClass: "bg-orange-600" },
  { label: "Purple", badgeClass: "bg-purple-600", iconBgClass: "bg-purple-700" },
];

export default function ThumbnailLayananPage() {
  const convex = useConvex();
  const savedServices = useQuery(api.serviceContent.list);
  const updateService = useMutation(api.serviceContent.update);
  const generateUploadUrl = useMutation(api.serviceContent.generateUploadUrl);
  const fileRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const services = useMemo(() => {
    if (!savedServices || savedServices.length === 0) return defaultServices;
    const savedByKey = new Map(savedServices.map((svc) => [svc.key, svc]));
    return defaultServices.map((svc) => {
      const saved = savedByKey.get(svc.key);
      if (!saved) return svc;
      return {
        key: saved.key,
        titleId: saved.titleId,
        titleEn: saved.titleEn,
        descriptionId: saved.descriptionId,
        descriptionEn: saved.descriptionEn,
        image: saved.image,
        badgeText: saved.badgeText,
        badgeClass: saved.badgeClass,
        iconBgClass: saved.iconBgClass,
        iconName: saved.iconName,
        value1: saved.value1,
        label1: saved.label1,
        value2: saved.value2,
        label2: saved.label2,
        value3: saved.value3,
        label3: saved.label3,
        order: saved.order,
      };
    });
  }, [savedServices]);

  const [editKey, setEditKey] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceForm>(defaultServices[0]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeIcon = iconOptions.find((item) => item.name === form.iconName)?.icon ?? TreePine;
  const ActiveIcon = activeIcon;

  function startEdit(service: ServiceForm) {
    setEditKey(service.key);
    setForm(service);
    setError(null);
    setTimeout(() => {
      editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);

    try {
      const uploadUrl = await generateUploadUrl();
      const uploadRes = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!uploadRes.ok) throw new Error("Upload ke Convex storage gagal");
      const { storageId } = await uploadRes.json();
      const signedUrl = await convex.query(api.serviceContent.getImageUrl, { storageId });
      if (!signedUrl) throw new Error("Gagal mengambil URL gambar");

      const nextForm = { ...form, image: signedUrl };
      setForm(nextForm);
      await updateService(nextForm);
      setSavedKey(nextForm.key);
      setTimeout(() => setSavedKey(null), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload gagal");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await updateService(form);
      setSavedKey(form.key);
      setEditKey(null);
      setTimeout(() => setSavedKey(null), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan konten");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-bold text-xl text-gray-900">Kelola Konten Layanan ID-MAP</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Edit section Solusi Ekosistem Pesisir di halaman publik: thumbnail, icon, badge, judul, deskripsi, dan value points.
        </p>
      </div>

      <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700">
        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>Perubahan tersimpan ke Convex dan langsung tampil di section layanan halaman utama.</span>
      </div>

      {editKey && (
        <div ref={editorRef} className="bg-white rounded-xl border border-emerald-100 p-4 shadow-sm scroll-mt-4">
          <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-5">
            <div>
              <div className="relative h-48 rounded-xl overflow-hidden bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.image} alt={form.titleId} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <span className={`absolute top-3 right-3 text-[10px] font-bold text-white px-2.5 py-1 rounded-full ${form.badgeClass}`}>
                  {form.badgeText}
                </span>
                <div className={`absolute bottom-3 left-4 z-10 w-12 h-12 rounded-xl flex items-center justify-center ${form.iconBgClass} shadow-lg border-2 border-white`}>
                  <ActiveIcon className="w-6 h-6 text-white" />
                </div>
                {uploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="mt-3 w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-3 text-sm font-semibold text-gray-500 hover:border-emerald-400 hover:text-emerald-600 disabled:opacity-50"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Upload Thumbnail
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="space-y-1">
                <span className="text-xs font-semibold text-gray-600">Judul Indonesia</span>
                <input value={form.titleId} onChange={(e) => setForm((f) => ({ ...f, titleId: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400" />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold text-gray-600">Judul English</span>
                <input value={form.titleEn} onChange={(e) => setForm((f) => ({ ...f, titleEn: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400" />
              </label>
              <label className="space-y-1 md:col-span-2">
                <span className="text-xs font-semibold text-gray-600">URL Thumbnail</span>
                <input value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400" />
              </label>
              <label className="space-y-1 md:col-span-2">
                <span className="text-xs font-semibold text-gray-600">Deskripsi Indonesia</span>
                <textarea value={form.descriptionId} onChange={(e) => setForm((f) => ({ ...f, descriptionId: e.target.value }))} rows={2} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-emerald-400" />
              </label>
              <label className="space-y-1 md:col-span-2">
                <span className="text-xs font-semibold text-gray-600">Deskripsi English</span>
                <textarea value={form.descriptionEn} onChange={(e) => setForm((f) => ({ ...f, descriptionEn: e.target.value }))} rows={2} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-emerald-400" />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold text-gray-600">Badge</span>
                <input value={form.badgeText} onChange={(e) => setForm((f) => ({ ...f, badgeText: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400" />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold text-gray-600">Icon</span>
                <select value={form.iconName} onChange={(e) => setForm((f) => ({ ...f, iconName: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400">
                  {iconOptions.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
                </select>
              </label>
              <label className="space-y-1 md:col-span-2">
                <span className="text-xs font-semibold text-gray-600">Warna</span>
                <select
                  value={`${form.badgeClass}|${form.iconBgClass}`}
                  onChange={(e) => {
                    const [badgeClass, iconBgClass] = e.target.value.split("|");
                    setForm((f) => ({ ...f, badgeClass, iconBgClass }));
                  }}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
                >
                  {colorOptions.map((item) => (
                    <option key={item.label} value={`${item.badgeClass}|${item.iconBgClass}`}>{item.label}</option>
                  ))}
                </select>
              </label>

              {[1, 2, 3].map((n) => (
                <div key={n} className="grid grid-cols-2 gap-2">
                  <label className="space-y-1">
                    <span className="text-xs font-semibold text-gray-600">Value {n}</span>
                    <input value={form[`value${n}` as keyof ServiceForm] as string} onChange={(e) => setForm((f) => ({ ...f, [`value${n}`]: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400" />
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs font-semibold text-gray-600">Label {n}</span>
                    <input value={form[`label${n}` as keyof ServiceForm] as string} onChange={(e) => setForm((f) => ({ ...f, [`label${n}`]: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400" />
                  </label>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

          <div className="mt-4 flex gap-2">
            <button onClick={handleSave} disabled={saving || uploading} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Simpan & Update Live
            </button>
            <button onClick={() => setEditKey(null)} className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200">
              <X className="w-4 h-4" />
              Batal
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {services.map((svc) => {
          const Icon = iconOptions.find((item) => item.name === svc.iconName)?.icon ?? TreePine;
          const justSaved = savedKey === svc.key;

          return (
            <div key={svc.key} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="relative h-36 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={svc.image} alt={svc.titleId} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <span className={`absolute top-3 right-3 text-[10px] font-bold text-white px-2.5 py-1 rounded-full ${svc.badgeClass}`}>
                  {svc.badgeText}
                </span>
                <div className={`absolute bottom-3 left-4 z-10 w-11 h-11 rounded-xl flex items-center justify-center ${svc.iconBgClass} shadow-lg border-2 border-white`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                {justSaved && (
                  <div className="absolute inset-0 bg-emerald-600/80 flex items-center justify-center">
                    <Check className="w-7 h-7 text-white" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-sm text-gray-900">{svc.titleId}</h2>
                    <p className="mt-1 text-xs text-gray-500 line-clamp-2">{svc.descriptionId}</p>
                  </div>
                  <button onClick={() => startEdit(svc)} className="p-2 rounded-lg text-blue-500 hover:bg-blue-50" title="Edit layanan">
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-gray-100 pt-3">
                  <div>
                    <p className="text-xs font-bold text-gray-900">{svc.value1}</p>
                    <p className="text-[10px] text-gray-400">{svc.label1}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">{svc.value2}</p>
                    <p className="text-[10px] text-gray-400">{svc.label2}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">{svc.value3}</p>
                    <p className="text-[10px] text-gray-400">{svc.label3}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
