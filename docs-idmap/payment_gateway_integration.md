# Payment Gateway Integration - Mayar.id

## 1. Overview

ID-MAP menggunakan Mayar.id untuk mendukung donasi publik melalui QRIS dan invoice. Fokus integrasi payment saat ini adalah kontribusi/donasi ke proyek mangrove, bukan pembelian carbon credit corporate.

Payment flow utama:
- User memilih proyek dan nominal donasi.
- Sistem membuat QRIS/invoice.
- Contribution dibuat dengan status `pending`.
- Mayar mengirim webhook setelah pembayaran.
- Sistem mengonfirmasi contribution menjadi `paid`.

## 2. Related Files

| File | Purpose |
|---|---|
| `src/app/api/payment/create-qris/route.ts` | Membuat QRIS dan pending contribution |
| `src/app/api/payment/create-invoice/route.ts` | Membuat invoice payment |
| `src/app/api/payment/webhook/route.ts` | Menerima dan memverifikasi webhook Mayar |
| `src/app/api/payment/status/route.ts` | Mengecek status payment |
| `src/app/api/payment/simulate/route.ts` | Simulasi sandbox |
| `src/app/api/payment/config/route.ts` | Mengekspos konfigurasi payment yang aman |
| `src/app/api/payment/register-webhook/route.ts` | Register webhook bila diperlukan |
| `src/lib/mayar.ts` | Helper integrasi Mayar |
| `convex/contributions.ts` | Mutation contribution pending/confirm |
| `convex/schema.ts` | Data model contribution |

## 3. Environment Variables

| Env | Purpose |
|---|---|
| `MAYAR_SANDBOX` | Menentukan mode sandbox/live |
| `MAYAR_API_KEY` | API key Mayar |
| `MAYAR_WEBHOOK_TOKEN` | Token/signature secret webhook |
| `NEXT_PUBLIC_CONVEX_URL` | Convex HTTP client |
| `ADMIN_API_TOKEN` | Admin-only/test utility protection |

## 4. QRIS Creation Flow

Endpoint:

```text
POST /api/payment/create-qris
```

Request body:

```json
{
  "amount": 50000,
  "projectId": "project_id",
  "userId": "optional_user_id"
}
```

Flow:

```text
Client submits amount and projectId
  -> Endpoint rate limit per IP
  -> Validate minimum donation amount
  -> Create QRIS in Mayar if API configured
  -> Fallback dummy paymentId for local/dev if Mayar unavailable
  -> Create pending contribution in Convex
  -> Return paymentId, QR image URL, amount, co2Equivalent
```

Important behavior:
- Minimum donation amount is Rp 1.000.
- Endpoint is intentionally public so visitors can donate without login.
- Rate limit is applied per IP to protect Mayar quota and Convex writes.
- Local/dev fallback can return dummy payment ID.

## 5. Contribution Data

Contribution fields in Convex:

| Field | Purpose |
|---|---|
| `userId` | Optional user making donation |
| `projectId` | Target project |
| `amount` | Donation amount in IDR |
| `co2Equivalent` | Support estimate |
| `method` | QRIS, Transfer, or CSR |
| `paymentId` | Mayar/dummy payment ID |
| `paymentStatus` | pending, paid, failed |
| `createdAt` | Timestamp |

Note: `co2Equivalent` in donation flow is an impact/support estimate for public communication, not a regulatory carbon credit purchase claim.

## 6. Webhook Flow

Endpoint:

```text
POST /api/payment/webhook
```

Flow:

```text
Mayar sends payment event
  -> Read raw body
  -> Verify webhook token/signature
  -> Parse payload
  -> Extract paymentId
  -> If event is payment.received and status paid/success/completed
  -> Confirm contribution by paymentId
  -> Return 2xx to Mayar
```

Webhook security:
- Verifies `Authorization: Bearer ...` token.
- Supports `x-mayar-signature` HMAC-SHA256 where available.
- Rejects invalid webhook with 401.
- Uses paymentId lookup for idempotent confirmation.

Webhook response design:
- Return 2xx quickly when processed/acknowledged.
- Return 5xx on internal processing failure so Mayar can retry.

## 7. Status Values

Payment status in contribution:

| Status | Meaning |
|---|---|
| `pending` | QRIS/invoice created, waiting for payment |
| `paid` | Payment confirmed by webhook or trusted flow |
| `failed` | Payment failed or expired |

Mayar status considered paid:
- `paid`
- `success`
- `completed`
- boolean `true`

## 8. Rate Limiting

Payment endpoints use Redis-backed rate limit where env exists.

Known limits from submission documentation:

| Endpoint | Limit |
|---|---|
| `/api/payment/create-qris` | 10/hour per IP |
| `/api/payment/create-invoice` | 5/hour per IP |
| `/api/payment/status` | 240/5 minutes per IP |
| `/api/payment/simulate` | 20/hour per IP |
| `/api/payment/register-webhook` | 10/hour per IP |

## 9. Sandbox and Local Development

`MAYAR_SANDBOX=true` should be used when:
- Running demos without real payment settlement.
- Testing QR/invoice creation.
- Using simulate endpoint.

If `MAYAR_API_KEY` is not configured:
- QRIS endpoint can return dummy `paymentId`.
- UI can still render fallback QR via `qrcode.react`.
- This helps local development without hitting Mayar.

## 10. Error Handling

Expected errors:

| Case | Response |
|---|---|
| Amount below minimum | 400 |
| Missing projectId | 400 |
| Rate limit exceeded | 429 |
| Invalid webhook token/signature | 401 |
| Invalid webhook JSON | 400 |
| Missing paymentId in webhook | 400 |
| Convex/update failure | 500 |

## 11. Logging

Payment routes use structured logger.

Important events:
- `qris_rate_limited`
- `createQris_failed_fallback`
- `qris_created`
- `webhook_rejected`
- `webhook_invalid_json`
- `webhook_missing_payment_id`
- `payment_confirmed`
- `webhook_handler_exception`

## 12. Security Checklist

- [x] Webhook token/signature verification.
- [x] Rate limit critical payment endpoints.
- [x] Sandbox guard for simulate endpoint.
- [x] Idempotent confirmation through `paymentId`.
- [x] No payment secret exposed to client.
- [ ] Add alerting for repeated webhook failures.
- [ ] Add e2e tests for webhook valid/invalid.
- [ ] Add reconciliation job/report for pending payments.

## 13. Current Scope Boundary

This integration supports:
- Donation QRIS.
- Donation invoice.
- Payment status check.
- Payment webhook.
- Contribution confirmation.

This integration does not currently document or define:
- Corporate Carbon Purchase Flow.
- Carbon credit marketplace transaction.
- ESG portfolio payment.
- Regulatory carbon credit settlement.

