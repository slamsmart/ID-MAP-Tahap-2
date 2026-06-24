"use client";

import { useState, useEffect, useCallback } from "react";
import { Newspaper, ExternalLink, RefreshCw, Clock, Tag } from "lucide-react";
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
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 w-20 bg-gray-100 rounded-full" />
        <div className="h-3 w-16 bg-gray-100 rounded" />
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3.5 bg-gray-100 rounded w-full" />
        <div className="h-3.5 bg-gray-100 rounded w-5/6" />
        <div className="h-3.5 bg-gray-100 rounded w-4/6" />
      </div>
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
        <div className="h-3 w-24 bg-gray-100 rounded" />
        <div className="h-3 w-12 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

export default function BeritaTerkini() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("Semua");

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
    <section className="py-16 bg-gray-50">
      <div className="max-w-5xl mx-auto px-6">

        {/* Header */}
        <ScrollReveal className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-emerald-600 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                Realtime
              </span>
              <h2 className="text-3xl font-extrabold text-[#0f3d2e]">Berita Terkini</h2>
              <p className="text-slate-500 text-sm mt-1 max-w-md">
                Update terbaru seputar mangrove, ekosistem pesisir, dan kebijakan lingkungan Indonesia — dari berbagai sumber terpercaya.
              </p>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-1.5 flex-shrink-0">
              <button
                onClick={() => fetchNews(true)}
                disabled={refreshing || loading}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full hover:bg-emerald-100 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Memuat..." : "Perbarui"}
              </button>
              {lastUpdated && (
                <span className="text-[11px] text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Diperbarui {lastUpdated.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* Filter chips */}
        {!loading && articles.length > 0 && (
          <ScrollReveal delay={80} className="flex flex-wrap gap-2 mb-7">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                  activeFilter === f
                    ? "bg-[#0f3d2e] text-white border-[#0f3d2e]"
                    : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:text-emerald-700"
                }`}
              >
                {f}
              </button>
            ))}
          </ScrollReveal>
        )}

        {/* News grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 min-h-[240px]">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : error ? (
            <div className="col-span-3 text-center py-16">
              <Newspaper className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="text-slate-500 text-sm mb-4">Gagal memuat berita. Periksa koneksi internet.</p>
              <button
                onClick={() => fetchNews(true)}
                className="px-5 py-2 text-sm font-semibold text-emerald-700 border border-emerald-300 rounded-full hover:bg-emerald-50 transition"
              >
                Coba lagi
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="col-span-3 text-center py-16">
              <Newspaper className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="text-slate-500 text-sm">Tidak ada berita untuk kategori ini.</p>
            </div>
          ) : (
            filtered.map((article, idx) => {
              const cat = getCategory(article.title);
              return (
                <ScrollReveal key={`${article.title}-${idx}`} delay={Math.min(idx, 5) * 60}>
                  <a
                    href={article.link || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col bg-white rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 p-5 h-full"
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
                        Baca selengkapnya
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </a>
                </ScrollReveal>
              );
            })
          )}
        </div>

        {/* Footer link */}
        {!loading && !error && articles.length > 0 && (
          <ScrollReveal delay={180} className="text-center mt-8">
            <a
              href="https://news.google.com/search?q=mangrove+pesisir+ekosistem+indonesia&hl=id&gl=ID"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-900 underline underline-offset-4 transition-colors"
            >
              Lihat lebih banyak berita di Google News
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}
