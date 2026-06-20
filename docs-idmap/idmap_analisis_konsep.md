# ID-MAP Analisis Konsep Produk

## 1. Konsep Utama

ID-MAP adalah platform operasional dan data untuk ekosistem pesisir. Konsep utamanya adalah menghubungkan data, proyek, pendanaan publik, verifikasi, dan edukasi dalam satu sistem digital.

Produk ini tidak hanya berfungsi sebagai website informasi, tetapi sebagai workflow platform:
- Public discovery.
- Donation.
- Project management.
- KYC.
- MRV.
- Verification.
- Admin operations.
- AI-assisted support.

## 2. Product Pillars

| Pillar | Penjelasan |
|---|---|
| Data Integration | Data mangrove, abrasi, penyu, dan Pokmaswas disajikan dalam satu platform |
| Project Transparency | Proyek memiliki status, lokasi, progress, target, dan pendanaan |
| Public Participation | Sahabat dapat berdonasi dan melihat kontribusinya |
| Verification | KYC dan MRV membantu menjaga kualitas data/proyek |
| Operational Dashboard | Setiap role memiliki dashboard sesuai kebutuhan |
| AI Assistance | AI membantu edukasi, analisis, dan operasional |

## 3. Scope Konseptual

### 3.1 Public Layer

Public layer adalah area tanpa login.

Fungsi:
- Memperkenalkan ID-MAP.
- Menampilkan proyek.
- Menyediakan peta interaktif.
- Memberikan edukasi ekosistem pesisir.
- Memfasilitasi donasi cepat.
- Menjawab pertanyaan melalui live chat AI.

Halaman utama:
- `/`
- `/proyek`
- `/donasi-cepat/[projectId]`
- `/jelajahi-peta-mangrove`
- `/uji-coba-peta`
- `/edukasi-ekosistem-pesisir`
- `/tentang`
- `/faq`
- `/mitra-kami`

### 3.2 Role Dashboard Layer

Dashboard layer adalah area setelah login.

| Dashboard | Fokus |
|---|---|
| Sahabat | Kontribusi, dampak, sertifikat |
| Mitra | Proyek, pendanaan, KYC, MRV |
| Verifikator | Review data, peta, konten publik |
| Admin | Operasional platform |

### 3.3 Data & Verification Layer

Layer ini memastikan data proyek dan user dapat dipercaya.

Komponen:
- KYC documents.
- Project status.
- MRV reports.
- System activities.
- Verifikator review.
- Admin review.

### 3.4 Payment Layer

Payment layer difokuskan pada donasi publik.

Komponen:
- QRIS creation.
- Invoice creation.
- Pending contribution.
- Webhook confirmation.
- Contribution status update.

### 3.5 AI Layer

AI layer digunakan untuk:
- Chat publik.
- Analisis mangrove.
- Bantuan dashboard.
- Edukasi user.

Guardrails:
- Rate limiting.
- Message trimming.
- System message stripping.
- Provider fallback.

## 4. Core Workflows

### 4.1 Donasi

```text
Landing/proyek
  -> Pilih proyek
  -> Pilih nominal
  -> Create QRIS
  -> Contribution pending
  -> Payment webhook
  -> Contribution paid
  -> Riwayat dan sertifikat
```

### 4.2 Proyek Mitra

```text
Mitra login
  -> Submit KYC
  -> Create project
  -> Isi detail proyek
  -> Submit/update progress
  -> Review admin/verifikator
  -> Project verified
```

### 4.3 MRV

```text
Mitra submit report
  -> MRV status menunggu/dalam proses
  -> Verifikator review
  -> Approve/reject
  -> Status update
```

### 4.4 Konten Publik

```text
Verifikator/Admin login
  -> Edit landing/about/FAQ/footer
  -> Convex update
  -> Public page updates via live query
```

## 5. Differentiator

| Aspek | Nilai Pembeda |
|---|---|
| Multi-role | Satu sistem untuk publik, mitra, verifikator, admin |
| Real-time backend | Convex live query membuat data cepat update |
| Payment connected | Donasi langsung terhubung ke proyek |
| GIS and map | Data pesisir divisualisasikan |
| AI support | Edukasi dan analisis lebih mudah diakses |
| Security baseline | Cookie session, rate limit, CAPTCHA, webhook verification |

## 6. Batasan Konsep

Yang belum menjadi fokus:
- Marketplace karbon.
- Corporate purchase flow.
- ESG corporate dashboard.
- Sertifikasi karbon resmi sebagai transaksi jual beli.
- Blockchain/tokenisasi.
- IoT.
- Native mobile app.

Estimasi CO2e di flow donasi digunakan sebagai narasi dampak/support, bukan klaim regulatori jual beli karbon.

## 7. MVP Definition

MVP ID-MAP dianggap tercapai jika:
- Public landing dapat menjelaskan produk.
- User dapat login sesuai role.
- Sahabat dapat donasi ke proyek.
- Mitra dapat submit proyek dan KYC.
- Verifikator/Admin dapat review data utama.
- Peta interaktif tersedia.
- AI chat berjalan.
- Payment webhook dapat mengubah status kontribusi.
- Deployment production stabil.

## 8. Pilot Definition

Pilot dianggap siap jika:
- Role registration lebih ketat.
- Test coverage bertambah.
- CSP diterapkan.
- Authorization mutation diperkuat.
- Dashboard CRUD utama stabil.
- Payment live/sandbox jelas untuk demo.
- Dokumentasi operasional lengkap.

