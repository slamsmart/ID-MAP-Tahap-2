import { test, expect } from "@playwright/test";

// Smoke 3: Middleware proteksi rute. Tanpa cookie sesi, akses /admin
// /verifikator /mitra /user harus redirect ke portal login yang sesuai
// dengan ?next=... agar UX bisa redirect-back setelah login.
const PROTECTED_PATHS = [
  { path: "/admin", loginPath: "/masuk/admin" },
  { path: "/verifikator", loginPath: "/masuk/verifikator" },
  { path: "/mitra", loginPath: "/masuk" },
  { path: "/corporate", loginPath: "/masuk" },
  { path: "/user", loginPath: "/masuk" },
];

for (const { path, loginPath } of PROTECTED_PATHS) {
  test(`route guard: GET ${path} tanpa sesi → ${loginPath}`, async ({ page }) => {
    const response = await page.goto(path);
    await expect(page).toHaveURL(new RegExp(`${loginPath.replace(/\//g, "\\/")}(\\?|$)`), { timeout: 15_000 });
    expect(page.url()).toMatch(/[?&]next=/);
    expect(response?.status()).toBeLessThan(500);
  });
}
