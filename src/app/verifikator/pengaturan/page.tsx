"use client";

import { useEffect, useState } from "react";
import { getSession } from "@/lib/auth";

export default function VerifikatorPengaturanPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const s = getSession();
    if (s) { setName(s.name); setEmail(s.email); }
  }, []);

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="font-bold text-xl text-gray-900">Pengaturan</h1>
        <p className="text-sm text-gray-500">Informasi akun verifikator.</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1">Nama</label>
          <p className="text-sm font-semibold text-gray-900">{name || "—"}</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1">Email</label>
          <p className="text-sm text-gray-700">{email || "—"}</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1">Role</label>
          <span className="text-xs font-bold px-2.5 py-1 bg-teal-100 text-teal-700 rounded-full">Verifikator</span>
        </div>
      </div>
    </div>
  );
}
