# ID-MAP Tech Stack

## 1. Overview

ID-MAP dibangun sebagai aplikasi web full-stack berbasis Next.js 14 dan Convex. Fokus stack adalah kecepatan development, real-time dashboard, deployment serverless/container-ready, dan integrasi layanan Indonesia seperti QRIS via Mayar.id.

## 2. Core Stack

| Layer | Technology | Version/Package | Purpose |
|---|---|---|---|
| Framework | Next.js | `14.2.35` | App Router, frontend, API routes |
| UI Runtime | React | `18` | Component model |
| Language | TypeScript | `^5` | Type safety |
| Backend | Convex | `^1.36.1` | Real-time DB, queries, mutations |
| Styling | TailwindCSS | `^3.4.1` | Utility CSS |
| Icons | lucide-react | `^1.12.0` | Icons |
| Motion | motion | `^12.40.0` | Animation |
| Maps | leaflet, react-leaflet | `^1.9.4`, `^4.2.1` | Interactive maps |
| Charts | recharts | `^3.8.1` | Dashboard visualization |
| Payment QR | qrcode.react | `^4.2.0` | QR fallback rendering |
| Auth Hashing | bcryptjs | `^3.0.3` | Password hashing |
| Email | nodemailer, resend | `^8.0.8`, `^6.12.3` | OTP email |
| AI SDK | openai, Anthropic SDK | `^6.39.0`, `^0.98.0` | AI provider clients |
| Rate Limit | Upstash Redis/Ratelimit | `^1.38.0`, `^2.0.8` | Distributed throttling |
| Testing | Playwright | `^1.48.0` | E2E tests |

## 3. Architecture Choice

### Next.js App Router

Dipilih karena:
- Satu framework untuk page dan API routes.
- Cocok untuk Vercel.
- Mendukung SSR/metadata/SEO.
- Mudah dipaketkan ke Cloud Run melalui Docker.

### Convex

Dipilih karena:
- Real-time query untuk dashboard.
- Type-safe generated API.
- Serverless backend tanpa REST boilerplate berlebihan.
- Cocok untuk prototype menuju pilot yang butuh iterasi cepat.

### TailwindCSS

Dipilih karena:
- Cepat membuat UI dashboard.
- Konsisten untuk responsive layout.
- Mudah menjaga design token.

### Mayar.id

Dipilih karena:
- Mendukung QRIS.
- Relevan untuk user Indonesia.
- Ada webhook untuk payment confirmation.

### Cloudinary

Dipilih karena:
- Upload dan CDN image siap pakai.
- Cocok untuk gambar proyek dan konten publik.

### NVIDIA/OpenRouter AI

Dipilih karena:
- Mendukung fallback multi-provider.
- Cocok untuk chatbot dan analisis mangrove.

## 4. Project Structure

```text
ID-MAP-Final/
  src/
    app/             Next.js pages and API routes
    components/      UI components
    contexts/        React contexts
    lib/             Utilities and integrations
  convex/            Schema, queries, mutations
  public/            Static assets and docs
  tests/e2e/         Playwright tests
  scripts/           Utility scripts
  _bmad/             BMAD planning artifacts
  docs-idmap/        Documentation pack
```

## 5. Important Folders

| Folder | Purpose |
|---|---|
| `src/app` | App Router pages and API route handlers |
| `src/app/api/auth` | Login, register, logout, OTP, reset password |
| `src/app/api/payment` | QRIS, invoice, status, webhook, simulate |
| `src/app/api/chat` | AI chatbot endpoint |
| `src/app/api/mangrove-analysis` | AI analysis endpoint |
| `src/components/landing` | Landing page sections |
| `src/components/dashboard` | Shared dashboard components |
| `src/components/map` | Interactive map layers |
| `src/components/shared` | Navbar, footer, session guard |
| `src/components/pwa` | Service worker registration and install prompt |
| `src/lib` | Auth, logger, rate limit, session, Mayar, static GIS data |
| `convex` | Backend schema and domain logic |

## 6. Main Scripts

```bash
npm run dev
npm run build
npm run start
npm run test:e2e
npm run test:e2e:ui
npm run test:e2e:install
npm run test:qris
```

## 7. Environment Variables

| Env | Required For |
|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | Convex client/API |
| `SESSION_SECRET` | Session signing |
| `NEXT_PUBLIC_SITE_URL` | App URL |
| `NVIDIA_API_KEY` | AI primary |
| `OPENROUTER_API_KEY` | AI fallback |
| `GMAIL_USER` | OTP email |
| `GMAIL_APP_PASSWORD` | OTP email |
| `TURNSTILE_SECRET_KEY` | CAPTCHA verification |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | CAPTCHA client |
| `MAYAR_SANDBOX` | Payment mode |
| `MAYAR_API_KEY` | Mayar API |
| `MAYAR_WEBHOOK_TOKEN` | Webhook verification |
| `ADMIN_API_TOKEN` | Health/admin API |
| `UPSTASH_REDIS_REST_URL` | Rate limit |
| `UPSTASH_REDIS_REST_TOKEN` | Rate limit |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Cloudinary upload preset |

## 8. Testing Stack

Current E2E files:
- `01-landing.spec.ts`
- `02-auth.spec.ts`
- `03-route-guard.spec.ts`
- `04-api-health.spec.ts`

Recommended additional coverage:
- Payment QRIS and webhook.
- KYC submit/review.
- Project create/edit.
- MRV submit/review.
- Upload validation.
- AI rate limit/fallback.

## 9. Deployment Stack

| Platform | Role |
|---|---|
| Vercel | Current production deployment |
| Convex Cloud | Backend and database |
| Cloudflare | Custom domain, SSL, DDoS/bot protection |
| Google Cloud Run | Container-ready deployment target |
| Cloudinary | Image storage/CDN |
| Upstash Redis | Distributed rate limiting |

## 10. Technical Debt

| Debt | Priority |
|---|---|
| Strict CSP belum final | Medium |
| TypeScript/ESLint gate perlu diperketat | Medium |
| Beberapa mutation authorization perlu server gateway/internal mutation | High |
| Dashboard CRUD e2e coverage perlu ditambah | Medium |
| UI dashboard dapat dikonsolidasi ke shared components | Low |

