# Project Brief — ID-MAP v2.0
> Agent: 🔍 Mary (Business Analyst) | BMAD Phase I — Step 1

---

## 1. Executive Summary

**ID-MAP** (Integrasi Data dan Manajemen Pesisir) adalah platform digital multi-peran untuk akselerasi restorasi dan perlindungan ekosistem mangrove Indonesia melalui perdagangan karbon transparan, pengelolaan proyek berbasis sains, donasi komunitas, dan verifikasi lapangan terstandar.

Platform ini menjawab dua krisis sekaligus:
1. Indonesia kehilangan ±52% dari 3,36 juta hektar mangrove akibat alih fungsi lahan dan abrasi
2. Pasar karbon sukarela Indonesia belum memiliki infrastruktur digital yang terpercaya dan aksesibel

---

## 2. Problem Statement

### 2.1 Domain Problems

| # | Problem | Impact | Root Cause |
|---|---------|--------|------------|
| P1 | Data mangrove tersebar, tidak terstandar, sulit diakses real-time | Kebijakan lambat, proyek overlapping | Tidak ada platform agregasi nasional |
| P2 | Korporasi ingin offset karbon tapi kesulitan menemukan proyek terverifikasi | Permintaan karbon tidak tersalurkan | Ketiadaan marketplace yang terpercaya |
| P3 | NGO/mitra lapangan kekurangan pendanaan dan tools manajemen proyek | Proyek stagnan, tidak scalable | Ekosistem funding yang fragmented |
| P4 | Masyarakat lokal tidak terlibat meaningful dalam konservasi | Aktivitas illegal meningkat | Tidak ada kanal partisipasi digital |
| P5 | Verifikasi MRV manual, lambat, mahal | Data tidak akurat, kepercayaan rendah | Tidak ada sistem MRV digital |

### 2.2 Market Opportunity

- **TAM**: Pasar karbon sukarela global ~$2B (2023) → projected $50B (2030)
- **SAM**: Pasar karbon mangrove Asia Tenggara ~$180M
- **SOM** (Year 1-2): 50 proyek terverifikasi × rata-rata 500 tCO2e × IDR 200.000/ton = **IDR 5B GMV**

### 2.3 Regulatory Alignment

Platform selaras dengan:
- **PMN 2025** (Pemulihan Mangrove Nasional) — target 600.000 ha restorasi
- **KKMD** (Kelompok Kerja Mangrove Daerah) — struktur verifikasi daerah
- **BRGMN** (Badan Restorasi Gambut & Mangrove Nasional) — framework pelaporan
- **Peraturan Presiden No. 98/2021** — Nilai Ekonomi Karbon
- **POJK No. 60/2023** — Perdagangan Karbon

---

## 3. Proposed Solution

ID-MAP v2.0 adalah platform SaaS multi-tenant dengan empat role utama:

| Role | Bahasa Umum | Fungsi Utama |
|------|-------------|--------------|
| `sahabat` | Relawan/Donatur | Donasi, tracking dampak, sertifikat |
| `mitra` | NGO/Pengelola Proyek | Manajemen proyek, upload MRV, pendanaan |
| `verifikator` | Ilmuwan Lapangan | Verifikasi data, peta abrasi, fauna |
| `admin` | Operator Platform | KYC, pengaturan sistem, laporan |

### 3.1 Core Features v2.0

1. **Mangrove Project Registry** — CRUD proyek, tracking progress, status SRN
2. **Carbon Credit Marketplace** — listing, kalkulasi CO2e, transaksi korporat
3. **Community Donation Engine** — QRIS/Transfer/CSR via Mayar.id
4. **KYC & Onboarding** — verifikasi dokumen (KTP/NIB/NPWP/Akta)
5. **MRV Digital** — laporan monitoring, reporting, verification dengan audit trail
6. **Interactive Map** — peta mangrove nasional, abrasi, penyu, pokmaswas (Leaflet)
7. **AI Analysis Panel** — analisis kondisi mangrove via OpenRouter (DeepSeek/Gemini)
8. **Certificates** — NFT-ready sertifikat karbon dan kontribusi
9. **OTP Authentication** — verifikasi email real-time
10. **Admin Dashboard** — manajemen pengguna, proyek, SRN, laporan

---

## 4. User Personas

### Persona 1 — Budi (Sahabat, 28th, Mahasiswa)
> "Saya ingin berkontribusi untuk lingkungan tapi tidak tahu caranya."
- Goal: donasi kecil yang terasa meaningful, lihat dampak nyata
- Pain: platform donasi tidak transparan, tidak ada bukti dampak
- Channel: Instagram → landing page → donasi QRIS

### Persona 2 — Ibu Sari (Mitra, 45th, Direktur NGO)
> "Proyek kami sudah ada tapi sulit dapat pendanaan karena tidak ada sistem pelaporan yang proper."
- Goal: kelola multi-proyek, laporan MRV otomatis, akses pasar karbon
- Pain: admin manual, Excel, tidak ada dashboard terpadu
- Channel: onboarding via admin, referral korporat

### Persona 3 — Pak Hendra (Corporate, 40th, CSR Manager)
> "Kami butuh offset karbon terverifikasi untuk laporan ESG kami."
- Goal: beli kredit karbon Indonesia, dapat laporan ESG siap audit
- Pain: tidak ada marketplace kredibel, proses panjang
- Channel: LinkedIn → mitra platform → corporate dashboard

### Persona 4 — Dr. Rini (Verifikator, 35th, Peneliti LIPI)
> "Data lapangan saya hilang di spreadsheet, tidak ada yang bisa akses."
- Goal: input data verifikasi lapangan, kolaborasi tim
- Pain: tools tersebar, tidak terintegrasi
- Channel: undangan admin platform

---

## 5. Success Metrics (KPIs)

### Phase II (6 bulan pertama setelah launch)
| Metric | Target |
|--------|--------|
| Registered Mitra | 20 NGO |
| Verified Projects | 10 proyek |
| tCO2e Listed | 5.000 ton |
| Corporate Buyers | 5 perusahaan |
| Community Donors | 500 sahabat |
| GMV Carbon Credits | IDR 1B |
| GMV Donations | IDR 250jt |
| MRV Reports Submitted | 30 laporan |

### Health Metrics
- Platform uptime: ≥99.5%
- KYC approval time: ≤48 jam
- Payment success rate: ≥98%
- AI analysis response time: ≤10 detik

---

## 6. Constraints & Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Regulasi karbon Indonesia berubah | Medium | High | Modular compliance layer, bukan hardcode |
| Fraud data MRV dari mitra | Medium | High | Verifikator independen + audit trail immutable |
| Payment gateway (Mayar.id) downtime | Low | Medium | Fallback ke transfer manual |
| AI provider (OpenRouter) rate limit | Medium | Low | Cache + queue + fallback provider |
| Low adoption korporat tahun pertama | High | High | Sales-assisted onboarding + pilot program |

---

## 7. Out of Scope (v2.0)

- Mobile app native (iOS/Android) — roadmap v3.0
- Blockchain/tokenisasi karbon kredit — roadmap v3.0
- Integrasi SPEI/SWIFT untuk transaksi internasional
- Multi-bahasa penuh (saat ini ID + EN partial)
- IoT sensor mangrove real-time

---

## 8. Stakeholders

| Stakeholder | Interest | Influence |
|-------------|----------|-----------|
| BRGMN | Pelaporan nasional | High |
| Kemenlingkungan | Regulasi | High |
| NGO Mitra | Platform utama | High |
| Korporat CSR | Revenue utama | High |
| Komunitas lokal | Partisipasi | Medium |
| Investor platform | Return & impact | Medium |

---

*Dokumen ini dihasilkan oleh Mary (BMAD Business Analyst) pada BMAD Phase I Party Mode — ID-MAP v2.0*
