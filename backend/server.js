const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');
const PORT = Number(process.env.PORT || 4173);
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-before-production';
const TOKEN_TTL_SECONDS = 60 * 60 * 8;
const APP_BASE_URL = process.env.APP_BASE_URL || `http://localhost:${PORT}`;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000);
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX || 180);
const PAYMENT_PROVIDER = String(process.env.PAYMENT_PROVIDER || 'sandbox').toLowerCase();
const MOYASAR_SECRET_KEY = process.env.MOYASAR_SECRET_KEY || process.env.PAYMENT_API_KEY || '';
const MOYASAR_WEBHOOK_SECRET = process.env.MOYASAR_WEBHOOK_SECRET || '';
const WHATSAPP_PROVIDER = String(process.env.WHATSAPP_PROVIDER || 'sandbox').toLowerCase();
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_API_KEY || '';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
const WHATSAPP_WEBHOOK_SECRET = process.env.WHATSAPP_WEBHOOK_SECRET || '';
const WHATSAPP_GRAPH_API_VERSION = process.env.WHATSAPP_GRAPH_API_VERSION || 'v23.0';
const ZATCA_PROVIDER = String(process.env.ZATCA_PROVIDER || 'sandbox').toLowerCase();
const ZATCA_API_KEY = process.env.ZATCA_API_KEY || '';
const ZATCA_PROVIDER_URL = process.env.ZATCA_PROVIDER_URL || '';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.ttf': 'font/ttf',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const rateBuckets = new Map();

function requestIp(req) {
  return String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'local').split(',')[0].trim();
}

function enforceRateLimit(req) {
  if (req.method === 'OPTIONS') return;
  const key = `${requestIp(req)}:${req.url.split('?')[0]}`;
  const now = Date.now();
  const bucket = rateBuckets.get(key) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + RATE_LIMIT_WINDOW_MS;
  }
  bucket.count += 1;
  rateBuckets.set(key, bucket);
  if (bucket.count > RATE_LIMIT_MAX) {
    throw httpError(429, 'طلبات كثيرة خلال وقت قصير. جرّب بعد دقيقة.');
  }
}

function securityHeaders(extra = {}) {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Cross-Origin-Opener-Policy': 'same-origin',
    ...extra
  };
}

function nowIso() {
  return new Date().toISOString();
}

function id(prefix) {
  return `${prefix}_${crypto.randomBytes(8).toString('hex')}`;
}

function toEnglishDigits(value) {
  return String(value ?? '').replace(/[\u0660-\u0669\u06f0-\u06f9]/g, (digit) => {
    const code = digit.charCodeAt(0);
    return String(code >= 0x06f0 ? code - 0x06f0 : code - 0x0660);
  });
}

function normalizePhone(value) {
  const digits = toEnglishDigits(value).replace(/\D/g, '');
  if (digits.startsWith('9665') && digits.length === 12) return `0${digits.slice(3)}`;
  if (digits.startsWith('5') && digits.length === 9) return `0${digits}`;
  return digits;
}

function normalizeArabic(value) {
  return toEnglishDigits(value)
    .toLowerCase()
    .replace(/[\u0623\u0625\u0622]/g, '\u0627')
    .replace(/\u0629/g, '\u0647')
    .replace(/\u0649/g, '\u064a')
    .replace(/\u0640/g, '')
    .replace(/[^\u0600-\u06ff\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function validateSaudiPhone(value) {
  return /^05\d{8}$/.test(normalizePhone(value));
}

function validateVatNumber(value) {
  return /^\d{15}$/.test(toEnglishDigits(value).replace(/\D/g, ''));
}

function validateCrNumber(value) {
  return /^\d{10}$/.test(toEnglishDigits(value).replace(/\D/g, ''));
}

function cleanDigits(value) {
  return toEnglishDigits(value).replace(/\D/g, '');
}

function normalizeVatStatus(value) {
  return value === 'registered' ? 'registered' : 'not_registered';
}

function normalizeBusinessRegistrationStatus(value) {
  return ['cr', 'freelance', 'none'].includes(value) ? value : 'none';
}

function isVatRegistered(org) {
  return org?.vatRegistrationStatus === 'registered' && validateVatNumber(org.vatNumber || '');
}

function getOrgVatRate(org) {
  return isVatRegistered(org) ? Number(org.defaultVatRate || 0.15) : 0;
}

function integrationMode(provider, requiredSecrets) {
  return requiredSecrets.every(Boolean) ? provider : 'sandbox';
}

function paymentIntegrationMode() {
  return integrationMode(PAYMENT_PROVIDER, [MOYASAR_SECRET_KEY]);
}

function whatsappIntegrationMode() {
  return integrationMode(WHATSAPP_PROVIDER, [WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID]);
}

function zatcaIntegrationMode() {
  return integrationMode(ZATCA_PROVIDER, [ZATCA_API_KEY, ZATCA_PROVIDER_URL]);
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, expected] = String(stored).split(':');
  if (!salt || !expected) return false;
  const actual = crypto.scryptSync(String(password), salt, 64);
  return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), actual);
}

function base64url(input) {
  return Buffer.from(JSON.stringify(input)).toString('base64url');
}

function signToken(payload) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const body = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS
  };
  const data = `${base64url(header)}.${base64url(body)}`;
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('base64url');
  return `${data}.${signature}`;
}

function verifyToken(token) {
  const [header, body, signature] = String(token || '').split('.');
  if (!header || !body || !signature) return null;
  const data = `${header}.${body}`;
  const expected = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  if (payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

function seedDb() {
  const createdAt = nowIso();
  const organizationId = 'org_demo';
  return {
    meta: { version: 1, createdAt, updatedAt: createdAt },
    organizations: [
      {
        id: organizationId,
        nameAr: 'مركز نمو للتدريب',
        nameEn: 'Nomu Training Center',
        vatNumber: '',
        crNumber: '',
        phone: '0551234567',
        addressAr: 'الرياض، المملكة العربية السعودية',
        defaultVatRate: 0,
        vatRegistrationStatus: 'not_registered',
        businessRegistrationStatus: 'none',
        launchMode: 'trial_no_tax',
        canChargeVat: false,
        paymentProviderStatus: paymentIntegrationMode(),
        whatsappProviderStatus: whatsappIntegrationMode(),
        zatcaProviderStatus: 'not_applicable',
        currency: 'SAR',
        createdAt,
        updatedAt: createdAt
      }
    ],
    users: [
      {
        id: 'usr_owner',
        organizationId,
        name: 'مالك المنشأة',
        email: 'owner@daftar.local',
        phone: '0551234567',
        role: 'owner',
        passwordHash: hashPassword('Daftar@12345'),
        createdAt,
        updatedAt: createdAt
      }
    ],
    customers: [
      customerSeed(organizationId, 'أحمد العتيبي', '0551234567', '310987654300003', 'شاهد رابط الدفع'),
      customerSeed(organizationId, 'شركة نمو', '0508881122', '310222222200003', 'دفع آخر فاتورة'),
      customerSeed(organizationId, 'مؤسسة المدار', '0534040404', '310333333300003', 'بانتظار الدفعة الأولى'),
      customerSeed(organizationId, 'نورة القحطاني', '0567001122', '', 'تحتاج تذكير'),
      customerSeed(organizationId, 'سالم الغامدي', '0559912211', '', 'عرض الصيانة مفتوح'),
      customerSeed(organizationId, 'شركة مسار', '0542227788', '310444444400003', 'عقد شراكة')
    ],
    invoices: [],
    payments: [],
    collectionPlans: [],
    reminders: [],
    auditLogs: []
  };
}

function customerSeed(organizationId, name, phone, vatNumber, note) {
  const createdAt = nowIso();
  return {
    id: id('cus'),
    organizationId,
    name,
    phone,
    vatNumber,
    email: '',
    notes: note,
    searchText: normalizeArabic(`${name} ${phone} ${vatNumber} ${note}`),
    createdAt,
    updatedAt: createdAt
  };
}

function seedInvoices(db) {
  if (db.invoices.length) return db;
  const org = db.organizations[0];
  const customers = db.customers;
  const invoices = [
    createInvoiceRecord(db, org.id, customers[0].id, {
      serviceDescription: 'دورة إدارة المبيعات',
      amount: 2400,
      vatMode: 'inclusive',
      status: 'viewed',
      issuedAt: nowIso()
    }, false),
    createInvoiceRecord(db, org.id, customers[1].id, {
      serviceDescription: 'ورشة تدريب فريق المبيعات',
      amount: 6800,
      vatMode: 'inclusive',
      status: 'paid',
      issuedAt: nowIso()
    }, false),
    createInvoiceRecord(db, org.id, customers[2].id, {
      serviceDescription: 'استشارة قانونية شهرية',
      amount: 4500,
      vatMode: 'exclusive',
      status: 'sent',
      issuedAt: nowIso()
    }, false),
    createInvoiceRecord(db, org.id, customers[3].id, {
      serviceDescription: 'دورة خدمة العملاء',
      amount: 1200,
      vatMode: 'inclusive',
      status: 'due',
      issuedAt: nowIso()
    }, false)
  ];
  db.invoices.push(...invoices);
  db.payments.push({
    id: id('pay'),
    organizationId: org.id,
    invoiceId: invoices[1].id,
    customerId: invoices[1].customerId,
    amount: invoices[1].total,
    method: 'mada',
    status: 'paid',
    providerReference: 'demo-paid-001',
    paidAt: nowIso(),
    createdAt: nowIso()
  });
  createCollectionPlan(db, org.id, invoices[0].id, { template: 'training', depositPercent: 30, firstReminderHours: 24 }, false);
  createCollectionPlan(db, org.id, invoices[2].id, { template: 'consulting', depositPercent: 50, firstReminderHours: 48 }, false);
  createCollectionPlan(db, org.id, invoices[3].id, { template: 'training', depositPercent: 30, firstReminderHours: 24 }, false);
  return db;
}

function migrateDb(db) {
  db.meta = db.meta || { version: 1, createdAt: nowIso(), updatedAt: nowIso() };
  db.organizations = db.organizations || [];
  db.users = db.users || [];
  db.customers = db.customers || [];
  db.invoices = db.invoices || [];
  db.payments = db.payments || [];
  db.collectionPlans = db.collectionPlans || [];
  db.reminders = db.reminders || [];
  db.auditLogs = db.auditLogs || [];
  db.webhookEvents = db.webhookEvents || [];
  db.whatsappMessages = db.whatsappMessages || [];
  db.zatcaSubmissions = db.zatcaSubmissions || [];

  db.organizations.forEach((org) => {
    org.vatRegistrationStatus = normalizeVatStatus(org.vatRegistrationStatus || (validateVatNumber(org.vatNumber || '') ? 'registered' : 'not_registered'));
    org.businessRegistrationStatus = normalizeBusinessRegistrationStatus(org.businessRegistrationStatus || (org.crNumber ? 'cr' : 'none'));
    org.launchMode = org.launchMode || (org.vatRegistrationStatus === 'registered' ? 'production_ready' : 'trial_no_tax');
    org.defaultVatRate = org.vatRegistrationStatus === 'registered' ? Number(org.defaultVatRate || 0.15) : 0;
    org.canChargeVat = isVatRegistered(org);
    org.paymentProviderStatus = paymentIntegrationMode();
    org.whatsappProviderStatus = whatsappIntegrationMode();
    org.zatcaProviderStatus = org.canChargeVat ? zatcaIntegrationMode() : 'not_applicable';
  });

  db.invoices.forEach((invoice) => {
    if (!invoice.taxProfile) {
      invoice.taxProfile = invoice.vatRate > 0 ? 'vat_registered' : 'not_registered';
    }
    if (!invoice.complianceType) {
      invoice.complianceType = invoice.vatRate > 0 ? 'tax_invoice' : 'commercial_invoice';
    }
  });

  return db;
}

function ensureDb() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    const db = seedInvoices(seedDb());
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
  }
}

function readDb() {
  ensureDb();
  return migrateDb(JSON.parse(fs.readFileSync(DB_PATH, 'utf8')));
}

function writeDb(db) {
  db.meta.updatedAt = nowIso();
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
}

function audit(db, organizationId, userId, action, entityType, entityId, details = {}) {
  db.auditLogs.unshift({
    id: id('log'),
    organizationId,
    userId,
    action,
    entityType,
    entityId,
    details,
    createdAt: nowIso()
  });
}

function publicUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

function invoiceNumber(db) {
  return `INV-${String(db.invoices.length + 1042).padStart(4, '0')}`;
}

function calculateAmounts(amount, vatMode, vatRate = 0.15) {
  const input = Number(amount || 0);
  const rate = vatMode === 'none' ? 0 : Number(vatRate || 0);
  if (rate <= 0) {
    return {
      subtotal: Math.round(input * 100) / 100,
      vat: 0,
      total: Math.round(input * 100) / 100
    };
  }
  const inclusive = vatMode === 'inclusive';
  const subtotal = inclusive ? input / (1 + rate) : input;
  const vat = subtotal * rate;
  const total = inclusive ? input : subtotal + vat;
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    vat: Math.round(vat * 100) / 100,
    total: Math.round(total * 100) / 100
  };
}

function createInvoiceRecord(db, organizationId, customerId, payload, shouldAudit = true, userId = 'system') {
  const org = db.organizations.find((item) => item.id === organizationId);
  const customer = db.customers.find((item) => item.id === customerId && item.organizationId === organizationId);
  if (!org) throw httpError(404, 'المنشأة غير موجودة.');
  if (!customer) throw httpError(404, 'العميل غير موجود.');
  if (!String(payload.serviceDescription || '').trim()) throw httpError(400, 'اكتب وصف الخدمة بالعربي.');
  if (Number(payload.amount || 0) <= 0) throw httpError(400, 'أضف قيمة صحيحة للفاتورة.');
  const vatRate = getOrgVatRate(org);
  const vatMode = vatRate > 0 ? (payload.vatMode || 'inclusive') : 'none';
  const amounts = calculateAmounts(payload.amount, vatMode, vatRate);
  const createdAt = nowIso();
  const publicPaymentId = id('link');
  const invoice = {
    id: id('inv'),
    organizationId,
    customerId,
    number: invoiceNumber(db),
    status: payload.status || 'draft',
    serviceDescription: String(payload.serviceDescription).trim(),
    amountInput: Number(payload.amount),
    vatMode,
    vatRate,
    subtotal: amounts.subtotal,
    vat: amounts.vat,
    total: amounts.total,
    issueLanguage: 'ar',
    taxProfile: isVatRegistered(org) ? 'vat_registered' : 'not_registered',
    complianceType: isVatRegistered(org) ? 'tax_invoice' : 'commercial_invoice',
    taxInvoice: isVatRegistered(org),
    zatcaStatus: isVatRegistered(org) ? 'draft' : 'not_applicable',
    paymentLink: `${APP_BASE_URL}/pay/${publicPaymentId}`,
    qrPayload: isVatRegistered(org) ? `DAFTAR|${org.vatNumber}|${amounts.total}|${amounts.vat}` : `DAFTAR|NO_VAT|${amounts.total}|0`,
    issuedAt: payload.issuedAt || null,
    dueAt: payload.dueAt || null,
    createdAt,
    updatedAt: createdAt
  };
  if (shouldAudit) audit(db, organizationId, userId, 'invoice.created', 'invoice', invoice.id, { number: invoice.number });
  return invoice;
}

function createCollectionPlan(db, organizationId, invoiceId, payload, shouldAudit = true, userId = 'system') {
  const invoice = db.invoices.find((item) => item.id === invoiceId && item.organizationId === organizationId);
  if (!invoice) throw httpError(404, 'الفاتورة غير موجودة.');
  const createdAt = nowIso();
  const plan = {
    id: id('col'),
    organizationId,
    invoiceId,
    customerId: invoice.customerId,
    template: payload.template || 'training',
    depositPercent: Number(payload.depositPercent ?? 30),
    firstReminderHours: Number(payload.firstReminderHours ?? 24),
    channel: 'whatsapp',
    status: 'active',
    createdAt,
    updatedAt: createdAt
  };
  db.collectionPlans.push(plan);
  db.reminders.push({
    id: id('rem'),
    organizationId,
    planId: plan.id,
    invoiceId,
    customerId: invoice.customerId,
    channel: 'whatsapp',
    message: buildWhatsappMessage(db, invoice, plan),
    status: 'scheduled',
    scheduledAt: new Date(Date.now() + plan.firstReminderHours * 60 * 60 * 1000).toISOString(),
    sentAt: null,
    createdAt
  });
  if (shouldAudit) audit(db, organizationId, userId, 'collection_plan.created', 'collectionPlan', plan.id, { invoiceId });
  return plan;
}

function buildWhatsappMessage(db, invoice, plan) {
  const customer = db.customers.find((item) => item.id === invoice.customerId);
  const deposit = Math.round(invoice.total * plan.depositPercent / 100);
  return `مرحبًا ${customer?.name || 'عميلنا العزيز'}،

هذه فاتورة ${invoice.serviceDescription} بقيمة ${formatSar(invoice.total)}.
الدفعة المطلوبة الآن: ${formatSar(deposit)}.

رابط الدفع:
${invoice.paymentLink}

بعد الدفع ستصلك الفاتورة الضريبية تلقائيًا.`;
}

function formatSar(value) {
  return `${Number(value).toLocaleString('en-US')} ريال`;
}

function invoiceView(db, invoice) {
  const customer = db.customers.find((item) => item.id === invoice.customerId);
  const paidAmount = db.payments
    .filter((payment) => payment.invoiceId === invoice.id && payment.status === 'paid')
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  return {
    ...invoice,
    customer,
    paidAmount,
    outstandingAmount: Math.max(0, Math.round((invoice.total - paidAmount) * 100) / 100)
  };
}

function dashboardReport(db, organizationId) {
  const org = db.organizations.find((item) => item.id === organizationId);
  const invoices = db.invoices.filter((item) => item.organizationId === organizationId);
  const payments = db.payments.filter((item) => item.organizationId === organizationId && item.status === 'paid');
  const paidToday = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const followups = invoices.filter((invoice) => ['due', 'viewed', 'sent'].includes(invoice.status)).length;
  const vatDue = invoices.reduce((sum, invoice) => sum + Number(invoice.vat || 0), 0);
  const total = invoices.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);
  const paid = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const overdue = invoices.filter((invoice) => invoice.status === 'due').reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);
  return {
    paidToday,
    paymentCount: payments.length,
    followups,
    vatDue: Math.round(vatDue * 100) / 100,
    collectionRate: total ? Math.round((paid / total) * 100) : 0,
    totals: {
      invoiced: Math.round(total * 100) / 100,
      paid: Math.round(paid * 100) / 100,
      overdue: Math.round(overdue * 100) / 100,
      waiting: Math.max(0, Math.round((total - paid - overdue) * 100) / 100)
    },
    taxProfile: {
      vatRegistrationStatus: org?.vatRegistrationStatus || 'not_registered',
      canChargeVat: isVatRegistered(org),
      vatRate: getOrgVatRate(org),
      message: isVatRegistered(org)
        ? 'ضريبة القيمة المضافة مفعلة على الفواتير.'
        : 'الإطلاق التجريبي يعمل بدون ضريبة حتى تضيف رقمًا ضريبيًا صحيحًا.'
    },
    integrations: {
      payments: paymentIntegrationMode(),
      whatsapp: whatsappIntegrationMode(),
      zatca: org && isVatRegistered(org) ? zatcaIntegrationMode() : 'not_applicable'
    },
    invoiceStatuses: ['paid', 'viewed', 'due', 'draft', 'sent'].map((status) => ({
      status,
      count: invoices.filter((invoice) => invoice.status === status).length
    })),
    cashFlow: [5200, 6800, 6100, 9200, 8500, 11800, 13200],
    activeInvoices: invoices.slice(0, 6).map((invoice) => invoiceView(db, invoice))
  };
}

function vatReport(db, organizationId) {
  const org = db.organizations.find((item) => item.id === organizationId);
  const invoices = db.invoices.filter((item) => item.organizationId === organizationId);
  const taxableSales = invoices.reduce((sum, invoice) => sum + Number(invoice.subtotal || 0), 0);
  const vatDue = invoices.reduce((sum, invoice) => sum + Number(invoice.vat || 0), 0);
  return {
    period: 'current_month',
    vatRegistrationStatus: org?.vatRegistrationStatus || 'not_registered',
    canChargeVat: isVatRegistered(org),
    taxableSales: Math.round(taxableSales * 100) / 100,
    vatDue: Math.round(vatDue * 100) / 100,
    invoiceCount: invoices.length,
    warnings: db.customers.filter((customer) => !customer.vatNumber).length
  };
}

function httpError(status, message, details = null) {
  const error = new Error(message);
  error.status = status;
  error.details = details;
  return error;
}

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    ...securityHeaders(),
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
    'Access-Control-Allow-Origin': CORS_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(httpError(413, 'حجم الطلب كبير جدًا.'));
        req.destroy();
      }
    });
    req.on('end', () => {
      req.rawBody = body;
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(httpError(400, 'صيغة JSON غير صحيحة.'));
      }
    });
  });
}

function requestJson(urlString, payload, headers = {}) {
  return new Promise((resolve, reject) => {
    const target = new URL(urlString);
    const body = JSON.stringify(payload);
    const req = https.request({
      method: 'POST',
      hostname: target.hostname,
      path: `${target.pathname}${target.search}`,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        ...headers
      }
    }, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        let data = {};
        try {
          data = responseBody ? JSON.parse(responseBody) : {};
        } catch (error) {
          return reject(httpError(502, 'رد مزود الدفع غير مفهوم.', { responseBody }));
        }
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(httpError(502, 'مزود الدفع رفض الطلب.', data));
        }
        return resolve(data);
      });
    });
    req.on('error', (error) => reject(httpError(502, 'تعذر الاتصال بمزود الدفع.', { message: error.message })));
    req.write(body);
    req.end();
  });
}

async function createMoyasarInvoice(payment, invoice) {
  if (payment.provider !== 'moyasar') return payment;
  const auth = Buffer.from(`${MOYASAR_SECRET_KEY}:`).toString('base64');
  const moyasarInvoice = await requestJson('https://api.moyasar.com/v1/invoices', {
    amount: Math.round(Number(payment.amount) * 100),
    currency: 'SAR',
    description: payment.description,
    callback_url: `${APP_BASE_URL}/api/webhooks/moyasar`,
    success_url: `${APP_BASE_URL}/app.html#payment-success=${payment.id}`,
    back_url: `${APP_BASE_URL}/app.html#invoice=${invoice.id}`,
    metadata: {
      daftarPaymentId: payment.id,
      invoiceId: invoice.id,
      invoiceNumber: invoice.number,
      customerId: invoice.customerId
    }
  }, {
    Authorization: `Basic ${auth}`
  });
  payment.providerReference = moyasarInvoice.id || payment.providerReference;
  payment.checkoutUrl = moyasarInvoice.url || payment.checkoutUrl;
  payment.status = mapPaymentStatus(moyasarInvoice.status);
  payment.providerResponse = moyasarInvoice;
  payment.updatedAt = nowIso();
  invoice.paymentLink = payment.checkoutUrl || invoice.paymentLink;
  invoice.updatedAt = nowIso();
  return payment;
}

async function sendWhatsappViaMeta(message) {
  if (message.provider !== 'meta') return message;
  const to = message.phone.startsWith('0') ? `966${message.phone.slice(1)}` : message.phone;
  const response = await requestJson(`https://graph.facebook.com/${WHATSAPP_GRAPH_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: {
      preview_url: false,
      body: message.body
    }
  }, {
    Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`
  });
  message.providerMessageId = response.messages?.[0]?.id || message.providerMessageId;
  message.status = 'sent';
  message.sentAt = nowIso();
  message.providerResponse = response;
  message.updatedAt = nowIso();
  return message;
}

async function submitZatcaToProvider(submission) {
  if (submission.provider === 'sandbox') return submission;
  const endpoint = `${ZATCA_PROVIDER_URL.replace(/\/$/, '')}/invoices/${submission.action}`;
  const response = await requestJson(endpoint, submission.requestPayload, {
    Authorization: `Bearer ${ZATCA_API_KEY}`
  });
  submission.status = response.status || response.clearanceStatus || response.reportingStatus || 'submitted';
  submission.providerReference = response.id || response.uuid || submission.providerReference;
  submission.responsePayload = response;
  submission.updatedAt = nowIso();
  return submission;
}

function getAuth(req, db) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const payload = verifyToken(token);
  if (!payload) throw httpError(401, 'سجل الدخول أولًا.');
  const user = db.users.find((item) => item.id === payload.userId);
  if (!user) throw httpError(401, 'المستخدم غير موجود.');
  return { user, organizationId: user.organizationId };
}

function pathParts(url) {
  return url.pathname.split('/').filter(Boolean);
}

async function handleApi(req, res, url) {
  const db = readDb();
  const parts = pathParts(url).slice(1);
  const method = req.method;

  if (method === 'OPTIONS') return sendJson(res, 204, {});
  if (method === 'GET' && parts[0] === 'health') {
    return sendJson(res, 200, { ok: true, service: 'Daftar API', time: nowIso() });
  }

  if (parts[0] === 'webhooks') return handleWebhooks(req, res, db, parts);

  if (method === 'POST' && parts[0] === 'auth' && parts[1] === 'login') {
    const body = await readBody(req);
    const user = db.users.find((item) => item.email.toLowerCase() === String(body.email || '').toLowerCase());
    if (!user || !verifyPassword(body.password, user.passwordHash)) throw httpError(401, 'بيانات الدخول غير صحيحة.');
    audit(db, user.organizationId, user.id, 'auth.login', 'user', user.id);
    writeDb(db);
    return sendJson(res, 200, {
      token: signToken({ userId: user.id, organizationId: user.organizationId, role: user.role }),
      user: publicUser(user),
      organization: db.organizations.find((item) => item.id === user.organizationId)
    });
  }

  if (method === 'POST' && parts[0] === 'auth' && parts[1] === 'register') {
    const body = await readBody(req);
    if (!body.organizationNameAr) throw httpError(400, 'أضف اسم المنشأة بالعربي.');
    const vatRegistrationStatus = normalizeVatStatus(body.vatRegistrationStatus);
    if (vatRegistrationStatus === 'registered' && !validateVatNumber(body.vatNumber)) {
      throw httpError(400, 'إذا كانت المنشأة مسجلة في ضريبة القيمة المضافة، أضف رقمًا ضريبيًا صحيحًا من 15 رقم.');
    }
    if (body.crNumber && !validateCrNumber(body.crNumber)) throw httpError(400, 'السجل التجاري يجب أن يكون 10 أرقام.');
    if (!validateSaudiPhone(body.phone)) throw httpError(400, 'رقم الجوال غير صحيح.');
    if (!body.email || !body.password) throw httpError(400, 'أضف البريد وكلمة المرور.');
    if (db.users.some((item) => item.email.toLowerCase() === String(body.email).toLowerCase())) {
      throw httpError(409, 'يوجد حساب بهذا البريد.');
    }
    const createdAt = nowIso();
    const organizationId = id('org');
    const userId = id('usr');
    const org = {
      id: organizationId,
      nameAr: String(body.organizationNameAr).trim(),
      nameEn: String(body.organizationNameEn || '').trim(),
      vatNumber: vatRegistrationStatus === 'registered' ? cleanDigits(body.vatNumber) : '',
      crNumber: body.crNumber ? cleanDigits(body.crNumber) : '',
      phone: normalizePhone(body.phone),
      addressAr: String(body.addressAr || '').trim(),
      defaultVatRate: vatRegistrationStatus === 'registered' ? 0.15 : 0,
      vatRegistrationStatus,
      businessRegistrationStatus: normalizeBusinessRegistrationStatus(body.businessRegistrationStatus || (body.crNumber ? 'cr' : 'none')),
      launchMode: vatRegistrationStatus === 'registered' ? 'production_ready' : 'trial_no_tax',
      canChargeVat: vatRegistrationStatus === 'registered',
      paymentProviderStatus: paymentIntegrationMode(),
      whatsappProviderStatus: whatsappIntegrationMode(),
      zatcaProviderStatus: vatRegistrationStatus === 'registered' ? zatcaIntegrationMode() : 'not_applicable',
      currency: 'SAR',
      createdAt,
      updatedAt: createdAt
    };
    const user = {
      id: userId,
      organizationId,
      name: String(body.name || 'مالك المنشأة').trim(),
      email: String(body.email).trim(),
      phone: normalizePhone(body.phone),
      role: 'owner',
      passwordHash: hashPassword(body.password),
      createdAt,
      updatedAt: createdAt
    };
    db.organizations.push(org);
    db.users.push(user);
    audit(db, organizationId, userId, 'organization.registered', 'organization', organizationId);
    writeDb(db);
    return sendJson(res, 201, {
      token: signToken({ userId, organizationId, role: 'owner' }),
      user: publicUser(user),
      organization: org
    });
  }

  const auth = getAuth(req, db);

  if (method === 'GET' && parts[0] === 'me') {
    return sendJson(res, 200, {
      user: publicUser(auth.user),
      organization: db.organizations.find((item) => item.id === auth.organizationId)
    });
  }

  if (parts[0] === 'organization') {
    const org = db.organizations.find((item) => item.id === auth.organizationId);
    if (method === 'GET') return sendJson(res, 200, org);
    if (method === 'PUT') {
      const body = await readBody(req);
      const vatRegistrationStatus = normalizeVatStatus(body.vatRegistrationStatus ?? org.vatRegistrationStatus);
      const incomingVatNumber = body.vatNumber !== undefined ? cleanDigits(body.vatNumber) : (org.vatNumber || '');
      if (vatRegistrationStatus === 'registered' && !validateVatNumber(incomingVatNumber)) {
        throw httpError(400, 'إذا فعّلت ضريبة القيمة المضافة، أضف رقمًا ضريبيًا صحيحًا من 15 رقم.');
      }
      if (body.crNumber && !validateCrNumber(body.crNumber)) throw httpError(400, 'السجل التجاري يجب أن يكون 10 أرقام.');
      Object.assign(org, {
        nameAr: body.nameAr ?? org.nameAr,
        nameEn: body.nameEn ?? org.nameEn,
        vatRegistrationStatus,
        vatNumber: vatRegistrationStatus === 'registered' ? incomingVatNumber : '',
        crNumber: body.crNumber !== undefined ? cleanDigits(body.crNumber) : org.crNumber,
        businessRegistrationStatus: normalizeBusinessRegistrationStatus(body.businessRegistrationStatus ?? org.businessRegistrationStatus),
        launchMode: body.launchMode || (vatRegistrationStatus === 'registered' ? 'production_ready' : 'trial_no_tax'),
        phone: body.phone ? normalizePhone(body.phone) : org.phone,
        addressAr: body.addressAr ?? org.addressAr,
        defaultVatRate: vatRegistrationStatus === 'registered' ? 0.15 : 0,
        updatedAt: nowIso()
      });
      org.canChargeVat = isVatRegistered(org);
      org.paymentProviderStatus = paymentIntegrationMode();
      org.whatsappProviderStatus = whatsappIntegrationMode();
      org.zatcaProviderStatus = org.canChargeVat ? zatcaIntegrationMode() : 'not_applicable';
      audit(db, auth.organizationId, auth.user.id, 'organization.updated', 'organization', org.id);
      writeDb(db);
      return sendJson(res, 200, org);
    }
  }

  if (parts[0] === 'customers') return handleCustomers(req, res, db, auth, parts);
  if (parts[0] === 'invoices') return handleInvoices(req, res, db, auth, parts);
  if (parts[0] === 'payments') return handlePayments(req, res, db, auth, parts);
  if (parts[0] === 'whatsapp') return handleWhatsapp(req, res, db, auth, parts);
  if (parts[0] === 'zatca') return handleZatca(req, res, db, auth, parts);
  if (parts[0] === 'collection-plans') return handleCollectionPlans(req, res, db, auth, parts);
  if (parts[0] === 'reminders') return handleReminders(req, res, db, auth, parts);
  if (parts[0] === 'reports') return handleReports(req, res, db, auth, parts);
  if (parts[0] === 'audit-logs' && method === 'GET') {
    return sendJson(res, 200, db.auditLogs.filter((item) => item.organizationId === auth.organizationId).slice(0, 100));
  }
  if (parts[0] === 'search' && method === 'GET') {
    const query = normalizeArabic(url.searchParams.get('q') || '');
    const customers = db.customers.filter((item) => item.organizationId === auth.organizationId && item.searchText.includes(query));
    const invoices = db.invoices.filter((item) => item.organizationId === auth.organizationId && normalizeArabic(`${item.number} ${item.serviceDescription}`).includes(query));
    return sendJson(res, 200, { customers, invoices: invoices.map((invoice) => invoiceView(db, invoice)) });
  }

  throw httpError(404, 'المسار غير موجود.');
}

async function handleCustomers(req, res, db, auth, parts) {
  const method = req.method;
  const customerId = parts[1];
  if (method === 'GET' && !customerId) {
    const query = normalizeArabic(new URL(req.url, `http://${req.headers.host}`).searchParams.get('q') || '');
    const customers = db.customers
      .filter((item) => item.organizationId === auth.organizationId)
      .filter((item) => !query || item.searchText.includes(query));
    return sendJson(res, 200, customers);
  }
  if (method === 'POST' && !customerId) {
    const body = await readBody(req);
    if (!String(body.name || '').trim()) throw httpError(400, 'أضف اسم العميل.');
    if (!validateSaudiPhone(body.phone)) throw httpError(400, 'رقم الجوال غير صحيح.');
    if (body.vatNumber && !validateVatNumber(body.vatNumber)) throw httpError(400, 'الرقم الضريبي يجب أن يكون 15 رقم.');
    const createdAt = nowIso();
    const customer = {
      id: id('cus'),
      organizationId: auth.organizationId,
      name: String(body.name).trim(),
      phone: normalizePhone(body.phone),
      email: String(body.email || '').trim(),
      vatNumber: body.vatNumber ? toEnglishDigits(body.vatNumber).replace(/\D/g, '') : '',
      notes: String(body.notes || '').trim(),
      searchText: normalizeArabic(`${body.name} ${body.phone} ${body.email} ${body.vatNumber} ${body.notes}`),
      createdAt,
      updatedAt: createdAt
    };
    db.customers.push(customer);
    audit(db, auth.organizationId, auth.user.id, 'customer.created', 'customer', customer.id);
    writeDb(db);
    return sendJson(res, 201, customer);
  }
  const customer = db.customers.find((item) => item.id === customerId && item.organizationId === auth.organizationId);
  if (!customer) throw httpError(404, 'العميل غير موجود.');
  if (method === 'GET') return sendJson(res, 200, customer);
  if (method === 'PUT') {
    const body = await readBody(req);
    if (body.phone && !validateSaudiPhone(body.phone)) throw httpError(400, 'رقم الجوال غير صحيح.');
    if (body.vatNumber && !validateVatNumber(body.vatNumber)) throw httpError(400, 'الرقم الضريبي يجب أن يكون 15 رقم.');
    Object.assign(customer, {
      name: body.name ?? customer.name,
      phone: body.phone ? normalizePhone(body.phone) : customer.phone,
      email: body.email ?? customer.email,
      vatNumber: body.vatNumber ? toEnglishDigits(body.vatNumber).replace(/\D/g, '') : customer.vatNumber,
      notes: body.notes ?? customer.notes,
      updatedAt: nowIso()
    });
    customer.searchText = normalizeArabic(`${customer.name} ${customer.phone} ${customer.email} ${customer.vatNumber} ${customer.notes}`);
    audit(db, auth.organizationId, auth.user.id, 'customer.updated', 'customer', customer.id);
    writeDb(db);
    return sendJson(res, 200, customer);
  }
  if (method === 'DELETE') {
    customer.deletedAt = nowIso();
    audit(db, auth.organizationId, auth.user.id, 'customer.deleted', 'customer', customer.id);
    writeDb(db);
    return sendJson(res, 200, { ok: true });
  }
  throw httpError(405, 'طريقة الطلب غير مدعومة.');
}

async function handleInvoices(req, res, db, auth, parts) {
  const method = req.method;
  const invoiceId = parts[1];
  const action = parts[2];
  if (method === 'GET' && !invoiceId) {
    return sendJson(res, 200, db.invoices.filter((item) => item.organizationId === auth.organizationId).map((invoice) => invoiceView(db, invoice)));
  }
  if (method === 'POST' && !invoiceId) {
    const body = await readBody(req);
    const invoice = createInvoiceRecord(db, auth.organizationId, body.customerId, body, true, auth.user.id);
    db.invoices.unshift(invoice);
    writeDb(db);
    return sendJson(res, 201, invoiceView(db, invoice));
  }
  const invoice = db.invoices.find((item) => item.id === invoiceId && item.organizationId === auth.organizationId);
  if (!invoice) throw httpError(404, 'الفاتورة غير موجودة.');
  if (method === 'GET' && !action) return sendJson(res, 200, invoiceView(db, invoice));
  if (method === 'PUT' && !action) {
    if (!['draft'].includes(invoice.status)) throw httpError(409, 'لا يمكن تعديل فاتورة صادرة أو مرسلة.');
    const body = await readBody(req);
    if (body.serviceDescription !== undefined) invoice.serviceDescription = String(body.serviceDescription).trim();
    if (body.amount !== undefined || body.vatMode !== undefined) {
      const amounts = calculateAmounts(body.amount ?? invoice.amountInput, body.vatMode ?? invoice.vatMode, invoice.vatRate);
      invoice.amountInput = Number(body.amount ?? invoice.amountInput);
      invoice.vatMode = body.vatMode ?? invoice.vatMode;
      Object.assign(invoice, amounts);
    }
    invoice.updatedAt = nowIso();
    audit(db, auth.organizationId, auth.user.id, 'invoice.updated', 'invoice', invoice.id);
    writeDb(db);
    return sendJson(res, 200, invoiceView(db, invoice));
  }
  if (method === 'POST' && action === 'issue') {
    const org = db.organizations.find((item) => item.id === auth.organizationId);
    invoice.status = 'issued';
    invoice.zatcaStatus = isVatRegistered(org) ? 'ready_for_provider' : 'not_applicable';
    invoice.issuedAt = nowIso();
    invoice.updatedAt = nowIso();
    audit(db, auth.organizationId, auth.user.id, 'invoice.issued', 'invoice', invoice.id, { number: invoice.number });
    writeDb(db);
    return sendJson(res, 200, invoiceView(db, invoice));
  }
  if (method === 'POST' && action === 'send') {
    invoice.status = 'sent';
    invoice.updatedAt = nowIso();
    const plan = createCollectionPlan(db, auth.organizationId, invoice.id, { template: 'training', depositPercent: 30, firstReminderHours: 24 }, true, auth.user.id);
    const payment = db.payments.find((item) => item.invoiceId === invoice.id && item.status === 'pending')
      || createPaymentRequest(db, auth, invoice, { amount: invoice.total, method: 'card' });
    if (payment.provider === 'moyasar' && !payment.checkoutUrl) await createMoyasarInvoice(payment, invoice);
    const whatsappMessage = createWhatsappMessage(db, auth, { invoiceId: invoice.id, message: buildWhatsappMessage(db, invoice, plan) });
    await sendWhatsappViaMeta(whatsappMessage);
    audit(db, auth.organizationId, auth.user.id, 'invoice.sent', 'invoice', invoice.id, { channel: 'whatsapp' });
    writeDb(db);
    return sendJson(res, 200, { invoice: invoiceView(db, invoice), collectionPlan: plan, payment, whatsappMessage, message: whatsappMessage.body });
  }
  if (method === 'POST' && action === 'payments') {
    const body = await readBody(req);
    const payment = {
      id: id('pay'),
      organizationId: auth.organizationId,
      invoiceId: invoice.id,
      customerId: invoice.customerId,
      amount: Number(body.amount || invoice.total),
      method: body.method || 'manual',
      status: body.status || 'paid',
      providerReference: body.providerReference || '',
      paidAt: body.status === 'failed' ? null : nowIso(),
      createdAt: nowIso()
    };
    db.payments.unshift(payment);
    if (payment.status === 'paid') invoice.status = 'paid';
    invoice.updatedAt = nowIso();
    audit(db, auth.organizationId, auth.user.id, 'payment.recorded', 'payment', payment.id, { invoiceId: invoice.id });
    writeDb(db);
    return sendJson(res, 201, { payment, invoice: invoiceView(db, invoice) });
  }
  throw httpError(405, 'طريقة الطلب غير مدعومة.');
}

function createPaymentRequest(db, auth, invoice, payload = {}) {
  const amount = Number(payload.amount || invoice.outstandingAmount || invoice.total);
  if (amount <= 0) throw httpError(400, 'أضف مبلغ دفع صحيح.');
  const mode = paymentIntegrationMode();
  const payment = {
    id: id('pay'),
    organizationId: auth.organizationId,
    invoiceId: invoice.id,
    customerId: invoice.customerId,
    amount,
    currency: 'SAR',
    method: payload.method || 'card',
    status: 'pending',
    provider: mode,
    providerReference: mode === 'sandbox' ? id('moyasar_sandbox') : '',
    checkoutUrl: mode === 'sandbox'
      ? `${APP_BASE_URL}/app.html#payment=${invoice.id}`
      : '',
    description: payload.description || `Daftar invoice ${invoice.number}`,
    metadata: {
      invoiceId: invoice.id,
      invoiceNumber: invoice.number,
      customerId: invoice.customerId
    },
    paidAt: null,
    createdAt: nowIso(),
    updatedAt: nowIso()
  };
  db.payments.unshift(payment);
  invoice.paymentLink = payment.checkoutUrl || invoice.paymentLink;
  invoice.updatedAt = nowIso();
  audit(db, auth.organizationId, auth.user.id, 'payment.request_created', 'payment', payment.id, { invoiceId: invoice.id, provider: mode });
  return payment;
}

function createWhatsappMessage(db, auth, payload = {}) {
  const invoice = payload.invoiceId
    ? db.invoices.find((item) => item.id === payload.invoiceId && item.organizationId === auth.organizationId)
    : null;
  const customer = payload.customerId
    ? db.customers.find((item) => item.id === payload.customerId && item.organizationId === auth.organizationId)
    : invoice
      ? db.customers.find((item) => item.id === invoice.customerId && item.organizationId === auth.organizationId)
      : null;
  const phone = normalizePhone(payload.phone || customer?.phone || '');
  if (!validateSaudiPhone(phone)) throw httpError(400, 'أضف رقم واتساب سعودي صحيح مثل 05xxxxxxxx.');
  const plan = invoice ? { depositPercent: Number(payload.depositPercent ?? 30), firstReminderHours: Number(payload.firstReminderHours ?? 24), template: payload.template || 'training' } : null;
  const messageBody = String(payload.message || (invoice ? buildWhatsappMessage(db, invoice, plan) : '')).trim();
  if (!messageBody) throw httpError(400, 'أضف نص الرسالة.');
  const mode = whatsappIntegrationMode();
  const message = {
    id: id('wa'),
    organizationId: auth.organizationId,
    invoiceId: invoice?.id || null,
    customerId: customer?.id || null,
    phone,
    body: messageBody,
    provider: mode,
    providerMessageId: mode === 'sandbox' ? id('wamid_sandbox') : '',
    status: mode === 'sandbox' ? 'sandbox_sent' : 'queued',
    direction: 'outbound',
    sentAt: mode === 'sandbox' ? nowIso() : null,
    createdAt: nowIso(),
    updatedAt: nowIso()
  };
  db.whatsappMessages.unshift(message);
  audit(db, auth.organizationId, auth.user.id, 'whatsapp.message_created', 'whatsappMessage', message.id, { invoiceId: invoice?.id || null, mode });
  return message;
}

function createZatcaSubmission(db, auth, invoice, action) {
  const org = db.organizations.find((item) => item.id === auth.organizationId);
  const customer = db.customers.find((item) => item.id === invoice.customerId);
  if (!isVatRegistered(org)) {
    throw httpError(409, 'لا يمكن إرسال الفاتورة إلى ZATCA بدون رقم ضريبي صحيح. فعّل ضريبة القيمة المضافة من الإعدادات بعد التسجيل الرسمي.');
  }
  if (action === 'clearance' && customer?.vatNumber && !validateVatNumber(customer.vatNumber)) {
    throw httpError(400, 'رقم العميل الضريبي غير صحيح لفاتورة التخليص.');
  }
  if (!invoice.issuedAt) {
    invoice.status = 'issued';
    invoice.issuedAt = nowIso();
  }
  const mode = zatcaIntegrationMode();
  const submission = {
    id: id('zatca'),
    organizationId: auth.organizationId,
    invoiceId: invoice.id,
    action,
    provider: mode,
    status: mode === 'sandbox' ? (action === 'clearance' ? 'cleared' : 'reported') : 'queued',
    providerReference: mode === 'sandbox' ? id('zatca_sandbox') : '',
    requestPayload: {
      invoiceNumber: invoice.number,
      vatNumber: org.vatNumber,
      total: invoice.total,
      vat: invoice.vat,
      currency: 'SAR'
    },
    responsePayload: mode === 'sandbox'
      ? { accepted: true, note: 'Sandbox simulation. Replace with certified ZATCA provider before production.' }
      : {},
    createdAt: nowIso(),
    updatedAt: nowIso()
  };
  db.zatcaSubmissions.unshift(submission);
  invoice.zatcaStatus = submission.status;
  invoice.updatedAt = nowIso();
  audit(db, auth.organizationId, auth.user.id, `zatca.invoice_${action}`, 'invoice', invoice.id, { submissionId: submission.id, mode });
  return submission;
}

async function handlePayments(req, res, db, auth, parts) {
  const paymentId = parts[1];
  if (req.method === 'GET' && !paymentId) {
    return sendJson(res, 200, db.payments.filter((item) => item.organizationId === auth.organizationId));
  }
  if (req.method === 'POST' && paymentId === 'create') {
    const body = await readBody(req);
    const invoice = db.invoices.find((item) => item.id === body.invoiceId && item.organizationId === auth.organizationId);
    if (!invoice) throw httpError(404, 'الفاتورة غير موجودة.');
    const payment = createPaymentRequest(db, auth, invoice, body);
    await createMoyasarInvoice(payment, invoice);
    writeDb(db);
    return sendJson(res, 201, {
      payment,
      providerMode: payment.provider,
      nextStep: payment.provider === 'sandbox'
        ? 'الدفع يعمل الآن كتجربة محلية. أضف مفاتيح Moyasar لتفعيل الدفع الحقيقي.'
        : 'أرسل checkoutUrl للعميل أو اربطه بواجهة الدفع.'
    });
  }
  const payment = db.payments.find((item) => item.id === paymentId && item.organizationId === auth.organizationId);
  if (!payment) throw httpError(404, 'عملية الدفع غير موجودة.');
  if (req.method === 'GET') return sendJson(res, 200, payment);
  throw httpError(405, 'طريقة الطلب غير مدعومة.');
}

function safeCompareText(a, b) {
  const left = Buffer.from(String(a || ''));
  const right = Buffer.from(String(b || ''));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function verifyOptionalWebhookSignature(req, secret, headerName) {
  if (!secret) return true;
  const signature = req.headers[headerName.toLowerCase()];
  if (!signature) throw httpError(401, 'توقيع Webhook مفقود.');
  const signatureValue = String(signature).replace(/^sha256=/i, '');
  const raw = req.rawBody || '';
  const hex = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  const base64 = crypto.createHmac('sha256', secret).update(raw).digest('base64');
  if (!safeCompareText(signatureValue, hex) && !safeCompareText(signatureValue, base64)) {
    throw httpError(401, 'توقيع Webhook غير صحيح.');
  }
  return true;
}

function mapPaymentStatus(status) {
  const normalized = String(status || '').toLowerCase();
  if (['paid', 'captured', 'succeeded', 'success'].includes(normalized)) return 'paid';
  if (['failed', 'voided', 'canceled', 'cancelled', 'expired'].includes(normalized)) return 'failed';
  if (['refunded', 'partially_refunded'].includes(normalized)) return 'refunded';
  return 'pending';
}

async function handleWebhooks(req, res, db, parts) {
  if (req.method !== 'POST') throw httpError(405, 'طريقة الطلب غير مدعومة.');
  const provider = parts[1];
  const body = await readBody(req);
  const event = {
    id: id('wh'),
    provider,
    payload: body,
    processed: false,
    createdAt: nowIso()
  };
  db.webhookEvents.unshift(event);

  if (provider === 'moyasar') {
    verifyOptionalWebhookSignature(req, MOYASAR_WEBHOOK_SECRET, 'x-moyasar-signature');
    const paymentPayload = body.data || body.payment || body;
    const providerReference = paymentPayload.id || paymentPayload.payment_id || paymentPayload.providerReference;
    const metadata = paymentPayload.metadata || {};
    const payment = db.payments.find((item) =>
      item.providerReference === providerReference ||
      item.id === metadata.daftarPaymentId ||
      item.invoiceId === metadata.invoiceId
    );
    if (payment) {
      payment.status = mapPaymentStatus(paymentPayload.status);
      payment.providerReference = providerReference || payment.providerReference;
      payment.updatedAt = nowIso();
      if (payment.status === 'paid') {
        payment.paidAt = paymentPayload.paid_at || nowIso();
        const invoice = db.invoices.find((item) => item.id === payment.invoiceId);
        if (invoice) {
          invoice.status = 'paid';
          invoice.updatedAt = nowIso();
        }
      }
      event.processed = true;
      event.relatedId = payment.id;
    }
    writeDb(db);
    return sendJson(res, 200, { ok: true, processed: event.processed, paymentId: event.relatedId || null });
  }

  if (provider === 'whatsapp') {
    if (WHATSAPP_WEBHOOK_SECRET) {
      verifyOptionalWebhookSignature(req, WHATSAPP_WEBHOOK_SECRET, req.headers['x-hub-signature-256'] ? 'x-hub-signature-256' : 'x-whatsapp-signature');
    }
    const statuses = body.entry?.flatMap((entry) =>
      entry.changes?.flatMap((change) => change.value?.statuses || []) || []
    ) || body.statuses || [];
    statuses.forEach((statusItem) => {
      const message = db.whatsappMessages.find((item) => item.providerMessageId === statusItem.id);
      if (message) {
        message.status = statusItem.status || message.status;
        message.updatedAt = nowIso();
        event.processed = true;
        event.relatedId = message.id;
      }
    });
    writeDb(db);
    return sendJson(res, 200, { ok: true, processed: event.processed });
  }

  writeDb(db);
  return sendJson(res, 202, { ok: true, processed: false, message: 'تم حفظ Webhook بدون معالج مخصص.' });
}

async function handleWhatsapp(req, res, db, auth, parts) {
  if (req.method === 'POST' && parts[1] === 'send') {
    const body = await readBody(req);
    const message = createWhatsappMessage(db, auth, body);
    await sendWhatsappViaMeta(message);
    writeDb(db);
    return sendJson(res, 202, {
      message,
      providerMode: message.provider,
      nextStep: message.provider === 'sandbox'
        ? 'تم تسجيل الرسالة كتجربة محلية. أضف مفاتيح WhatsApp Cloud API للإرسال الحقيقي.'
        : 'تم وضع الرسالة في طابور الإرسال.'
    });
  }
  throw httpError(404, 'مسار واتساب غير موجود.');
}

async function handleZatca(req, res, db, auth, parts) {
  if (req.method === 'POST' && parts[1] === 'invoices' && parts[2] && ['report', 'clearance'].includes(parts[3])) {
    const invoice = db.invoices.find((item) => item.id === parts[2] && item.organizationId === auth.organizationId);
    if (!invoice) throw httpError(404, 'الفاتورة غير موجودة.');
    const submission = createZatcaSubmission(db, auth, invoice, parts[3]);
    await submitZatcaToProvider(submission);
    invoice.zatcaStatus = submission.status;
    invoice.updatedAt = nowIso();
    writeDb(db);
    return sendJson(res, 202, {
      invoice: invoiceView(db, invoice),
      submission,
      providerMode: submission.provider,
      nextStep: submission.provider === 'sandbox'
        ? 'هذه محاكاة امتثال. قبل الإنتاج اربط مزود ZATCA معتمد أو تكامل Fatoora مباشر.'
        : 'تم وضع الفاتورة في طابور مزود ZATCA.'
    });
  }
  throw httpError(404, 'مسار ZATCA غير موجود.');
}

async function handleCollectionPlans(req, res, db, auth, parts) {
  if (req.method === 'GET') {
    return sendJson(res, 200, db.collectionPlans.filter((item) => item.organizationId === auth.organizationId));
  }
  if (req.method === 'POST') {
    const body = await readBody(req);
    const plan = createCollectionPlan(db, auth.organizationId, body.invoiceId, body, true, auth.user.id);
    writeDb(db);
    return sendJson(res, 201, plan);
  }
  throw httpError(405, 'طريقة الطلب غير مدعومة.');
}

async function handleReminders(req, res, db, auth, parts) {
  const reminderId = parts[1];
  const action = parts[2];
  if (req.method === 'GET') {
    return sendJson(res, 200, db.reminders.filter((item) => item.organizationId === auth.organizationId));
  }
  const reminder = db.reminders.find((item) => item.id === reminderId && item.organizationId === auth.organizationId);
  if (!reminder) throw httpError(404, 'التذكير غير موجود.');
  if (req.method === 'POST' && action === 'mark-sent') {
    reminder.status = 'sent';
    reminder.sentAt = nowIso();
    audit(db, auth.organizationId, auth.user.id, 'reminder.sent', 'reminder', reminder.id);
    writeDb(db);
    return sendJson(res, 200, reminder);
  }
  throw httpError(405, 'طريقة الطلب غير مدعومة.');
}

async function handleReports(req, res, db, auth, parts) {
  if (req.method !== 'GET') throw httpError(405, 'طريقة الطلب غير مدعومة.');
  if (parts[1] === 'dashboard') return sendJson(res, 200, dashboardReport(db, auth.organizationId));
  if (parts[1] === 'vat') return sendJson(res, 200, vatReport(db, auth.organizationId));
  throw httpError(404, 'التقرير غير موجود.');
}

function safeStaticPath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const requested = decoded === '/' ? '/index.html' : decoded;
  const resolved = path.resolve(ROOT, `.${requested}`);
  if (!resolved.startsWith(ROOT)) return null;
  return resolved;
}

function serveStatic(req, res) {
  const filePath = safeStaticPath(req.url);
  if (!filePath || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, securityHeaders({ 'Content-Type': 'text/plain; charset=utf-8' }));
    res.end('الصفحة غير موجودة.');
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, securityHeaders({ 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' }));
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  try {
    enforceRateLimit(req);
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname.startsWith('/api/')) {
      return await handleApi(req, res, url);
    }
    return serveStatic(req, res);
  } catch (error) {
    const status = error.status || 500;
    return sendJson(res, status, {
      error: {
        message: error.message || 'حدث خطأ غير متوقع.',
        details: error.details || null
      }
    });
  }
});

ensureDb();
server.listen(PORT, () => {
  console.log(`Daftar is running on http://localhost:${PORT}`);
  console.log('Demo login: owner@daftar.local / Daftar@12345');
});
