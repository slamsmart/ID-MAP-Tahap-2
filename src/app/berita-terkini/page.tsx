"use client";

import { useState, useEffect, useCallback } from "react";
import { Newspaper, ExternalLink, RefreshCw, Clock, Tag } from "lucide-react";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import ScrollReveal from "@/components/shared/ScrollReveal";

interface Article {
  title: string;
  link: string;
  pubDate: string;
  source: string;
}

const CATEGORIES: { label: string; color: string; pattern: RegExp }[] = [
  { label: "Kebijakan", color: "bg-purple-100 text-purple-700 border-purple-200", pattern: /kebijakan|peraturan|regulasi|pp\s?\d|undang|permenhut|permen|klhk|kkp/i },
  { label: "Rehabilitasi", color: "bg-emerald-100 text-emerald-700 border-emerald-200", pattern: /rehabilitasi|tanam|restorasi|penanaman|bibit|m4cr|brgm/i },
  { label: "Karbon Biru", color: "bg-blue-100 text-blue-700 border-blue-200", pattern: /karbon|carbon|emisi|ndc|blue carbon|renaksi|iklim/i },
  { label: "Abrasi & Bencana", color: "bg-orange-100 text-orange-700 border-orange-200", pattern: /abrasi|banjir|rob|erosi|gelombang|bencana/i },
  { label: "Komunitas", color: "bg-teal-100 text-teal-700 border-teal-200", pattern: /masyarakat|komunitas|pokmaswas|nelayan|petambak|pesisir/i },
];

function getCategory(title: string) {
  for (const cat of CATEGORIES) {
    if (cat.pattern.test(title)) return cat;
  }
  return { label: "Berita", color: "bg-gray-100 text-gray-600 border-gray-200" };
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric", month: "short", year: "numeric",
    });
  } catch { return ""; }
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse h-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="h-4 w-20 bg-gray-100 rounded-full" />
        <div className="h-3 w-16 bg-gray-100 rounded" />
      </div>
      <div className="space-y-2 flex-1">
        <div className="h-3.5 bg-gray-100 rounded w-full" />
        <div className="h-3.5 bg-gray-100 rounded w-5/6" />
        <div className="h-3.5 bg-gray-100 rounded w-4/6" />
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="h-3 w-24 bg-gray-100 rounded" />
        <div className="h-3 w-16 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

export default function BeritaTerkiniPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Semua");

  const fetchNews = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    setError(false);
    try {
      const res = await fetch("/api/berita-mangrove");
      if (!res.ok) throw new Error();
      const data: Article[] = await res.json();
      setArticles(data);
      setLastUpdated(new Date());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
    const interval = setInterval(() => fetchNews(), 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchNews]);

  const filters = ["Semua", ...CATEGORIES.map(c => c.label), "Berita"];
  const filtered = activeFilter === "Semua"
    ? articles
    : articles.filter(a => getCategory(a.title).label === activeFilter);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0f3d2e]">

        {/* Hero */}
        <section className="relative bg-[#0f3d2e] text-white overflow-hidden">
          <div className="relative max-w-5xl mx-auto px-6 py-20 text-center">
            <ScrollReveal>
              <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold tracking-widest uppercase bg-white/10 rounded-full mb-5 border border-white/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Realtime Update
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-4">
                Berita Terkini
                <br />
                <span className="text-white">Mangrove & Pesisir</span>
              </h1>
            </ScrollReveal>
          </div>
        </section>

        {/* Stats bar */}
        <section className="bg-white text-black py-5 border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2 text-black">
              <Newspaper className="w-4 h-4" />
              <span className="font-semibold">
                {loading ? "Memuat berita..." : error ? "Gagal memuat" : `${articles.length} berita tersedia`}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {lastUpdated && (
                <span className="text-black text-xs font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Diperbarui {lastUpdated.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
              <button
                onClick={() => fetchNews(true)}
                disabled={refreshing || loading}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-[#0f3d2e] border border-[#0f3d2e] text-white rounded-full hover:bg-[#14523d] transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Memuat..." : "Perbarui"}
              </button>
            </div>
          </div>
        </section>

        {/* Filter chips */}
        <section className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-6 py-3 flex gap-2 overflow-x-auto scrollbar-none">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`flex-shrink-0 px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                  activeFilter === f
                    ? "bg-[#0f3d2e] text-white border-[#0f3d2e]"
                    : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:text-emerald-700"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </section>

        {/* News Grid */}
        <section className="py-12 bg-white">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 min-h-[320px]">
              {loading ? (
                Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)
              ) : error ? (
                <div className="col-span-3 text-center py-20">
                  <Newspaper className="w-12 h-12 mx-auto mb-4 text-gray-200" />
                  <p className="text-slate-500 mb-5">Gagal memuat berita. Periksa koneksi internet Anda.</p>
                  <button
                    onClick={() => fetchNews(true)}
                    className="px-6 py-2.5 text-sm font-semibold text-emerald-700 border border-emerald-300 rounded-full hover:bg-emerald-50 transition"
                  >
                    Coba Lagi
                  </button>
                </div>
              ) : filtered.length === 0 ? (
                <div className="col-span-3 text-center py-20">
                  <Newspaper className="w-12 h-12 mx-auto mb-4 text-gray-200" />
                  <p className="text-slate-500">Tidak ada berita untuk kategori ini.</p>
                </div>
              ) : (
                filtered.map((article, idx) => {
                  const cat = getCategory(article.title);
                  return (
                    <ScrollReveal key={`${article.title}-${idx}`} delay={Math.min(idx % 6, 5) * 60}>
                      <a
                        href={article.link || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col bg-white rounded-2xl border border-black hover:border-emerald-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 p-5 h-full"
                      >
                        {/* Top meta */}
                        <div className="flex items-center justify-between mb-3">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${cat.color}`}>
                            {cat.label}
                          </span>
                          {article.pubDate && (
                            <span className="text-[10px] text-gray-400 tabular-nums">
                              {formatDate(article.pubDate)}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-sm font-semibold text-gray-800 leading-snug group-hover:text-emerald-700 transition-colors line-clamp-3 flex-1 mb-4">
                          {article.title}
                        </h3>

                        {/* Bottom meta */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-auto">
                          {article.source ? (
                            <span className="text-[10px] text-gray-400 flex items-center gap-1 truncate max-w-[55%]">
                              <Tag className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{article.source}</span>
                            </span>
                          ) : <span />}
                          <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1 group-hover:gap-1.5 transition-all flex-shrink-0">
                            Baca
                            <ExternalLink className="w-3 h-3" />
                          </span>
                        </div>
                      </a>
                    </ScrollReveal>
                  );
                })
              )}
            </div>

            {/* More link */}
            {!loading && !error && articles.length > 0 && (
              <ScrollReveal delay={200} className="text-center mt-10">
                <a
                  href="https://news.google.com/search?q=mangrove+pesisir+ekosistem+indonesia&hl=id&gl=ID"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-900 underline underline-offset-4 transition-colors"
                >
                  Lihat lebih banyak di Google News
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </ScrollReveal>
            )}
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
