# Architecture Document — ID-MAP v2.0
> Agent: 🏗️ Winston (System Architect) | BMAD Phase I — Step 3

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     ID-MAP v2.0                             │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  Next.js 14  │    │    Convex    │    │   External   │  │
│  │  App Router  │◄──►│  Serverless  │    │   Services   │  │
│  │  (Frontend)  │    │  (Backend)   │    │              │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                   │                    │          │
│    React 18           PostgreSQL-like        Mayar.id       │
│    Tailwind CSS       real-time DB           Cloudinary     │
│    Leaflet.js         TypeScript SDK         OpenRouter     │
│    ShadcnUI           File Storage           (AI)           │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Tech Stack

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Framework | Next.js App Router | 14.x | SSR + SSG, file-based routing, Server Components |
| Backend | Convex | Latest | Serverless, real-time reactivity, no REST boilerplate |
| Database | Convex DB | — | Document-based, typed, auto-indexed, reactive queries |
| Language | TypeScript | 5.x | Type safety full stack |
| Styling | Tailwind CSS | 3.x | Utility-first, consistent design system |
| UI Components | Shadcn/ui | Latest | Radix primitives, accessible, customizable |
| Maps | Leaflet.js | 1.9.x | Open source, no API key, GeoJSON support |
| Auth | Custom (localStorage + Convex) | — | Lightweight, role-based, OTP email |
| Payment | Mayar.id | v2 API | Indonesian payment gateway, QRIS support |
| Storage | Cloudinary | v2 | Image optimization, CDN, signed upload |
| AI | OpenRouter | — | Free tier DeepSeek/Gemini, multi-provider fallback |
| Animation | Framer Motion | 11.x | Smooth UI transitions |
| Icons | Lucide React | Latest | Consistent icon set |

---

## 3. Directory Architecture

```
ID-MAP-Final/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (public)/           # Landing pages (no auth required)
│   │   │   ├── page.tsx        # Home
│   │   │   ├── masuk/          # Login
│   │   │   ├── daftar/         # Register
│   │   │   ├── proyek/         # Public project listing
│   │   │   ├── jelajahi-peta-mangrove/  # Public map
│   │   │   └── edukasi-ekosistem-pesisir/
│   │   ├── user/               # Sahabat dashboard (protected)
│   │   ├── mitra/              # Mitra dashboard (protected)
│   │   ├── verifikator/        # Verifikator dashboard (protected)
│   │   ├── corporate/          # Corporate dashboard (protected)
│   │   ├── admin/              # Admin dashboard (protected)
│   │   └── api/                # Next.js API Routes
│   │       ├── auth/           # OTP, login, register
│   │       ├── payment/        # Mayar.id webhook + initiate
│   │       ├── cloudinary-upload/  # Signed upload URL
│   │       ├── mangrove-analysis/  # AI proxy to OpenRouter
│   │       └── chat/           # Live chat API
│   ├── components/
│   │   ├── landing/            # Home page sections
│   │   ├── dashboard/          # Shared dashboard components
│   │   ├── map/                # Leaflet map components
│   │   ├── shared/             # Navbar, Footer, SessionGuard
│   │   └── chat/               # LiveChat
│   ├── lib/
│   │   ├── auth.ts             # Session management (localStorage)
│   │   ├── utils.ts            # Shared utilities
│   │   ├── abrasionData.ts     # Static GIS data: abrasi
│   │   ├── mangroveNasionalData.ts  # Static mangrove layer data
│   │   ├── penyuData.ts        # Static turtle monitoring data
│   │   └── pokmaswasData.ts    # Static community watch data
│   └── contexts/
│       └── LanguageContext.tsx  # i18n (ID/EN)
├── convex/                     # Backend (Convex serverless)
│   ├── schema.ts               # Database schema (source of truth)
│   ├── users.ts                # User queries/mutations
│   ├── projects.ts             # Project queries/mutations
│   ├── contributions.ts        # Donation queries/mutations
│   ├── transactions.ts         # Carbon credit transactions
│   ├── certificates.ts         # Certificate generation
│   ├── kyc.ts                  # KYC document management
│   ├── mrvReports.ts           # MRV report management
│   ├── activities.ts           # Audit log
│   ├── platformStats.ts        # Aggregated statistics
│   ├── otpCodes.ts             # OTP management
│   └── seed.ts                 # Dev seed data
└── _bmad/                      # BMAD planning artifacts
```

---

## 4. Data Model

### 4.1 Schema Entities

```typescript
// Entity Relationship Summary
users (1) ──< contributions (N)   [userId]
users (1) ──< projects (N)        [mitraId]
users (1) ──< kycDocuments (N)    [userId]
users (1) ──< certificates (N)    [ownerId]
users (1) ──< transactions (N)    [companyId]
projects (1) ──< contributions (N)  [projectId]
projects (1) ──< transactions (N)   [projectId]
projects (1) ──< certificates (N)   [projectId]
projects (1) ──< mrvReports (N)     [projectId]
```

### 4.2 Role Definitions (Final)

```typescript
type Role = "sahabat" | "mitra" | "verifikator" | "admin" | "corporate"
// NOTE: "komunitas" is deprecated — all references must be removed in E0
```

### 4.3 Key Indexes

| Table | Index | Use Case |
|-------|-------|----------|
| users | by_email | Login lookup |
| users | by_role | Role filtering |
| users | by_kycStatus | KYC queue |
| projects | by_status | Public listing |
| projects | by_mitra | Mitra dashboard |
| contributions | by_user | Sahabat history |
| contributions | by_paymentId | Webhook lookup |
| otpCodes | by_email | OTP verification |

---

## 5. Auth Architecture

```
User → /masuk → POST /api/auth/login
  → Convex: users.getUserByEmail (validate password)
  → Generate session: {_id, email, name, role}
  → localStorage.setItem("idmap_session", JSON.stringify(session))
  → SessionGuard reads session on every protected route
  → getDashboardPath(role) → redirect to dashboard
```

### Auth Boundaries
- **Public**: `/`, `/masuk`, `/daftar`, `/proyek` (read-only), `/jelajahi-peta-mangrove`
- **Sahabat**: `/user/*`
- **Mitra**: `/mitra/*`
- **Verifikator**: `/verifikator/*`
- **Corporate**: `/corporate/*`
- **Admin**: `/admin/*`

### Security Concerns (to fix in E0/E1)
- Password currently stored as plain string in schema → must hash with bcrypt
- Session in localStorage (XSS risk) → consider httpOnly cookie or at minimum encrypt
- No CSRF protection on API routes → add CSRF token middleware
- OTP not rate-limited → add rate limiting

---

## 6. API Routes

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/auth/login` | POST | None | Validate credentials, return session |
| `/api/auth/register` | POST | None | Create user, trigger OTP |
| `/api/auth/verify-otp` | POST | None | Verify OTP code |
| `/api/auth/send-otp` | POST | None | Send/resend OTP email |
| `/api/payment/initiate` | POST | User | Initiate Mayar.id payment |
| `/api/payment/webhook` | POST | Mayar signature | Payment status callback |
| `/api/cloudinary-upload` | POST | User | Get signed Cloudinary upload URL |
| `/api/mangrove-analysis` | POST | User | Proxy to OpenRouter AI |
| `/api/chat` | POST | User | Live chat handler |

---

## 7. Real-time Architecture (Convex)

```
Browser → useQuery(api.projects.list) → Convex DB
                    ↑ auto re-renders when DB changes
Browser → useMutation(api.contributions.create) → Convex DB
                    ↑ triggers re-render in all subscribed clients
```

Key pattern: Convex queries are **reactive** — no polling needed. All dashboard data stays live automatically.

---

## 8. Map Architecture

```
Leaflet Map (client-only, ssr: false)
├── TileLayer: OpenStreetMap / Esri Satellite
├── AbrasionMap (layer toggle)
│   └── Data source: /lib/abrasionData.ts (static GeoJSON)
├── TurtleLayer (layer toggle)
│   └── Data source: /lib/penyuData.ts (static)
└── PokmaswasLayer (layer toggle)
    └── Data source: /lib/pokmaswasData.ts (static)
```

**Migration plan**: Move static GIS data to Convex DB so verifikator can update via dashboard.

---

## 9. AI Architecture

```
User message → POST /api/mangrove-analysis
  → Inject system prompt (PMN 2025, KKMD, BRGMN context)
  → Inject role context (which role the user has)
  → Call OpenRouter API (deepseek/deepseek-v4-flash:free)
  → Stream response back to MangroveAIPanel component
  → Fallback: google/gemini-2.0-flash-exp:free
```

---

## 10. Deployment Architecture

```
Vercel (Frontend + API Routes)
├── Next.js App (Edge + Node.js runtime)
├── Environment variables: CONVEX_DEPLOYMENT, NEXT_PUBLIC_CONVEX_URL,
│   OPENROUTER_API_KEY, MAYAR_API_KEY, CLOUDINARY_* vars
└── Preview deployments per branch

Convex Cloud (Backend)
├── Serverless functions (queries, mutations, actions)
├── Convex DB (document store)
└── Convex File Storage (KYC docs, project images)
```

---

## 11. Performance Strategy

| Area | Strategy |
|------|----------|
| Images | Next.js Image + Cloudinary + WebP conversion |
| Map | `dynamic(() => ..., { ssr: false })` — no SSR for Leaflet |
| Heavy components | `dynamic()` for all dashboard sections |
| Convex queries | Paginated with `.paginate()` for large lists |
| AI responses | Streaming (no waiting for full response) |
| Static data | GIS data in `/lib/*` files (build-time) |

---

## 12. Technical Debt Registry

| ID | Issue | Severity | Epic |
|----|-------|----------|------|
| TD-01 | Password stored plaintext in DB | CRITICAL | E0 |
| TD-02 | `"komunitas"` role in auth.ts type | HIGH | E0 |
| TD-03 | `.tmp` files committed to repo | HIGH | E0 |
| TD-04 | SYSTEM_MAP.md is blank template | MEDIUM | E0 |
| TD-05 | No test coverage | HIGH | E1+ |
| TD-06 | Static GIS data, not DB-backed | MEDIUM | E7 |
| TD-07 | No rate limiting on OTP/auth endpoints | HIGH | E1 |
| TD-08 | No input sanitization on Convex mutations | HIGH | E1 |
| TD-09 | `corporate` role not in schema yet | MEDIUM | E0 |
| TD-10 | Mayar.id webhook signature not verified | HIGH | E4 |

---

*Dokumen ini dihasilkan oleh Winston (BMAD System Architect) pada BMAD Phase I Party Mode — ID-MAP v2.0*
