"use client";

import { useEffect, useState } from "react";
import { ABRASION_SITES, PRIORITAS_CONFIG, type AbrasionSite, type PrioritasType } from "@/lib/abrasionData";
import { Plus, Pencil, Trash2, Save, X, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";

const STORAGE_KEY = "idmap_abrasi_override";

function loadSites(): AbrasionSite[] {
  if (typeof window === "undefined") return ABRASION_SITES;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : ABRASION_SITES;
  } catch {
    return ABRASION_SITES;
  }
}

function saveSites(sites: AbrasionSite[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sites));
}

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

export default function KelolaAbrasiPage() {
  const [sites, setSites] = useState<AbrasionSite[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<Omit<AbrasionSite, "no">>(emptyForm);
  const [filterPrioritas, setFilterPrioritas] = useState<PrioritasType | "Semua">("Semua");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSites(loadSites());
  }, []);

  const filtered = filterPrioritas === "Semua" ? sites : sites.filter((s) => s.prioritas === filterPrioritas);

  function handleEdit(site: AbrasionSite) {
    setEditId(site.no);
    setIsAdding(false);
    setForm({ ...site });
  }

  function handleDelete(no: number) {
    if (!confirm("Hapus lokasi ini?")) return;
    const updated = sites.filter((s) => s.no !== no).map((s, i) => ({ ...s, no: i + 1 }));
    setSites(updated);
    saveSites(updated);
    flash();
  }

  function handleSaveEdit() {
    const updated = sites.map((s) => s.no === editId ? { ...form, no: editId } : s);
    setSites(updated);
    saveSites(updated);
    setEditId(null);
    flash();
  }

  function handleAdd() {
    const nextNo = sites.length > 0 ? Math.max(...sites.map((s) => s.no)) + 1 : 1;
    const updated = [...sites, { ...form, no: nextNo }];
    setSites(updated);
    saveSites(updated);
    setIsAdding(false);
    setForm(emptyForm);
    flash();
  }

  function handleReset() {
    if (!confirm("Reset ke data awal? Semua perubahan akan hilang.")) return;
    localStorage.removeItem(STORAGE_KEY);
    setSites(ABRASION_SITES);
    flash();
  }

  function flash() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function updateTanaman(idx: number, val: string) {
    const arr = [...form.tanamanRekomendasi];
    arr[idx] = val;
    setForm({ ...form, tanamanRekomendasi: arr });
  }

  function addTanaman() {
    setForm({ ...form, tanamanRekomendasi: [...form.tanamanRekomendasi, ""] });
  }

  function removeTanaman(idx: number) {
    setForm({ ...form, tanamanRekomendasi: form.tanamanRekomendasi.filter((_, i) => i !== idx) });
  }

  const EditForm = ({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) => (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">Nama Pantai</label>
          <input value={form.namaPantai} onChange={(e) => setForm({ ...form, namaPantai: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Nama pantai" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">Kecamatan/Kab</label>
          <input value={form.kecamatanKab} onChange={(e) => setForm({ ...form, kecamatanKab: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Kecamatan, Kab." />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">Indikasi Abrasi</label>
          <input value={form.indikasiAbrasi} onChange={(e) => setForm({ ...form, indikasiAbrasi: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Keterangan abrasi" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">Kondisi Sesudah</label>
          <input value={form.kondisiSesudah} onChange={(e) => setForm({ ...form, kondisiSesudah: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">Prioritas</label>
          <select value={form.prioritas} onChange={(e) => setForm({ ...form, prioritas: e.target.value as PrioritasType })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="Tinggi">Tinggi</option>
            <option value="Sedang">Sedang</option>
            <option value="Rendah–Sedang">Rendah–Sedang</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">Substrat</label>
          <select value={form.substrat} onChange={(e) => setForm({ ...form, substrat: e.target.value as AbrasionSite["substrat"] })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="Pasir">Pasir</option>
            <option value="Lumpur">Lumpur</option>
            <option value="Campuran">Campuran</option>
            <option value="Berbatu">Berbatu</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">Luasan</label>
          <input value={form.luasan} onChange={(e) => setForm({ ...form, luasan: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="misal: 50–100 ha" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Lat</label>
            <input type="number" value={form.lat} onChange={(e) => setForm({ ...form, lat: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" step="0.0001" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Lng</label>
            <input type="number" value={form.lng} onChange={(e) => setForm({ ...form, lng: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" step="0.0001" />
          </div>
        </div>
      </div>

      {/* Tanaman rekomendasi */}
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
        <button onClick={addTanaman} className="text-xs text-emerald-600 font-semibold flex items-center gap-1 hover:text-emerald-700">
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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl text-gray-900">Data Abrasi Pantai</h1>
          <p className="text-sm text-gray-500">{sites.length} lokasi · Jawa Timur</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
              ✓ Tersimpan
            </span>
          )}
          <button onClick={handleReset} className="text-xs text-gray-500 hover:text-red-600 px-3 py-1.5 border border-gray-200 rounded-lg hover:border-red-200 transition-colors">
            Reset Data
          </button>
          <button onClick={() => { setIsAdding(true); setEditId(null); setForm(emptyForm); }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600">
            <Plus className="w-4 h-4" /> Tambah Lokasi
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        {(["Semua", "Tinggi", "Sedang", "Rendah–Sedang"] as const).map((f) => (
          <button key={f} onClick={() => setFilterPrioritas(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
              filterPrioritas === f
                ? f === "Tinggi" ? "bg-red-100 text-red-700 border-red-200"
                  : f === "Sedang" ? "bg-amber-100 text-amber-700 border-amber-200"
                  : f === "Rendah–Sedang" ? "bg-blue-100 text-blue-700 border-blue-200"
                  : "bg-gray-800 text-white border-gray-800"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
            }`}>
            {f}
          </button>
        ))}
      </div>

      {/* Add form */}
      {isAdding && (
        <EditForm onSave={handleAdd} onCancel={() => setIsAdding(false)} />
      )}

      {/* Table */}
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
              <th className="px-4 py-3 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((site) => {
              const cfg = PRIORITAS_CONFIG[site.prioritas];
              const isExpanded = expandedId === site.no;
              return (
                <>
                  <tr key={site.no} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
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
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleEdit(site)}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(site.no)}
                          className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded row */}
                  {isExpanded && (
                    <tr key={`${site.no}-exp`} className="bg-gray-50/50">
                      <td colSpan={7} className="px-4 pb-3 pt-0">
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

                  {/* Edit form inline */}
                  {editId === site.no && (
                    <tr key={`${site.no}-edit`}>
                      <td colSpan={7} className="px-4 py-3">
                        <EditForm onSave={handleSaveEdit} onCancel={() => setEditId(null)} />
                      </td>
                    </tr>
                  )}
                </>
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
        Perubahan disimpan di browser ini. Untuk sinkronisasi ke semua perangkat, hubungi admin.
      </div>
    </div>
  );
}
