import { test, expect } from "@playwright/test";

// Smoke 4: API health endpoints — webhook GET (reachability check)
// dan /api/auth/me (anonymous) harus 200 + null user.
test("webhook GET endpoint reachable", async ({ request }) => {
  const r = await request.get("/api/payment/webhook");
  expect(r.ok()).toBeTruthy();
  const body = await r.json();
  expect(body.ok).toBe(true);
});

test("/api/auth/me without cookie returns null user", async ({ request }) => {
  const r = await request.get("/api/auth/me");
  expect(r.ok()).toBeTruthy();
  const body = await r.json();
  expect(body.user).toBeNull();
});

test("/api/auth/login dengan body kosong → 400", async ({ request }) => {
  const r = await request.post("/api/auth/login", {
    data: {},
    headers: { "Content-Type": "application/json" },
  });
  expect(r.status()).toBe(400);
});
