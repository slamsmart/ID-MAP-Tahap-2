import { NextResponse } from "next/server";

const RSS_FEEDS = [
  "https://news.google.com/rss/search?q=mangrove+pesisir+indonesia&hl=id&gl=ID&ceid=ID:id",
  "https://news.google.com/rss/search?q=rehabilitasi+mangrove+kebijakan+ekosistem&hl=id&gl=ID&ceid=ID:id",
  "https://news.google.com/rss/search?q=karbon+biru+mangrove+indonesia&hl=id&gl=ID&ceid=ID:id",
];

interface Article {
  title: string;
  link: string;
  pubDate: string;
  source: string;
}

function getText(xml: string, tag: string): string {
  const cdata = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`));
  if (cdata) return cdata[1].trim();
  const plain = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return plain ? plain[1].replace(/<!?\[CDATA\[|\]\]>/g, "").trim() : "";
}

function parseItems(xml: string): Article[] {
  const items: Article[] = [];
  const regex = /<item>([\s\S]*?)<\/item>/g;
  let m: RegExpExecArray | null;

  while ((m = regex.exec(xml)) !== null) {
    const raw = m[1];
    const title = getText(raw, "title");
    if (!title) continue;

    const linkMatch = raw.match(/<link>([^<]+)<\/link>/) ||
                      raw.match(/<link\s*\/>([^<]+)/) ||
                      raw.match(/(https?:\/\/[^\s<"']+)/);
    const link = linkMatch?.[1]?.trim() || "";

    const pubDate = getText(raw, "pubDate");
    const srcMatch = raw.match(/<source[^>]*>([^<]+)<\/source>/);
    const source = srcMatch?.[1]?.trim() || "";

    items.push({ title, link, pubDate, source });
  }

  return items;
}

export async function GET() {
  try {
    const responses = await Promise.allSettled(
      RSS_FEEDS.map(url =>
        fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; ID-MAP/1.0; +https://id-map.app)",
            "Accept": "application/rss+xml, application/xml, text/xml",
          },
          next: { revalidate: 1800 },
        }).then(r => r.text())
      )
    );

    const allItems: Article[] = [];
    for (const r of responses) {
      if (r.status === "fulfilled") allItems.push(...parseItems(r.value));
    }

    // Deduplicate by title prefix
    const seen = new Set<string>();
    const unique = allItems.filter(a => {
      const key = a.title.slice(0, 60).toLowerCase().replace(/\s+/g, " ");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort newest first
    unique.sort((a, b) => {
      const da = a.pubDate ? new Date(a.pubDate).getTime() : 0;
      const db = b.pubDate ? new Date(b.pubDate).getTime() : 0;
      return db - da;
    });

    return NextResponse.json(unique.slice(0, 18), {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
      },
    });
  } catch {
    return NextResponse.json([]);
  }
}
