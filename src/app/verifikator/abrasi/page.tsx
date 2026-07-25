"use client";

import { useState, Fragment } from "react";
import dynamic from "next/dynamic";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ABRASION_SITES, PRIORITAS_CONFIG, type PrioritasType, type AbrasionSite } from "@/lib/abrasionData";
import { Plus, Pencil, Trash2, Save, X, AlertTriangle, ChevronDown, ChevronUp, Map as MapIcon } from "lucide-react";

const AbrasionMap = dynamic(
  () => import("@/components/map/AbrasionMap"),
  { ssr: false }
);

const emptyForm: Omit<AbrasionSite, "no"> = {
  namaPantai: "",
  kecamatanKab: "",
  indikasiAbrasi: "",
  kondisiSesudah: "-",
  substrat: "Pasir",
  luasan: "",
  prioritas: "Sedang",
  tanamanRekomendasi: [""],
  lat: 0,
  lng: 0,
};

function EditForm({
  form,
  setForm,
  onSave,
  onCancel,
}: {
  form: Omit<AbrasionSite, "no">;
  setForm: React.Dispatch<React.SetStateAction<Omit<AbrasionSite, "no">>>;
  onSave: () => void;
  onCancel: () => void;
}) {
  function updateTanaman(idx: number, val: string) {
    setForm((prev) => {
      const arr = [...prev.tanamanRekomendasi];
      arr[idx] = val;
      return { ...prev, tanamanRekomendasi: arr };
    });
  }
  function addTanamanField() {
    setForm((prev) => ({ ...prev, tanamanRekomendasi: [...prev.tanamanRekomendasi, ""] }));
  }
  function removeTanaman(idx: number) {
    setForm((prev) => ({ ...prev, tanamanRekomendasi: prev.tanamanRekomendasi.filter((_, i) => i !== idx) }));
  }
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">Nama Pantai</label>
          <input value={form.namaPantai} onChange={(e) => setForm((prev) => ({ ...prev, namaPantai: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Nama pantai" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">Kecamatan/Kab</label>
          <input value={form.kecamatanKab} onChange={(e) => setForm((prev) => ({ ...prev, kecamatanKab: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Kecamatan, Kab." />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">Indikasi Abrasi</label>
          <input value={form.indikasiAbrasi} onChange={(e) => setForm((prev) => ({ ...prev, indikasiAbrasi: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Keterangan abrasi" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">Kondisi Sesudah</label>
          <input value={form.kondisiSesudah} onChange={(e) => setForm((prev) => ({ ...prev, kondisiSesudah: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">Prioritas</label>
          <select value={form.prioritas} onChange={(e) => setForm((prev) => ({ ...prev, prioritas: e.target.value as PrioritasType }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="Tinggi">Tinggi</option>
            <option value="Sedang">Sedang</option>
            <option value="Rendah–Sedang">Rendah–Sedang</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">Substrat</label>
          <select value={form.substrat} onChange={(e) => setForm((prev) => ({ ...prev, substrat: e.target.value as AbrasionSite["substrat"] }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="Pasir">Pasir</option>
            <option value="Lumpur">Lumpur</option>
            <option value="Campuran">Campuran</option>
            <option value="Berbatu">Berbatu</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">Luasan</label>
          <input value={form.luasan} onChange={(e) => setForm((prev) => ({ ...prev, luasan: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="misal: 50–100 ha" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Lat</label>
            <input type="number" value={form.lat} onChange={(e) => setForm((prev) => ({ ...prev, lat: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" step="0.0001" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Lng</label>
            <input type="number" value={form.lng} onChange={(e) => setForm((prev) => ({ ...prev, lng: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" step="0.0001" />
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-600 block mb-1">Tanaman Rekomendasi</label>
        {form.tanamanRekomendasi.map((t, i) => (
          <div key={i} className="flex gap-2 mb-1.5">
            <input value={t} onChange={(e) => updateTanaman(i, e.target.value)}
              className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm" placeholder={`Tanaman ${i + 1}`} />
            <button onClick={() => removeTanaman(i)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        <button onClick={addTanamanField} className="text-xs text-emerald-600 font-semibold flex items-center gap-1 hover:text-emerald-700">
          <Plus className="w-3.5 h-3.5" /> Tambah Tanaman
        </button>
      </div>

      <div className="flex gap-2 pt-1">
        <button onClick={onSave} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700">
          <Save className="w-3.5 h-3.5" /> Simpan
        </button>
        <button onClick={onCancel} className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200">
          <X className="w-3.5 h-3.5" /> Batal
        </button>
      </div>
    </div>
  );
}

export default function KelolaAbrasiPage() {
  const convexSites = useQuery(api.abrasionSites.list);
  const seed = useMutation(api.abrasionSites.seed);
  const updateSite = useMutation(api.abrasionSites.updateSite);
  const addSite = useMutation(api.abrasionSites.addSite);
  const deleteSite = useMutation(api.abrasionSites.deleteSite);

  const [editId, setEditId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<Omit<AbrasionSite, "no">>(emptyForm);
  const [filterPrioritas, setFilterPrioritas] = useState<PrioritasType | "Semua">("Semua");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [view, setView] = useState<"table" | "map">("table");
  const [seeding, setSeeding] = useState(false);

  const sites: AbrasionSite[] =
    convexSites && convexSites.length > 0
      ? (convexSites as unknown as AbrasionSite[])
      : ABRASION_SITES;

  const filtered = filterPrioritas === "Semua" ? sites : sites.filter((s) => s.prioritas === filterPrioritas);

  async function ensureDatabase() {
    if (convexSites && convexSites.length > 0) return;
    setSeeding(true);
    try {
      await seed();
      // tunggu re-render setelah seed
      await new Promise((r) => setTimeout(r, 500));
    } catch (e) {
      console.error("Seed gagal:", e);
    } finally {
      setSeeding(false);
    }
  }

  function toSitePayload(site: AbrasionSite | Omit<AbrasionSite, "no">) {
    return {
      namaPantai: site.namaPantai,
      kecamatanKab: site.kecamatanKab,
      indikasiAbrasi: site.indikasiAbrasi,
      kondisiSesudah: site.kondisiSesudah,
      substrat: site.substrat,
      luasan: site.luasan,
      prioritas: site.prioritas,
      tanamanRekomendasi: (site.tanamanRekomendasi || []).map((t) => t.trim()).filter(Boolean),
      lat: Number(site.lat),
      lng: Number(site.lng),
    };
  }

  function handleEdit(site: AbrasionSite) {
    setEditId(site.no);
    setIsAdding(false);
    // Hanya salin field yg dikenal, hindari _id / _creationTime dari Convex
    setForm({
      namaPantai: site.namaPantai,
      kecamatanKab: site.kecamatanKab,
      indikasiAbrasi: site.indikasiAbrasi,
      kondisiSesudah: site.kondisiSesudah,
      substrat: site.substrat,
      luasan: site.luasan,
      prioritas: site.prioritas,
      tanamanRekomendasi: site.tanamanRekomendasi,
      lat: site.lat,
      lng: site.lng,
    });
  }

  async function handleDelete(no: number) {
    if (!confirm("Hapus lokasi ini?")) return;
    try {
      await ensureDatabase();
      await deleteSite({ no });
      flash();
    } catch (e) {
      alert("Gagal menghapus: " + (e instanceof Error ? e.message : "Error"));
    }
  }

  async function handleSaveEdit() {
    if (editId === null) return;
    try {
      await ensureDatabase();
      // Hanya field schema — jangan sebar _id/_creationTime dari dokumen Convex
      await updateSite({ no: editId, ...toSitePayload(form) });
      setEditId(null);
      flash();
    } catch (e) {
      console.error("Gagal simpan edit:", e);
      alert("Gagal menyimpan: " + (e instanceof Error ? e.message : "Cek console"));
    }
  }

  async function handleAdd() {
    try {
      await ensureDatabase();
      await addSite(toSitePayload(form));
      setIsAdding(false);
      setForm(emptyForm);
      flash();
    } catch (e) {
      console.error("Gagal tambah:", e);
      alert("Gagal menambah: " + (e instanceof Error ? e.message : "Cek console"));
    }
  }

  function flash() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (view === "map") {
    return (
      <div className="fixed inset-0 z-[400]">
        <AbrasionMap
          onClose={() => setView("table")}
          editable
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl text-gray-900">Data Abrasi Pantai</h1>
          <p className="text-sm text-gray-500">{sites.length} lokasi · Jawa Timur</p>
        </div>
        <div className="flex items-center gap-2">
          {seeding && (
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-lg">
              Menyimpan data awal…
            </span>
          )}
          {saved && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg">
              ✓ Tersimpan
            </span>
          )}
          <button
            onClick={() => setView("map")}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700"
          >
            <MapIcon className="w-4 h-4" /> Peta Interaktif
          </button>
          {!convexSites?.length && (
            <button
              onClick={ensureDatabase}
              disabled={seeding}
              className="text-xs text-emerald-600 hover:text-emerald-700 px-3 py-1.5 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors disabled:opacity-50"
            >
              Simpan ke Database
            </button>
          )}
          <button onClick={() => { setIsAdding(true); setEditId(null); setForm(emptyForm); }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600">
            <Plus className="w-4 h-4" /> Tambah Lokasi
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {(["Semua", "Tinggi", "Sedang", "Rendah–Sedang"] as const).map((f) => (
          <button key={f} onClick={() => setFilterPrioritas(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
              filterPrioritas === f
                ? f === "Tinggi" ? "bg-red-100 text-red-700 border-red-100"
                  : f === "Sedang" ? "bg-amber-100 text-amber-700 border-amber-100"
                  : f === "Rendah–Sedang" ? "bg-blue-100 text-blue-700 border-blue-100"
                  : "bg-gray-800 text-white border-gray-800"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
            }`}>
            {f}
          </button>
        ))}
      </div>

      {isAdding && (
        <EditForm key="add-form" form={form} setForm={setForm} onSave={handleAdd} onCancel={() => setIsAdding(false)} />
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-3 font-semibold">#</th>
              <th className="px-4 py-3 font-semibold">Nama Pantai</th>
              <th className="px-4 py-3 font-semibold hidden sm:table-cell">Kecamatan/Kab</th>
              <th className="px-4 py-3 font-semibold">Prioritas</th>
              <th className="px-4 py-3 font-semibold hidden md:table-cell">Substrat</th>
              <th className="px-4 py-3 font-semibold hidden md:table-cell">Luasan</th>
              <th className="px-4 py-3 font-semibold hidden lg:table-cell">Koordinat</th>
              <th className="px-4 py-3 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((site) => {
              const cfg = PRIORITAS_CONFIG[site.prioritas as PrioritasType];
              if (!cfg) return null;
              const isExpanded = expandedId === site.no;
              return (
                <Fragment key={site.no}>
                  <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{site.no}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setExpandedId(isExpanded ? null : site.no)}
                        className="font-semibold text-gray-800 flex items-center gap-1 hover:text-emerald-700 text-left">
                        {site.namaPantai}
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{site.kecamatanKab}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.bg} ${cfg.text}`}>
                        {site.prioritas}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{site.substrat}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{site.luasan}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs font-mono text-gray-400">{site.lat}, {site.lng}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleEdit(site)}
                          aria-label={`Edit data abrasi ${site.namaPantai}`}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(site.no)}
                          aria-label={`Hapus data abrasi ${site.namaPantai}`}
                          className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr key={`${site.no}-exp`} className="bg-gray-50/50">
                      <td colSpan={8} className="px-4 pb-3 pt-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-600 pt-2">
                          <div>
                            <span className="font-semibold text-gray-500 block mb-0.5">Indikasi Abrasi</span>
                            {site.indikasiAbrasi}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-500 block mb-0.5">Kondisi Sesudah</span>
                            {site.kondisiSesudah}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-500 block mb-0.5">Koordinat</span>
                            {site.lat}, {site.lng}
                          </div>
                          <div>
                            <span className="font-semibold text-emerald-600 block mb-0.5">Tanaman Rekomendasi</span>
                            <ul className="space-y-0.5">
                              {site.tanamanRekomendasi.map((t, i) => (
                                <li key={i} className="flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />{t}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}

                  {editId === site.no && (
                    <tr key={`${site.no}-edit`}>
                      <td colSpan={8} className="px-4 py-3">
                        <EditForm key="edit-form" form={form} setForm={setForm} onSave={handleSaveEdit} onCancel={() => setEditId(null)} />
                      </td>
                    </tr>
                  )}
                </Fragment> 
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-8 text-center text-gray-400 text-sm">Tidak ada data.</div>
        )}
      </div>

      <div className="text-xs text-gray-400 flex items-center gap-1.5">
        <AlertTriangle className="w-3.5 h-3.5" />
        Data tersimpan di database dan sinkron real-time ke semua perangkat.
      </div>
    </div>
  );
}
