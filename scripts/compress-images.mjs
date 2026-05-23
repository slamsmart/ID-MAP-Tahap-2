/**
 * compress-images.mjs
 * Konversi semua gambar di public/images ke WebP + resize optimal
 * Jalankan: node scripts/compress-images.mjs
 */
import sharp from "sharp";
import { readdir, stat, mkdir } from "fs/promises";
import { join, basename, extname } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const INPUT_DIR  = join(__dirname, "../public/images");
const OUTPUT_DIR = join(__dirname, "../public/images");

// Konfigurasi per file
const CONFIG = {
  "hero-mangrove.png":  { width: 1920, quality: 82 },
  "hero-mangrove2.png": { width: 1920, quality: 82 },
  "logo.png":           { width: 400,  quality: 90, keepPng: true },
  "logo2.png":          { width: 400,  quality: 90, keepPng: true },
  "mangrove-demak.jpeg":  { width: 800, quality: 82 },
  "mangrove-sumba.jpeg":  { width: 800, quality: 82 },
};

const DEFAULT = { width: 1200, quality: 82 };

function fmt(bytes) {
  if (bytes >= 1_000_000) return (bytes / 1_000_000).toFixed(2) + " MB";
  return (bytes / 1_000).toFixed(1) + " KB";
}

const files = await readdir(INPUT_DIR);

for (const file of files) {
  const ext = extname(file).toLowerCase();
  if (![".png", ".jpg", ".jpeg", ".webp"].includes(ext)) continue;

  const cfg  = CONFIG[file] ?? DEFAULT;
  const src  = join(INPUT_DIR, file);
  const name = basename(file, ext);
  const webpDest = join(OUTPUT_DIR, `${name}.webp`);

  const srcSize = (await stat(src)).size;

  try {
    // WebP version
    await sharp(src)
      .resize({ width: cfg.width, withoutEnlargement: true })
      .webp({ quality: cfg.quality, effort: 6 })
      .toFile(webpDest);

    const webpSize = (await stat(webpDest)).size;
    const saved = (((srcSize - webpSize) / srcSize) * 100).toFixed(0);
    console.log(`✓ ${file} → ${name}.webp  ${fmt(srcSize)} → ${fmt(webpSize)}  (-${saved}%)`);

    // Optimized PNG juga (untuk logo agar tetap ada fallback transparan)
    if (cfg.keepPng) {
      const pngDest = join(OUTPUT_DIR, `${name}.opt.png`);
      await sharp(src)
        .resize({ width: cfg.width, withoutEnlargement: true })
        .png({ quality: cfg.quality, compressionLevel: 9 })
        .toFile(pngDest);
      const pngSize = (await stat(pngDest)).size;
      console.log(`  └ ${name}.opt.png  ${fmt(srcSize)} → ${fmt(pngSize)}`);
    }
  } catch (err) {
    console.error(`✗ ${file}: ${err.message}`);
  }
}

console.log("\nSelesai! Update referensi .png/.jpg → .webp di komponen.");
