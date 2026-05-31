# Deploy ID-MAP ke Google Cloud Run

Dokumen ini menyiapkan ID-MAP agar bisa dijalankan di ekosistem Google dengan pola deployment mirip URL contoh `*.run.app`.

## Arsitektur yang dipakai

- Frontend + API app: Next.js 14 di Cloud Run.
- Database + realtime backend: Convex Cloud.
- Media upload: Cloudinary.
- Payment: Mayar.id.
- AI: NVIDIA NIM dan/atau OpenRouter.

Artinya, yang dipindahkan ke Google Cloud Run adalah server Next.js milik project ini. Service eksternal lain tetap dipakai lewat environment variables.

## Environment variables minimum

Wajib untuk app bisa hidup dengan aman:

```bash
NEXT_PUBLIC_CONVEX_URL=
SESSION_SECRET=
NEXT_PUBLIC_SITE_URL=
```

Disarankan untuk submission/demo penuh:

```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
NVIDIA_API_KEY=
OPENROUTER_API_KEY=
GMAIL_USER=
GMAIL_APP_PASSWORD=
TURNSTILE_SECRET_KEY=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
MAYAR_SANDBOX=true
MAYAR_API_KEY=
MAYAR_WEBHOOK_TOKEN=
ADMIN_API_TOKEN=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Catatan:

- `SESSION_SECRET` wajib minimal 32 karakter di production.
- Jika `MAYAR_API_KEY` kosong, sebagian flow pembayaran tetap jalan dalam mode demo.
- Jika `NVIDIA_API_KEY` kosong, endpoint chat akan gagal kecuali Anda siapkan fallback sendiri.
- Jika Upstash belum diisi, rate limit tetap jalan dengan mode memory per instance.

## Build image lokal

```bash
docker build -t id-map-cloudrun .
docker run -p 8080:8080 --env-file .env.production id-map-cloudrun
```

## Deploy ke Cloud Run

```bash
gcloud builds submit --tag asia-southeast2-docker.pkg.dev/PROJECT_ID/REPO_NAME/id-map
gcloud run deploy id-map ^
  --image asia-southeast2-docker.pkg.dev/PROJECT_ID/REPO_NAME/id-map ^
  --platform managed ^
  --region asia-southeast2 ^
  --allow-unauthenticated ^
  --port 8080 ^
  --set-env-vars NODE_ENV=production,NEXT_PUBLIC_SITE_URL=https://YOUR_SERVICE_URL
```

Tambahkan secret/env lain lewat `--set-env-vars`, `--update-secrets`, atau Console Google Cloud.

## Rekomendasi untuk submission lomba

- Pakai region `asia-southeast2` agar dekat dengan user Indonesia.
- Siapkan 1 URL publik Cloud Run khusus juri.
- Isi `NEXT_PUBLIC_SITE_URL` dengan URL Cloud Run final.
- Pastikan akun demo tetap aktif dan kredensial juri ditulis ulang di dokumen submission.
- Simpan API key sensitif di Google Secret Manager, bukan hardcode.

## Known compatibility notes

- Build saat ini lolos, tetapi Next.js masih memberi warning `themeColor` metadata di beberapa route.
- TypeScript dan ESLint masih di-ignore saat build sesuai konfigurasi project saat ini.
- App tetap tergantung pada Convex Cloud, jadi deployment ini bukan migrasi backend penuh ke Google.
