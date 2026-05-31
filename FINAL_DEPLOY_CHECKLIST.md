# Final Deploy Checklist

Gunakan checklist ini sebelum publish ID-MAP ke Cloud Run untuk URL juri.

## 1. Secrets dan environment

- [ ] `NEXT_PUBLIC_CONVEX_URL` sudah mengarah ke instance Convex aktif.
- [ ] `SESSION_SECRET` sudah diisi minimal 32 karakter random.
- [ ] `NEXT_PUBLIC_SITE_URL` sudah diisi URL final Cloud Run.
- [ ] `NVIDIA_API_KEY` dan/atau `OPENROUTER_API_KEY` sudah aktif.
- [ ] `MAYAR_API_KEY`, `MAYAR_WEBHOOK_TOKEN`, `ADMIN_API_TOKEN` sudah terpasang jika demo payment penuh.
- [ ] `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` dan `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` sudah benar.
- [ ] `GMAIL_USER` dan `GMAIL_APP_PASSWORD` sudah benar jika OTP email dipakai.
- [ ] `TURNSTILE_SECRET_KEY` dan `NEXT_PUBLIC_TURNSTILE_SITE_KEY` sudah benar jika CAPTCHA dipakai.
- [ ] `UPSTASH_REDIS_REST_URL` dan `UPSTASH_REDIS_REST_TOKEN` terisi bila ingin rate limit lintas instance.

## 2. Build dan container

- [ ] `npm run build` sukses.
- [ ] `docker build -t id-map-cloudrun .` sukses.
- [ ] `docker run -p 8080:8080 --env-file .env.production id-map-cloudrun` bisa start.

## 3. Demo experience untuk juri

- [ ] Landing page, map, dashboard, dan chatbot bisa dibuka.
- [ ] Akun demo juri masih valid.
- [ ] Jika payment live belum siap, `MAYAR_SANDBOX=true` dipertahankan.
- [ ] Dokumen `SUBMISSION_STATUS.md` sudah sinkron dengan kondisi deploy final.

## 4. Publish ke Google

- [ ] Artifact Registry repo `id-map` sudah dibuat di `asia-southeast2`.
- [ ] `gcloud builds submit` sukses.
- [ ] `gcloud run deploy` sukses.
- [ ] URL `*.run.app` final sudah diuji.
- [ ] Semua env sensitif dipasang via Secret Manager atau env Cloud Run, bukan file repo.
