# ID-MAP Security Audit Result

Tanggal update: 2026-07-07  
Scope update: fix audit nomor 1-4 tanpa mengubah payment flow.  
Format: siap copas ke Notion.

## Tabel Audit Utama

| ID | Temuan Audit | Tingkat Risiko | Dampak | Status Saat Ini | Ringkasan Perbaikan |
|---|---|---|---|---|---|
| SEC-01 | Public seed/reset mutations | Critical | Dapat dipakai untuk reset atau mengotori data production jika mutation Convex public terpanggil pihak tidak berwenang | ✅ Fixed | Semua seed/reset mutation sekarang wajib `adminSecret`. Panel admin tidak lagi direct-call mutation dari browser, tetapi lewat `/api/admin/seed` yang membaca session HttpOnly dan hanya role `admin` yang boleh akses. |
| SEC-02 | `actorId` client-side spoofable untuk RBAC Convex | High | Client bisa mencoba spoof `actorId` admin/verifikator untuk mutation privileged jika mengetahui ID user | ✅ Fixed untuk scope kritikal | Flow admin seed/content tidak lagi mempercayai `actorId` dari browser. Server gateway mengambil user dari cookie HttpOnly, lalu menambahkan `actorId` dan `CONVEX_ADMIN_MUTATION_SECRET` dari server. Full migration RBAC lama tetap masuk backlog terpisah. |
| SEC-03 | Admin content mutations masih public/kurang auth kuat | High | Konten homepage/about/FAQ/footer/service bisa dideface atau upload URL bisa dibuat tanpa admin session yang valid | ✅ Fixed | Mutation `aboutContent`, `faqContent`, `footerContent`, `landingHero`, `rolesSection`, dan `serviceContent` sekarang butuh role `admin/verifikator` + secret server. Frontend verifikator pindah ke `/api/admin/content`. |
| SEC-04 | CSP masih permissive dan build ignore lint/type errors | Medium | CSP kurang efektif menahan XSS, dan error lint/type bisa lolos saat build production | ✅ Fixed - staged hardening | Ditambah `Content-Security-Policy-Report-Only` yang lebih ketat + endpoint `/api/security/csp-report`. Build ignore sekarang bisa dimatikan dengan `NEXT_STRICT_BUILD=true` tanpa langsung merusak flow payment/map/chat. |

## Payment Safety

| ID | Checklist | Status Saat Ini | Catatan |
|---|---|---|---|
| PAY-01 | `src/app/api/payment/*` tidak diedit | ✅ Aman | Tidak ada perubahan route payment dari fix SEC-01 sampai SEC-04. |
| PAY-02 | `src/lib/mayar.ts` tidak diedit | ✅ Aman | Helper Mayar tidak disentuh. |
| PAY-03 | `convex/contributions.ts` tidak diedit | ✅ Aman | Flow payment confirmation tidak diubah. |
| PAY-04 | Payment targeted lint | ✅ Pass | Lint payment route + Mayar helper pass tanpa warning/error. |
| PAY-05 | Unit test Mayar/payment helper | ✅ Pass | Masuk dalam 48 unit tests yang pass. |

## Bukti Perubahan

| ID | Area | File / Endpoint | Status | Ringkasan |
|---|---|---|---|---|
| FIX-01 | Convex auth hardening | `convex/authz.ts` | ✅ Fixed | Tambah `requireServerMutationSecret` untuk mutation public yang harus lewat server trusted. |
| FIX-02 | Seed/reset lock | `convex/seed.ts`, `convex/partnerOrganizations.ts` | ✅ Fixed | Semua seed/demo seed mutation wajib `adminSecret`. |
| FIX-03 | Admin gateway seed | `src/app/api/admin/seed/route.ts` | ✅ Fixed | Route server membaca session HttpOnly, require role `admin`, lalu memanggil Convex dengan secret server. |
| FIX-04 | Admin gateway content | `src/app/api/admin/content/route.ts` | ✅ Fixed | Route server membaca session HttpOnly, require role `admin/verifikator`, lalu memanggil content mutation dengan secret server. |
| FIX-05 | Frontend admin/verifikator | `src/lib/adminConvex.ts`, `src/app/admin/pengaturan/page.tsx`, `src/app/verifikator/*` content pages | ✅ Fixed | Browser tidak direct-call privileged Convex mutation; semua save/update admin lewat API server. |
| FIX-06 | CSP Report-Only | `next.config.mjs`, `src/app/api/security/csp-report/route.ts` | ✅ Fixed | Staging CSP ketat via report-only agar bisa diuji tanpa mematahkan payment/map/chat. |
| FIX-07 | Build hardening | `next.config.mjs` | ✅ Fixed | `ignoreDuringBuilds` dan `ignoreBuildErrors` bisa dibuat fail dengan `NEXT_STRICT_BUILD=true`. |
| FIX-08 | Env docs | `.env.example` | ✅ Fixed | Tambah `CONVEX_ADMIN_MUTATION_SECRET`. |

## Required Env

| Env | Lokasi | Status | Catatan |
|---|---|---|---|
| `CONVEX_ADMIN_MUTATION_SECRET` | Next runtime + Convex environment | 🟡 Wajib diset saat deploy | Value harus sama di Next dan Convex, random, minimal 32 karakter. |
| `NEXT_STRICT_BUILD=true` | CI / production build | 🟡 Optional hardening | Aktifkan setelah backlog TypeScript lama dibersihkan. |

## Verification

| ID | Check | Command | Status |
|---|---|---|---|
| VER-01 | Targeted lint admin/security files | `npx next lint --file src/lib/adminConvex.ts --file src/app/api/admin/content/route.ts --file src/app/api/admin/seed/route.ts --file src/app/api/security/csp-report/route.ts --file src/app/admin/pengaturan/page.tsx --file src/app/verifikator/tentang/page.tsx --file src/app/verifikator/faq/page.tsx --file src/app/verifikator/footer/page.tsx --file src/app/verifikator/tiga-peran/page.tsx --file src/app/verifikator/thumbnail-layanan/page.tsx --file src/app/verifikator/landing-hero/page.tsx` | ✅ Pass |
| VER-02 | Targeted lint Convex files | `npx eslint convex/authz.ts convex/seed.ts convex/aboutContent.ts convex/faqContent.ts convex/footerContent.ts convex/landingHero.ts convex/rolesSection.ts convex/serviceContent.ts convex/partnerOrganizations.ts` | ✅ Pass |
| VER-03 | Config lint | `npx eslint next.config.mjs` | ✅ Pass |
| VER-04 | Unit tests | `npx vitest run __tests__/lib/sessionToken.test.ts __tests__/lib/rateLimit.test.ts __tests__/lib/mayar.test.ts __tests__/lib/authz.test.ts` | ✅ Pass, 48 tests |
| VER-05 | Payment targeted lint | `npx next lint --file src/app/api/payment/webhook/route.ts --file src/app/api/payment/simulate/route.ts --file src/app/api/payment/status/route.ts --file src/app/api/payment/create-qris/route.ts --file src/app/api/payment/create-invoice/route.ts --file src/lib/mayar.ts` | ✅ Pass |
| VER-06 | Full TypeScript check | `npx tsc --noEmit --pretty false` | 🟡 Existing backlog, patched admin/CSP files tidak muncul sebagai error |

## TypeScript Backlog

| ID | Area | Contoh Error | Status Saat Ini | Catatan |
|---|---|---|---|---|
| TS-01 | Payment-adjacent Convex | `convex/contributions.ts(38,11): Cannot find name 'requireRole'` | 🟡 Open Backlog | Tidak disentuh untuk menjaga boundary payment flow. |
| TS-02 | Gamification schema drift | `convex/gamification.ts` references `referrals` table / fields not in schema | 🟡 Open Backlog | Existing backlog. |
| TS-03 | External mayar-cli hook | Missing `@earendil-works/pi-coding-agent` types | 🟡 Open Backlog | Existing backlog di folder tool/hook. |
| TS-04 | Auth OTP route typing | `send-reset-otp` user projection lacks `name` type | 🟡 Open Backlog | Existing backlog. |
| TS-05 | Login pages | `Loader2` missing imports | 🟡 Open Backlog | Existing backlog. |

## Security Backlog Berikutnya

| ID | Prioritas | Item | Status Saat Ini | Rekomendasi |
|---|---|---|---|---|
| NEXT-01 | Critical | Payment confirmation mutations masih public | 🟡 Payment-safe pass | Fix terpisah: pindahkan provider-confirmation mutation ke trusted webhook/server path/internal mutation, tanpa mengubah verifikasi Mayar. |
| NEXT-02 | High | Full removal client `actorId` trust | 🟡 Open Hardening | Migrasi dashboard lain ke Convex Auth atau Next server gateway per module. |
| NEXT-03 | Medium | Enforce strict CSP | 🟡 Open Hardening | Pakai data report-only dulu, lalu ketatkan enforced CSP bertahap. |
| NEXT-04 | Medium | Strict build di CI | 🟡 Open Hardening | Setelah backlog TypeScript bersih, set `NEXT_STRICT_BUILD=true`. |
