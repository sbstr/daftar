const translations = {
  ar: {
    brandName: 'Daftar',
    brandTagline: 'دفتر منشأتك اليومي',
    navHome: 'الرئيسية',
    navInvoices: 'الفواتير',
    navCollect: 'التحصيل',
    navCustomers: 'العملاء',
    navSettings: 'الإعدادات',
    supportTitle: 'تحتاج مساعدة؟',
    supportBody: 'أرسل لنا على واتساب ونمشي معك خطوة بخطوة.',
    supportButton: 'فتح واتساب',
    marketLabel: 'مصمم للسوق السعودي',
    homeTitle: 'وش يحتاج شغلك اليوم؟',
    invoicesTitle: 'الفواتير',
    collectViewTitle: 'التحصيل',
    customersViewTitle: 'العملاء',
    settingsViewTitle: 'الإعدادات',
    newInvoice: 'إنشاء فاتورة',
    quickInvoice: 'فاتورة جديدة',
    quickInvoiceHint: 'أنشئها وأرسلها واتساب',
    quickCollect: 'تابع التحصيل',
    quickCollectHint: 'الفواتير المتأخرة والتذكيرات',
    quickCustomer: 'أضف عميل',
    quickCustomerHint: 'بياناته وفواتيره في مكان واحد',
    metricCash: 'وصل اليوم',
    metricCashHint: 'من 6 عمليات دفع',
    metricFollow: 'تحتاج متابعة',
    metricFollowHint: 'جاهزة لتذكير واتساب',
    metricVat: 'ضريبة مستحقة',
    metricVatHint: 'حتى نهاية الشهر الحالي',
    todayTitle: 'اليوم في Daftar',
    viewAll: 'عرض الكل',
    zatcaTitle: 'جاهزية الفوترة',
    invoiceBuilderTitle: 'إنشاء فاتورة',
    invoiceBuilderHint: 'الحقول العربية أساسية وليست اختيارية',
    collectTitle: 'محرك التحصيل الذكي',
    customersTitle: 'العملاء'
  },
  en: {
    brandName: 'Daftar',
    brandTagline: 'Daily operations for your business',
    navHome: 'Home',
    navInvoices: 'Invoices',
    navCollect: 'Collect',
    navCustomers: 'Customers',
    navSettings: 'Settings',
    supportTitle: 'Need help?',
    supportBody: 'Message us on WhatsApp and we will guide you step by step.',
    supportButton: 'Open WhatsApp',
    marketLabel: 'Built for Saudi small businesses',
    homeTitle: 'What does your business need today?',
    invoicesTitle: 'Invoices',
    collectViewTitle: 'Collections',
    customersViewTitle: 'Customers',
    settingsViewTitle: 'Settings',
    newInvoice: 'Create invoice',
    quickInvoice: 'New invoice',
    quickInvoiceHint: 'Create and send by WhatsApp',
    quickCollect: 'Follow collections',
    quickCollectHint: 'Overdue invoices and reminders',
    quickCustomer: 'Add customer',
    quickCustomerHint: 'Customer data and invoices in one place',
    metricCash: 'Received today',
    metricCashHint: 'From 6 payments',
    metricFollow: 'Needs follow-up',
    metricFollowHint: 'Ready for WhatsApp reminders',
    metricVat: 'VAT due',
    metricVatHint: 'Until the end of this month',
    todayTitle: 'Today in Daftar',
    viewAll: 'View all',
    zatcaTitle: 'E-invoicing readiness',
    invoiceBuilderTitle: 'Create invoice',
    invoiceBuilderHint: 'Arabic invoice fields are core, not optional',
    collectTitle: 'Smart collection engine',
    customersTitle: 'Customers'
  }
};

const collectTemplates = {
  training: {
    service: 'دورة إدارة المبيعات',
    deposit: 30,
    reminder: 24,
    opener: 'تم حجز مقعدك في',
    rows: [
      ['أحمد العتيبي', 'دورة إدارة المبيعات', 2400, 'viewed', 'تذكير دفع العربون بعد 24 ساعة'],
      ['شركة نمو', 'ورشة تدريب فريق المبيعات', 6800, 'paid', 'إصدار فاتورة ZATCA النهائية'],
      ['نورة القحطاني', 'دورة خدمة العملاء', 1200, 'due', 'إرسال تذكير واتساب الآن']
    ]
  },
  consulting: {
    service: 'استشارة قانونية شهرية',
    deposit: 50,
    reminder: 48,
    opener: 'تم اعتماد عرض الخدمة',
    rows: [
      ['مؤسسة المدار', 'استشارة قانونية شهرية', 4500, 'sent', 'انتظار مشاهدة رابط الدفع'],
      ['شركة مسار', 'إعداد عقد شراكة', 3200, 'due', 'تذكير الدفعة الأولى بعد 48 ساعة'],
      ['عبدالله الشهري', 'جلسة استشارية', 850, 'paid', 'إرسال ملخص الجلسة والفاتورة']
    ]
  },
  workshop: {
    service: 'صيانة ناقل الحركة',
    deposit: 40,
    reminder: 24,
    opener: 'تم تجهيز عرض الصيانة',
    rows: [
      ['سالم الغامدي', 'صيانة ناقل الحركة', 3600, 'viewed', 'تذكير بالموافقة والدفع'],
      ['مؤسسة الرحلة', 'صيانة دورية لسيارتين', 1900, 'paid', 'إرسال فاتورة ضريبية'],
      ['محمد الحربي', 'تغيير كمبروسر', 2200, 'due', 'تذكير عربون قطع الغيار']
    ]
  },
  appointments: {
    service: 'حجز جلسة علاج طبيعي',
    deposit: 20,
    reminder: 24,
    opener: 'تم تسجيل موعدك',
    rows: [
      ['ريم السبيعي', 'جلسة علاج طبيعي', 350, 'sent', 'انتظار تأكيد الموعد'],
      ['هدى المالكي', 'باقة تجميل', 900, 'viewed', 'تذكير الدفع قبل الموعد'],
      ['فهد المطيري', 'استشارة تغذية', 250, 'due', 'إرسال رابط إعادة جدولة']
    ]
  }
};

const customers = [
  { name: 'أحمد العتيبي', phone: '0551234567', due: 720, last: 'شاهد رابط الدفع' },
  { name: 'شركة نمو', phone: '0508881122', due: 0, last: 'دفع آخر فاتورة' },
  { name: 'مؤسسة المدار', phone: '0534040404', due: 4500, last: 'بانتظار الدفعة الأولى' },
  { name: 'نورة القحطاني', phone: '0567001122', due: 1200, last: 'تحتاج تذكير' },
  { name: 'سالم الغامدي', phone: '0559912211', due: 1440, last: 'عرض الصيانة مفتوح' },
  { name: 'شركة مسار', phone: '0542227788', due: 3200, last: 'عقد شراكة' }
];

const statusLabels = {
  sent: 'أُرسلت',
  viewed: 'شوهدت',
  due: 'تحتاج تذكير',
  paid: 'مدفوعة',
  draft: 'مسودة',
  issued: 'صادرة'
};

const state = {
  language: 'ar',
  view: 'home',
  template: 'training'
};

const backend = {
  baseUrl: window.location.protocol === 'file:' ? 'http://localhost:4173/api' : '/api',
  token: localStorage.getItem('daftar_token') || '',
  online: false,
  user: null,
  organization: null,
  customers: null,
  invoices: null,
  dashboard: null
};

const elements = {
  viewTitle: document.getElementById('viewTitle'),
  backendStatus: document.getElementById('backendStatus'),
  languageToggle: document.getElementById('languageToggle'),
  taxProfileNotice: document.getElementById('taxProfileNotice'),
  readinessBusiness: document.getElementById('readinessBusiness'),
  readinessVat: document.getElementById('readinessVat'),
  orgSettingsForm: document.getElementById('orgSettingsForm'),
  orgNameAr: document.getElementById('orgNameAr'),
  orgVatStatus: document.getElementById('orgVatStatus'),
  orgVatNumber: document.getElementById('orgVatNumber'),
  orgCrNumber: document.getElementById('orgCrNumber'),
  orgBusinessStatus: document.getElementById('orgBusinessStatus'),
  orgLaunchMode: document.getElementById('orgLaunchMode'),
  orgSettingsMessage: document.getElementById('orgSettingsMessage'),
  customerName: document.getElementById('customerName'),
  phoneNumber: document.getElementById('phoneNumber'),
  vatNumber: document.getElementById('vatNumber'),
  vatHint: document.getElementById('vatHint'),
  serviceDescription: document.getElementById('serviceDescription'),
  invoiceAmount: document.getElementById('invoiceAmount'),
  vatMode: document.getElementById('vatMode'),
  formMessage: document.getElementById('formMessage'),
  previewCustomer: document.getElementById('previewCustomer'),
  previewService: document.getElementById('previewService'),
  previewSubtotal: document.getElementById('previewSubtotal'),
  previewVat: document.getElementById('previewVat'),
  previewTotal: document.getElementById('previewTotal'),
  depositPercent: document.getElementById('depositPercent'),
  depositLabel: document.getElementById('depositLabel'),
  firstReminder: document.getElementById('firstReminder'),
  messagePreview: document.getElementById('messagePreview'),
  pipelineRows: document.getElementById('pipelineRows'),
  customerSearch: document.getElementById('customerSearch'),
  customerCards: document.getElementById('customerCards'),
  metricCashValue: document.getElementById('metricCashValue'),
  metricCashHint: document.getElementById('metricCashHint'),
  metricFollowValue: document.getElementById('metricFollowValue'),
  metricVatValue: document.getElementById('metricVatValue'),
  chartTotalValue: document.getElementById('chartTotalValue'),
  collectionRateValue: document.getElementById('collectionRateValue'),
  toast: document.getElementById('toast')
};

function toEnglishDigits(value) {
  return String(value).replace(/[\u0660-\u0669\u06f0-\u06f9]/g, (digit) => {
    const code = digit.charCodeAt(0);
    return String(code >= 0x06f0 ? code - 0x06f0 : code - 0x0660);
  });
}

function normalizeArabic(value) {
  return toEnglishDigits(value)
    .toLowerCase()
    .replace(/[\u0623\u0625\u0622]/g, '\u0627')
    .replace(/\u0629/g, '\u0647')
    .replace(/\u0649/g, '\u064a')
    .replace(/\u0640/g, '')
    .replace(/[^\u0600-\u06ff\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatSar(value) {
  return `${Number(value).toLocaleString('en-US')} ${state.language === 'ar' ? 'ريال' : 'SAR'}`;
}

function isOrgVatRegistered() {
  return backend.organization?.vatRegistrationStatus === 'registered' && validateVat(backend.organization?.vatNumber || '');
}

function getVatRate() {
  return isOrgVatRegistered() ? Number(backend.organization?.defaultVatRate || 0.15) : 0;
}

function renderTaxProfile() {
  const registered = isOrgVatRegistered();
  if (elements.taxProfileNotice) {
    elements.taxProfileNotice.textContent = registered
      ? 'الضريبة مفعلة: سيتم احتساب 15% وإتاحة إرسال الفواتير إلى ZATCA.'
      : 'الإطلاق التجريبي بدون رقم ضريبي: لن نضيف ضريبة 15% ولن نرسل الفواتير إلى ZATCA حتى تضيف رقمًا ضريبيًا صحيحًا.';
    elements.taxProfileNotice.classList.toggle('ready', registered);
  }
  if (elements.readinessBusiness) {
    const hasBusiness = ['cr', 'freelance'].includes(backend.organization?.businessRegistrationStatus);
    elements.readinessBusiness.textContent = hasBusiness ? 'بيانات النشاط جاهزة' : 'النشاط في وضع إطلاق تجريبي';
  }
  if (elements.readinessVat) {
    elements.readinessVat.textContent = registered ? 'الرقم الضريبي صحيح' : 'الضريبة مؤجلة حتى التفعيل الرسمي';
  }
  if (elements.vatMode) {
    elements.vatMode.disabled = !registered;
    elements.vatMode.value = registered && elements.vatMode.value !== 'none' ? elements.vatMode.value : 'none';
  }
  if (elements.vatHint) {
    elements.vatHint.textContent = registered ? 'رقم العميل الضريبي اختياري، ويتكون من 15 رقم عند إضافته.' : 'اختياري حاليًا. لا تضف ضريبة قبل التسجيل الرسمي.';
  }
}

function setBackendStatus(online, message) {
  backend.online = online;
  if (!elements.backendStatus) return;
  elements.backendStatus.textContent = message || (online ? 'متصل بالـ Backend' : 'بيانات تجريبية');
  elements.backendStatus.classList.toggle('online', online);
}

async function apiRequest(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  if (backend.token) headers.Authorization = `Bearer ${backend.token}`;
  const response = await fetch(`${backend.baseUrl}${path}`, {
    ...options,
    headers,
    body: options.body && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error?.message || 'تعذر الاتصال بالخادم.');
  return data;
}

async function loginDemo() {
  if (backend.token) return;
  const session = await apiRequest('/auth/login', {
    method: 'POST',
    body: {
      email: 'owner@daftar.local',
      password: 'Daftar@12345'
    }
  });
  backend.token = session.token;
  localStorage.setItem('daftar_token', session.token);
}

async function syncBackend() {
  try {
    await loginDemo();
    const [me, dashboard, customersResult, invoicesResult] = await Promise.all([
      apiRequest('/me'),
      apiRequest('/reports/dashboard'),
      apiRequest('/customers'),
      apiRequest('/invoices')
    ]);
    backend.user = me.user;
    backend.organization = me.organization;
    backend.dashboard = dashboard;
    backend.customers = customersResult;
    backend.invoices = invoicesResult;
    setBackendStatus(true, 'متصل بالـ Backend');
    renderDashboardFromApi();
    renderOrganizationSettings();
    renderTaxProfile();
    renderInvoicePreview();
    renderCustomers();
    renderCollection();
  } catch (error) {
    setBackendStatus(false, 'بيانات تجريبية');
  }
}

function renderDashboardFromApi() {
  if (!backend.dashboard) return;
  const dashboard = backend.dashboard;
  if (elements.metricCashValue) elements.metricCashValue.textContent = formatSar(dashboard.paidToday);
  if (elements.metricCashHint) elements.metricCashHint.textContent = `من ${dashboard.paymentCount} عمليات دفع`;
  if (elements.metricFollowValue) elements.metricFollowValue.textContent = `${dashboard.followups} فواتير`;
  if (elements.metricVatValue) elements.metricVatValue.textContent = formatSar(dashboard.vatDue);
  if (!dashboard.taxProfile?.canChargeVat && elements.metricVatValue) elements.metricVatValue.textContent = formatSar(0);
  if (elements.chartTotalValue) elements.chartTotalValue.textContent = formatSar(dashboard.totals.invoiced);
  if (elements.collectionRateValue) elements.collectionRateValue.textContent = `${dashboard.collectionRate}%`;
}

function renderOrganizationSettings() {
  const org = backend.organization;
  if (!org) return;
  if (elements.orgNameAr) elements.orgNameAr.value = org.nameAr || '';
  if (elements.orgVatStatus) elements.orgVatStatus.value = org.vatRegistrationStatus || 'not_registered';
  if (elements.orgVatNumber) elements.orgVatNumber.value = org.vatNumber || '';
  if (elements.orgCrNumber) elements.orgCrNumber.value = org.crNumber || '';
  if (elements.orgBusinessStatus) elements.orgBusinessStatus.value = org.businessRegistrationStatus || 'none';
  if (elements.orgLaunchMode) elements.orgLaunchMode.value = org.launchMode || 'trial_no_tax';
  if (elements.orgSettingsMessage) {
    elements.orgSettingsMessage.textContent = isOrgVatRegistered()
      ? 'وضع الإنتاج الضريبي جاهز داخل النظام.'
      : 'وضع الإطلاق التجريبي يعمل بدون ضريبة وبدون إرسال ZATCA.';
  }
}

function normalizePhone(value) {
  const digits = toEnglishDigits(value).replace(/\D/g, '');
  if (digits.startsWith('9665') && digits.length === 12) return `0${digits.slice(3)}`;
  if (digits.startsWith('5') && digits.length === 9) return `0${digits}`;
  return digits;
}

function validatePhone(value) {
  return /^05\d{8}$/.test(normalizePhone(value));
}

function validateVat(value) {
  return /^\d{15}$/.test(toEnglishDigits(value).replace(/\D/g, ''));
}

function calculateInvoice() {
  const totalInput = Number(elements.invoiceAmount.value || 0);
  const vatRate = getVatRate();
  if (vatRate <= 0 || elements.vatMode.value === 'none') {
    return { subtotal: totalInput, vat: 0, total: totalInput };
  }
  const inclusive = elements.vatMode.value === 'inclusive';
  const subtotal = inclusive ? totalInput / (1 + vatRate) : totalInput;
  const vat = subtotal * vatRate;
  const total = inclusive ? totalInput : subtotal + vat;
  return { subtotal, vat, total };
}

function renderInvoicePreview() {
  const { subtotal, vat, total } = calculateInvoice();
  elements.previewCustomer.textContent = elements.customerName.value || 'عميل جديد';
  elements.previewService.textContent = elements.serviceDescription.value || 'خدمة';
  elements.previewSubtotal.textContent = formatSar(Math.round(subtotal));
  elements.previewVat.textContent = formatSar(Math.round(vat));
  elements.previewTotal.textContent = formatSar(Math.round(total));
  validateInvoiceForm(false);
}

function validateInvoiceForm(showSuccess = false) {
  const errors = [];
  if (!elements.customerName.value.trim()) errors.push('أضف اسم العميل عشان نكمل الفاتورة.');
  if (!validatePhone(elements.phoneNumber.value)) errors.push('رقم الجوال غير صحيح، اكتبه مثل: 05xxxxxxxx.');
  if (elements.vatNumber.value.trim() && !validateVat(elements.vatNumber.value)) errors.push('الرقم الضريبي إذا أضفته لازم يكون 15 رقم.');
  if (!elements.serviceDescription.value.trim()) errors.push('اكتب وصف الخدمة بالعربي.');
  if (Number(elements.invoiceAmount.value || 0) <= 0) errors.push('أضف قيمة صحيحة للفاتورة.');

  elements.formMessage.classList.toggle('error', errors.length > 0);
  elements.formMessage.textContent = errors[0] || (showSuccess ? 'تم حفظ الفاتورة وتجهيز رسالة واتساب.' : 'الفاتورة جاهزة للإرسال.');
  return errors.length === 0;
}

function buildMessage() {
  const template = collectTemplates[state.template];
  const customer = elements.customerName.value.trim() || 'عميلنا العزيز';
  const service = elements.serviceDescription.value.trim() || template.service;
  const amount = Number(elements.invoiceAmount.value || 0);
  const deposit = Math.round(amount * Number(elements.depositPercent.value) / 100);
  const reminder = elements.firstReminder.options[elements.firstReminder.selectedIndex].text;

  return `مرحبًا ${customer}،

${template.opener}: ${service}.

قيمة الخدمة: ${formatSar(amount)}
الدفعة المطلوبة الآن: ${formatSar(deposit)}

رابط الدفع:
https://pay.daftar.sa/inv-1042

بعد الدفع ستصلك الفاتورة الضريبية المتوافقة مع ZATCA تلقائيًا.

ملاحظة: سيتم إرسال تذكير تلقائي بعد ${reminder} إذا لم يكتمل الدفع.`;
}

function renderCollection() {
  elements.depositLabel.textContent = `${elements.depositPercent.value}%`;
  elements.messagePreview.textContent = buildMessage();
  const rows = backend.invoices
    ? backend.invoices.slice(0, 8).map((invoice) => {
      const action = {
        paid: 'تم التحصيل وإصدار الفاتورة',
        due: 'إرسال تذكير واتساب الآن',
        viewed: 'تذكير دفع العربون بعد 24 ساعة',
        sent: 'انتظار مشاهدة رابط الدفع',
        issued: 'إرسال رابط الدفع للعميل',
        draft: 'مراجعة الفاتورة قبل الإرسال'
      }[invoice.status] || 'متابعة الفاتورة';
      return [
        invoice.customer?.name || 'عميل',
        invoice.serviceDescription,
        invoice.total,
        invoice.status,
        action
      ];
    })
    : collectTemplates[state.template].rows;
  elements.pipelineRows.innerHTML = rows.map(([customer, service, amount, status, action]) => `
    <tr>
      <td>${customer}</td>
      <td>${service}</td>
      <td>${formatSar(amount)}</td>
      <td><span class="badge ${status}">${statusLabels[status] || status}</span></td>
      <td>${action}</td>
    </tr>
  `).join('');
}

function setTemplate(templateName) {
  state.template = templateName;
  const template = collectTemplates[templateName];
  elements.serviceDescription.value = template.service;
  elements.depositPercent.value = template.deposit;
  elements.firstReminder.value = String(template.reminder);
  document.querySelectorAll('.template-option').forEach((button) => {
    button.classList.toggle('active', button.dataset.template === templateName);
  });
  renderInvoicePreview();
  renderCollection();
}

function renderCustomers() {
  const query = normalizeArabic(elements.customerSearch.value);
  const source = backend.customers || customers;
  const filtered = source.filter((customer) => {
    const haystack = normalizeArabic(`${customer.name} ${customer.phone} ${customer.last || customer.notes || ''}`);
    return !query || haystack.includes(query);
  });

  elements.customerCards.innerHTML = filtered.map((customer) => `
    <article class="customer-card">
      <strong>${customer.name}</strong>
      <span>${customer.phone}</span>
      <span>المتبقي عليه: ${formatSar(customer.due ?? getCustomerDue(customer.id))}</span>
      <span>آخر تواصل: ${customer.last || customer.notes || 'لا توجد ملاحظات'}</span>
    </article>
  `).join('') || '<p>ما لقينا عميل بهذا الاسم. جرّب كتابة الاسم بطريقة ثانية.</p>';
}

function getCustomerDue(customerId) {
  if (!backend.invoices) return 0;
  return backend.invoices
    .filter((invoice) => invoice.customerId === customerId && invoice.status !== 'paid')
    .reduce((sum, invoice) => sum + Number(invoice.outstandingAmount ?? invoice.total ?? 0), 0);
}

function setView(viewName) {
  state.view = viewName;
  document.querySelectorAll('.view').forEach((view) => view.classList.toggle('active', view.id === viewName));
  document.querySelectorAll('[data-view-link]').forEach((button) => {
    button.classList.toggle('active', button.dataset.viewLink === viewName);
  });
  const titleKey = {
    home: 'homeTitle',
    invoices: 'invoicesTitle',
    collect: 'collectViewTitle',
    customers: 'customersViewTitle',
    settings: 'settingsViewTitle'
  }[viewName];
  elements.viewTitle.textContent = translations[state.language][titleKey];
}

function applyLanguage(language) {
  state.language = language;
  document.documentElement.lang = language;
  document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i18n]').forEach((node) => {
    const key = node.dataset.i18n;
    if (translations[language][key]) node.textContent = translations[language][key];
  });
  elements.languageToggle.textContent = language === 'ar' ? 'English' : 'العربية';
  setView(state.view);
  renderInvoicePreview();
  renderCollection();
  renderCustomers();
}

function applySmartDirection(input) {
  const value = input.value.trim();
  if (!value) {
    input.dir = document.documentElement.dir;
    return;
  }
  input.dir = /[\u0600-\u06ff]/.test(value) ? 'rtl' : 'ltr';
}

function showToast(message = 'تم نسخ الرسالة') {
  elements.toast.textContent = message;
  elements.toast.classList.add('show');
  window.setTimeout(() => elements.toast.classList.remove('show'), 1800);
}

document.querySelectorAll('[data-view-link]').forEach((button) => {
  button.addEventListener('click', (event) => {
    event.preventDefault();
    setView(button.dataset.viewLink);
  });
});

document.querySelectorAll('[data-open-invoice]').forEach((button) => {
  button.addEventListener('click', () => setView('invoices'));
});

document.querySelectorAll('[data-smart-dir]').forEach((input) => {
  applySmartDirection(input);
  input.addEventListener('input', () => applySmartDirection(input));
});

[elements.customerName, elements.phoneNumber, elements.vatNumber, elements.serviceDescription, elements.invoiceAmount, elements.vatMode].forEach((input) => {
  input.addEventListener('input', renderInvoicePreview);
  input.addEventListener('change', renderInvoicePreview);
});

document.getElementById('invoiceForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (validateInvoiceForm(true)) {
    if (backend.online) {
      try {
        let customer = (backend.customers || []).find((item) => normalizePhone(item.phone) === normalizePhone(elements.phoneNumber.value));
        if (!customer) {
          customer = await apiRequest('/customers', {
            method: 'POST',
            body: {
              name: elements.customerName.value,
              phone: elements.phoneNumber.value,
              vatNumber: elements.vatNumber.value,
              notes: 'أضيف من واجهة إنشاء الفاتورة'
            }
          });
        }
        const invoice = await apiRequest('/invoices', {
          method: 'POST',
          body: {
            customerId: customer.id,
            serviceDescription: elements.serviceDescription.value,
            amount: Number(elements.invoiceAmount.value),
            vatMode: getVatRate() > 0 ? elements.vatMode.value : 'none'
          }
        });
        await apiRequest(`/invoices/${invoice.id}/send`, { method: 'POST' });
        await syncBackend();
        showToast('تم حفظ الفاتورة وربطها بخطة تحصيل.');
      } catch (error) {
        showToast(error.message || 'تعذر حفظ الفاتورة في الخادم.');
      }
    }
    setView('collect');
    renderCollection();
  }
});

document.querySelectorAll('.template-option').forEach((button) => {
  button.addEventListener('click', () => setTemplate(button.dataset.template));
});

[elements.depositPercent, elements.firstReminder].forEach((input) => {
  input.addEventListener('input', renderCollection);
  input.addEventListener('change', renderCollection);
});

elements.customerSearch.addEventListener('input', renderCustomers);

elements.languageToggle.addEventListener('click', () => {
  applyLanguage(state.language === 'ar' ? 'en' : 'ar');
});

if (elements.orgSettingsForm) {
  elements.orgSettingsForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!backend.online) {
      showToast('شغل الـ Backend أولًا لحفظ إعدادات المنشأة.');
      return;
    }
    try {
      const org = await apiRequest('/organization', {
        method: 'PUT',
        body: {
          nameAr: elements.orgNameAr.value,
          vatRegistrationStatus: elements.orgVatStatus.value,
          vatNumber: elements.orgVatNumber.value,
          crNumber: elements.orgCrNumber.value,
          businessRegistrationStatus: elements.orgBusinessStatus.value,
          launchMode: elements.orgLaunchMode.value
        }
      });
      backend.organization = org;
      renderOrganizationSettings();
      renderTaxProfile();
      renderInvoicePreview();
      await syncBackend();
      showToast('تم حفظ إعدادات الإطلاق.');
    } catch (error) {
      if (elements.orgSettingsMessage) elements.orgSettingsMessage.textContent = error.message;
      showToast(error.message || 'تعذر حفظ الإعدادات.');
    }
  });
}

document.getElementById('copyMessage').addEventListener('click', async () => {
  const message = buildMessage();
  try {
    await navigator.clipboard.writeText(message);
  } catch (error) {
    const textarea = document.createElement('textarea');
    textarea.value = message;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  }
  showToast(state.language === 'ar' ? 'تم نسخ الرسالة' : 'Message copied');
});

renderTaxProfile();
renderInvoicePreview();
renderCollection();
renderCustomers();
applyLanguage('ar');
syncBackend();
