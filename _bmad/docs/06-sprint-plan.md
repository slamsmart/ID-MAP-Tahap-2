# Sprint Plan — ID-MAP v2.0
> Agents: ✅ Bob (PO) + 🏃 Alex (SM) | BMAD Phase I — Step 5-6

---

## Epic Map

| Epic | Name | Stories | Sprint | Owner Role |
|------|------|---------|--------|------------|
| **E0** | Migration & Foundation | 7 stories | S1 | All |
| **E1** | Auth & User Management | 8 stories | S1–S2 | Dev |
| **E2** | Project Management | 7 stories | S2–S3 | Dev |
| **E3** | Carbon Marketplace | 6 stories | S3–S4 | Dev |
| **E4** | Community Donations | 5 stories | S2–S3 | Dev |
| **E5** | Verification & MRV | 6 stories | S3–S4 | Dev |
| **E6** | Admin Dashboard | 6 stories | S2–S4 | Dev |
| **E7** | Map & GIS | 5 stories | S2–S3 | Dev |
| **E8** | AI Features | 4 stories | S3–S4 | Dev |

---

## Sprint 1 — Foundation (2 minggu)

**Goal**: Zero tech debt baseline — codebase bersih, auth solid, schema production-ready

| Story | Epic | Title | Points |
|-------|------|-------|--------|
| S001 | E0 | Remove `komunitas` role dari codebase | 2 |
| S002 | E0 | Delete semua `.tmp` files dari repo | 1 |
| S003 | E0 | Add `corporate` role ke schema + auth | 3 |
| S004 | E0 | Implement password hashing (bcrypt) | 3 |
| S005 | E0 | Schema migration: Convex @convex-dev/migrations setup | 5 |
| S006 | E0 | Fill SYSTEM_MAP.md dengan data proyek aktual | 2 |
| S007 | E0 | Env var audit + `.env.example` documentation | 2 |
| S008 | E1 | OTP email service production (Resend/Nodemailer) | 5 |
| S009 | E1 | Rate limiting pada /api/auth/* endpoints | 3 |
| S010 | E1 | Input sanitization pada semua Convex mutations | 3 |

**Sprint 1 Velocity**: 29 points
**Sprint 1 Definition of Done**: Semua TODO di E0 resolved, auth endpoints secure, tidak ada .tmp files

---

## Sprint 2 — Core Features (2 minggu)

**Goal**: Sahabat dan Mitra bisa end-to-end flow

| Story | Epic | Title | Points |
|-------|------|-------|--------|
| S011 | E1 | Complete user registration + OTP flow | 5 |
| S012 | E1 | KYC document upload flow (Cloudinary) | 5 |
| S013 | E1 | Admin KYC review interface | 3 |
| S014 | E2 | Mitra create/edit project form (multi-step) | 8 |
| S015 | E2 | Project listing public page (filter + search) | 5 |
| S016 | E2 | Project detail page | 5 |
| S017 | E4 | Donation flow: pilih proyek → QRIS/Transfer | 8 |
| S018 | E4 | Mayar.id webhook handler + payment confirmation | 5 |
| S019 | E6 | Admin dashboard stats overview | 3 |
| S020 | E7 | Interactive map: layer toggle (abrasi/penyu/pokmaswas) | 5 |

**Sprint 2 Velocity**: 52 points

---

## Sprint 3 — Growth Features (2 minggu)

**Goal**: Corporate onboard, MRV digital, AI production-ready

| Story | Epic | Title | Points |
|-------|------|-------|--------|
| S021 | E3 | Corporate registration flow | 5 |
| S022 | E3 | Carbon credit marketplace listing | 8 |
| S023 | E3 | Carbon credit purchase + invoice | 8 |
| S024 | E4 | Certificate generation (kontribusi + karbon) | 5 |
| S025 | E5 | Verifikator review & approve MRV | 5 |
| S026 | E5 | MRV submission form (Mitra) | 5 |
| S027 | E6 | Admin project management CRUD | 5 |
| S028 | E8 | AI panel: context injection per role | 5 |
| S029 | E8 | AI streaming response | 3 |
| S030 | E2 | MRV dashboard Mitra | 3 |

**Sprint 3 Velocity**: 52 points

---

## Sprint 4 — Polish & Launch (2 minggu)

**Goal**: Production deploy, ESG reporting, complete test coverage

| Story | Epic | Title | Points |
|-------|------|-------|--------|
| S031 | E3 | Corporate ESG portfolio dashboard | 8 |
| S032 | E5 | Verifikator: abrasi + penyu data input | 5 |
| S033 | E6 | Admin user management (ban, role change) | 3 |
| S034 | E6 | Platform settings (harga CO2e, fee) | 3 |
| S035 | E8 | AI analysis history per session | 3 |
| S036 | — | Performance audit + Core Web Vitals | 5 |
| S037 | — | Security audit (OWASP Top 10) | 5 |
| S038 | — | E2E tests critical flows | 8 |
| S039 | — | Production deployment (Vercel) | 3 |
| S040 | — | Monitoring setup (error tracking) | 3 |

**Sprint 4 Velocity**: 46 points

---

## Backlog Refinement Rules (Bob PO)

1. Story masuk Sprint hanya jika: AC jelas, desain tersedia, dependencies selesai
2. Stories > 8 points wajib dipecah
3. Setiap story punya: Deskripsi, AC, Test hints
4. P0 stories tidak boleh di-skip atau di-defer
5. Tech debt (TD-*) wajib ada dalam setiap sprint (maks 20% capacity)

## Sprint Ceremony Schedule (Alex SM)

| Ceremony | Waktu | Durasi |
|----------|-------|--------|
| Sprint Planning | Senin minggu 1 | 2 jam |
| Daily Standup | Setiap hari | 15 menit |
| Sprint Review | Jumat minggu 2 | 1 jam |
| Retrospective | Jumat minggu 2 | 45 menit |
| Backlog Refinement | Rabu minggu 1 | 1 jam |

---

## Definition of Done (Universal)

- [ ] Code diimplementasi dan berjalan di local
- [ ] Tidak ada TypeScript error
- [ ] Tidak ada console.error di production paths
- [ ] Convex schema valid (tidak ada validation error)
- [ ] Responsive: mobile + desktop
- [ ] Tested: minimal happy path manual
- [ ] Tidak ada hardcoded credentials
- [ ] PR merged ke main

---

*Dokumen ini dihasilkan oleh Bob (BMAD PO) + Alex (BMAD SM) pada BMAD Phase I Party Mode — ID-MAP v2.0*
