# ID-MAP Production Architecture

## 1. Ringkasan

ID-MAP adalah aplikasi web multi-role berbasis Next.js 14 dan Convex untuk integrasi data pesisir, manajemen proyek mangrove, donasi publik, KYC, MRV, peta interaktif, dan AI analysis.

Status saat dokumen ini dibuat: functional prototype menuju pilot. Aplikasi sudah memiliki production domain, backend real-time, dashboard multi-role, payment QRIS, AI endpoint, rate limit, dan deployment readiness untuk Cloud Run.

## 2. High-Level Architecture

```text
Browser / Mobile Web
        |
        v
Next.js 14 App Router
        |
        |-- Public pages: landing, proyek, peta, edukasi, FAQ
        |-- Protected dashboards: user, mitra, verifikator, admin
        |-- API routes: auth, payment, AI, upload, health
        |
        v
Convex
        |
        |-- Real-time database
        |-- Queries and mutations
        |-- File storage metadata
        |
        v
External Services
        |
        |-- Mayar.id: QRIS, invoice, webhook
        |-- Cloudinary: media upload and CDN
        |-- NVIDIA / OpenRouter: AI provider and fallback
        |-- Gmail SMTP: OTP email
        |-- Upstash Redis: distributed rate limit
        |-- Cloudflare: domain, SSL, bot and DDoS protection
```

## 3. Runtime Components

| Layer | Technology | Responsibility |
|---|---|---|
| Frontend | Next.js 14, React 18, TypeScript | Routing, pages, dashboards, UI |
| Backend API | Next.js Route Handlers | Auth, payment, AI proxy, upload, health |
| Database | Convex | Real-time documents, queries, mutations |
| Styling | TailwindCSS | Design system and responsive layout |
| Maps | Leaflet / map components / GIS assets | Interactive map layers |
| Payment | Mayar.id | QRIS, invoice, webhook confirmation |
| Upload | Cloudinary | Project/content image handling |
| AI | NVIDIA API and OpenRouter fallback | Chatbot and mangrove analysis |
| Rate Limit | Upstash Redis | Multi-instance request throttling |
| Hosting | Vercel, Convex Cloud, Cloud Run-ready | Production deployment |

## 4. Entry Points

| Entrypoint | File/Route | Purpose |
|---|---|---|
| Root Layout | `src/app/layout.tsx` | Global metadata, providers, live chat, PWA |
| Convex Provider | `src/app/ConvexClientProvider.tsx` | Convex client context |
| Middleware | `src/middleware.ts` | Protected route guard |
| Public App | `src/app/page.tsx` | Landing page |
| Dashboard Routes | `src/app/user`, `src/app/mitra`, `src/app/verifikator`, `src/app/admin` | Role dashboards |
| API Routes | `src/app/api/*` | Server endpoints |
| Schema | `convex/schema.ts` | Source of truth for data model |

## 5. Route Protection

Protected route groups:

| Route Prefix | Intended Role |
|---|---|
| `/user` | Sahabat |
| `/mitra` | Mitra |
| `/verifikator` | Verifikator |
| `/admin` | Admin |

Security design:
- Session token stored in HttpOnly cookie.
- Session signed with HMAC-SHA256.
- Middleware verifies protected route access before dashboard render.
- Server helpers support `requireSession` and `requireRole`.

## 6. Core Data Model

| Table | Purpose |
|---|---|
| `users` | Account, role, KYC status, profile, gamification |
| `projects` | Mangrove projects, status, funding, location |
| `contributions` | Public donation records |
| `transactions` | Payment/transaction records where applicable |
| `certificates` | Contribution certificates |
| `mrvReports` | Monitoring, Reporting, Verification reports |
| `kycDocuments` | Uploaded verification documents |
| `systemActivities` | Audit log |
| `otpCodes` | OTP verification and reset codes |
| `platformStats` | Aggregated platform statistics |
| `partnerOrganizations` | Facilitator organization whitelist |
| `landingHero`, `aboutContent`, `faqContent`, `footerContent` | Editable public content |

Role enum:

```text
sahabat
mitra
mitra_facilitator
verifikator
admin
corporate
```

Note: current documentation scope does not include Corporate Carbon Purchase Flow.

## 7. Main Runtime Flows

### 7.1 App Bootstrap

```text
src/app/layout.tsx
  -> ConvexClientProvider
  -> LanguageProvider
  -> Page content
  -> LiveChat
  -> InstallPrompt
  -> ServiceWorkerRegistrar
```

### 7.2 Auth

```text
User submits login
  -> /api/auth/login
  -> Convex user lookup
  -> Password verification
  -> Signed session cookie
  -> Middleware permits dashboard route
```

### 7.3 Donation Payment

```text
User selects project and donation amount
  -> /api/payment/create-qris
  -> Mayar.id QRIS creation if configured
  -> Convex contribution created as pending
  -> Mayar webhook hits /api/payment/webhook
  -> Webhook verification
  -> Contribution confirmed as paid
```

### 7.4 MRV

```text
Mitra submits MRV report
  -> Convex mrvReports record
  -> Verifikator reviews
  -> Status updated
  -> Audit trail recorded
```

### 7.5 AI

```text
User sends chat/analysis request
  -> /api/chat or /api/mangrove-analysis
  -> Rate limit and guardrails
  -> NVIDIA primary provider
  -> OpenRouter fallback when needed
  -> Response returned to UI
```

## 8. External Integrations

| Integration | Env | Purpose |
|---|---|---|
| Convex | `NEXT_PUBLIC_CONVEX_URL` | Backend and real-time DB |
| Mayar.id | `MAYAR_API_KEY`, `MAYAR_WEBHOOK_TOKEN`, `MAYAR_SANDBOX` | QRIS, invoice, webhook |
| Cloudinary | `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Image upload |
| NVIDIA | `NVIDIA_API_KEY` | AI primary provider |
| OpenRouter | `OPENROUTER_API_KEY` | AI fallback |
| Gmail SMTP | `GMAIL_USER`, `GMAIL_APP_PASSWORD` | OTP email |
| Turnstile | `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | CAPTCHA |
| Upstash | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Distributed rate limiting |
| Session | `SESSION_SECRET` | Cookie signing |

## 9. Deployment Architecture

Current/available targets:
- Vercel for production Next.js deployment.
- Convex Cloud for backend.
- Cloudflare for custom domain and DDoS/bot protection.
- Cloud Run-ready through `Dockerfile` and `cloudbuild.yaml`.

Cloud Run checklist:
- `npm run build` succeeds.
- Docker image builds.
- Runtime env variables are configured.
- Port `8080` is used for container deployment.
- Sensitive variables are set via platform env/secret manager.

## 10. Security Controls

Implemented or documented controls:
- HttpOnly cookie session.
- HMAC session token.
- Password hashing with bcrypt.
- Route middleware for protected pages.
- Turnstile CAPTCHA on register.
- Upstash Redis rate limit for critical endpoints.
- Mayar webhook verification.
- Upload MIME and size checks.
- Structured logger with redaction.
- Cloudflare SSL and bot protection.

Known security work:
- Add strict Content Security Policy.
- Move any client-supplied `actorId` mutation pattern behind trusted server gateway/internal mutation.
- Expand Playwright coverage for dashboard CRUD and payment.
- Re-enable TypeScript/ESLint quality gate in CI.

## 11. Observability

Current baseline:
- Structured JSON logger in `src/lib/logger.ts`.
- Request duration tracking in API routes.
- Audit-style logs for auth, rate limit, payment, webhook, and register events.
- `/api/health` endpoint gated by admin token.

Recommended next:
- Add Sentry or equivalent.
- Add deployment health checks.
- Add alerting for payment webhook failures.
- Add dashboard for rate limit and AI provider errors.

