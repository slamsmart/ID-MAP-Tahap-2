"use client";

import { useState } from "react";
import { DATA_POKMASWAS, KABKOTA_WARNA, type DataPokmaswas } from "@/lib/pokmaswasData";
import { Plus, Pencil, Trash2, Save, X, AlertTriangle, Phone, MapPin } from "lucide-react";

const STORAGE_KEY = "idmap_pokmaswas_override";

function loadData(): DataPokmaswas[] {
  if (typeof window === "undefined") return DATA_POKMASWAS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DATA_POKMASWAS;
  } catch {
    return DATA_POKMASWAS;
  }
}

function saveData(data: DataPokmaswas[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const emptyForm: Omit<DataPokmaswas, "no"> = {
  kabKota: "Kab. Malang",
  namaKelompok: "",
  alamat: "",
  desa: "",
  kecamatan: "",
  ketua: "",
  noHp: "",
  lat: 0,
  lon: 0,
};

function EditForm({
  form,
  setForm,
  onSave,
  onCancel,
}: {
  form: Omit<DataPokmaswas, "no">;
  setForm: React.Dispatch<React.SetStateAction<Omit<DataPokmaswas, "no">>>;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">Kab/Kota</label>
          <select
            value={form.kabKota}
            onChange={(e) => setForm({ ...form, kabKota: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            {Object.keys(KABKOTA_WARNA).map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">Nama Kelompok</label>
          <input
            value={form.namaKelompok}
            onChange={(e) => setForm({ ...form, namaKelompok: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            placeholder="Nama kelompok"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">Desa</label>
          <input
            value={form.desa}
            onChange={(e) => setForm({ ...form, desa: e.target.value, alamat: `${e.target.value}, ${form.kecamatan}` })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            placeholder="Nama desa"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">Kecamatan</label>
          <input
            value={form.kecamatan}
            onChange={(e) => setForm({ ...form, kecamatan: e.target.value, alamat: `${form.desa}, ${e.target.value}` })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            placeholder="Kecamatan"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">Ketua</label>
          <input
            value={form.ketua}
            onChange={(e) => setForm({ ...form, ketua: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            placeholder="Nama ketua"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">No. HP</label>
          <input
            value={form.noHp}
            onChange={(e) => setForm({ ...form, noHp: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            placeholder="62 812-xxxx-xxxx"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">Latitude</label>
          <input
            type="number"
            value={form.lat}
            onChange={(e) => setForm({ ...form, lat: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            step="0.0001"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">Longitude</label>
          <input
            type="number"
            value={form.lon}
            onChange={(e) => setForm({ ...form, lon: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            step="0.0001"
          />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onSave}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700"
        >
          <Save className="w-3.5 h-3.5" /> Simpan
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200"
        >
          <X className="w-3.5 h-3.5" /> Batal
        </button>
      </div>
    </div>
  );
}

export default function KelolaPokmaswasPage() {
  const [data, setData] = useState<DataPokmaswas[]>(loadData);
  const [editNo, setEditNo] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<Omit<DataPokmaswas, "no">>(emptyForm);
  const [filterKab, setFilterKab] = useState<string>("Semua");
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState(false);

  const kabList = ["Semua", ...Array.from(new Set(data.map((d) => d.kabKota)))];
  const filtered = data.filter((d) => {
    const matchKab = filterKab === "Semua" || d.kabKota === filterKab;
    const q = search.toLowerCase();
    const matchSearch = !q || d.namaKelompok.toLowerCase().includes(q) || d.ketua.toLowerCase().includes(q);
    return matchKab && matchSearch;
  });

  function flash() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleEdit(item: DataPokmaswas) {
    setEditNo(item.no);
    setIsAdding(false);
    const { no: _no, ...rest } = item;
    setForm(rest);
  }

  function handleDelete(no: number) {
    if (!confirm("Hapus data Pokmaswas ini?")) return;
    const updated = data.filter((d) => d.no !== no);
    setData(updated);
    saveData(updated);
    flash();
  }

  function handleSaveEdit() {
    const updated = data.map((d) => d.no === editNo ? { ...form, no: editNo! } : d);
    setData(updated);
    saveData(updated);
    setEditNo(null);
    flash();
  }

  function handleAdd() {
    const newNo = Math.max(0, ...data.map((d) => d.no)) + 1;
    const updated = [...data, { ...form, no: newNo }];
    setData(updated);
    saveData(updated);
    setIsAdding(false);
    setForm(emptyForm);
    flash();
  }

  function handleReset() {
    if (!confirm("Reset ke data awal?")) return;
    localStorage.removeItem(STORAGE_KEY);
    setData(DATA_POKMASWAS);
    flash();
  }


  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl text-gray-900">Data Pokmaswas</h1>
          <p className="text-sm text-gray-500">
            {data.length} kelompok · {Array.from(new Set(data.map((d) => d.kabKota))).length} kab/kota · Jawa Timur
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
              ✓ Tersimpan
            </span>
          )}
          <button
            onClick={handleReset}
            className="text-xs text-gray-500 hover:text-red-600 px-3 py-1.5 border border-gray-200 rounded-lg hover:border-red-200 transition-colors"
          >
            Reset Data
          </button>
          <button
            onClick={() => { setIsAdding(true); setEditNo(null); setForm(emptyForm); }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white text-sm font-semibold rounded-lg hover:bg-emerald-600"
          >
            <Plus className="w-4 h-4" /> Tambah Kelompok
          </button>
        </div>
      </div>

      {/* Filter + Search */}
      <div className="flex flex-wrap items-center gap-2">
        {kabList.map((kab) => {
          const warna = KABKOTA_WARNA[kab] ?? "#6b7280";
          return (
            <button
              key={kab}
              onClick={() => setFilterKab(kab)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                filterKab === kab
                  ? kab === "Semua"
                    ? "bg-gray-800 text-white border-gray-800"
                    : "text-white border-transparent"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
              }`}
              style={filterKab === kab && kab !== "Semua" ? { backgroundColor: warna, borderColor: warna } : {}}
            >
              {kab}
            </button>
          );
        })}
        <input
          type="text"
          placeholder="Cari kelompok / ketua..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ml-auto px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400 w-48"
        />
      </div>

      {/* Add form */}
      {isAdding && (
        <EditForm form={form} setForm={setForm} onSave={handleAdd} onCancel={() => setIsAdding(false)} />
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-xs text-gray-400 font-semibold px-4 py-3 w-8">#</th>
                <th className="text-left text-xs text-gray-400 font-semibold px-3 py-3 hidden sm:table-cell">Kab/Kota</th>
                <th className="text-left text-xs text-gray-400 font-semibold px-3 py-3">Nama Kelompok</th>
                <th className="text-left text-xs text-gray-400 font-semibold px-3 py-3 hidden md:table-cell">Alamat</th>
                <th className="text-left text-xs text-gray-400 font-semibold px-3 py-3">Ketua</th>
                <th className="text-left text-xs text-gray-400 font-semibold px-3 py-3 hidden lg:table-cell">No. HP</th>
                <th className="text-left text-xs text-gray-400 font-semibold px-3 py-3 hidden md:table-cell">Koordinat</th>
                <th className="text-left text-xs text-gray-400 font-semibold px-3 py-3 w-16">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const warna = KABKOTA_WARNA[item.kabKota] ?? "#6b7280";
                if (editNo === item.no) {
                  return (
                    <tr key={item.no}>
                      <td colSpan={8} className="px-4 py-3">
                        <EditForm form={form} setForm={setForm} onSave={handleSaveEdit} onCancel={() => setEditNo(null)} />
                      </td>
                    </tr>
                  );
                }
                return (
                  <tr key={item.no} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-gray-400 font-mono">{item.no}</td>
                    <td className="px-3 py-3 hidden sm:table-cell">
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: warna, color: "white" }}
                      >
                        {item.kabKota}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base">👤</span>
                        <span className="font-medium text-gray-800">{item.namaKelompok}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        {item.alamat}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-700">{item.ketua}</td>
                    <td className="px-3 py-3 hidden lg:table-cell">
                      {item.noHp ? (
                        <div className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                          <Phone className="w-3 h-3 flex-shrink-0" />
                          {item.noHp}
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell">
                      <span className="text-xs font-mono text-gray-400">{item.lat}, {item.lon}</span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.no)}
                          className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-8 text-center text-gray-400 text-sm">Tidak ada data.</div>
          )}
        </div>
        <div className="px-4 py-3 border-t border-gray-50 text-xs text-gray-400">
          Menampilkan {filtered.length} dari {data.length} kelompok
        </div>
      </div>

      <div className="text-xs text-gray-400 flex items-center gap-1.5">
        <AlertTriangle className="w-3.5 h-3.5" />
        Perubahan disimpan di browser ini. Untuk sinkronisasi ke semua perangkat, hubungi admin.
      </div>
    </div>
  );
}
