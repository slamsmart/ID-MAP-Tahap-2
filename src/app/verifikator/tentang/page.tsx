"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  AlertTriangle,
  Check,
  ImageIcon,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
} from "lucide-react";

type ServiceItem = {
  iconKey: string;
  titleId: string;
  titleEn: string;
  descId: string;
  descEn: string;
  image?: string;
};
type WhyCard = {
  iconKey: string;
  titleId: string;
  titleEn: string;
  descId: string;
  descEn: string;
};

type AboutForm = {
  heroImage?: string;
  heroTitleId: string;
  heroTitleEn: string;
  heroSubtitleId: string;
  heroSubtitleEn: string;
  apaItuTitleId: string;
  apaItuTitleEn: string;
  apaItuParagraph1Id: string;
  apaItuParagraph1En: string;
  apaItuParagraph2Id: string;
  apaItuParagraph2En: string;
  missionId: string;
  missionEn: string;
  visionId: string;
  visionEn: string;
  services: ServiceItem[];
  whyCards: WhyCard[];
};

const ICON_OPTIONS = [
  "Sprout",
  "Leaf",
  "BarChart3",
  "Anchor",
  "Shield",
  "HeartHandshake",
  "Globe",
  "Users",
  "Target",
  "Eye",
  "Award",
];

const defaults: AboutForm = {
  heroImage: undefined,
  heroTitleId: "Tentang ID-MAP",
  heroTitleEn: "About ID-MAP",
  heroSubtitleId: "Platform Integrasi Data dan Manajemen Pesisir untuk ekosistem pesisir nusantara",
  heroSubtitleEn: "Integrated Coastal Data & Management Platform for Indonesia's coastal ecosystem",
  apaItuTitleId: "Apa itu ID-MAP?",
  apaItuTitleEn: "What is ID-MAP?",
  apaItuParagraph1Id: "ID-MAP merupakan platform integrasi data dan manajemen pesisir demi keberlanjutan ekosistem mangrove dan pesisir dan pemberdayaan masyarakat pesisir seluruh Indonesia.",
  apaItuParagraph1En: "ID-MAP is an integrated coastal data and management platform for the sustainability of mangrove and coastal ecosystems and the empowerment of coastal communities across Indonesia.",
  apaItuParagraph2Id: "ID-MAP mengintegrasikan data ekosistem pesisir Indonesia — mangrove, abrasi pantai, habitat penyu, dan jaringan Pokmaswas/Mitra — sehingga komunitas, pemerintah daerah, dan pendukung publik dapat berkolaborasi pada satu platform yang terverifikasi dan transparan.",
  apaItuParagraph2En: "ID-MAP brings together coastal ecosystem data — mangroves, abrasion, sea-turtle habitats, and the Pokmaswas/partner network — so communities, regional governments, and public supporters can collaborate on one verified, transparent platform.",
  missionId: "Mengintegrasikan data dan tata kelola pesisir Indonesia melalui enam layanan inti — rehabilitasi mangrove, penyulaman, MRV digital, decarbonisasi aquaculture, perbaikan habitat penyu, dan pemberdayaan masyarakat pesisir — secara transparan, partisipatif, dan berkelanjutan.",
  missionEn: "Integrate coastal data and governance through six core services — mangrove rehabilitation, replanting, digital MRV, aquaculture decarbonisation, sea-turtle habitat restoration, and coastal community empowerment — transparently, participatively, and sustainably.",
  visionId: "Menjadi platform terpercaya yang mempercepat pemulihan dan keberlanjutan ekosistem pesisir nusantara melalui kolaborasi data, komunitas, dan teknologi.",
  visionEn: "Become the trusted platform that accelerates the recovery and sustainability of Indonesia's coastal ecosystems through data, community, and technology.",
  services: [
    { iconKey: "Sprout", titleId: "Rehabilitasi Mangrove", titleEn: "Mangrove Rehabilitation", descId: "Restorasi ekosistem mangrove pesisir bersama Pokmaswas dan komunitas lokal.", descEn: "Restoring coastal mangrove ecosystems with Pokmaswas and local communities." },
    { iconKey: "Leaf", titleId: "Penyulaman Mangrove", titleEn: "Mangrove Replanting", descId: "Penanaman ulang bibit pada area yang masih jarang atau gagal tumbuh.", descEn: "Replanting on areas that remain sparse or failed to grow." },
    { iconKey: "BarChart3", titleId: "Monev Mangrove", titleEn: "Mangrove M&E", descId: "Jasa pemantauan, pelaporan, dan verifikasi (MRV) data mangrove digital.", descEn: "Digital monitoring, reporting and verification (MRV) services for mangrove data." },
    { iconKey: "Anchor", titleId: "Decarbonisasi Aquaculture", titleEn: "Aquaculture Decarbonisation", descId: "Mendukung tambak rendah emisi yang ramah ekosistem pesisir.", descEn: "Supporting low-emission aquaculture friendly to coastal ecosystems." },
    { iconKey: "Shield", titleId: "Perbaikan Habitat Penyu", titleEn: "Sea-Turtle Habitat Restoration", descId: "Konservasi titik peneluran dan penjagaan tukik bersama komunitas.", descEn: "Conserving nesting points and protecting hatchlings with communities." },
    { iconKey: "HeartHandshake", titleId: "Pemberdayaan Masyarakat Pesisir", titleEn: "Coastal Community Empowerment", descId: "Penguatan ekonomi & kapasitas Pokmaswas dan kelompok nelayan.", descEn: "Strengthening the economy and capacity of Pokmaswas and fisher groups." },
  ],
  whyCards: [
    { iconKey: "Shield", titleId: "Terverifikasi", titleEn: "Verified", descId: "Setiap proyek divalidasi tim verifikator dan dapat diaudit oleh DKP daerah.", descEn: "Every project validated by the verifier team, auditable by regional DKP." },
    { iconKey: "Globe", titleId: "Data Spasial Terpadu", titleEn: "Integrated Spatial Data", descId: "Peta interaktif terintegrasi: mangrove, abrasi, penyu, dan jaringan Pokmaswas/Mitra.", descEn: "Integrated interactive map: mangrove, abrasion, sea turtle, and the Pokmaswas/partner network." },
    { iconKey: "Users", titleId: "Inklusif & Partisipatif", titleEn: "Inclusive & Participatory", descId: "Menghubungkan Sahabat Pesisir, Mitra pelaksana, dan komunitas lokal pada satu platform.", descEn: "Connecting Sahabat Pesisir, executing partners, and local communities on one platform." },
    { iconKey: "BarChart3", titleId: "MRV Digital", titleEn: "Digital MRV", descId: "Dashboard real-time untuk pemantauan, pelaporan, dan verifikasi data lapangan.", descEn: "Real-time dashboards for monitoring, reporting, and verifying field data." },
    { iconKey: "HeartHandshake", titleId: "Dampak Nyata", titleEn: "Real Impact", descId: "Setiap kontribusi tersalurkan langsung ke kelompok masyarakat pesisir pelaksana.", descEn: "Every contribution flows directly to the executing coastal community group." },
    { iconKey: "Leaf", titleId: "Berkelanjutan", titleEn: "Sustainable", descId: "Mendukung pemulihan ekosistem pesisir nusantara secara jangka panjang.", descEn: "Supporting long-term recovery of Indonesia's coastal ecosystems." },
  ],
};

async function uploadToCloudinary(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/cloudinary-upload", { method: "POST", body: fd });
  const json = (await res.json()) as { url?: string; error?: string };
  if (!res.ok || !json.url) throw new Error(json.error ?? "Upload gagal");
  return json.url;
}

export default function VerifikatorTentangPage() {
  const data = useQuery(api.aboutContent.get);
  const updateAbout = useMutation(api.aboutContent.update);

  const [form, setForm] = useState<AboutForm>(defaults);
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  useEffect(() => {
    if (data && !hydrated) {
      setForm({
        heroImage: data.heroImage,
        heroTitleId: data.heroTitleId,
        heroTitleEn: data.heroTitleEn,
        heroSubtitleId: data.heroSubtitleId,
        heroSubtitleEn: data.heroSubtitleEn,
        apaItuTitleId: data.apaItuTitleId,
        apaItuTitleEn: data.apaItuTitleEn,
        apaItuParagraph1Id: data.apaItuParagraph1Id,
        apaItuParagraph1En: data.apaItuParagraph1En,
        apaItuParagraph2Id: data.apaItuParagraph2Id,
        apaItuParagraph2En: data.apaItuParagraph2En,
        missionId: data.missionId,
        missionEn: data.missionEn,
        visionId: data.visionId,
        visionEn: data.visionEn,
        services: data.services,
        whyCards: data.whyCards,
      });
      setHydrated(true);
    } else if (data === null && !hydrated) {
      setHydrated(true);
    }
  }, [data, hydrated]);

  function field<K extends keyof AboutForm>(key: K, value: AboutForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }
  function patchService(idx: number, patch: Partial<ServiceItem>) {
    setForm((f) => ({ ...f, services: f.services.map((s, i) => (i === idx ? { ...s, ...patch } : s)) }));
  }
  function patchWhy(idx: number, patch: Partial<WhyCard>) {
    setForm((f) => ({ ...f, whyCards: f.whyCards.map((s, i) => (i === idx ? { ...s, ...patch } : s)) }));
  }
  function addService() {
    setForm((f) => ({ ...f, services: [...f.services, { iconKey: "Sprout", titleId: "", titleEn: "", descId: "", descEn: "" }] }));
  }
  function removeService(idx: number) {
    setForm((f) => ({ ...f, services: f.services.filter((_, i) => i !== idx) }));
  }
  function addWhy() {
    setForm((f) => ({ ...f, whyCards: [...f.whyCards, { iconKey: "Shield", titleId: "", titleEn: "", descId: "", descEn: "" }] }));
  }
  function removeWhy(idx: number) {
    setForm((f) => ({ ...f, whyCards: f.whyCards.filter((_, i) => i !== idx) }));
  }

  async function handleHeroUpload(file: File) {
    setUploadingField("hero");
    setError(null);
    try {
      const url = await uploadToCloudinary(file);
      field("heroImage", url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload gagal");
    } finally {
      setUploadingField(null);
    }
  }
  async function handleServiceUpload(idx: number, file: File) {
    setUploadingField(`svc-${idx}`);
    setError(null);
    try {
      const url = await uploadToCloudinary(file);
      patchService(idx, { image: url });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload gagal");
    } finally {
      setUploadingField(null);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await updateAbout(form);
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
        <h1 className="font-bold text-xl text-gray-900">Kelola Halaman Tentang</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Edit hero, misi, visi, 6 layanan inti, dan kartu &quot;Mengapa&quot; pada halaman publik <code>/tentang</code>. Perubahan tampil real-time.
        </p>
      </div>

      <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700">
        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>Gambar diunggah ke Cloudinary, copy ID/EN disimpan di Convex. Klik <strong>Simpan</strong> untuk publish.</span>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-5">
        {/* Hero */}
        <div>
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wider mb-3">Hero</h2>
          <div className="flex items-start gap-3 mb-4">
            <div className="relative w-40 h-24 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
              {form.heroImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.heroImage} alt="Hero" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <ImageIcon className="w-6 h-6" />
                </div>
              )}
              {uploadingField === "hero" && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <label className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-emerald-100 text-emerald-700 hover:bg-emerald-50 cursor-pointer transition">
                <Upload className="w-3.5 h-3.5" /> Ganti Gambar Hero (opsional)
                <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleHeroUpload(f); e.target.value = ""; }} />
              </label>
              {form.heroImage && (
                <button onClick={() => field("heroImage", undefined)} className="ml-2 text-xs text-red-500 hover:text-red-700">Hapus</button>
              )}
              <p className="text-[11px] text-gray-400 mt-1.5">JPG/PNG/WebP, maks 8MB. Kosong = pakai warna brand.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="text" value={form.heroTitleId} onChange={(e) => field("heroTitleId", e.target.value)} placeholder="Judul ID" className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            <input type="text" value={form.heroTitleEn} onChange={(e) => field("heroTitleEn", e.target.value)} placeholder="Title EN" className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            <input type="text" value={form.heroSubtitleId} onChange={(e) => field("heroSubtitleId", e.target.value)} placeholder="Subjudul ID" className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            <input type="text" value={form.heroSubtitleEn} onChange={(e) => field("heroSubtitleEn", e.target.value)} placeholder="Subtitle EN" className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
          </div>
        </div>

        <div className="border-t border-gray-100" />

        {/* Apa itu */}
        <div>
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wider mb-3">Apa itu ID-MAP</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <input type="text" value={form.apaItuTitleId} onChange={(e) => field("apaItuTitleId", e.target.value)} placeholder="Judul ID" className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            <input type="text" value={form.apaItuTitleEn} onChange={(e) => field("apaItuTitleEn", e.target.value)} placeholder="Title EN" className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <textarea rows={3} value={form.apaItuParagraph1Id} onChange={(e) => field("apaItuParagraph1Id", e.target.value)} placeholder="Paragraf 1 ID" className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none" />
            <textarea rows={3} value={form.apaItuParagraph1En} onChange={(e) => field("apaItuParagraph1En", e.target.value)} placeholder="Paragraph 1 EN" className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none" />
            <textarea rows={3} value={form.apaItuParagraph2Id} onChange={(e) => field("apaItuParagraph2Id", e.target.value)} placeholder="Paragraf 2 ID" className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none" />
            <textarea rows={3} value={form.apaItuParagraph2En} onChange={(e) => field("apaItuParagraph2En", e.target.value)} placeholder="Paragraph 2 EN" className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none" />
          </div>
        </div>

        <div className="border-t border-gray-100" />

        {/* Misi & Visi */}
        <div>
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wider mb-3">Misi & Visi</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <textarea rows={4} value={form.missionId} onChange={(e) => field("missionId", e.target.value)} placeholder="Misi ID" className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none" />
            <textarea rows={4} value={form.missionEn} onChange={(e) => field("missionEn", e.target.value)} placeholder="Mission EN" className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none" />
            <textarea rows={4} value={form.visionId} onChange={(e) => field("visionId", e.target.value)} placeholder="Visi ID" className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none" />
            <textarea rows={4} value={form.visionEn} onChange={(e) => field("visionEn", e.target.value)} placeholder="Vision EN" className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none" />
          </div>
        </div>

        <div className="border-t border-gray-100" />

        {/* Layanan */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wider">Enam Layanan ({form.services.length})</h2>
            <button onClick={addService} className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-100 font-semibold">
              <Plus className="w-3 h-3" /> Tambah
            </button>
          </div>
          <div className="space-y-3">
            {form.services.map((svc, idx) => (
              <div key={idx} className="border border-gray-100 rounded-xl p-3 bg-gray-50/50">
                <div className="flex items-start gap-3 mb-2">
                  <div className="relative w-20 h-14 rounded bg-gray-100 border border-gray-200 flex-shrink-0 overflow-hidden">
                    {svc.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={svc.image} alt={svc.titleId} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon className="w-4 h-4" /></div>
                    )}
                    {uploadingField === `svc-${idx}` && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <select value={svc.iconKey} onChange={(e) => patchService(idx, { iconKey: e.target.value })} className="px-2 py-1 text-xs border border-gray-200 rounded bg-white">
                        {ICON_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
                      </select>
                      <label className="px-2 py-1 text-xs font-semibold rounded border border-emerald-100 text-emerald-700 hover:bg-emerald-50 cursor-pointer">
                        <Upload className="w-3 h-3 inline mr-0.5" /> Gambar
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleServiceUpload(idx, f); e.target.value = ""; }} />
                      </label>
                      <button onClick={() => removeService(idx)} aria-label="Hapus layanan" className="ml-auto p-1 text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input type="text" value={svc.titleId} onChange={(e) => patchService(idx, { titleId: e.target.value })} placeholder="Judul ID" className="px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-emerald-500" />
                  <input type="text" value={svc.titleEn} onChange={(e) => patchService(idx, { titleEn: e.target.value })} placeholder="Title EN" className="px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-emerald-500" />
                  <textarea rows={2} value={svc.descId} onChange={(e) => patchService(idx, { descId: e.target.value })} placeholder="Deskripsi ID" className="px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-emerald-500 resize-none" />
                  <textarea rows={2} value={svc.descEn} onChange={(e) => patchService(idx, { descEn: e.target.value })} placeholder="Description EN" className="px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-emerald-500 resize-none" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100" />

        {/* Why */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wider">Mengapa ID-MAP ({form.whyCards.length})</h2>
            <button onClick={addWhy} className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-100 font-semibold">
              <Plus className="w-3 h-3" /> Tambah
            </button>
          </div>
          <div className="space-y-3">
            {form.whyCards.map((card, idx) => (
              <div key={idx} className="border border-gray-100 rounded-xl p-3 bg-gray-50/50">
                <div className="flex items-center gap-2 mb-2">
                  <select value={card.iconKey} onChange={(e) => patchWhy(idx, { iconKey: e.target.value })} className="px-2 py-1 text-xs border border-gray-200 rounded bg-white">
                    {ICON_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                  <button onClick={() => removeWhy(idx)} aria-label="Hapus kartu" className="ml-auto p-1 text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input type="text" value={card.titleId} onChange={(e) => patchWhy(idx, { titleId: e.target.value })} placeholder="Judul ID" className="px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-emerald-500" />
                  <input type="text" value={card.titleEn} onChange={(e) => patchWhy(idx, { titleEn: e.target.value })} placeholder="Title EN" className="px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-emerald-500" />
                  <textarea rows={2} value={card.descId} onChange={(e) => patchWhy(idx, { descId: e.target.value })} placeholder="Deskripsi ID" className="px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-emerald-500 resize-none" />
                  <textarea rows={2} value={card.descEn} onChange={(e) => patchWhy(idx, { descEn: e.target.value })} placeholder="Description EN" className="px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-emerald-500 resize-none" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
              <Check className="w-4 h-4" /> Tersimpan
            </span>
          )}
          <button onClick={handleSave} disabled={saving || !hydrated || !!uploadingField} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
}
