import { test, expect } from "@playwright/test";

// Smoke 2: Auth — login demo "sahabat" → /user dashboard.
// Demo akun di-bootstrap on-demand oleh /api/auth/register kalau belum ada.
test("login demo sahabat → /user", async ({ page }) => {
  await page.goto("/masuk");

  await page.getByLabel(/email/i).fill("user@idmap.id");
  await page.locator("#login-password").fill("user123");
  await page.getByRole("button", { name: /masuk|log\s*in/i }).click();

  await page.waitForURL(/\/user(\/|$)/, { timeout: 30_000 });
  await expect(page).toHaveURL(/\/user(\/|$)/);
});

test("login dengan password salah menampilkan error", async ({ page }) => {
  await page.goto("/masuk");
  await page.getByLabel(/email/i).fill("user@idmap.id");
  await page.locator("#login-password").fill("wrong-password-123");
  await page.getByRole("button", { name: /masuk|log\s*in/i }).click();

  await expect(page.getByText(/email atau password salah|invalid email or password/i)).toBeVisible({
    timeout: 15_000,
  });
});
