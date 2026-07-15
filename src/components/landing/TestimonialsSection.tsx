import {
  BadgeCheck,
  Building2,
  HeartHandshake,
  Quote,
  Sprout,
} from "lucide-react";
import ScrollReveal from "@/components/shared/ScrollReveal";

const testimonials = [
  {
    label: "Donasi QRIS",
    name: "Rani Wulandari",
    role: "Sahabat Pesisir, Surabaya",
    quote:
      "Setelah donasi lewat QRIS, saya bisa mengikuti proyek mangrove yang saya dukung dan melihat update dampaknya.",
    impact: "Donasi tercatat dan dampaknya mudah dipantau",
    Icon: HeartHandshake,
  },
  {
    label: "Pendanaan Mitra",
    name: "Pak Junaedi",
    role: "Ketua Pokmaswas, Banyuwangi",
    quote:
      "Program kami lebih mudah dikenalkan ke publik. Data lokasi, target tanam, dan kebutuhan pendanaan jadi lebih rapi.",
    impact: "Proyek lokal lebih siap menerima dukungan",
    Icon: Sprout,
  },
  {
    label: "Laporan CSR",
    name: "Nadia Prameswari",
    role: "CSR Manager, Jakarta",
    quote:
      "Tim kami lebih percaya karena proyeknya terverifikasi dan laporan dampaknya bisa dipakai untuk kebutuhan CSR.",
    impact: "Dukungan perusahaan lebih transparan",
    Icon: Building2,
  },
];

export default function TestimonialsSection() {
  return (
    <section className="bg-[#f6fbf7] py-14 font-sans sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <ScrollReveal className="mx-auto max-w-3xl text-center">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-700">
            <BadgeCheck className="h-3 w-3" />
            Cerita dari ekosistem
          </span>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-[#0f3d2e] sm:text-4xl">
            Cerita pengguna yang merasakan dampaknya
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Nama dan cerita berikut disusun sebagai contoh representatif dari
            donatur, mitra lapangan, dan perusahaan yang terlibat dalam program
            pesisir.
          </p>
        </ScrollReveal>

        <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-5 md:grid-cols-3">
          {testimonials.map((item, index) => {
            const Icon = item.Icon;

            return (
              <ScrollReveal key={item.name} delay={index * 100} className="h-full">
                <article className="flex h-full flex-col rounded-2xl border border-emerald-100 bg-white p-5 shadow-[0_24px_60px_-34px_rgba(15,61,46,0.45)] transition-colors duration-300 hover:border-emerald-200 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      <Icon className="h-3.5 w-3.5" />
                      {item.label}
                    </span>
                    <Quote className="h-5 w-5 text-emerald-200" />
                  </div>

                  <blockquote className="mt-5 flex-1 text-base font-medium leading-7 text-[#0f3d2e]">
                    &ldquo;{item.quote}&rdquo;
                  </blockquote>

                  <div className="mt-6 border-t border-emerald-100 pt-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {item.name}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {item.role}
                        </p>
                      </div>
                      <span className="h-10 w-10 shrink-0 rounded-full bg-[#0f3d2e] text-center text-sm font-bold leading-10 text-white">
                        {index + 1}
                      </span>
                    </div>
                    <p className="mt-4 rounded-xl bg-[#f1f8f3] px-3 py-2 text-xs font-medium text-emerald-800">
                      {item.impact}
                    </p>
                  </div>
                </article>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
