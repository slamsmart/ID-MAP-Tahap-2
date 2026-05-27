"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Check,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";

type FaqItem = {
  questionId: string;
  questionEn: string;
  answerId: string;
  answerEn: string;
};

type FaqForm = {
  heroTitleId: string;
  heroTitleEn: string;
  heroSubtitleId: string;
  heroSubtitleEn: string;
  items: FaqItem[];
};

const defaults: FaqForm = {
  heroTitleId: "Pertanyaan Umum (FAQ)",
  heroTitleEn: "Frequently Asked Questions (FAQ)",
  heroSubtitleId: "Jawaban untuk pertanyaan yang sering diajukan tentang ID-MAP",
  heroSubtitleEn: "Answers to common questions about ID-MAP",
  items: [
    { questionId: "Apa itu ID-MAP?", questionEn: "What is ID-MAP?", answerId: "", answerEn: "" },
  ],
};

export default function VerifikatorFaqPage() {
  const data = useQuery(api.faqContent.get);
  const updateFaq = useMutation(api.faqContent.update);

  const [form, setForm] = useState<FaqForm>(defaults);
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data && !hydrated) {
      setForm({
        heroTitleId: data.heroTitleId,
        heroTitleEn: data.heroTitleEn,
        heroSubtitleId: data.heroSubtitleId,
        heroSubtitleEn: data.heroSubtitleEn,
        items: data.items,
      });
      setHydrated(true);
    } else if (data === null && !hydrated) {
      setHydrated(true);
    }
  }, [data, hydrated]);

  function field<K extends keyof FaqForm>(key: K, value: FaqForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }
  function patchItem(idx: number, patch: Partial<FaqItem>) {
    setForm((f) => ({
      ...f,
      items: f.items.map((it, i) => (i === idx ? { ...it, ...patch } : it)),
    }));
  }
  function addItem() {
    setForm((f) => ({
      ...f,
      items: [...f.items, { questionId: "", questionEn: "", answerId: "", answerEn: "" }],
    }));
  }
  function removeItem(idx: number) {
    setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  }
  function moveItem(idx: number, dir: -1 | 1) {
    setForm((f) => {
      const next = [...f.items];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return f;
      [next[idx], next[target]] = [next[target], next[idx]];
      return { ...f, items: next };
    });
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await updateFaq(form);
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
        <h1 className="font-bold text-xl text-gray-900">Kelola Halaman FAQ</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Edit pertanyaan dan jawaban di halaman publik <code>/faq</code>. Setiap item dwibahasa ID/EN. Perubahan tampil real-time tanpa redeploy.
        </p>
      </div>

      <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700">
        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>Klik <strong>Tambah</strong> untuk pertanyaan baru, panah atas/bawah untuk mengatur urutan, atau <strong>ikon hapus</strong> untuk membuang item.</span>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="text" value={form.heroTitleId} onChange={(e) => field("heroTitleId", e.target.value)} placeholder="Judul ID" className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            <input type="text" value={form.heroTitleEn} onChange={(e) => field("heroTitleEn", e.target.value)} placeholder="Title EN" className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            <input type="text" value={form.heroSubtitleId} onChange={(e) => field("heroSubtitleId", e.target.value)} placeholder="Subjudul ID" className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            <input type="text" value={form.heroSubtitleEn} onChange={(e) => field("heroSubtitleEn", e.target.value)} placeholder="Subtitle EN" className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
          </div>
        </div>

        <div className="border-t border-gray-100" />

        {/* Items */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wider">
              Pertanyaan & Jawaban ({form.items.length})
            </h2>
            <button onClick={addItem} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-100 font-semibold">
              <Plus className="w-3 h-3" /> Tambah
            </button>
          </div>

          <div className="space-y-3">
            {form.items.map((it, idx) => (
              <div key={idx} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 bg-white px-2 py-1 rounded border border-gray-100">
                    #{idx + 1}
                  </span>
                  <div className="flex items-center gap-1 ml-auto">
                    <button
                      onClick={() => moveItem(idx, -1)}
                      disabled={idx === 0}
                      aria-label="Pindah ke atas"
                      className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveItem(idx, 1)}
                      disabled={idx === form.items.length - 1}
                      aria-label="Pindah ke bawah"
                      className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeItem(idx)}
                      aria-label="Hapus pertanyaan"
                      className="p-1 text-red-400 hover:text-red-600 ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Pertanyaan ID</label>
                    <input
                      type="text"
                      value={it.questionId}
                      onChange={(e) => patchItem(idx, { questionId: e.target.value })}
                      placeholder="Apa itu ID-MAP?"
                      className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Question EN</label>
                    <input
                      type="text"
                      value={it.questionEn}
                      onChange={(e) => patchItem(idx, { questionEn: e.target.value })}
                      placeholder="What is ID-MAP?"
                      className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Jawaban ID</label>
                    <textarea
                      rows={4}
                      value={it.answerId}
                      onChange={(e) => patchItem(idx, { answerId: e.target.value })}
                      placeholder="ID-MAP adalah..."
                      className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Answer EN</label>
                    <textarea
                      rows={4}
                      value={it.answerEn}
                      onChange={(e) => patchItem(idx, { answerEn: e.target.value })}
                      placeholder="ID-MAP is..."
                      className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
                    />
                  </div>
                </div>
              </div>
            ))}

            {form.items.length === 0 && (
              <div className="text-center text-sm text-gray-500 py-6">
                Belum ada pertanyaan. Klik <strong>Tambah</strong> untuk membuat item baru.
              </div>
            )}
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
            disabled={saving || !hydrated}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
}
