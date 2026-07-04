# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 02-auth.spec.ts >> login dengan password salah menampilkan error
- Location: tests\e2e\02-auth.spec.ts:16:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/email atau password salah|invalid email or password/i)
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for getByText(/email atau password salah|invalid email or password/i)

```

```yaml
- link "ID-MAP":
  - /url: /
  - img "ID-MAP"
- text: Platform Integrasi Data Ekosistem Pesisir Berkelanjutan
- heading "Satu Platform. Seluruh Ekosistem Mangrove & Pesisir Indonesia." [level=2]
- paragraph: Data terintegrasi untuk pemantauan restorasi lingkungan, rehabilitasi, dan keberlanjutan pesisir nusantara.
- text: 12.456 Sahabat Terlibat 1.285.760 Bibit Ditanam 823.456 Ton Serapan Karbon (CO₂e) Rp 98,65 M Potensi Nilai Carbon
- paragraph: “ID-MAP memudahkan kami memantau proyek restorasi mangrove secara real-time dan transparan.”
- text: DR Dr. Rina S. Direktur, Yayasan Mangrove Indonesia
- button "EN"
- button "ID"
- heading "Selamat Datang Kembali 👋" [level=1]
- paragraph: Masuk ke akun Anda untuk melanjutkan perjalanan karbon.
- button "Sahabat"
- button "Mitra"
- paragraph: Donasi QRIS, pantau dampak, & sertifikat
- text: Alamat Email
- textbox "Alamat Email":
  - /placeholder: nama@email.com
- text: Kata Sandi
- link "Lupa password?":
  - /url: /lupa-password
- textbox "Kata Sandi":
  - /placeholder: Masukkan kata sandi
- button "Tampilkan password"
- checkbox "Ingat saya"
- text: Ingat saya
- button "Masuk"
- paragraph: Demo Akun
- text: Sahabat user@idmap.id user123
- button "Isi Otomatis"
- paragraph:
  - text: Belum punya akun?
  - link "Daftar Sekarang":
    - /url: /daftar
- button "Buka Live Chat"
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | // Smoke 2: Auth — login demo "sahabat" → /user dashboard.
  4  | // Demo akun di-bootstrap on-demand oleh /api/auth/register kalau belum ada.
  5  | test("login demo sahabat → /user", async ({ page }) => {
  6  |   await page.goto("/masuk");
  7  | 
  8  |   await page.getByLabel(/email/i).fill("user@idmap.id");
  9  |   await page.locator("#login-password").fill("user123");
  10 |   await page.getByRole("button", { name: /masuk|log\s*in/i }).click();
  11 | 
  12 |   await page.waitForURL(/\/user(\/|$)/, { timeout: 30_000 });
  13 |   await expect(page).toHaveURL(/\/user(\/|$)/);
  14 | });
  15 | 
  16 | test("login dengan password salah menampilkan error", async ({ page }) => {
  17 |   await page.goto("/masuk");
  18 |   await page.getByLabel(/email/i).fill("user@idmap.id");
  19 |   await page.locator("#login-password").fill("wrong-password-123");
  20 |   await page.getByRole("button", { name: /masuk|log\s*in/i }).click();
  21 | 
> 22 |   await expect(page.getByText(/email atau password salah|invalid email or password/i)).toBeVisible({
     |                                                                                        ^ Error: expect(locator).toBeVisible() failed
  23 |     timeout: 15_000,
  24 |   });
  25 | });
  26 | 
```