# ID-MAP Roadmap

## 1. Roadmap Scope

Roadmap ini mengikuti scope terbaru ID-MAP:
- Public landing and education.
- Donation.
- Project management.
- KYC.
- MRV.
- Verification.
- Map and GIS.
- AI support.
- Admin operations.
- Production hardening.

Tidak termasuk:
- Corporate Carbon Purchase Flow.
- Carbon credit marketplace.
- ESG portfolio corporate.
- Blockchain/tokenization.

## 2. Roadmap Phases

### Phase 0 - Foundation

Goal: Menstabilkan fondasi teknis dan keamanan.

Deliverables:
- Auth cookie session.
- Password hashing.
- Protected route middleware.
- Env documentation.
- Rate limit.
- CAPTCHA.
- Webhook verification.
- System map and technical docs.

Success criteria:
- Login semua role berjalan.
- Protected route fail-closed.
- Register terlindungi CAPTCHA.
- Payment webhook menolak request invalid.
- Build production sukses.

### Phase 1 - Public Experience and Donation

Goal: Publik dapat memahami platform dan berdonasi.

Deliverables:
- Landing page.
- Project listing.
- Donasi cepat.
- QRIS/invoice.
- Contribution history.
- Certificate contribution.
- AI live chat.
- Peta interaktif.

Success criteria:
- User dapat membuat donasi.
- Payment status dapat berubah menjadi paid.
- Public pages mobile-friendly.
- AI chat dapat menjawab pertanyaan dasar.

### Phase 2 - Mitra and Project Operations

Goal: Mitra dapat mengelola proyek.

Deliverables:
- Mitra dashboard.
- KYC submission.
- Project create/edit.
- Funding progress.
- Project status workflow.
- MRV submission.

Success criteria:
- Mitra dapat submit KYC.
- Mitra dapat membuat proyek.
- Proyek dapat tampil sesuai status.
- MRV report dapat dibuat.

### Phase 3 - Verification and Admin

Goal: Operasional platform dapat dikontrol oleh Verifikator dan Admin.

Deliverables:
- KYC review.
- MRV review.
- Project review.
- User management.
- Transaction monitoring.
- Platform stats.
- Editable content for landing/about/FAQ/footer.

Success criteria:
- Admin dapat approve/reject KYC.
- Verifikator dapat review MRV.
- Admin dapat melihat transaksi donasi.
- Konten publik dapat diperbarui dari dashboard.

### Phase 4 - Pilot Hardening

Goal: Platform siap pilot dengan risiko teknis lebih rendah.

Deliverables:
- Strict CSP.
- More Playwright tests.
- TypeScript/ESLint CI gate.
- Authorization hardening for Convex mutations.
- Monitoring/error tracking.
- Cloud Run validation.
- Better audit trail.

Success criteria:
- Critical journey covered by e2e.
- No hardcoded secrets.
- Payment errors observable.
- Deploy rollback plan tersedia.
- Known high-priority debts berkurang.

## 3. BMAD Epic Plan

| Epic | Name | Focus |
|---|---|---|
| E0 | Foundation & Security | Auth, session, env, rate limit, webhook |
| E1 | Auth & User Management | Register, login, OTP, reset, role guard |
| E2 | Project Management | Project CRUD, status, funding |
| E3 | Community Donations | QRIS, invoice, webhook, contribution |
| E4 | KYC & Verification | Upload document, review, status |
| E5 | MRV | Report submission and review |
| E6 | Admin Dashboard | Stats, user, project, transaction, reports |
| E7 | Map & GIS | Mangrove, abrasion, turtle, Pokmaswas |
| E8 | AI Features | Chatbot, analysis, fallback, guardrails |
| E9 | QA & Deployment | Tests, CSP, CI, monitoring, Cloud Run |

## 4. Suggested Sprint Plan

### Sprint 1 - Foundation and Security

Scope:
- Auth hardening.
- Session cookie and middleware.
- Password hashing.
- Rate limit.
- Turnstile.
- Webhook verification.
- Env audit.

Definition of Done:
- Protected routes cannot be accessed without valid session.
- Auth endpoints rate-limited.
- Webhook validates token/signature.
- Build works.

### Sprint 2 - Donation and Public Flow

Scope:
- Project public listing.
- Donasi cepat.
- QRIS creation.
- Payment status.
- Contribution record.
- Certificate contribution baseline.
- Landing and map polish.

Definition of Done:
- User can donate to project.
- Contribution becomes pending.
- Webhook can confirm contribution.
- Public mobile flow works.

### Sprint 3 - Mitra, KYC, MRV

Scope:
- Mitra project form.
- KYC document upload.
- MRV submission.
- Admin KYC review.
- Verifikator MRV queue.

Definition of Done:
- Mitra can submit KYC and project.
- Admin can review KYC.
- MRV can be submitted and reviewed.

### Sprint 4 - Admin, AI, Pilot Hardening

Scope:
- Admin dashboard improvements.
- AI context and guardrails.
- Additional e2e tests.
- CSP.
- Cloud Run deployment verification.
- Monitoring setup.

Definition of Done:
- Admin can operate core platform.
- Critical flows tested.
- Production readiness checklist complete.

## 5. KPI Roadmap

| Metric | Pilot Target |
|---|---|
| Registered Sahabat | 500 |
| Registered Mitra | 20 |
| Verified Projects | 10 |
| Donation GMV | IDR 250 juta |
| MRV Reports Submitted | 30 |
| KYC Approval Time | <= 48 jam |
| Payment Success Rate | >= 98% |
| Platform Uptime | >= 99.5% |
| AI Response Time | <= 10 detik |

## 6. Risk Roadmap

| Risk | Mitigation |
|---|---|
| Fraud MRV | Verifikator review, audit log, stricter authorization |
| Payment failure | Webhook retry, idempotency, sandbox/manual fallback |
| Bot/register abuse | Turnstile and Redis rate limit |
| AI provider limit | Fallback chain and rate limit |
| Weak mutation trust boundary | Server gateway/internal mutations |
| Low data freshness | Verifikator CMS and future GIS DB migration |

