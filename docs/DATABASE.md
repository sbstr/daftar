# Daftar Production Database Shape

Use this as the first PostgreSQL migration plan when replacing `data/db.json`.

## Tables

```sql
create table organizations (
  id text primary key,
  name_ar text not null,
  name_en text,
  vat_registration_status text not null default 'not_registered',
  vat_number text,
  cr_number text,
  business_registration_status text not null default 'none',
  launch_mode text not null default 'trial_no_tax',
  default_vat_rate numeric(5,4) not null default 0,
  currency text not null default 'SAR',
  phone text,
  address_ar text,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create table users (
  id text primary key,
  organization_id text not null references organizations(id),
  name text not null,
  email citext not null unique,
  phone text,
  role text not null default 'owner',
  password_hash text not null,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create table customers (
  id text primary key,
  organization_id text not null references organizations(id),
  name text not null,
  phone text not null,
  email text,
  vat_number text,
  notes text,
  search_text text,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create table invoices (
  id text primary key,
  organization_id text not null references organizations(id),
  customer_id text not null references customers(id),
  number text not null,
  status text not null,
  service_description text not null,
  amount_input numeric(12,2) not null,
  vat_mode text not null,
  vat_rate numeric(5,4) not null,
  subtotal numeric(12,2) not null,
  vat numeric(12,2) not null,
  total numeric(12,2) not null,
  tax_profile text not null,
  compliance_type text not null,
  zatca_status text not null,
  payment_link text,
  qr_payload text,
  issued_at timestamptz,
  due_at timestamptz,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  unique (organization_id, number)
);

create table payments (
  id text primary key,
  organization_id text not null references organizations(id),
  invoice_id text not null references invoices(id),
  customer_id text not null references customers(id),
  amount numeric(12,2) not null,
  currency text not null default 'SAR',
  method text not null,
  status text not null,
  provider text not null,
  provider_reference text,
  checkout_url text,
  provider_response jsonb,
  paid_at timestamptz,
  created_at timestamptz not null,
  updated_at timestamptz
);

create table whatsapp_messages (
  id text primary key,
  organization_id text not null references organizations(id),
  invoice_id text references invoices(id),
  customer_id text references customers(id),
  phone text not null,
  body text not null,
  provider text not null,
  provider_message_id text,
  status text not null,
  direction text not null,
  sent_at timestamptz,
  provider_response jsonb,
  created_at timestamptz not null,
  updated_at timestamptz
);

create table zatca_submissions (
  id text primary key,
  organization_id text not null references organizations(id),
  invoice_id text not null references invoices(id),
  action text not null,
  provider text not null,
  status text not null,
  provider_reference text,
  request_payload jsonb not null,
  response_payload jsonb,
  created_at timestamptz not null,
  updated_at timestamptz
);

create table webhook_events (
  id text primary key,
  provider text not null,
  payload jsonb not null,
  processed boolean not null default false,
  related_id text,
  created_at timestamptz not null
);

create table audit_logs (
  id text primary key,
  organization_id text not null references organizations(id),
  user_id text,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb,
  created_at timestamptz not null
);
```

## Indexes

```sql
create index customers_org_search_idx on customers using gin (to_tsvector('simple', coalesce(search_text, '')));
create index invoices_org_status_idx on invoices (organization_id, status);
create index payments_org_status_idx on payments (organization_id, status);
create index audit_logs_org_created_idx on audit_logs (organization_id, created_at desc);
```
