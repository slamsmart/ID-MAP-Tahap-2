"use client";

import { useState, useEffect, useRef } from "react";
import { ImageIcon, Upload, Trash2, Eye } from "lucide-react";
import { 
  saveHeroImage, getHeroImage, clearHeroImage,
  saveAuthBgImage, getAuthBgImage, clearAuthBgImage 
} from "@/lib/heroImageStore";

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1763442363212-ac4e39b9b91e?w=2400&q=90&auto=format&fit=crop";

export default function AdminHeaderPage() {
  const [currentImage, setCurrentImage] = useState(DEFAULT_IMAGE);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth BG State
  const [authImage, setAuthImage] = useState(DEFAULT_IMAGE);
  const [authPreviewImage, setAuthPreviewImage] = useState<string | null>(null);
  const [authSaved, setAuthSaved] = useState(false);
  const [authUploading, setAuthUploading] = useState(false);
  const authFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getHeroImage().then((img) => {
      if (img) setCurrentImage(img);
    });
    getAuthBgImage().then((img) => {
      if (img) setAuthImage(img);
    });
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar (PNG, JPG, WEBP)");
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPreviewImage(dataUrl);
      setUploading(false);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    if (previewImage) {
      await saveHeroImage(previewImage);
      setCurrentImage(previewImage);
      setPreviewImage(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleReset = async () => {
    await clearHeroImage();
    setCurrentImage(DEFAULT_IMAGE);
    setPreviewImage(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleUrlInput = () => {
    const url = prompt("Masukkan URL gambar (https://...)");
    if (url && url.startsWith("http")) {
      setPreviewImage(url);
    }
  };

  // ─── Auth Background Handlers ─────────────────────────────────────────────

  const handleAuthFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar (PNG, JPG, WEBP)");
      return;
    }
    setAuthUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setAuthPreviewImage(dataUrl);
      setAuthUploading(false);
    };
    reader.readAsDataURL(file);
    if (authFileInputRef.current) authFileInputRef.current.value = "";
  };

  const handleAuthSave = async () => {
    if (authPreviewImage) {
      await saveAuthBgImage(authPreviewImage);
      setAuthImage(authPreviewImage);
      setAuthPreviewImage(null);
      setAuthSaved(true);
      setTimeout(() => setAuthSaved(false), 3000);
    }
  };

  const handleAuthReset = async () => {
    await clearAuthBgImage();
    setAuthImage(DEFAULT_IMAGE);
    setAuthPreviewImage(null);
    setAuthSaved(true);
    setTimeout(() => setAuthSaved(false), 3000);
  };

  const handleAuthUrlInput = () => {
    const url = prompt("Masukkan URL gambar (https://...)");
    if (url && url.startsWith("http")) {
      setAuthPreviewImage(url);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Header Image</h1>
        <p className="text-sm text-gray-500 mt-1">
          Ganti gambar hero/header di halaman landing page. Tidak ada batasan jumlah ganti atau ukuran file.
        </p>
      </div>

      {saved && (
        <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-lg text-sm font-medium">
          Header image berhasil diperbarui! Refresh landing page untuk melihat perubahan.
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Eye className="w-4 h-4 text-gray-500" />
          Gambar Saat Ini
        </h3>
        <div className="rounded-xl overflow-hidden border border-gray-200 aspect-[21/9] relative bg-gray-100">
          <img
            src={currentImage}
            alt="Current hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f3d2e]/70 to-transparent flex items-end p-4 sm:p-6">
            <p className="text-white text-sm font-medium">Hero header aktif di landing page</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Upload className="w-4 h-4 text-gray-500" />
          Ganti Gambar
        </h3>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-gray-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50/50 transition cursor-pointer"
          >
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900">Upload dari Komputer</p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP - tanpa batas ukuran</p>
            </div>
          </button>

          <button
            onClick={handleUrlInput}
            className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition cursor-pointer"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900">Input URL Gambar</p>
              <p className="text-xs text-gray-500 mt-1">Masukkan link gambar dari internet</p>
            </div>
          </button>
        </div>

        {uploading && (
          <div className="text-center py-4 text-sm text-gray-500">Memproses gambar...</div>
        )}

        {previewImage && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Preview Gambar Baru</h4>
            <div className="rounded-xl overflow-hidden border border-emerald-200 aspect-[21/9] relative bg-gray-100">
              <img
                src={previewImage}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0f3d2e]/70 to-transparent flex items-end p-4 sm:p-6">
                <p className="text-white text-sm font-medium">Preview - belum disimpan</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="px-6 py-2.5 bg-emerald-900 text-white text-sm font-semibold rounded-lg hover:bg-emerald-800 transition"
              >
                Simpan &amp; Terapkan
              </button>
              <button
                onClick={() => setPreviewImage(null)}
                className="px-6 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6">
        <h3 className="font-semibold text-gray-900 mb-2">Reset ke Default</h3>
        <p className="text-sm text-gray-500 mb-4">
          Kembalikan gambar header ke gambar mangrove default
        </p>
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition"
        >
          <Trash2 className="w-4 h-4" />
          Reset ke Default
        </button>
      </div>

      <hr className="my-8 border-gray-200" />

      {/* ─── Auth Background Section ───────────────────────────────────────── */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Background Autentikasi</h1>
        <p className="text-sm text-gray-500 mt-1">
          Ganti gambar background untuk halaman Masuk (/masuk) dan Daftar Akun (/daftar).
        </p>
      </div>

      {authSaved && (
        <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-lg text-sm font-medium">
          Background autentikasi berhasil diperbarui!
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Eye className="w-4 h-4 text-gray-500" />
          Gambar Saat Ini
        </h3>
        <div className="rounded-xl overflow-hidden border border-gray-200 aspect-[21/9] relative bg-gray-100">
          <img
            src={authImage}
            alt="Current Auth BG"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Upload className="w-4 h-4 text-gray-500" />
          Ganti Gambar
        </h3>

        <input
          ref={authFileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAuthFileSelect}
          className="hidden"
        />

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <button
            onClick={() => authFileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-gray-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50/50 transition cursor-pointer"
          >
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900">Upload dari Komputer</p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP - tanpa batas ukuran</p>
            </div>
          </button>

          <button
            onClick={handleAuthUrlInput}
            className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition cursor-pointer"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900">Input URL Gambar</p>
              <p className="text-xs text-gray-500 mt-1">Masukkan link gambar dari internet</p>
            </div>
          </button>
        </div>

        {authUploading && (
          <div className="text-center py-4 text-sm text-gray-500">Memproses gambar...</div>
        )}

        {authPreviewImage && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Preview Gambar Baru</h4>
            <div className="rounded-xl overflow-hidden border border-emerald-200 aspect-[21/9] relative bg-gray-100">
              <img
                src={authPreviewImage}
                alt="Auth BG Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAuthSave}
                className="px-6 py-2.5 bg-emerald-900 text-white text-sm font-semibold rounded-lg hover:bg-emerald-800 transition"
              >
                Simpan &amp; Terapkan
              </button>
              <button
                onClick={() => setAuthPreviewImage(null)}
                className="px-6 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6 mb-10">
        <h3 className="font-semibold text-gray-900 mb-2">Reset ke Default</h3>
        <p className="text-sm text-gray-500 mb-4">
          Kembalikan gambar background autentikasi ke gambar mangrove default
        </p>
        <button
          onClick={handleAuthReset}
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition"
        >
          <Trash2 className="w-4 h-4" />
          Reset ke Default
        </button>
      </div>

    </div>
  );
}
