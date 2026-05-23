# UX Specification — ID-MAP v2.0
> Agent: 🎨 Amelia (UX Designer) | BMAD Phase I — Step 4

---

## 1. Design Principles

1. **Alam sebagai estetika** — palette hijau-biru ekosistem pesisir, organic shapes
2. **Trust-first** — setiap angka ada sumbernya, sertifikat nyata, tidak ada dark patterns
3. **Mobile-first** — 70% target user akses via HP (QRIS native)
4. **Progressive disclosure** — kompleksitas tersembunyi sampai user butuh
5. **Bahasa manusia** — tidak ada jargon teknis di UI user-facing

---

## 2. Design Tokens

### Colors
```css
/* Primary — Mangrove Green */
--color-primary-50:  #f0fdf4;
--color-primary-100: #dcfce7;
--color-primary-500: #22c55e;
--color-primary-600: #16a34a;   /* CTA primary */
--color-primary-700: #15803d;
--color-primary-900: #14532d;

/* Secondary — Ocean Blue */
--color-secondary-500: #0ea5e9;
--color-secondary-600: #0284c7;

/* Accent — Sunset Amber (carbon, donation) */
--color-accent-500: #f59e0b;
--color-accent-600: #d97706;

/* Neutral */
--color-slate-50:  #f8fafc;
--color-slate-900: #0f172a;

/* Semantic */
--color-success:  #22c55e;
--color-warning:  #f59e0b;
--color-error:    #ef4444;
--color-info:     #0ea5e9;
```

### Typography
```css
--font-sans: "Geist", system-ui, sans-serif;
--font-mono: "Geist Mono", monospace;

/* Scale */
--text-xs:   0.75rem  / 1rem;
--text-sm:   0.875rem / 1.25rem;
--text-base: 1rem     / 1.5rem;
--text-lg:   1.125rem / 1.75rem;
--text-xl:   1.25rem  / 1.75rem;
--text-2xl:  1.5rem   / 2rem;
--text-3xl:  1.875rem / 2.25rem;
--text-4xl:  2.25rem  / 2.5rem;
```

### Spacing
```css
/* 4px base grid */
--space-1: 0.25rem;  --space-2: 0.5rem;
--space-3: 0.75rem;  --space-4: 1rem;
--space-6: 1.5rem;   --space-8: 2rem;
--space-12: 3rem;    --space-16: 4rem;
--space-24: 6rem;
```

---

## 3. Component Patterns

### 3.1 Navigation — Navbar

```
┌────────────────────────────────────────────────────┐
│ [Logo] ID-MAP    [Beranda] [Proyek] [Peta] [Blog]  [Masuk] [Daftar] │
└────────────────────────────────────────────────────┘

Mobile:
┌──────────────────┐
│ [Logo]     [≡]   │
└──────────────────┘
```
- Sticky, glassmorphism background (backdrop-blur) on scroll
- Active link: border-bottom emerald-500
- CTA "Daftar" button: emerald-600 filled, rounded-full

### 3.2 Dashboard Layout

```
┌──────────────────────────────────────────────────────┐
│                  Navbar (top, sticky)                │
├─────────────────┬────────────────────────────────────┤
│                 │                                    │
│  Sidebar        │         Main Content               │
│  (240px fixed)  │         (fluid)                    │
│                 │                                    │
│  [Avatar]       │  ┌─── Page Title ───────────────┐  │
│  [Name]         │  │  Breadcrumb                  │  │
│  [Role badge]   │  └──────────────────────────────┘  │
│                 │                                    │
│  ─────────────  │  ┌── Stats Cards ──────────────┐  │
│  Nav items      │  │  [Card] [Card] [Card] [Card] │  │
│  (icons+labels) │  └──────────────────────────────┘  │
│                 │                                    │
│  ─────────────  │  ┌── Main Content Area ─────────┐  │
│  [AI Panel]     │  │                              │  │
│  (collapsible)  │  └──────────────────────────────┘  │
│                 │                                    │
│  [Logout]       │                                    │
└─────────────────┴────────────────────────────────────┘
```

### 3.3 Stats Card

```
┌─────────────────────┐
│  [Icon]  CO2e Total  │
│                      │
│  2.450 tCO2e         │
│  ↑ 12% bulan ini     │
└─────────────────────┘
```
- bg: white, border: slate-200, rounded-2xl
- Icon: emerald bg circle
- Number: text-3xl font-bold slate-900
- Trend: green/red with arrow icon

### 3.4 Project Card

```
┌─────────────────────────────┐
│  [Image 16:9]               │
│─────────────────────────────│
│  Terverifikasi ●            │
│  Mangrove Demak Utara       │
│  Jawa Tengah                │
│─────────────────────────────│
│  850 tCO2e  │  120 ha       │
│─────────────────────────────│
│  Progress: ████░░░  75%     │
│─────────────────────────────│
│  [Lihat Detail]    [Donasi] │
└─────────────────────────────┘
```

### 3.5 AI Panel (MangroveAIPanel)

```
┌────────────────────────────────┐
│ 🤖 Analisis AI Mangrove    [v] │
├────────────────────────────────┤
│  [Chat history...]             │
│                                │
│  [Input...] [Kirim →]         │
└────────────────────────────────┘
```
- Default: expanded on all dashboards
- Collapsible with smooth animation (Framer Motion)
- Context badge: role + proyek terkait

---

## 4. User Flows

### 4.1 Onboarding Sahabat

```
Landing → [Daftar] → Form Register (nama, email, password)
  → POST /api/auth/send-otp → Email OTP
  → [Masukkan Kode OTP 6 digit]
  → POST /api/auth/verify-otp
  → Redirect → /user (dashboard sahabat)
  → [Onboarding card: "Mulai pertama Anda"]
```

### 4.2 Donasi Sahabat

```
/user atau /proyek → [Pilih Proyek] → [Donasi]
  → Modal: Pilih nominal (Rp 10k / 50k / 100k / Custom)
  → Preview: "= 0.5 tCO2e, sekitar 5 pohon"
  → [Bayar via QRIS] → QR Code Mayar.id
  → [Webhook] → Payment confirmed
  → Toast: "Donasi berhasil! 🌿"
  → Certificate available di /user/sertifikat
```

### 4.3 Mitra — Buat Proyek

```
/mitra → [+ Proyek Baru]
  → Form step 1: Info dasar (judul, lokasi, provinsi, deskripsi)
  → Form step 2: Data teknis (area ha, CO2e target, tipe layanan)
  → Form step 3: Upload foto proyek (Cloudinary)
  → Submit → Convex mutation → status: "Draft"
  → Redirect ke /mitra/proyek/[id]
  → Banner: "Proyek dibuat! Ajukan verifikasi untuk mulai listing."
```

### 4.4 Corporate — Beli Carbon Credit

```
/corporate → [Beli Karbon] → Filter proyek terverifikasi
  → Pilih proyek → [Beli Carbon Credit]
  → Kalkulator: input tCO2e → kalkulasi harga otomatis
  → Form: nama perusahaan, NPWP, alamat pengiriman invoice
  → [Konfirmasi & Bayar] → Redirect ke halaman payment
  → Webhook → Confirmed → Sertifikat karbon digenerate
  → Download sertifikat + invoice PDF
```

### 4.5 Admin — Approve KYC

```
/admin → [Verifikasi KYC] → List pending KYC (badge count)
  → Klik user → Detail profil + dokumen
  → Review dokumen (viewer inline atau buka tab baru)
  → [Approve] / [Reject + catatan]
  → Convex mutation → kycStatus update
  → Notifikasi email ke user
  → Kembali ke queue
```

---

## 5. Micro-interactions

| Interaction | Behavior |
|-------------|----------|
| Button hover | Scale 1.02 + shadow-md (Framer Motion) |
| Form submit | Loading spinner, disable button, optimistic UI |
| Donasi berhasil | Confetti + toast sukses |
| KYC approved | Notification badge dismiss + toast |
| Map marker click | Smooth popup slide-in |
| AI response | Streaming text effect (typewriter) |
| Sidebar toggle | Smooth slide (240px → 0px) |
| Stats cards | Count-up animation on mount |
| Progress bar | Animate from 0 to value on mount |

---

## 6. Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| `sm` | 640px | Mobile: stacked, hamburger nav |
| `md` | 768px | Tablet: partial sidebar |
| `lg` | 1024px | Desktop: full sidebar + content |
| `xl` | 1280px | Wide: more content columns |

---

## 7. Empty States

| Context | Copy | Action |
|---------|------|--------|
| Sahabat belum donasi | "Belum ada kontribusi. Mulai dari Rp 10.000!" | → Browse Proyek |
| Mitra belum punya proyek | "Buat proyek mangrove pertamamu" | → + Proyek Baru |
| Admin KYC queue kosong | "Semua KYC sudah diproses ✓" | — |
| Verifikator queue kosong | "Tidak ada proyek menunggu verifikasi" | — |

---

## 8. Error States

| Error | Message | Recovery |
|-------|---------|----------|
| Login gagal | "Email atau password salah" | Retry form |
| OTP expired | "Kode OTP sudah kadaluarsa. Kirim ulang?" | Resend button |
| Payment gagal | "Pembayaran gagal. Coba lagi atau hubungi support." | Retry + WhatsApp CTA |
| Upload gagal | "Upload gagal. Max 5MB, format JPG/PNG/PDF." | Re-upload |
| Network error | "Koneksi terputus. Cek jaringanmu." | Auto-retry indicator |

---

## 9. Accessibility

- Semua form inputs: label + aria-label + error message id
- Tombol icon-only: aria-label wajib
- Fokus visible (ring-2 emerald) tidak dihapus
- Contrast ratio: minimum 4.5:1 (WCAG AA)
- Alt text wajib pada semua gambar konten
- Keyboard navigable: Tab, Enter, Escape
- Skip-to-main-content link di awal halaman

---

*Dokumen ini dihasilkan oleh Amelia (BMAD UX Designer) pada BMAD Phase I Party Mode — ID-MAP v2.0*
