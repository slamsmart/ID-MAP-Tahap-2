# SYSTEM_MAP.md — ID-MAP v2.0

> Navigation map for AI agents and developers. Read this before any architecture-level work.
> Last updated: 2026-05-23 (BMAD Phase I Party Mode)

---

## Relationship With AGENTS.md

- `SYSTEM_MAP.md` → architecture, file locations, entrypoints, runtime flow, module boundaries
- `AGENTS.md` → agent behavior, editing discipline, safety rules, response style

Conflict resolution: SYSTEM_MAP wins for architecture; AGENTS.md wins for behavior.

---

## Project Snapshot

- **Project name**: ID-MAP (Indonesia Mangrove Action Platform)
- **Project type**: Multi-role SaaS web platform
- **Primary users**: Sahabat (donors), Mitra (NGO), Verifikator, Corporate, Admin
- **Primary goal**: Carbon credit marketplace + mangrove project management + community donations
- **Repo type**: Single app (Next.js + Convex monorepo style)
- **Main risks**: auth security, payment integrity, data MRV fraud, regulatory compliance

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript 5
- **Backend**: Convex (serverless functions + reactive DB)
- **Database**: Convex DB (document store, auto-indexed)
- **Auth**: Custom session (localStorage) + OTP email + Convex user validation
- **Storage**: Convex File Storage + Cloudinary (images/docs)
- **Queue / Jobs**: None yet (planned: Convex scheduled functions)
- **Infra / Hosting**: Vercel (frontend) + Convex Cloud (backend)
- **Observability**: None yet (planned: Sentry)
- **Testing**: None yet (planned: Playwright E2E, Vitest unit)
- **External integrations**: Mayar.id (payment), Cloudinary, OpenRouter (AI), Leaflet (maps)

---

## Top-Level Layout

```
ID-MAP-Final/
├── src/app/          # Next.js pages (App Router)
├── src/components/   # React components
├── src/lib/          # Utilities, auth, static GIS data
├── src/contexts/     # React contexts (Language)
├── convex/           # Backend (schema, queries, mutations, actions)
├── public/           # Static assets
├── _bmad/            # BMAD planning artifacts (not deployed)
└── scripts/          # Dev/build scripts
```

- **Main app folder**: `src/app/`
- **API / service folder**: `src/app/api/` (Next.js route handlers) + `convex/` (Convex backend)
- **Shared library folder**: `src/lib/`, `src/components/shared/`
- **Scripts / tooling folder**: `scripts/`
- **Generated artifacts to ignore**: `convex/_generated/`, `.next/`, `node_modules/`

---

## Entry Points

- **Web app entry**: `src/app/layout.tsx` → `src/app/ConvexClientProvider.tsx`
- **API entry**: `src/app/api/` (auth, payment, cloudinary-upload, mangrove-analysis, chat)
- **Worker entry**: None (Convex handles background via `internalMutation`)
- **CLI / scripts entry**: `scripts/` + `convex/seed.ts` (via `npx convex run`)
- **Auth entry**: `src/app/masuk/page.tsx` → `POST /api/auth/login` → `src/lib/auth.ts`
- **Admin / dashboard entry**: `src/app/admin/page.tsx` (protected by SessionGuard)
- **Runtime config files**: `.env.local`, `next.config.mjs`, `convex/tsconfig.json`

---

## Runtime Flows

### App Bootstrap Flow
- Entry: `src/app/layout.tsx`
- Providers: `ConvexClientProvider` (wraps all pages with Convex React client)
- Global side effects: LanguageContext, Navbar (Suspense)
- Output: Hydrated React tree with Convex subscription active

### Auth Flow
- Entry: `src/app/masuk/page.tsx`
- Identity source: Convex `users` table (email + password)
- Session storage: `localStorage["idmap_session"]` = `{_id, email, name, role}`
- Guard: `src/components/shared/SessionGuard.tsx` (reads localStorage, redirects if no session)
- Authorization boundary: Per-route in SessionGuard + layout-level redirect
- Failure path: `→ /masuk`

### Main Business Flow (Donation)
- Trigger: User clicks "Donasi" on project card
- UI: `/user/donasi` or modal overlay
- Service: `POST /api/payment/initiate` → Mayar.id API → returns QR URL
- Webhook: `POST /api/payment/webhook` → verify signature → `convex/contributions.ts:create`
- Output: `contributions` record created, certificate queued

### Payment / Billing Flow
- Trigger: Donation or carbon credit purchase
- Provider: Mayar.id (QRIS + Transfer)
- Validation: Webhook signature verification (TD-10: not yet implemented)
- Webhook / callback: `POST /api/payment/webhook`
- Data updates: `contributions.paymentStatus = "paid"` or `transactions.status = "Selesai"`

### AI Analysis Flow
- Trigger: User sends message in MangroveAIPanel
- Service: `POST /api/mangrove-analysis`
- External: OpenRouter API (deepseek/deepseek-v4-flash:free → gemini fallback)
- Output: Streaming text response to component

---

## Boundaries

- **UI / Presentation**: `src/app/`, `src/components/`
- **Client State**: React `useState`, Convex `useQuery` reactive subscriptions
- **API / Transport**: `src/app/api/*` (Next.js route handlers)
- **Domain Logic**: `convex/*.ts` (queries + mutations)
- **Persistence**: Convex DB + Convex File Storage + Cloudinary
- **External Services**: Mayar.id, OpenRouter, Cloudinary
- **Shared Utilities**: `src/lib/`, `src/contexts/`

---

## Integration Points

- **Auth provider**: Custom (OTP email)
- **Payment provider**: Mayar.id (`MAYAR_API_KEY`, `MAYAR_WEBHOOK_SECRET`)
- **Email / SMS**: Not yet wired (OTP uses placeholder) — plan: Resend or Nodemailer
- **File storage**: Cloudinary (`CLOUDINARY_*`) + Convex File Storage
- **Maps / GIS**: Leaflet.js (client-only) + static data in `src/lib/*Data.ts`
- **AI / ML**: OpenRouter (`OPENROUTER_API_KEY`) via `/api/mangrove-analysis`
- **Analytics**: None yet

---

## Key Files

| File | Purpose |
|------|---------|
| `convex/schema.ts` | Database schema — source of truth for all tables |
| `convex/seed.ts` | Dev seed data — `npx convex run seed:resetAndSeed` |
| `convex/users.ts` | User CRUD, bcrypt hashing, lazy migration |
| `convex/projects.ts` | Project CRUD, status transitions |
| `convex/contributions.ts` | Donation records, payment status |
| `src/lib/auth.ts` | Client session cache + `/api/auth/me` bridge |
| `src/lib/sessionToken.ts` | HMAC-signed session token (server-only) |
| `src/lib/serverSession.ts` | `cookies()` helpers for route handlers |
| `src/lib/logger.ts` | Structured JSON logger w/ field redaction |
| `src/middleware.ts` | Edge middleware — verifies session cookie for protected routes |
| `src/components/shared/SessionGuard.tsx` | Client-side guard, listens to `session:change` event |
| `src/components/shared/Navbar.tsx` | Top navigation, auth state |
| `src/app/api/auth/` | login, register, logout, me, send-otp |
| `src/app/api/payment/` | Mayar.id payment initiation + webhook |
| `src/app/api/mangrove-analysis/route.ts` | OpenRouter AI proxy |
| `tests/e2e/` | Playwright smoke tests (4 critical journeys) |
| `playwright.config.ts` | E2E runner config |
| `next.config.mjs` | Next.js config (image domains, etc.) |

---

## Data Model Notes

- **Core entities**: users, projects, contributions, transactions, certificates, kycDocuments, mrvReports, otpCodes, platformStats, systemActivities
- **Primary relationships**: users → projects (mitra), users → contributions (sahabat), projects → contributions, projects → transactions, projects → mrvReports
- **High-write areas**: contributions (donations), otpCodes (auth), systemActivities (audit log)
- **High-read areas**: projects (public listing), platformStats (admin dashboard)
- **Sensitive data**: users.password (CRITICAL: must be hashed — TD-01), kycDocuments (PII)
- **Role values**: `"sahabat" | "mitra" | "verifikator" | "admin" | "corporate"` — NOT `"komunitas"`

---

## Critical User Journeys

1. **Sahabat donation**: `/daftar` → OTP → `/user` → browse project → donasi QRIS → sertifikat
2. **Mitra project**: KYC → create project → MRV submission → SRN registration
3. **Corporate carbon**: register → browse verified projects → buy credit → ESG certificate
4. **Admin KYC flow**: review pending KYC → approve/reject → user notified

---

## Technical Debt Registry

| ID | Issue | Severity | Status | Epic |
|----|-------|----------|--------|------|
| TD-01 | Password plaintext di DB | CRITICAL | Resolved (bcrypt + lazy migrate) | E0/S004 |
| TD-02 | `"komunitas"` role in auth.ts | HIGH | Resolved | E0/S001 |
| TD-03 | `.tmp` files in repo | HIGH | Open | E0/S002 |
| TD-04 | No migrations system | HIGH | Open | E0/S005 |
| TD-05 | No test coverage | HIGH | In Progress (Playwright smoke) | E1+ |
| TD-06 | Static GIS data (not DB) | MEDIUM | Open | E7 |
| TD-07 | No rate limiting on auth | HIGH | Resolved | E1/S009 |
| TD-08 | No input sanitization | HIGH | Open | E1/S010 |
| TD-09 | `corporate` not in schema | MEDIUM | Resolved | E0/S003 |
| TD-10 | Webhook signature not verified | HIGH | Resolved | E4 |
| TD-11 | Session in localStorage (XSS risk) | HIGH | Resolved (HttpOnly cookie + middleware) | E1 |
| TD-12 | No structured logging | MEDIUM | Resolved (lib/logger.ts) | E1 |

---

## Deployment Map

- **Environments**: local (npm run dev) → preview (Vercel PR deploy) → production (Vercel main)
- **Deployment platform**: Vercel (Next.js) + Convex Cloud
- **Build pipeline**: `next build` → Vercel CI
- **Secret management**: Vercel Environment Variables + `.env.local` (gitignored)
- **Rollback path**: Vercel instant rollback to previous deployment

---

## Pre-Edit Trace Note

Before substantive edits, note:

```
Target file: [file]
Entrypoint: [route or trigger]
Flow: [brief flow trace]
Upstream callers: [who calls this]
Downstream dependencies: [what this calls]
Risk: [schema impact / auth impact / payment impact]
```

---

## Maintenance Rule

Update this file when any of these change:
- entrypoints, routes added/removed
- new external service integrations
- schema tables added/removed
- deployment shape changes
- new role added to system
