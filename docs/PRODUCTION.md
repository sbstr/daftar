# Daftar Production Runbook

This runbook turns the current launch-ready prototype into a deployable SaaS.

## 1. Environment

Copy `.env.example` to your production environment and set:

```text
PORT=4173
JWT_SECRET=<long-random-secret>
APP_BASE_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com
```

Keep `PAYMENT_PROVIDER=sandbox`, `WHATSAPP_PROVIDER=sandbox`, and `ZATCA_PROVIDER=sandbox` until each provider is activated.

## 2. Early Launch Without VAT

Use:

```text
DEFAULT_LAUNCH_MODE=trial_no_tax
```

The app will:

- keep VAT at `0`
- label invoices as non-tax/commercial invoices
- block ZATCA report/clearance
- allow sandbox payments and WhatsApp message logging

## 3. Payment Activation

When the legal/commercial account is ready:

```text
PAYMENT_PROVIDER=moyasar
MOYASAR_SECRET_KEY=sk_test_or_live_xxx
APP_BASE_URL=https://your-domain.com
```

The endpoint `POST /api/payments/create` will create a Moyasar invoice and store the returned checkout URL.

## 4. WhatsApp Activation

When Meta WhatsApp Cloud API is ready:

```text
WHATSAPP_PROVIDER=meta
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_GRAPH_API_VERSION=v23.0
```

The endpoint `POST /api/whatsapp/send` will send a text message and store the provider message id.

## 5. ZATCA Activation

Do not claim live Phase 2 compliance until the chosen provider/direct integration has been tested.

```text
ZATCA_PROVIDER=provider-name
ZATCA_API_KEY=...
ZATCA_PROVIDER_URL=https://provider.example.com/api
```

The current adapter posts to:

- `/invoices/report`
- `/invoices/clearance`

## 6. Data Layer

The current JSON DB is suitable for local launch demos only. Production should use PostgreSQL with:

- organizations
- users
- customers
- invoices
- payments
- whatsapp_messages
- zatca_submissions
- webhook_events
- audit_logs

## 7. Security

Already included:

- password hashing with `scrypt`
- token auth
- audit logs
- security headers
- basic rate limiting
- webhook signature hooks

Add before real customers:

- HTTPS behind a trusted reverse proxy
- encrypted backups
- log redaction
- monitoring and alerting
- database row-level tenant isolation
- password reset flow
- email verification

## 8. Mobile Launch

Start with the web app/PWA. For stores:

- wrap the frontend with Capacitor or rebuild in React Native/Flutter
- keep SaaS subscription purchase on web at first
- allow invoice payments through the payment gateway because they are for real-world services
- prepare privacy labels/data safety forms using `privacy.html`
- provide demo login for App Review
