# Product Requirements Document — ID-MAP v2.0
> Agent: 📋 John (Product Manager) | BMAD Phase I — Step 2

---

## 1. Overview

| Field | Value |
|-------|-------|
| Product | ID-MAP (Integrasi Data dan Manajemen Pesisir) |
| Version | 2.0 |
| Status | In Development |
| Tech Stack | Next.js 14 + Convex + TypeScript + Tailwind CSS |
| Target Launch | Q3 2026 |

---

## 2. Goals & Non-Goals

### Goals
- G1: Platform multi-role yang production-ready dengan auth, KYC, dan payment
- G2: Carbon credit marketplace end-to-end (listing → transaksi → sertifikat)
- G3: Community donation engine terintegrasi Mayar.id
- G4: MRV digital dengan audit trail
- G5: Interactive map mangrove nasional Indonesia
- G6: AI analysis panel untuk kondisi ekosistem

### Non-Goals
- Mobile native app
- Blockchain tokenization
- Multi-currency (selain IDR)
- Real-time sensor IoT

---

## 3. User Stories by Role

### 3.1 Sahabat (Community Donor)

| ID | Story | Priority | Acceptance Criteria |
|----|-------|----------|---------------------|
| US-S01 | Sebagai sahabat, saya ingin daftar akun dengan email dan OTP agar bisa mulai berkontribusi | P0 | Form daftar → OTP email → akun aktif dalam <2 menit |
| US-S02 | Sebagai sahabat, saya ingin donasi ke proyek mangrove via QRIS agar mudah dari HP | P0 | Pilih proyek → pilih nominal → QR Mayar.id → konfirmasi webhook → sertifikat |
| US-S03 | Sebagai sahabat, saya ingin lihat dampak kontribusi saya (tCO2e, pohon) | P0 | Dashboard impact realtime dari Convex |
| US-S04 | Sebagai sahabat, saya ingin download sertifikat kontribusi saya | P1 | PDF/PNG sertifikat dengan nama, tanggal, tCO2e |
| US-S05 | Sebagai sahabat, saya ingin lihat riwayat donasi saya | P1 | List transaksi dengan status dan amount |
| US-S06 | Sebagai sahabat, saya ingin update profil dan notifikasi | P2 | Form edit profil, toggle notifikasi email |

### 3.2 Mitra (Project Manager)

| ID | Story | Priority | Acceptance Criteria |
|----|-------|----------|---------------------|
| US-M01 | Sebagai mitra, saya ingin daftar dan upload dokumen KYC agar terverifikasi | P0 | Upload KTP/NIB/Akta → status menunggu → admin approve → role aktif |
| US-M02 | Sebagai mitra, saya ingin buat proyek mangrove baru dengan detail lengkap | P0 | Form proyek: judul, lokasi, provinsi, area, CO2e, deskripsi, foto |
| US-M03 | Sebagai mitra, saya ingin update progress proyek saya (0-100%) | P0 | Slider progress → simpan → history log |
| US-M04 | Sebagai mitra, saya ingin submit laporan MRV per kuartal | P1 | Form MRV: periode, tipe (M/R/V), upload dokumen |
| US-M05 | Sebagai mitra, saya ingin lihat pendanaan masuk ke proyek saya | P1 | Dashboard funding: total donasi, sumber, timeline |
| US-M06 | Sebagai mitra, saya ingin daftar proyek ke SRN (registry karbon) | P2 | Button "Daftarkan ke SRN" → status Pending → Terdaftar |
| US-M07 | Sebagai mitra, saya ingin pakai AI untuk analisis kondisi mangrove saya | P2 | Panel AI dengan konteks proyek → response DeepSeek/Gemini |

### 3.3 Corporate (Carbon Buyer)

| ID | Story | Priority | Acceptance Criteria |
|----|-------|----------|---------------------|
| US-C01 | Sebagai corporate, saya ingin register dengan profil perusahaan | P0 | Form: nama perusahaan, NIB, NPWP, alamat |
| US-C02 | Sebagai corporate, saya ingin browse proyek mangrove terverifikasi | P0 | List proyek dengan filter: provinsi, tipe, CO2e tersedia |
| US-C03 | Sebagai corporate, saya ingin beli karbon kredit dengan harga transparan | P0 | Pilih proyek → kalkulasi tCO2e × harga → checkout → invoice |
| US-C04 | Sebagai corporate, saya ingin dapat sertifikat karbon kredit | P0 | Sertifikat PDF dengan nomor sertifikat, co2, tanggal |
| US-C05 | Sebagai corporate, saya ingin laporan ESG portfolio karbon saya | P1 | Dashboard ESG: total offset, proyek, periode, export PDF |
| US-C06 | Sebagai corporate, saya ingin estimasi kebutuhan offset dari emisi saya | P2 | Kalkulator emisi → rekomendasi proyek |

### 3.4 Verifikator

| ID | Story | Priority | Acceptance Criteria |
|----|-------|----------|---------------------|
| US-V01 | Sebagai verifikator, saya ingin lihat semua proyek yang butuh verifikasi | P0 | Queue proyek status "Dalam Proses" |
| US-V02 | Sebagai verifikator, saya ingin approve/reject laporan MRV mitra | P0 | Review laporan → approve/reject dengan catatan → notifikasi mitra |
| US-V03 | Sebagai verifikator, saya ingin input data peta abrasi pantai | P1 | Form input titik koordinat + tingkat abrasi + upload foto |
| US-V04 | Sebagai verifikator, saya ingin update data penyu di peta | P1 | Form input penampakan penyu: koordinat, spesies, tanggal |
| US-V05 | Sebagai verifikator, saya ingin kelola data Pokmaswas | P2 | CRUD kelompok masyarakat pengawas: nama, lokasi, kontak |

### 3.5 Admin

| ID | Story | Priority | Acceptance Criteria |
|----|-------|----------|---------------------|
| US-A01 | Sebagai admin, saya ingin approve/reject KYC pengguna | P0 | Review dokumen → approve/reject → notifikasi user |
| US-A02 | Sebagai admin, saya ingin manage semua proyek di platform | P0 | CRUD proyek, ubah status, assign verifikator |
| US-A03 | Sebagai admin, saya ingin lihat dashboard statistik platform | P0 | Total users, proyek, CO2e, transaksi, aktivitas terkini |
| US-A04 | Sebagai admin, saya ingin manage pengguna (ban, role change) | P1 | List user → filter/search → edit role → ban |
| US-A05 | Sebagai admin, saya ingin setting platform (harga CO2e, fee) | P1 | Form setting: harga per ton, platform fee %, info kontak |
| US-A06 | Sebagai admin, saya ingin lihat semua transaksi dan laporan keuangan | P1 | List transaksi dengan filter, export CSV |
| US-A07 | Sebagai admin, saya ingin analisis AI untuk platform secara keseluruhan | P2 | AI panel dengan context data platform |

---

## 4. Functional Requirements

### FR-AUTH
- FR-AUTH-01: OTP via email (6 digit, expire 10 menit)
- FR-AUTH-02: Session via localStorage (JWT-like, tidak expired cepat)
- FR-AUTH-03: Role-based routing dengan SessionGuard
- FR-AUTH-04: Password hashed (bcrypt atau argon2)
- FR-AUTH-05: Logout clear session dan redirect ke /masuk

### FR-PAYMENT
- FR-PAY-01: Integrasi Mayar.id untuk QRIS dan Transfer
- FR-PAY-02: Webhook handler `/api/payment/webhook` untuk konfirmasi
- FR-PAY-03: Status payment: pending → paid → failed
- FR-PAY-04: Auto-generate sertifikat setelah payment success
- FR-PAY-05: Retry logic jika webhook gagal (max 3x)

### FR-CARBON
- FR-CC-01: Harga karbon kredit configurable oleh admin (IDR/tCO2e)
- FR-CC-02: Kalkulasi otomatis: amount × pricePerTon = totalAmount
- FR-CC-03: Sertifikat karbon dengan nomor unik (format: IDM-YYYY-XXXXX)
- FR-CC-04: Inventory tCO2e per proyek (tersedia vs terjual)
- FR-CC-05: Invoice/receipt otomatis

### FR-MAP
- FR-MAP-01: Peta mangrove nasional dengan Leaflet.js
- FR-MAP-02: Layer: abrasi, penyu, pokmaswas (toggle)
- FR-MAP-03: Data abrasion dari `/lib/abrasionData.ts`
- FR-MAP-04: Popup marker dengan detail data
- FR-MAP-05: Basemap: OpenStreetMap (default) + Satellite (toggle)

### FR-AI
- FR-AI-01: Panel AI di semua role dashboard
- FR-AI-02: Provider: OpenRouter (deepseek/deepseek-v4-flash:free primary, gemini fallback)
- FR-AI-03: Context injection: role user + data proyek relevan
- FR-AI-04: Streaming response
- FR-AI-05: Riwayat chat per sesi (bukan persistent)

---

## 5. Non-Functional Requirements

| Category | Requirement | Target |
|----------|-------------|--------|
| Performance | First Contentful Paint | ≤1.5 detik |
| Performance | API response time (Convex) | ≤300ms p95 |
| Performance | Map render time | ≤2 detik |
| Availability | Uptime | ≥99.5% |
| Security | Auth token | No bare tokens in localStorage — use encrypted session |
| Security | Upload | Cloudinary signed upload, max 5MB, whitelist MIME |
| Security | Payment webhook | Verify signature dari Mayar.id |
| Scalability | Concurrent users | 1.000 simultaneous |
| SEO | Landing page | LCP ≤2.5s, CLS ≤0.1 |
| Accessibility | WCAG | Level AA minimal |
| i18n | Bahasa | Indonesia (primary), English (partial) |

---

## 6. Feature Flags

| Flag | Default | Scope |
|------|---------|-------|
| `ENABLE_CORPORATE_ROLE` | false | Aktifkan setelah E3 selesai |
| `ENABLE_SRN_INTEGRATION` | false | Aktifkan setelah integrasi API SRN |
| `ENABLE_NFT_CERT` | false | Roadmap v3.0 |
| `AI_STREAMING` | true | Bisa dimatikan jika provider tidak support |

---

## 7. Epics Roadmap

| Epic | Name | Sprint | Status |
|------|------|--------|--------|
| E0 | Migration & Foundation | S1 | 🔄 In Progress |
| E1 | Auth & User Management | S1-S2 | ⏳ Planned |
| E2 | Project Management (Mitra) | S2-S3 | ⏳ Planned |
| E3 | Carbon Marketplace (Corporate) | S3-S4 | ⏳ Planned |
| E4 | Community Donations (Sahabat) | S2-S3 | ⏳ Planned |
| E5 | Verification & MRV (Verifikator) | S3-S4 | ⏳ Planned |
| E6 | Admin Dashboard | S2-S4 | ⏳ Planned |
| E7 | Map & GIS | S2-S3 | ⏳ Planned |
| E8 | AI Features | S3-S4 | ⏳ Planned |

---

*Dokumen ini dihasilkan oleh John (BMAD Product Manager) pada BMAD Phase I Party Mode — ID-MAP v2.0*
