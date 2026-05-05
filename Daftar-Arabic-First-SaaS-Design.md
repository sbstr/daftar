# Daftar — Arabic-First SaaS Platform Design

## 1. Product Positioning

**Daftar** is a mobile-first Arabic SaaS platform for small service businesses in Saudi Arabia. It helps owners issue compliant invoices, collect payments, manage customers, follow appointments, and understand tax obligations without needing accounting knowledge.

The product should feel Saudi-native from the first screen:

> "طلع فاتورتك، أرسلها للعميل، وتابع التحصيل بدون صداع."

English is secondary. Arabic is the product's original language, not a translated layer.

## 2. Core Audience

Primary users:

- Workshop owners.
- Training center operators.
- Small law and consulting offices.
- Beauty salons and appointment-based services.
- Freelancers and micro service businesses.
- Small contractors and maintenance teams.

User profile:

- Uses WhatsApp daily.
- May not understand accounting terms.
- Wants simple steps, not dashboards full of jargon.
- Cares about avoiding ZATCA/VAT mistakes.
- Prefers mobile over desktop.
- Trusts human support more than help-center articles.

## 3. Arabic-First Product Philosophy

Daftar must be designed as if Arabic is the only language.

Rules:

- Do not start with English labels and translate them.
- Use Saudi business terms users already know.
- Keep sentences short.
- Explain accounting actions as daily business actions.
- Avoid unnecessary formal Arabic.
- Use Saudi conversational tone lightly where it reduces anxiety.

Examples:

| Avoid | Use |
|---|---|
| إدارة الحسابات المدينة | متابعة الفواتير غير المدفوعة |
| إنشاء عميل جديد | إضافة عميل |
| عملية الدفع فشلت | ما تمت عملية الدفع، جرّب مرة ثانية |
| Transaction | عملية |
| Invoice | فاتورة |
| VAT | ضريبة القيمة المضافة |
| Tax number | الرقم الضريبي |

## 4. Product Modules

### A. Home Dashboard

Purpose: tell the owner what matters today.

Arabic-first sections:

- "فواتير تحتاج متابعة"
- "مبالغ وصلت اليوم"
- "مواعيد اليوم"
- "تنبيه ضريبة القيمة المضافة"
- "آخر العملاء"

Avoid generic analytics on the first screen. Use action-oriented cards.

### B. Invoices

Main flows:

- Create invoice.
- Send invoice by WhatsApp.
- Add payment link.
- Track status.
- Export PDF.
- Store ZATCA-ready invoice data.

Arabic required fields:

- اسم المنشأة
- اسم العميل
- وصف الخدمة
- الرقم الضريبي
- السجل التجاري
- ضريبة القيمة المضافة
- إجمالي الفاتورة

UX principle:

The user should feel they are "writing a normal invoice", while the system handles technical compliance in the background.

### C. Daftar Collect

This is the retention feature.

It turns invoices into collection flows:

- Send payment request.
- Auto-remind by WhatsApp.
- Collect deposit.
- Handle partial payments.
- Track overdue invoices.
- Issue final invoice after payment.

Templates:

| Sector | Collection Flow |
|---|---|
| Training | Deposit + reminder + final invoice |
| Consulting | Retainer + milestone payments |
| Workshop | Quote approval + parts deposit |
| Appointments | Paid booking + no-show fee |
| Contracting | Advance + progress payment + final payment |

### D. Customers

Arabic UX:

- "العملاء" not "CRM".
- Customer card should show:
  - الاسم
  - الجوال
  - آخر فاتورة
  - المتبقي عليه
  - آخر تواصل

Search must support:

- Arabic spelling variants.
- English numbers and Arabic numerals.
- Names with or without "ال".
- Hamza variations: أحمد / احمد.

### E. Appointments

For service businesses:

- Book appointment.
- Collect deposit.
- Send WhatsApp confirmation.
- Send reminder.
- Convert appointment into invoice.

Arabic microcopy:

- "تأكيد الموعد"
- "إرسال تذكير"
- "تحصيل عربون"
- "تحويل الموعد إلى فاتورة"

### F. VAT Reports

Avoid accounting-heavy language.

Use:

- "ملخص الضريبة"
- "المبيعات الخاضعة للضريبة"
- "ضريبة مستحقة"
- "جاهز للتصدير"

Show clear warnings:

> "انتبه: عندك فواتير ناقصة بيانات ضريبية قبل التصدير."

## 5. Information Architecture

Mobile RTL navigation should prioritize thumb access.

Bottom navigation:

1. الرئيسية
2. الفواتير
3. العملاء
4. التحصيل
5. المزيد

Primary action button:

- On Arabic UI, place the main floating action where RTL users naturally expect it: lower-left or centered depending on layout, but actions inside forms should align with RTL flow.

Desktop sidebar:

- Sidebar on the right.
- Main content flows right to left.
- Primary actions appear before secondary actions in RTL order.

Example button order:

`حفظ وإرسال` | `حفظ كمسودة` | `إلغاء`

## 6. Arabic UI Text Samples

### Onboarding

**أهلًا، خلنا نجهز دفترك**

أضف بيانات منشأتك مرة واحدة، وبعدها نستخدمها تلقائيًا في الفواتير والتقارير.

Buttons:

- ابدأ الإعداد
- عندي حساب

### Empty State

**ما عندك فواتير حتى الآن**

ابدأ بأول فاتورة، وأرسلها للعميل عبر واتساب خلال دقيقة.

Button:

- إنشاء فاتورة

### Error Messages

| Situation | Arabic Copy |
|---|---|
| Network error | الاتصال ضعيف شوي، جرّب مرة ثانية |
| Missing VAT number | أضف الرقم الضريبي عشان نكمل الفاتورة |
| Invalid phone | رقم الجوال غير صحيح، اكتبه مثل: 05xxxxxxxx |
| Payment failed | ما تمت عملية الدفع، تقدر تعيد المحاولة |
| PDF failed | ما قدرنا نجهز ملف PDF الآن، جرّب بعد لحظات |

### Success Messages

- تم إرسال الفاتورة للعميل.
- وصلت الدفعة وتم تحديث حالة الفاتورة.
- تم حفظ بيانات العميل.
- التقرير جاهز للتصدير.

## 7. Forms and Input Design

### Saudi Phone Number

Accept:

- 05xxxxxxxx
- +9665xxxxxxxx
- 9665xxxxxxxx
- Arabic numerals: ٠٥xxxxxxxx

Display normalized:

- 05xxxxxxxx

### VAT Number

Rules:

- 15 digits.
- Accept Arabic and English numerals.
- Show helper text:

> الرقم الضريبي يتكون من 15 رقم.

### CR Number

Use:

- السجل التجاري

Helper:

> اكتب رقم السجل التجاري كما هو في شهادة المنشأة.

### Smart Direction

Inputs should detect content direction:

- Arabic names: RTL.
- Email, URLs, invoice codes: LTR.
- Mixed text: preserve readable order.

## 8. Localization Architecture

Languages:

- Arabic: default.
- English: secondary.

Implementation principles:

- Store translation keys by intent, not literal word.
- Separate business terminology from UI labels.
- Support industry-specific copy.
- Avoid one generic translation for words like "statement", "balance", "charge", or "settlement".

Example key strategy:

```json
{
  "invoice.create.title": {
    "ar": "إنشاء فاتورة",
    "en": "Create invoice"
  },
  "collection.reminder.sent": {
    "ar": "تم إرسال تذكير للعميل",
    "en": "Reminder sent to customer"
  }
}
```

## 9. Technical Architecture

Recommended stack:

- Frontend: Next.js or React with full RTL support.
- Mobile: React Native or Flutter if native app is required.
- Backend: Node.js/NestJS or Laravel.
- Database: PostgreSQL with UTF-8.
- Search: PostgreSQL trigram + normalized Arabic search, or OpenSearch later.
- Queue: BullMQ / Redis for reminders, PDF generation, WhatsApp events.
- Storage: S3-compatible storage for invoice PDFs and attachments.
- Payments: Saudi-ready providers such as Moyasar, Tap, HyperPay, or STC Pay integration.
- Messaging: WhatsApp Business API via approved provider.

Core services:

- Auth service.
- Organization service.
- Customer service.
- Invoice service.
- Payment service.
- Collection workflow service.
- Notification service.
- ZATCA integration service.
- Reporting service.

## 10. Data Model Overview

Important entities:

- Organization
- User
- Customer
- Invoice
- InvoiceItem
- Payment
- CollectionPlan
- Reminder
- Appointment
- TaxReport
- AuditLog

Arabic-sensitive fields:

- `name_ar`
- `name_en`
- `description_ar`
- `description_en`
- `display_language`
- `normalized_search_text`

Do not make Arabic optional for legally relevant invoice content.

## 11. Arabic AI and Automation

High-value AI features:

### Smart Invoice Autofill

User writes:

> فاتورة لأحمد العتيبي، صيانة مكيف، 450 ريال شامل الضريبة

System extracts:

- Customer: أحمد العتيبي
- Service: صيانة مكيف
- Amount: 450
- VAT mode: شامل الضريبة

### Arabic OCR

Use cases:

- Read supplier invoices.
- Extract VAT numbers.
- Extract totals.
- Suggest expense category.

### Arabic Search

Normalize:

- أ إ آ → ا
- ة → ه or searchable equivalent
- ى → ي
- Remove tatweel
- Support Arabic/English numerals

### Voice Notes

Optional but powerful:

Owner sends a voice note:

> سو فاتورة لخالد على خدمة تنظيف بخمسمية ريال

System drafts the invoice for review.

## 12. ZATCA Compliance Context

Daftar must treat Arabic invoice data as core.

Must support:

- Arabic seller name.
- Arabic buyer name when available.
- Arabic item descriptions.
- VAT number.
- QR code.
- XML generation.
- PDF/A-3 invoice output when required by implementation scope.
- Audit trail.
- Immutable issued invoice records.

Recommendation:

Do not build the full ZATCA compliance layer from scratch in the first MVP. Start with a certified or experienced integration provider, then gradually internalize parts once volume justifies it.

## 13. Mobile-First Experience

Mobile principles:

- Large Arabic text.
- Minimal tables.
- Use cards for invoice status.
- Primary actions near thumb reach.
- WhatsApp sharing prominent.
- Avoid dense accounting screens.

Invoice creation flow:

1. اختر العميل
2. أضف الخدمة
3. راجع المبلغ والضريبة
4. أرسل الفاتورة

## 14. Customer Support

Support must be Arabic-first.

Channels:

- WhatsApp support.
- In-app chat.
- Short Arabic videos.
- Setup call for paid plans.
- Help center written in Saudi-friendly Arabic.

Support tone:

> ارسل لنا صورة المشكلة، ونساعدك خطوة بخطوة.

## 15. Feature Prioritization

### MVP

- Arabic onboarding.
- Organization profile.
- Customer list.
- ZATCA-ready invoice creation through provider.
- PDF invoice.
- WhatsApp invoice sending.
- Payment links.
- Daftar Collect templates.
- Basic VAT summary.
- Arabic support channel.

### V1

- Appointments.
- Advanced reminders.
- Customer timeline.
- Partial payments.
- Expense capture.
- Arabic search normalization.
- English interface.

### V2

- Arabic OCR.
- Voice invoice creation.
- Payroll add-on.
- Multi-branch support.
- Accountant access.
- API.

## 16. Go-To-Market Strategy for Saudi Arabia

### Beachhead Segment

Start with one segment:

**Training centers or small consulting/legal offices.**

Why:

- Clear invoices.
- Higher willingness to pay.
- Need reminders and deposits.
- Less POS complexity than restaurants or retail.

### Message

Primary Arabic message:

> فوترة إلكترونية أسهل، وتحصيل أسرع عبر واتساب.

Secondary messages:

- جهز فواتيرك بدون تعقيد.
- تابع المتأخرات بدون اتصالات محرجة.
- أرسل رابط الدفع والفاتورة في رسالة واحدة.
- مناسب للمنشآت الصغيرة.

### Channels

- WhatsApp demos.
- Meta and Snapchat lead ads.
- Partnerships with accountants.
- Partnerships with payment providers.
- Local chambers and SME events.
- Short Arabic TikTok/Reels tutorials.

### Validation Offer

Landing page offer:

> جرّب إعداد فواتيرك وتحصيلك خلال 24 ساعة.

Paid validation:

- 50 ريال setup deposit.
- Refundable if not satisfied.
- Goal: prove willingness to pay, not just interest.

## 17. Testing Plan

Test with:

- Business owners who do not speak English.
- Owners who currently use Excel and WhatsApp.
- Users over 40 who are less technical.
- Real invoices, real customers, real phone numbers in a controlled test.

Test scenarios:

- Create first invoice without help.
- Send invoice through WhatsApp.
- Understand invoice status.
- Find overdue customer.
- Export VAT report.
- Correct a wrong customer phone number.

Success metrics:

- First invoice created in under 3 minutes.
- User understands invoice status without explanation.
- User can explain Daftar Collect in their own words.
- User says they would pay 99-199 SAR monthly.

## 18. Common Mistakes to Avoid

- RTL layout with LTR mental model.
- Literal English translation.
- Overuse of accounting terms.
- Small Arabic font sizes.
- Hiding WhatsApp behind generic "share" buttons.
- Making English the clean version and Arabic the crowded version.
- Treating ZATCA as just a checkbox.
- Building too many industries at once.

## 19. Product Principle

Daftar should not feel like:

> "QuickBooks translated into Arabic."

It should feel like:

> "دفتر ذكي لصاحب منشأة سعودي يبغى يرتب فواتيره ويحصل فلوسه بدون تعقيد."

