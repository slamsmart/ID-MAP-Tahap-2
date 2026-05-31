# ID-MAP

Platform integrasi data dan manajemen pesisir Indonesia berbasis Next.js 14 + Convex. Project ini mencakup landing page publik, dashboard multi-role, analisis AI, donasi QRIS, serta peta interaktif untuk use case mangrove dan ekosistem pesisir.

## Menjalankan lokal

1. Salin `.env.example` sesuai kebutuhan menjadi file env lokal.
2. Install dependency:

```bash
npm install
```

3. Jalankan development server:

```bash
npm run dev
```

4. Buka `http://localhost:3000`.

## Scripts utama

```bash
npm run dev
npm run build
npm run start
npm run test:e2e
```

## Deployment

- Production aktif sebelumnya berjalan di Vercel.
- Repo ini sekarang juga sudah disiapkan untuk container deployment ke Google Cloud Run.
- Panduan deploy ada di `CLOUD_RUN_DEPLOY.md`.

## Catatan env penting

- `NEXT_PUBLIC_CONVEX_URL` wajib karena frontend dan API route berkomunikasi ke Convex.
- `SESSION_SECRET` wajib di production dan minimal 32 karakter.
- Payment, email, AI, CAPTCHA, dan upload media akan aktif sesuai env provider masing-masing.

## Submission readiness

Status fitur, akun demo, dan known debt terdokumentasi di `SUBMISSION_STATUS.md`.
