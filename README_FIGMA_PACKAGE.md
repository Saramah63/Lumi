# 🎨 Lumi Figma Design Package — راهنمای کامل

> **پکیج جامع طراحی حرفه‌ای Lumi برای Figma**  
> رابط کاربری آموزش مهارت‌های احساسی برای کودکان 4-6 سال

---

## 📦 محتویات این پکیج

این پکیج شامل **تمام ابزارها و اسناد** مورد نیاز برای طراحی کامل رابط Lumi در Figma است:

### 📄 اسناد اصلی

| فایل | توضیحات | زمان مطالعه |
|------|---------|------------|
| `FIGMA_DESIGN_GUIDE.md` | راهنمای کامل و جامع (120+ صفحه) | 30-45 دقیقه |
| `FIGMA_QUICK_START.md` | شروع سریع برای طراحی فوری | 5-10 دقیقه |
| `LUMI_CHARACTER_SPECS.md` | مشخصات دقیق کاراکتر Lumi | 15-20 دقیقه |
| `design-tokens.json` | توکن‌های طراحی (رنگ، spacing، etc.) | — |
| `FIGMA_PACKAGE_SUMMARY.md` | خلاصه و مرور کلی | 5 دقیقه |

---

## 🚀 شروع سریع (در 3 قدم)

### 1️⃣ انتخاب مسیر

**مسیر سریع (30 دقیقه):**
```bash
1. FIGMA_QUICK_START.md را باز کن
2. قدم‌به‌قدم دنبال کن
3. Components اصلی را بساز
```

**مسیر کامل (2-3 ساعت):**
```bash
1. FIGMA_DESIGN_GUIDE.md را مطالعه کن
2. Design System کامل را بساز
3. تمام Components و Screens را طراحی کن
```

### 2️⃣ Setup در Figma

```
1. فایل جدید Figma بساز
2. صفحات را بساز:
   📄 00 – Design System
   📄 01 – Components
   📄 02 – Screens
3. Color/Text Styles را import کن
```

### 3️⃣ شروع ساخت

```
1. رنگ‌ها را تعریف کن (Sky 300: #87CEEB, etc.)
2. Primary Button بساز
3. Lumi Avatar بساز
4. یک Screen تست کن
```

---

## 🎨 Design System — نگاه سریع

### رنگ‌های کلیدی

```css
/* Primary */
--sky-300: #87CEEB;        /* اصلی‌ترین رنگ */
--warm-300: #FFB366;       /* لهجه گرم */

/* Backgrounds */
--neutral-0: #FFFFFF;      /* سفید */
--neutral-50: #FAFBFC;     /* پس‌زمینه اصلی */
--neutral-200: #E5E9ED;    /* Border */

/* Text */
--text-primary: #2B3A4A;   /* متن تیره */
--text-secondary: #5F7082; /* متن ثانویه */

/* Firm Calm */
--calm-coral: #F4A6A6;     /* مرجانی ملایم (نه قرمز!) */
```

### Spacing (8pt Grid)

```
8px, 16px, 24px, 32px, 48px, 56px, 64px
```

### Typography

```
H1: 40px / Semibold
H2: 32px / Semibold
H3: 24px / Medium
Body: 16px / Regular
```

---

## 🧩 Components — لیست کامل

### ✅ دکمه‌ها (3 نوع)
- **Primary Button** — آبی آسمانی، متن سفید
- **Secondary Button** — سفید با border آبی
- **Firm Calm Button** — مرجانی ملایم

### 😊 Feeling Button (5 احساس)
```
🙂 Ilo      (شادی)
😢 Suru     (غم)
😡 Viha     (عصبانیت)
😨 Pelko    (ترس)
🤷 En tiedä (نمی‌دانم)
```

### 🎴 Scenario Card
- Tag (Quick ⚡ / Deep 🌱)
- عنوان
- Level indicator (1-3 dots)
- دکمه شروع

### 🌟 Lumi Avatar — کاراکتر اصلی
**6 Face States:**
```
😊 Neutral      — پیش‌فرض
😟 Concern      — نگران
💙 Empathy      — همدل
🌟 Encouraging  — تشویق‌کننده
🎉 Proud        — مفتخر
😐 Firm         — جدی
```

**4 Light Modes:**
```
⚪ Baseline  — ثابت
🌊 Sync      — تپش (تنفس)
✨ Warm      — گرم (جشن)
🔵 Firm      — محکم
```

### 🎛 Teacher HUD
- تایمر
- برچسب مرحله
- آیکون صدا
- آیکون تنظیمات

---

## 📱 Screens — 6 صفحه اصلی

### Layout کلی (iPad 1024×768)

```
┌─────────────────────────┬──────────────┐
│   Kid Stage (65%)       │   Teacher    │
│                         │   Panel (35%)│
│   • Lumi Avatar         │   �� Settings │
│   • Visuals             │   • Controls │
│   • Minimal Text        │   • Timer    │
└─────────────────────────┴──────────────┘
```

### صفحات:

1. **Teacher Dashboard** — انتخاب theme و scenario
2. **Feelings Check-in** — رأی‌گیری احساسات
3. **Breath Sync** — تمرین تنفس با Lumi
4. **Scenario Flow** — سناریو + سوالات + تمرین
5. **Closing Ritual** — پایان جلسه
6. **Component Library** — نمایش components

---

## 🎬 Animations — خلاصه

```javascript
// Float (شناوری ملایم)
duration: 4s
distance: 8px vertical
easing: ease-in-out

// Light Pulse (تپش نور - فقط Sync mode)
duration: 6s (3s in, 3s out)
scale: 0.9 → 1.1

// Warm Glow (لحظه گرم - celebration)
duration: 2s
scale: 1.0 → 1.25
trigger: manual (repair, closing)

// Head Tilt (کج کردن سر - Listening)
angle: 6°
duration: 300ms
```

---

## 📐 ساختار فایل Figma

```
📁 Lumi — Teacher Mode Interface
│
├── 📄 00 – Design System
│   ├── Colors (40+ styles)
│   ├── Typography (9 scales)
│   ├── Spacing (8pt grid)
│   ├── Shadows (7 levels)
│   └── Effects
│
├── 📄 01 – Components
���   ├── Buttons (Primary, Secondary, Firm)
│   ├── Feeling Buttons (5 variants)
│   ├── Scenario Card
│   ├── Lumi Avatar (72 variants!)
│   ├── Teacher HUD
│   └── Settings Drawer
│
├── 📄 02 – Screens
│   ├── Teacher Dashboard
│   ├── Feelings Check-in
│   ├── Breath Sync
│   ├── Scenario Flow
│   ├── Closing Ritual
│   └── Component Library
│
└── 📄 Prototypes
    └── Interactive Flow
```

---

## ✅ Checklist قبل از شروع

### آماده‌سازی
- [ ] Figma باز است
- [ ] این اسناد را دانلود کردم
- [ ] `FIGMA_QUICK_START.md` را خواندم
- [ ] تصویر Lumi را دارم (یا placeholder)

### ابزار Figma
- [ ] Color Styles را بلدم
- [ ] Text Styles را بلدم
- [ ] Components را بلدم
- [ ] Auto Layout را بلدم
- [ ] Variants را بلدم

### زمان
- [ ] 30-45 دقیقه برای نسخه سریع
- [ ] 2-3 ساعت برای نسخه کامل
- [ ] زمان کافی دارم

---

## 🎯 اصول طراحی Lumi

### 1. آرام و ایمن (Calm & Safe)
- رنگ‌های ملایم و نرم
- فضای کافی بین المان‌ها
- انیمیشن‌های subtle
- **هیچ قرمز تندی نیست** (Firm = Coral)

### 2. صدا-محور (Voice-First)
- متن minimal در بخش کودک
- تصاویر واضح و بزرگ
- معلم راهنمایی می‌کند

### 3. لمس-بهینه (Touch-Optimized)
- حداقل 56px touch target
- 64px توصیه می‌شود
- فاصله کافی بین دکمه‌ها
- برای iPad و smartboard

### 4. حرفه‌ای و گرم (Professional & Warm)
- premium برای معلمان
- دوستانه برای کودکان
- نه اسباب‌بازی‌وار، بلکه playful

### 5. اخلاقی (Ethically Designed)
- بدون شرم
- بدون مجازات
- نور ≠ امتیاز
- تمرکز روی رفتار، نه فرد

---

## 📚 راهنمای استفاده از اسناد

### برای طراح UI/UX:

1. **شروع:** `FIGMA_QUICK_START.md`
2. **جزئیات:** `FIGMA_DESIGN_GUIDE.md`
3. **کاراکتر:** `LUMI_CHARACTER_SPECS.md`
4. **مرجع:** `design-tokens.json`

### برای Developer:

1. **Tokens:** `design-tokens.json`
2. **Components:** `FIGMA_DESIGN_GUIDE.md` → Section 3
3. **Animations:** `LUMI_CHARACTER_SPECS.md` → Animations
4. **Specs:** تمام سایزها و رنگ‌ها در JSON

### برای Product Owner:

1. **خلاصه:** `FIGMA_PACKAGE_SUMMARY.md`
2. **Screens:** `FIGMA_DESIGN_GUIDE.md` → Section 4
3. **UX Flow:** `FIGMA_DESIGN_GUIDE.md` → Section 7

---

## 🔧 ابزارهای پیشنهادی

### Figma Plugins:
```
✅ Remove Background    — پاک‌سازی تصویر Lumi
✅ Design Tokens        — Export JSON
✅ Stark                — Check accessibility
✅ Autoflow             — User flow diagrams
✅ Content Reel         — Mock Finnish text
```

### External Tools:
```
✅ Figma Desktop App    — بهتر از web
✅ iPad (تست)          — تست واقعی
✅ VS Code              — برای JSON editing
```

---

## 💡 نکات مهم

### ❗ اشتباهات رایج:

❌ استفاده از قرمز تند برای Firm mode  
✅ استفاده از Calm Coral (#F4A6A6)

❌ Touch targets کوچک‌تر از 56px  
✅ همه دکمه‌ها 56px+ ارتفاع

❌ متن زیاد در بخش کودک  
✅ Minimal text, voice-first

❌ نور = reward/punishment  
✅ نور = awareness tool

❌ Component‌ها بدون variant  
✅ همه components با variants

### ✅ بهترین روش‌ها:

✅ همیشه Auto Layout استفاده کن  
✅ همه چیز را Component کن  
✅ از 8pt Grid پیروی کن  
✅ نام‌گذاری واضح: `Lumi/Category/Item`  
✅ روی iPad تست کن  

---

## 🌟 ویژگی‌های منحصربه‌فرد Lumi

### کاراکتر Lumi:
- **72 ترکیب ممکن** (6 face × 4 light × 3 pose)
- **انیمیشن‌های ملایم** (float, pulse, glow)
- **همیشه مهربان** (حتی در Firm mode)
- **آگاهی، نه قضاوت** (awareness, not judgment)

### Design System:
- **Premium & Calm** — حرفه‌ای اما آرام
- **Touch-Optimized** — برای کودکان 4-6 سال
- **Fully Documented** — تمام جزئیات موجود
- **Developer-Ready** — JSON tokens آماده

### UX Flow:
- **Two-Column Layout** — Kid (65%) + Teacher (35%)
- **Voice-First** — متن minimal
- **6-8 Minute Sessions** — کوتاه و مؤثر
- **No Child Data** — GDPR-ready

---

## 📊 آمار و ارقام

```
📄 صفحات راهنما:         5 فایل
📐 تعداد Screens:         6 صفحه
🧩 تعداد Components:      8+ منحصربه‌فرد
🎨 تعداد رنگ‌ها:          40+ توکن
🔠 مقیاس تایپوگرافی:      9 سطح
📏 مقادیر Spacing:        14 مقدار
🌟 ترکیبات Lumi:         72 حالت
⏱ زمان تا MVP:           2-3 ساعت
📦 حجم کل اسناد:         ~150 صفحه
```

---

## 🚀 مراحل بعدی

### فاز 1: طراحی (شما اینجا هستید ✅)
- [x] مطالعه اسناد
- [ ] ساخت در Figma
- [ ] Prototyping
- [ ] تست با iPad

### فاز 2: توسعه
- [ ] Import design tokens
- [ ] ساخت Components در React
- [ ] پیاده‌سازی Animations
- [ ] Integration با logic

### فاز 3: تست
- [ ] تست با معلمان
- [ ] Session‌های واقعی
- [ ] Feedback جمع‌آوری
- [ ] Iteration

### فاز 4: پایلوت
- [ ] انتخاب مراکز daycare
- [ ] آموزش معلمان
- [ ] اجرای pilot
- [ ] جمع‌آوری داده

---

## 📞 پشتیبانی و سوالات

### سوالات متداول:

**Q: چقدر زمان می‌برد؟**  
A: نسخه سریع 30-45 دقیقه، نسخه کامل 2-3 ساعت

**Q: آیا نیاز به تصویر Lumi دارم?**  
A: نه، می‌توانید با placeholder (emoji/shape) شروع کنید

**Q: Variant در Figma چیست?**  
A: امکان ایجاد حالت‌های مختلف یک Component

**Q: چطور Animations را تست کنم?**  
A: Prototype mode + Smart Animate در Figma

**Q: برای Development چه چیزی لازم است?**  
A: `design-tokens.json` + Export assets + این راهنماها

### کمک بیشتر:

- 📖 اسناد کامل را بخوانید
- 💬 با تیم مشورت کنید
- 🧪 روی iPad تست کنید
- 🔄 Iterate کنید

---

## ✨ خلاصه

شما الان یک **پکیج کامل و حرفه‌ای** دارید که شامل:

✅ راهنمای گام‌به‌گام Figma  
✅ Design System کامل  
✅ مشخصات دقیق Lumi Character  
✅ Design Tokens در JSON  
✅ Wireframes تمام صفحات  
✅ Component Library  
✅ Animation Specifications  

**همه چیز آماده است. فقط باید شروع کنید! 🚀**

---

## 🎯 یک نگاه نهایی

```
Lumi Design Package
├── ✅ Comprehensive Documentation
├── ✅ Design System Tokens
├── ✅ Component Specifications
├── ✅ Screen Wireframes
├── ✅ Character State System
├── ✅ Animation Guidelines
├── ✅ Developer Handoff Ready
└── ✅ Pilot-Ready Design

→ Status: READY FOR IMPLEMENTATION
```

---

**موفق باشید! 🌟**

*Lumi — Safe, Calm, Teacher-Led Emotional Skills Training*

---

**Version:** 1.0  
**Created:** 2025  
**License:** For Lumi Project Use  
**Maintainer:** Lumi Team

---

## 🔗 Quick Navigation

- [شروع سریع](#-شروع-سریع-در-3-قدم)
- [Design System](#-design-system--نگاه-سریع)
- [Components](#-components--لیست-کامل)
- [Screens](#-screens--6-صفحه-اصلی)
- [Checklist](#-checklist-قبل-از-شروع)
- [مراحل بعدی](#-مراحل-بعدی)

---
