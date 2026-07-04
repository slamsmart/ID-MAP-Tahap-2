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
    - generic [ref=e8]:
      - link "ID-MAP" [ref=e9] [cursor=pointer]:
        - /url: /
        - img "ID-MAP" [ref=e10]
      - generic [ref=e11]:
        - generic [ref=e12]:
          - img [ref=e13]
          - generic [ref=e16]: Platform Integrasi Data Ekosistem Pesisir Berkelanjutan
        - heading "Satu Platform. Seluruh Ekosistem Mangrove & Pesisir Indonesia." [level=2] [ref=e17]:
          - text: Satu Platform.
          - text: Seluruh Ekosistem Mangrove & Pesisir
          - text: Indonesia.
        - paragraph [ref=e18]: Data terintegrasi untuk pemantauan restorasi lingkungan, rehabilitasi, dan keberlanjutan pesisir nusantara.
        - generic [ref=e19]:
          - generic [ref=e20]:
            - generic [ref=e21]: "12.456"
            - generic [ref=e22]: Sahabat Terlibat
          - generic [ref=e23]:
            - generic [ref=e24]: 1.285.760
            - generic [ref=e25]: Bibit Ditanam
          - generic [ref=e26]:
            - generic [ref=e27]: 823.456 Ton
            - generic [ref=e28]: Serapan Karbon (CO₂e)
          - generic [ref=e29]:
            - generic [ref=e30]: Rp 98,65 M
            - generic [ref=e31]: Potensi Nilai Carbon
      - generic [ref=e32]:
        - paragraph [ref=e33]: “ID-MAP memudahkan kami memantau proyek restorasi mangrove secara real-time dan transparan.”
        - generic [ref=e34]:
          - generic [ref=e35]: DR
          - generic [ref=e36]:
            - generic [ref=e37]: Dr. Rina S.
            - generic [ref=e38]: Direktur, Yayasan Mangrove Indonesia
    - generic [ref=e39]:
      - generic [ref=e41]:
        - img [ref=e42]
        - button "EN" [ref=e45] [cursor=pointer]
        - button "ID" [ref=e46] [cursor=pointer]
      - generic [ref=e48]:
        - generic [ref=e49]:
          - heading "Selamat Datang Kembali 👋" [level=1] [ref=e50]
          - paragraph [ref=e51]: Masuk ke akun Anda untuk melanjutkan perjalanan karbon.
        - generic [ref=e52]:
          - button "Sahabat" [ref=e53] [cursor=pointer]
          - button "Mitra" [ref=e54] [cursor=pointer]
        - generic [ref=e55]:
          - img [ref=e56]
          - paragraph [ref=e59]: Donasi QRIS, pantau dampak, & sertifikat
        - generic [ref=e60]:
          - generic [ref=e61]:
            - generic [ref=e62]: Alamat Email
            - generic [ref=e63]:
              - img [ref=e64]
              - textbox "Alamat Email" [ref=e67]:
                - /placeholder: nama@email.com
          - generic [ref=e68]:
            - generic [ref=e69]:
              - generic [ref=e70]: Kata Sandi
              - link "Lupa password?" [ref=e71] [cursor=pointer]:
                - /url: /lupa-password
            - generic [ref=e72]:
              - img [ref=e73]
              - textbox "Kata Sandi" [ref=e76]:
                - /placeholder: Masukkan kata sandi
              - button "Tampilkan password" [ref=e77] [cursor=pointer]:
                - img [ref=e78]
          - generic [ref=e81]:
            - checkbox "Ingat saya" [ref=e82]
            - generic [ref=e83]: Ingat saya
          - button "Masuk" [ref=e84] [cursor=pointer]:
            - text: Masuk
            - img [ref=e85]
        - generic [ref=e87]:
          - generic [ref=e88]:
            - paragraph [ref=e89]: Demo Akun
            - generic [ref=e90]: Sahabat
          - generic [ref=e91]:
            - generic [ref=e92]:
              - generic [ref=e93]: user@idmap.id
              - generic [ref=e94]: user123
            - button "Isi Otomatis" [ref=e95] [cursor=pointer]
        - paragraph [ref=e96]:
          - text: Belum punya akun?
          - link "Daftar Sekarang" [ref=e97] [cursor=pointer]:
            - /url: /daftar
  - button "Buka Live Chat" [ref=e98] [cursor=pointer]:
    - img [ref=e99]
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