# Epic E0 — Migration & Foundation
> Status: 🔄 In Progress | Sprint 1 | Agent: 💻 James (Dev)

---

## Goal

Hapus semua technical debt warisan development awal. Setelah E0 selesai:
- Codebase bersih tanpa sisa artifact development
- Schema production-ready dengan role yang benar
- Auth layer secure
- Semua konfig terdokumentasi

---

## Stories

---

### S001 — Remove `komunitas` role dari codebase

**Priority**: P0  
**Points**: 2  
**Status**: ⏳ Pending

**Background**  
Role `komunitas` adalah nama lama yang sudah diganti menjadi `sahabat` di schema. Masih ada sisa di:
- `src/lib/auth.ts` — type `User.role` masih include `"komunitas"`
- `src/lib/auth.ts` — `getDashboardPath()` masih handle `"komunitas"`

**Acceptance Criteria**  
- [ ] `User.role` type di `auth.ts` tidak include `"komunitas"`
- [ ] `getDashboardPath()` tidak ada case `"komunitas"`
- [ ] Semua TypeScript compiles clean tanpa error
- [ ] `convex/schema.ts` tidak include `"komunitas"` (sudah benar, verifikasi)

**Files to Edit**  
- `src/lib/auth.ts`

---

### S002 — Delete semua `.tmp` files dari repo

**Priority**: P0  
**Points**: 1  
**Status**: ⏳ Pending

**Background**  
Terdapat file `.tmp` yang tertinggal dari sesi editing sebelumnya, masuk ke git status.

**Files to Delete**  
```
convex/projects.ts.tmp.8572.1779546466371
convex/schema.ts.tmp.8572.1779544075260
src/app/masuk/page.tsx.tmp.24316.1779547028865
src/app/api/mangrove-analysis/route.ts.tmp.14096.1779547402809
src/app/api/mangrove-analysis/route.ts.tmp.14096.1779548262107
src/app/jelajahi-peta-mangrove/page.tsx.tmp.9476.1779519205268 (already deleted per git status)
```

**Acceptance Criteria**  
- [ ] Semua file `.tmp.*` dihapus dari working directory
- [ ] `git status` tidak menampilkan file `.tmp.*`

---

### S003 — Add `corporate` role ke schema dan auth

**Priority**: P0  
**Points**: 3  
**Status**: ⏳ Pending

**Background**  
Route `/corporate/*` sudah ada di Next.js app tapi `corporate` belum ada sebagai role valid di Convex schema. Ini akan menyebabkan user corporate tidak bisa dibuat.

**Acceptance Criteria**  
- [ ] `convex/schema.ts`: `users.role` union includes `v.literal("corporate")`
- [ ] `src/lib/auth.ts`: `User.role` type includes `"corporate"`
- [ ] `getDashboardPath("corporate")` returns `"/corporate"`
- [ ] `convex/users.ts`: query/mutation yang filter by role include `"corporate"`
- [ ] `src/components/shared/SessionGuard.tsx`: corporate protected routes handled
- [ ] Seed data tetap valid (tidak perlu corporate user di seed)
- [ ] `npx convex dev` tidak ada schema validation error

**Files to Edit**  
- `convex/schema.ts`
- `src/lib/auth.ts`
- `src/components/shared/SessionGuard.tsx` (verifikasi)

---

### S004 — Implement password hashing

**Priority**: P0 (CRITICAL SECURITY)  
**Points**: 3  
**Status**: ⏳ Pending

**Background**  
Password saat ini disimpan plaintext di Convex DB. Ini adalah critical security vulnerability.

**Implementation Plan**  
```
Option A: bcryptjs (pure JS, works in Convex actions)
  npm install bcryptjs @types/bcryptjs
  
  Hash on register: await bcrypt.hash(password, 10)
  Verify on login: await bcrypt.compare(inputPassword, storedHash)

Option B: Convex Actions wrapper (if bcryptjs not compatible)
  → Create convex/auth.ts as an action (not mutation)
  → Use node runtime: "use node"
```

**Acceptance Criteria**  
- [ ] Password tidak pernah disimpan plaintext di DB
- [ ] Register: password di-hash sebelum `ctx.db.insert`
- [ ] Login: password di-compare dengan stored hash
- [ ] Existing seed users: hash password mereka di `seed.ts`
- [ ] Tidak ada TypeScript error
- [ ] Login tetap berfungsi normal setelah implementasi

**Files to Edit**  
- `convex/users.ts` (atau `convex/auth.ts` baru)
- `convex/seed.ts` (seed dengan hashed passwords)
- `src/app/api/auth/` routes

---

### S005 — Convex migrations setup

**Priority**: P1  
**Points**: 5  
**Status**: ⏳ Pending

**Background**  
Tidak ada sistem migrasi. Schema changes langsung overwrite — berisiko data loss di production.

**Implementation Plan**  
```bash
npm install @convex-dev/migrations
```

Setup migration helper component di `convex/migrations.ts`:
```typescript
import { Migrations } from "@convex-dev/migrations";
import { components } from "./_generated/api";

export const migrations = new Migrations(components.migrations);
export const run = migrations.runner();
```

Migrations yang perlu dibuat:
- `m001_remove_komunitas_role` — update existing `komunitas` users ke `sahabat`
- `m002_add_corporate_role_support` — no-op data migration (schema change only)
- `m003_hash_existing_passwords` — hash semua password plaintext yang ada

**Acceptance Criteria**  
- [ ] `@convex-dev/migrations` terinstall dan configured
- [ ] `convex/migrations.ts` ada dan export `run`
- [ ] Migration `m001` berhasil dijalankan tanpa error
- [ ] Tidak ada document dengan `role: "komunitas"` setelah m001
- [ ] `npx convex run migrations:run` berjalan sukses

---

### S006 — Fill SYSTEM_MAP.md dengan data aktual

**Priority**: P1  
**Points**: 2  
**Status**: ✅ Done (dibuat via BMAD Party Mode)

**Notes**  
SYSTEM_MAP.md sudah diisi dengan data proyek aktual selama sesi BMAD Phase I.

---

### S007 — Environment variable audit + dokumentasi

**Priority**: P1  
**Points**: 2  
**Status**: ⏳ Pending

**Required Env Vars**  
```bash
# Convex
NEXT_PUBLIC_CONVEX_URL=           # Public URL Convex deployment
CONVEX_DEPLOYMENT=                # Deployment ID

# Auth
NEXTAUTH_SECRET=                  # Random secret untuk session signing

# Payment — Mayar.id
MAYAR_API_KEY=                    # API key Mayar.id
MAYAR_WEBHOOK_SECRET=             # Secret untuk verify webhook signature

# Storage — Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# AI — OpenRouter
OPENROUTER_API_KEY=               # API key OpenRouter

# Email — OTP
EMAIL_SERVICE=                    # "resend" atau "nodemailer"
RESEND_API_KEY=                   # Jika pakai Resend
SMTP_HOST=                        # Jika pakai Nodemailer
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

**Acceptance Criteria**  
- [ ] `.env.example` dibuat dengan semua var di atas (tanpa value)
- [ ] `README.md` update: section "Environment Setup"
- [ ] Tidak ada hardcoded API key atau secret di codebase
- [ ] Verifikasi: `grep -r "MAYAR_\|CLOUDINARY_\|OPENROUTER" src/` → hanya via `process.env`

---

## E0 Completion Checklist

- [ ] S001: `komunitas` role dihapus
- [ ] S002: `.tmp` files dihapus  
- [ ] S003: `corporate` role ditambah
- [ ] S004: Password hashing aktif
- [ ] S005: Migrations system siap
- [ ] S006: SYSTEM_MAP.md lengkap ✅
- [ ] S007: `.env.example` ada

**E0 Done When**: `npx convex dev` bersih, `npx next build` sukses, tidak ada TypeScript error, tidak ada schema validation error, tidak ada `.tmp` files.

---

*Epic E0 didefinisikan oleh Bob (BMAD PO) dan James (BMAD Dev) pada BMAD Phase II kickoff — ID-MAP v2.0*
