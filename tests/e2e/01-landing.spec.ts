import { test, expect } from "@playwright/test";

// Smoke 1: Landing page render
// Mengejar: hero render, navbar tampil, link "Masuk" hadir.
test("landing page renders hero & primary CTA", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/ID[- ]?MAP|Mangrove/i);
  await expect(page.getByRole("link", { name: /masuk|log\s*in/i }).first()).toBeVisible();
});
