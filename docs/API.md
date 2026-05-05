# Daftar Backend API

Base URL:

```text
http://localhost:4173/api
```

Demo login:

```text
owner@daftar.local
Daftar@12345
```

Send authenticated requests with:

```text
Authorization: Bearer <token>
```

## Launch Modes

Daftar now supports a realistic early launch without CR or VAT:

| Mode | Meaning |
|---|---|
| `trial_no_tax` | No VAT is charged, ZATCA submission is blocked, payments/WhatsApp can run in sandbox. |
| `production_ready` | Use after CR/freelance license, bank account, payment provider activation, and VAT registration if required. |

VAT is calculated only when the organization has:

- `vatRegistrationStatus: "registered"`
- a valid 15-digit `vatNumber`

## Required Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/login` | Sign in and receive token |
| POST | `/auth/register` | Create organization and owner; VAT/CR are optional for trial |
| GET | `/me` | Current user and organization |
| GET | `/customers` | List customers |
| POST | `/customers` | Create customer |
| GET | `/invoices` | List invoices |
| POST | `/invoices` | Create invoice |
| POST | `/invoices/:id/send` | Create collection plan, payment request, and WhatsApp message |
| POST | `/invoices/:id/issue` | Mark invoice issued; ZATCA remains not applicable when not VAT registered |
| POST | `/payments/create` | Create payment request |
| GET | `/payments/:id` | Get payment status |
| POST | `/webhooks/moyasar` | Receive Moyasar payment updates |
| POST | `/whatsapp/send` | Queue/send WhatsApp message |
| POST | `/webhooks/whatsapp` | Receive WhatsApp delivery updates |
| POST | `/zatca/invoices/:id/report` | Report simplified invoice to ZATCA/provider |
| POST | `/zatca/invoices/:id/clearance` | Clear standard invoice through ZATCA/provider |
| GET | `/reports/dashboard` | Dashboard metrics and charts |
| GET | `/reports/vat` | VAT summary |
| GET | `/audit-logs` | Audit logs |

## Examples

### Register Without VAT

```json
{
  "organizationNameAr": "دفتر للتقنية",
  "name": "مالك المنشأة",
  "email": "owner@example.com",
  "password": "StrongPassword123!",
  "phone": "0551234567",
  "vatRegistrationStatus": "not_registered",
  "businessRegistrationStatus": "none"
}
```

### Create Payment Request

```json
{
  "invoiceId": "inv_xxx",
  "method": "card"
}
```

If `PAYMENT_PROVIDER=sandbox` or `MOYASAR_SECRET_KEY` is empty, the response uses `providerMode: "sandbox"` and a local checkout URL.

For live or test Moyasar invoices, set:

```text
PAYMENT_PROVIDER=moyasar
MOYASAR_SECRET_KEY=sk_test_or_live_xxx
APP_BASE_URL=https://your-domain.com
```

Then `/payments/create` posts to Moyasar `/v1/invoices` and stores the returned checkout `url`.

### Send WhatsApp Message

```json
{
  "invoiceId": "inv_xxx"
}
```

If WhatsApp credentials are missing, the message is stored as `sandbox_sent`.

For real WhatsApp Cloud API sending, set:

```text
WHATSAPP_PROVIDER=meta
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_GRAPH_API_VERSION=v23.0
```

Then `/whatsapp/send` posts a text message through the Graph API and stores the returned message id.

### ZATCA Report

```http
POST /api/zatca/invoices/inv_xxx/report
```

This returns `409` until the organization has a valid VAT registration profile. This prevents accidental tax submissions before official readiness.

For a provider adapter, set:

```text
ZATCA_PROVIDER=provider-name
ZATCA_API_KEY=...
ZATCA_PROVIDER_URL=https://provider.example.com/api
```

The backend will POST to:

- `{ZATCA_PROVIDER_URL}/invoices/report`
- `{ZATCA_PROVIDER_URL}/invoices/clearance`

## Production Checklist

- Move JSON storage to PostgreSQL.
- Put secrets in a managed secret store.
- Use HTTPS only.
- Add rate limiting and abuse protection.
- Activate Moyasar/Tap/HyperPay with CR or freelance license and commercial bank account.
- Activate WhatsApp Cloud API or a local BSP.
- Use a certified ZATCA provider or complete direct Fatoora integration before advertising formal Phase 2 compliance.
- Review privacy, terms, refund policy, and tax copy with a Saudi legal/accounting professional before paid launch.
