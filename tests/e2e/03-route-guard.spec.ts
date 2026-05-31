import { test, expect } from "@playwright/test";

// Smoke 3: Middleware proteksi rute. Tanpa cookie sesi, akses /admin
// /verifikator /mitra /user harus redirect ke /masuk dengan ?next=...
const PROTECTED_PATHS = ["/admin", "/verifikator", "/mitra", "/corporate", "/user"];

for (const p of PROTECTED_PATHS) {
  test(`route guard: GET ${p} tanpa sesi → /masuk`, async ({ page }) => {
    const response = await page.goto(p);
    await expect(page).toHaveURL(/\/masuk(\?|$)/, { timeout: 15_000 });
    // Pastikan ?next= terbawa supaya UX bisa redirect-back setelah login.
    expect(page.url()).toMatch(/[?&]next=/);
    expect(response?.status()).toBeLessThan(500);
  });
}
