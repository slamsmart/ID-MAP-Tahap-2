# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 02-auth.spec.ts >> login demo sahabat → /user
- Location: tests\e2e\02-auth.spec.ts:5:5

# Error details

```
TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e4]:
      - link "ID-MAP" [ref=e5] [cursor=pointer]:
        - /url: /
        - img "ID-MAP" [ref=e6]
      - generic [ref=e7]:
        - generic [ref=e8]:
          - img [ref=e9]
          - text: Platform Integrasi Data Ekosistem Pesisir Berkelanjutan
        - heading "Satu Platform. Seluruh Ekosistem Mangrove & Pesisir Indonesia." [level=2] [ref=e12]:
          - text: Satu Platform.
          - text: Seluruh Ekosistem Mangrove & Pesisir
          - text: Indonesia.
        - paragraph [ref=e13]: Data terintegrasi untuk pemantauan restorasi lingkungan, rehabilitasi, dan keberlanjutan pesisir nusantara.
        - generic [ref=e14]:
          - generic [ref=e15]:
            - generic [ref=e16]: "12.456"
            - generic [ref=e17]: Sahabat Terlibat
          - generic [ref=e18]:
            - generic [ref=e19]: 1.285.760
            - generic [ref=e20]: Bibit Ditanam
          - generic [ref=e21]:
            - generic [ref=e22]: 823.456 Ton
            - generic [ref=e23]: Serapan Karbon (CO₂e)
          - generic [ref=e24]:
            - generic [ref=e25]: Rp 98,65 M
            - generic [ref=e26]: Potensi Nilai Carbon
      - generic [ref=e27]:
        - paragraph [ref=e28]: “ID-MAP memudahkan kami memantau proyek restorasi mangrove secara real-time dan transparan.”
        - generic [ref=e29]:
          - generic [ref=e30]: DR
          - generic [ref=e31]:
            - generic [ref=e32]: Dr. Rina S.
            - generic [ref=e33]: Direktur, Yayasan Mangrove Indonesia
    - generic [ref=e34]:
      - generic [ref=e35]:
        - link "Beranda ID-MAP" [ref=e36] [cursor=pointer]:
          - /url: /
          - img "ID-MAP" [ref=e38]
        - generic [ref=e39]:
          - img [ref=e40]
          - button "EN" [ref=e43]
          - button "ID" [ref=e44]
      - generic [ref=e46]:
        - generic [ref=e47]:
          - heading "Selamat Datang Kembali 👋" [level=1] [ref=e48]
          - paragraph [ref=e49]: Masuk ke akun Anda untuk melanjutkan perjalanan karbon.
        - generic [ref=e50]:
          - button "Sahabat" [ref=e51]
          - button "Mitra" [ref=e52]
        - generic [ref=e53]:
          - img [ref=e54]
          - paragraph [ref=e57]: Donasi QRIS, pantau dampak, & sertifikat
        - generic [ref=e58]:
          - generic [ref=e59]:
            - text: Alamat Email
            - generic [ref=e60]:
              - img [ref=e61]
              - textbox "Alamat Email" [ref=e64]:
                - /placeholder: nama@email.com
          - generic [ref=e65]:
            - generic [ref=e66]:
              - text: Kata Sandi
              - link "Lupa password?" [ref=e67] [cursor=pointer]:
                - /url: /lupa-password
            - generic [ref=e68]:
              - img [ref=e69]
              - textbox "Kata Sandi" [ref=e72]:
                - /placeholder: Masukkan kata sandi
              - button "Tampilkan password" [ref=e73]:
                - img [ref=e74]
          - generic [ref=e77]:
            - checkbox "Ingat saya" [ref=e78]
            - text: Ingat saya
          - button "Masuk" [ref=e79]:
            - text: Masuk
            - img [ref=e80]
        - generic [ref=e82]:
          - generic [ref=e83]:
            - paragraph [ref=e84]: Demo Akun
            - text: Sahabat
          - generic [ref=e85]:
            - generic [ref=e86]: user@idmap.iduser123
            - button "Isi Otomatis" [ref=e87]
        - paragraph [ref=e88]:
          - text: Belum punya akun?
          - link "Daftar Sekarang" [ref=e89] [cursor=pointer]:
            - /url: /daftar
  - button "Buka Live Chat" [ref=e90]:
    - img [ref=e91]
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
> 12 |   await page.waitForURL(/\/user(\/|$)/, { timeout: 30_000 });
     |              ^ TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
  13 |   await expect(page).toHaveURL(/\/user(\/|$)/);
  14 | });
  15 | 
  16 | test("login dengan password salah menampilkan error", async ({ page }) => {
  17 |   await page.goto("/masuk");
  18 |   await page.getByLabel(/email/i).fill("user@idmap.id");
  19 |   await page.locator("#login-password").fill("wrong-password-123");
  20 |   await page.getByRole("button", { name: /masuk|log\s*in/i }).click();
  21 | 
  22 |   await expect(page.getByText(/email atau password salah|invalid email or password/i)).toBeVisible({
  23 |     timeout: 15_000,
  24 |   });
  25 | });
  26 | 
```