# 📦 Lumi Figma Design Package — خلاصه کامل
### همه چیز در یک نگاه

---

## 🎯 این پکیج شامل چیست؟

✅ **راهنمای کامل طراحی Figma** (120+ صفحه)  
✅ **Design Tokens در JSON** (آماده برای کد)  
✅ **Quick Start راهنما** (شروع در 15 دقیقه)  
✅ **مشخصات دقیق کاراکتر Lumi** (6 face states + 4 light modes)  
✅ **Wireframes تمام صفحات** (6 screen)  
✅ **Component Library کامل**  
✅ **Animation Specifications** (برای developers)

---

## 📂 فایل‌های موجود

```
📄 FIGMA_DESIGN_GUIDE.md          ← راهنمای کامل (اصلی)
📄 FIGMA_QUICK_START.md           ← شروع سریع (15-30 دقیقه)
📄 LUMI_CHARACTER_SPECS.md        ← مشخصات کاراکتر
📄 design-tokens.json              ← توکن‌های طراحی
📄 FIGMA_PACKAGE_SUMMARY.md       ← این فایل (خلاصه)
```

---

## 🎨 Design System — خلاصه

### رنگ‌های اصلی

```
Primary:    #87CEEB (Sky 300)
Accent:     #FFB366 (Warm 300)
Background: #FAFBFC (Neutral 50)
Text:       #2B3A4A (Primary)
Firm:       #F4A6A6 (Calm Coral)
```

### تایپوگرافی

```
H1:   40px / Semibold / 1.25
H2:   32px / Semibold / 1.25
H3:   24px / Medium / 1.5
Body: 16px / Regular / 1.75
```

### Spacing (8pt Grid)

```
8px, 16px, 24px, 32px, 48px, 56px (min touch), 64px (recommended)
```

### Radius

```
Buttons: 16px
Cards:   24px
Pills:   9999px
```

---

## 🧩 Components — خلاصه

### دکمه‌ها
- **Primary Button:** 64×auto, Sky 300, white text
- **Secondary Button:** 64×auto, white bg, Sky 300 border
- **Firm Calm Button:** 64×auto, Calm Coral bg

### Feeling Button
- **Size:** 120×140px
- **Content:** Emoji (64px) + Label + Counter
- **Variants:** 5 feelings (Ilo, Suru, Viha, Pelko, EnTieda)

### Scenario Card
- **Size:** 400×auto
- **Content:** Tag + Title + Level dots + CTA
- **Variants:** Quick/Deep, Level 1-3

### Lumi Avatar
- **Sizes:** sm (200px), md (300px), lg (400px)
- **Face States:** 6 (neutral, concern, empathy, encouraging, proud, firm)
- **Light Modes:** 4 (baseline, sync, warm, firm)
- **Poses:** 3 (normal, listening, firm_still)

---

## 📱 Screens — خلاصه

### Layout اصلی: 1024×768px (iPad Landscape)

```
┌─────────────────────────┬──────────────┐
│   Kid Stage (65%)       │   Teacher    │
│                         │   Panel (35%)│
│   Lumi + Visuals        │   Controls   │
│   Minimal text          │   Settings   │
└─────────────────────────┴──────────────┘
```

### 6 صفحه اصلی:

1. **Teacher Dashboard** — انتخاب theme, scenario, settings
2. **Feelings Check-in** — 5 دکمه احساس با vote counter
3. **Breath Sync** — Lumi breathing + دایره تنفس
4. **Scenario Flow** — Situation + Questions + Practice
5. **Closing Ritual** — پایان جلسه با warm glow
6. **Component Library** — نمایش تمام components

---

## 🌟 Lumi Character — خلاصه

### 6 Face States

```
😊 Neutral      → Default, calm
😟 Concern      → Listening, caring
💙 Empathy      → Head tilt, understanding
🌟 Encouraging  → Big smile, sparkle
🎉 Proud        → Double sparkle, celebration
😐 Firm         → Serious, stable (not scary)
```

### 4 Light Modes

```
⚪ Baseline  → Steady glow
🌊 Sync      → Pulse 6s (breathing)
✨ Warm      → Bright 2s (celebration)
🔵 Firm      → Solid, no animation
```

### 3 Poses

```
🧍 Normal       → Straight, float active
👂 Listening    → Head tilt 6°
🛑 Firm Still   → No float, stable
```

---

## 🎬 Animations — خلاصه

```
Float:       4s, 8px vertical, ease-in-out, continuous
Light Pulse: 6s, scale 0.9-1.1, sync mode only
Warm Glow:   2s, scale 1.25, one-time trigger
Head Tilt:   6°, 300ms, listening mode
```

---

## 🚀 چطور شروع کنم؟

### مسیر سریع (30 دقیقه):

1. **`FIGMA_QUICK_START.md` را باز کن**
2. مراحل 1-8 را دنبال کن
3. Components اصلی را بساز
4. یک screen تست کن

### مسیر کامل (2-3 ساعت):

1. **`FIGMA_DESIGN_GUIDE.md` را بخوان**
2. Design Tokens را setup کن
3. تمام Components را بساز
4. `LUMI_CHARACTER_SPECS.md` را برای Lumi دنبال کن
5. تمام 6 screen را طراحی کن
6. Prototyping اضافه کن

---

## 📋 Checklist شروع

### Setup اولیه
- [ ] فایل Figma جدید ساختم
- [ ] صفحات را ساختم (00-Design System, 01-Components, 02-Screens)
- [ ] Color Styles تعریف شد
- [ ] Text Styles تعریف شد
- [ ] Shadow Styles تعریف شد

### Components
- [ ] Primary Button ✅
- [ ] Secondary Button ✅
- [ ] Firm Calm Button ✅
- [ ] Feeling Button (5 variants) ✅
- [ ] Scenario Card ✅
- [ ] Lumi Avatar (با variants) ✅
- [ ] Teacher HUD ✅

### Screens
- [ ] Teacher Dashboard
- [ ] Feelings Check-in
- [ ] Breath Sync
- [ ] Scenario Flow
- [ ] Closing Ritual
- [ ] Component Library

### Finalization
- [ ] Prototyping اضافه شد
- [ ] روی iPad تست شد
- [ ] Assets export شد
- [ ] آماده برای Development

---

## 💡 نکات کلیدی

### طراحی
✅ همیشه 8pt grid استفاده کن  
✅ Minimum touch target: 56px  
✅ همه چیز را Component کن  
✅ از Auto Layout استفاده کن  
✅ نام‌گذاری واضح: `Lumi/Category/Item`

### رنگ‌ها
✅ ملایم و آرام (no harsh red)  
✅ کنتراست کافی برای readability  
✅ Firm mode = Coral (نه قرمز)

### Lumi
✅ همیشه مهربان (حتی در Firm mode)  
✅ انیمیشن‌ها subtle  
✅ نور ≠ reward meter (فقط awareness)

### UX
✅ Kid-facing: minimal text, voice-first  
✅ Teacher panel: واضح و جدا  
✅ Touch-optimized برای iPad  
✅ No child data, no recording

---

## 📚 منابع اضافی

### Figma Plugins پیشنهادی:
- **Remove Background** — برای تصویر Lumi
- **Design Tokens** — export JSON
- **Stark** — accessibility check
- **Autoflow** — user flow diagrams

### Tools:
- **design-tokens.json** — import در کد
- **Animation specs** — برای developers
- **Component library** — reference

---

## 🎯 مرحله بعد

### برای طراح:
1. تمام components را در Figma بساز
2. Prototyping کامل
3. با iPad تست کن
4. Feedback از معلمان بگیر

### برای Developer:
1. `design-tokens.json` را import کن
2. Components را بر اساس Figma بساز
3. Animation specs را پیاده‌سازی کن
4. با طراح هماهنگ باش

### برای محصول:
1. با مراکز daycare تست کن
2. Session‌های واقعی run کن
3. Feedback جمع‌آوری کن
4. Iterate

---

## ✨ Lumi از ایده به محصول

```
✅ Concept          → تعریف شد
✅ UX Flow          → طراحی شد
✅ Design System    → کامل شد
✅ Components       → آماده
✅ Screens          → مشخص شد
✅ Character        → طراحی شد
✅ Animations       → تعریف شد
✅ Figma Package    → آماده!

→ مرحله بعد: ساخت در Figma + Development
```

---

## 📞 سوالات متداول

### Q: چند وقت طول می‌کشه؟
**A:** نسخه سریع: 30-45 دقیقه / نسخه کامل: 2-3 ساعت

### Q: آیا باید تصویر Lumi داشته باشم؟
**A:** نه، می‌توانید با placeholder شروع کنید (emoji یا shape ساده)

### Q: Component Variants چطور کار می‌کنه؟
**A:** در Figma, component → Add variant → Properties تعریف کن

### Q: چطور Animation‌ها رو تست کنم?
**A:** Prototype mode → Smart Animate transitions

### Q: Design Tokens چیه؟
**A:** مقادیر طراحی (رنگ، spacing، etc.) که در JSON export می‌شه

### Q: برای Development چی نیاز دارم؟
**A:** `design-tokens.json` + Figma assets export + این راهنماها

---

## 🎉 آماده برای شروع!

شما الان داری��:

📦 **پکیج کامل طراحی**  
📐 **راهنمای گام‌به‌گام**  
🎨 **Design System حرفه‌ای**  
🌟 **Lumi Character specs**  
💻 **آماده برای Development**

---

## 🚀 Quick Links

- شروع سریع → `FIGMA_QUICK_START.md`
- راهنمای کامل → `FIGMA_DESIGN_GUIDE.md`
- کاراکتر Lumi → `LUMI_CHARACTER_SPECS.md`
- Design Tokens → `design-tokens.json`

---

**موفق باشید! 🌟**

*Lumi — Safe, Calm, Teacher-Led Emotional Skills Training for Ages 4–6*

---

## 📊 آمار پکیج

```
📄 Documents:     5 files
📐 Screens:       6 layouts
🧩 Components:    8+ unique
🎨 Colors:        40+ tokens
🔠 Typography:    9 scales
📏 Spacing:       14 values
🌟 Lumi States:   72 combinations (6×4×3)
⏱ Time to MVP:   2-3 hours
```

---

**Version:** 1.0  
**Created:** 2025  
**Status:** ✅ Ready for Implementation  
**License:** For Lumi Project Use

---
