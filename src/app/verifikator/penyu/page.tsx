"use client";

import { useEffect, useState } from "react";
import { TITIK_PENDARATAN_PENYU, PENYU_WARNA, type TitikPenyu } from "@/lib/penyuData";
import { Plus, Pencil, Trash2, Save, X, AlertTriangle } from "lucide-react";

const STORAGE_KEY = "idmap_penyu_override";

function loadData(): TitikPenyu[] {
  if (typeof window === "undefined") return TITIK_PENDARATAN_PENYU;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : TITIK_PENDARATAN_PENYU;
  } catch {
    return TITIK_PENDARATAN_PENYU;
  }
}

function saveData(data: TitikPenyu[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const emptyForm: Omit<TitikPenyu, "id"> = {
  namaIkon: "Penyu Hijau",
  pantai: "",
  noSarang: 1,
  lat: 0,
  lon: 0,
  jenisPenyu: "Penyu Hijau (Chelonia mydas)",
  statusPerlindungan: "dilindungi",
  ancaman: [""],
  tanggalSurvei: "",
  catatan: "",
};

export default function KelolaPenyuPage() {
  const [data, setData] = useState<TitikPenyu[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<Omit<TitikPenyu, "id">>(emptyForm);
  const [filterPantai, setFilterPantai] = useState<string>("Semua");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setData(loadData());
  }, []);

  const pantaiList = ["Semua", ...Array.from(new Set(data.map((t) => t.pantai)))];
  const filtered = filterPantai === "Semua" ? data : data.filter((t) => t.pantai === filterPantai);

  function flash() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleEdit(titik: TitikPenyu) {
    setEditId(titik.id);
    setIsAdding(false);
    setForm({ ...titik });
  }

  function handleDelete(id: string) {
    if (!confirm("Hapus titik sarang ini?")) return;
    const updated = data.filter((t) => t.id !== id);
    setData(updated);
    saveData(updated);
    flash();
  }

  function handleSaveEdit() {
    const updated = data.map((t) => t.id === editId ? { ...form, id: editId } : t);
    setData(updated);
    saveData(updated);
    setEditId(null);
    flash();
  }

  function handleAdd() {
    const newId = `MANUAL-${Date.now()}`;
    const updated = [...data, { ...form, id: newId }];
    setData(updated);
    saveData(updated);
    setIsAdding(false);
    setForm(emptyForm);
    flash();
  }

  function handleReset() {
    if (!confirm("Reset ke data awal?")) return;
    localStorage.removeItem(STORAGE_KEY);
    setData(TITIK_PENDARATAN_PENYU);
    flash();
  }

  function updateAncaman(idx: number, val: string) {
    const arr = [...form.ancaman];
    arr[idx] = val;
    setForm({ ...form, ancaman: arr });
  }

  const EditForm = ({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) => (
    <div className="bg-emerald-50 border border-teal-200 rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">Nama Pantai</label>
          <input value={form.pantai} onChange={(e) => setForm({ ...form, pantai: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Nama pantai" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">No. Sarang</label>
          <input type="number" value={form.noSarang} onChange={(e) => setForm({ ...form, noSarang: parseInt(e.target.value) || 1 })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" min={1} />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">Jenis Penyu</label>
          <select value={form.namaIkon} onChange={(e) => setForm({ ...form, namaIkon: e.target.value,
              jenisPenyu: e.target.value === "Penyu Hijau" ? "Penyu Hijau (Chelonia mydas)"
                : e.target.value === "Penyu Lekang" ? "Penyu Lekang (Lepidochelys olivacea)"
                : form.jenisPenyu })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="Penyu Hijau">Penyu Hijau</option>
            <option value="Penyu Lekang">Penyu Lekang</option>
            <option value="Penyu Belimbing">Penyu Belimbing</option>
            <option value="Penyu Sisik">Penyu Sisik</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">Tanggal Survei</label>
          <input value={form.tanggalSurvei} onChange={(e) => setForm({ ...form, tanggalSurvei: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="DD/MM/YYYY" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">Latitude</label>
          <input type="number" value={form.lat} onChange={(e) => setForm({ ...form, lat: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" step="0.000001" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">Longitude</label>
          <input type="number" value={form.lon} onChange={(e) => setForm({ ...form, lon: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" step="0.000001" />
        </div>
        <div className="col-span-2">
          <label className="text-xs font-semibold text-gray-600 block mb-1">Catatan</label>
          <input value={form.catatan ?? ""} onChange={(e) => setForm({ ...form, catatan: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Opsional" />
        </div>
      </div>

      {/* Ancaman */}
      <div>
        <label className="text-xs font-semibold text-gray-600 block mb-1">Ancaman</label>
        {form.ancaman.map((a, i) => (
          <div key={i} className="flex gap-2 mb-1.5">
            <input value={a} onChange={(e) => updateAncaman(i, e.target.value)}
              className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm" placeholder={`Ancaman ${i + 1}`} />
            <button onClick={() => setForm({ ...form, ancaman: form.ancaman.filter((_, j) => j !== i) })}
              className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        <button onClick={() => setForm({ ...form, ancaman: [...form.ancaman, ""] })}
          className="text-xs text-emerald-600 font-semibold flex items-center gap-1 hover:text-emerald-700">
          <Plus className="w-3.5 h-3.5" /> Tambah Ancaman
        </button>
      </div>

      <div className="flex gap-2 pt-1">
        <button onClick={onSave} className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700">
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
          <h1 className="font-bold text-xl text-gray-900">Titik Pendaratan Penyu</h1>
          <p className="text-sm text-gray-500">{data.length} sarang · {Array.from(new Set(data.map(t => t.pantai))).length} pantai</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg">
              ✓ Tersimpan
            </span>
          )}
          <button onClick={handleReset} className="text-xs text-gray-500 hover:text-red-600 px-3 py-1.5 border border-gray-200 rounded-lg hover:border-red-100 transition-colors">
            Reset Data
          </button>
          <button onClick={() => { setIsAdding(true); setEditId(null); setForm(emptyForm); }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white text-sm font-semibold rounded-lg hover:bg-teal-600">
            <Plus className="w-4 h-4" /> Tambah Sarang
          </button>
        </div>
      </div>

      {/* Filter pantai */}
      <div className="flex flex-wrap items-center gap-2">
        {pantaiList.map((p) => {
          const jenis = data.find((t) => t.pantai === p)?.namaIkon ?? "";
          const warna = PENYU_WARNA[jenis] ?? "#6b7280";
          return (
            <button key={p} onClick={() => setFilterPantai(p)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                filterPantai === p
                  ? p === "Semua" ? "bg-gray-800 text-white border-gray-800" : "text-white border-transparent"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
              }`}
              style={filterPantai === p && p !== "Semua" ? { backgroundColor: warna, borderColor: warna } : {}}>
              {p === "Semua" ? "Semua" : p.replace("Pantai ", "")}
            </button>
          );
        })}
      </div>

      {/* Add form */}
      {isAdding && (
        <EditForm onSave={handleAdd} onCancel={() => setIsAdding(false)} />
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((titik) => {
          const warna = PENYU_WARNA[titik.namaIkon] ?? "#6b7280";
          return (
            <div key={titik.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {editId === titik.id ? (
                <div className="p-4">
                  <EditForm onSave={handleSaveEdit} onCancel={() => setEditId(null)} />
                </div>
              ) : (
                <>
                  <div className="h-2" style={{ backgroundColor: warna }} />
                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🐢</span>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{titik.pantai}</p>
                          <p className="text-[10px] font-semibold" style={{ color: warna }}>
                            Sarang #{titik.noSarang} · {titik.namaIkon}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => handleEdit(titik)}
                          aria-label={`Edit titik pendaratan penyu ${titik.pantai}`}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(titik.id)}
                          aria-label={`Hapus titik pendaratan penyu ${titik.pantai}`}
                          className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 italic">{titik.jenisPenyu}</p>

                    {titik.catatan && (
                      <p className="text-xs text-gray-600 bg-gray-50 rounded-lg px-2 py-1.5">{titik.catatan}</p>
                    )}

                    <div className="flex flex-wrap gap-1">
                      {titik.ancaman.map((a) => (
                        <span key={a} className="text-[10px] px-1.5 py-0.5 bg-orange-50 text-orange-700 rounded font-medium">{a}</span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-gray-50">
                      <span>{titik.lat.toFixed(6)}, {titik.lon.toFixed(6)}</span>
                      <span>Survei: {titik.tanggalSurvei}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-8 text-center text-gray-400 text-sm">Tidak ada data.</div>
      )}

      <div className="text-xs text-gray-400 flex items-center gap-1.5">
        <AlertTriangle className="w-3.5 h-3.5" />
        Perubahan disimpan di browser ini. Untuk sinkronisasi ke semua perangkat, hubungi admin.
      </div>
    </div>
  );
}
