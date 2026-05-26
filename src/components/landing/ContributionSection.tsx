"use client";

import {
  ArrowRight,
  Building2,
  Users,
} from "lucide-react";

const communitySteps = [
  { label: "Scan QRIS", sublabel: "Dukung Proyek", num: "1" },
  { label: "Dana Terkumpul", sublabel: "Disalurkan", num: "2" },
  { label: "Proyek Karbon", sublabel: "di Lapangan", num: "3" },
  { label: "Terintegrasi SRN", sublabel: "(Registrasi)", num: "4" },
  { label: "Dampak Nyata", sublabel: "untuk Lingkungan", num: "5" },
];

const corporateSteps = [
  { label: "Pilih Proyek", sublabel: "Terverifikasi", num: "1" },
  { label: "Beli Carbon Credit", sublabel: "di ID-MAP", num: "2" },
  { label: "Klaim & Manfaat", sublabel: "Carbon Credit", num: "3" },
  { label: "Hitung & Penuhi", sublabel: "Kewajiban Emisi", num: "4" },
  { label: "Laporan ESG", sublabel: "Perusahaan", num: "5" },
];

export default function ContributionSection() {
  return (
    <div>
      <h2 className="font-display font-bold text-2xl md:text-3xl text-emerald-900 mb-8">
        Dua Cara Mudah Berkontribusi
      </h2>

      <div className="space-y-6">
        {/* Community Flow */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
            <div className="flex items-center gap-3 min-w-fit">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <p className="font-display font-bold text-emerald-900 text-sm">
                  Untuk Komunitas
                </p>
                <p className="text-xs text-gray-500">Dukung via QRIS</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 md:gap-3 flex-1">
              {communitySteps.map((step, i) => (
                <div key={step.num} className="flex items-center gap-2">
                  <div className="flex flex-col items-center text-center w-16">
                    <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mb-1">
                      <span className="font-display font-bold text-emerald-700 text-xs">
                        {step.num}
                      </span>
                    </div>
                    <p className="text-[10px] font-medium text-gray-700 leading-tight">
                      {step.label}
                    </p>
                    <p className="text-[9px] text-gray-400">{step.sublabel}</p>
                  </div>
                  {i < communitySteps.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-gray-300 hidden md:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Corporate Flow */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
            <div className="flex items-center gap-3 min-w-fit">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <p className="font-display font-bold text-emerald-900 text-sm">
                  Untuk Perusahaan
                </p>
                <p className="text-xs text-gray-500">
                  Beli & Klaim Carbon Credit
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 md:gap-3 flex-1">
              {corporateSteps.map((step, i) => (
                <div key={step.num} className="flex items-center gap-2">
                  <div className="flex flex-col items-center text-center w-16">
                    <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mb-1">
                      <span className="font-display font-bold text-emerald-700 text-xs">
                        {step.num}
                      </span>
                    </div>
                    <p className="text-[10px] font-medium text-gray-700 leading-tight">
                      {step.label}
                    </p>
                    <p className="text-[9px] text-gray-400">{step.sublabel}</p>
                  </div>
                  {i < corporateSteps.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-gray-300 hidden md:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
