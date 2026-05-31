# Playwright E2E — ID-MAP

Smoke test untuk 4 critical journey.

## Setup pertama kali

```bash
npm install               # menarik @playwright/test
npm run test:e2e:install  # download browser chromium
```

## Jalankan

```bash
npm run test:e2e          # headless, dev server otomatis di-spawn
npm run test:e2e:ui       # interactive UI mode
```

## Konfigurasi

- `E2E_BASE_URL` — override URL (default `http://localhost:3000`)
- `E2E_PORT` — override port jika dev server tidak di 3000
- `E2E_NO_SERVER=1` — jangan spawn dev server (jika sudah running)

## Cakupan

| File | Skenario |
|---|---|
| `01-landing.spec.ts` | Landing render, navbar, CTA |
| `02-auth.spec.ts` | Login demo sahabat, error path |
| `03-route-guard.spec.ts` | Middleware proteksi 5 protected routes |
| `04-api-health.spec.ts` | Webhook reachable, `/api/auth/me`, validasi login |
