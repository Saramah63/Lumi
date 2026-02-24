# 🚀 Lumi Figma Quick Start Guide
### ساخت سریع طراحی Lumi در Figma — گام به گام

---

## ⚡ راهنمای سریع 15 دقیقه‌ای

### قدم 1: آماده‌سازی پایه (2 دقیقه)

1. فایل جدید Figma بساز: **"Lumi — Teacher Mode"**
2. این صفحات را بساز:
   - 00 – Design System
   - 01 – Components  
   - 02 – Screens

---

### قدم 2: رنگ‌ها را تعریف کن (3 دقیقه)

در صفحه **00 – Design System**:

#### رنگ‌های اصلی
```
کلیک روی ➕ در Color Styles

Sky 300: #87CEEB  ← اصلی‌ترین
Warm 300: #FFB366  ← لهجه
Neutral 50: #FAFBFC  ← پس‌زمینه
White: #FFFFFF
```

#### رنگ‌های متن
```
Primary: #2B3A4A  ← تیره
Secondary: #5F7082  ← متوسط
Tertiary: #8A96A3  ← روشن
```

#### رنگ Firm Calm
```
Calm Coral: #F4A6A6  ← نه قرمز، مرجانی ملایم
```

**نام‌گذاری:** `Lumi/Primary/Sky 300`

---

### قدم 3: تایپوگرافی (2 دقیقه)

کلیک ➕ در Text Styles:

```
H1: 40px / Semibold (600) / 1.25 line
H2: 32px / Semibold (600) / 1.25 line
H3: 24px / Medium (500) / 1.5 line
Body: 16px / Regular (400) / 1.75 line
Small: 12px / Regular (400) / 1.5 line
```

**نام‌گذاری:** `Lumi/H1`, `Lumi/Body`

---

### قدم 4: سایه‌ها (1 دقیقه)

کلیک ➕ در Effect Styles:

```
Shadow SM:
  Y: 1px, Blur: 3px
  Color: #2B3A4A, 8% opacity

Shadow MD:
  Y: 4px, Blur: 6px
  Color: #2B3A4A, 8% opacity

Shadow Glow:
  Blur: 20px
  Color: #87CEEB, 40% opacity
```

---

### قدم 5: کامپوننت دکمه اصلی (3 دقیقه)

در صفحه **01 – Components**:

1. مستطیل بکش: **160×64px**
2. **Auto Layout** فعال کن:
   - Horizontal
   - Padding: 24px چپ/راست
   - Center aligned
3. **Fill:** Sky 300
4. **Border Radius:** 16px
5. **Shadow:** Shadow SM
6. متن بنویس: "Button"
   - Style: Lumi/Body
   - Color: White
7. **Convert to Component** (⌘+⌥+K یا Ctrl+Alt+K)
8. **Add Variant:**
   - Property: State
   - Options: Default, Hover, Disabled

برای **Hover state:**
- Opacity: 90%
- Shadow: Shadow MD

برای **Disabled:**
- Opacity: 50%

---

### قدم 6: دکمه احساس (Feeling Button) (4 دقیقه)

1. فریم بساز: **120×140px**
2. **Auto Layout** عمودی:
   - Padding: 16px
   - Gap: 8px
   - Center aligned
3. **Fill:** White
4. **Border:** 2px, Neutral 200
5. **Border Radius:** 24px
6. **Shadow:** Shadow SM

**محتویات:**

- **Emoji:** متن 64px → 🙂
- **Label:** "Ilo" → Lumi/Body
- **Counter Badge:**
  - دایره 32px
  - Fill: Sky 300
  - متن: "0" / Small / White
  - Position: Absolute, top-right -8px

**Convert to Component**

**Add Variants:**
- Property: Feeling
- Options: Ilo, Suru, Viha, Pelko, EnTieda

برای هر حالت emoji و label را تغییر بده:
```
🙂 Ilo
😢 Suru
😡 Viha
😨 Pelko
🤷 En tiedä
```

---

### قدم 7: کامپوننت Lumi Avatar (مهم‌ترین!)

#### ورژن ساده (اگر تصویر Lumi ندارید):

1. دایره بکش: **400×400px**
2. **Fill:** Sky 100
3. متن emoji بزرگ: "✨" یا "🌟" (200px)

#### ورژن کامل (با تصویر):

1. تصویر Lumi را **Import** کن
2. در فریم **400×400px** قرار بده
3. **Center** کن

**لایه نور (Antenna Light):**

1. دایره بکش: **80×80px**
2. Position: بالای سر Lumi
3. **Fill:** Radial Gradient
   - مرکز: White 60%
   - بیرون: Sky 300 80%
4. **Blur:** 10px

**Convert to Component**

**Add Variants:**

```
Property: Face
Options: neutral, concern, empathy, encouraging, proud, firm

Property: Light
Options: baseline, sync, warm, firm

Property: Size
Options: sm (200px), md (300px), lg (400px)
```

**نکته:** برای هر face state می‌توانید لایه چهره جداگانه بسازید و show/hide کنید.

---

### قدم 8: لِی‌اُوت صفحه اصلی (3 دقیقه)

در صفحه **02 – Screens**:

1. فریم بساز: **1024×768px** (iPad Landscape)
2. نام: "Teacher Dashboard"
3. Fill: Neutral 50

**دو ستون:**

**چپ (Kid Stage) — 665px عرض:**
- فریم نام: "Kid Stage"
- Lumi Avatar (lg) در مرکز
- عنوان H2: "Tervetuloa Lumin kanssa!"

**راست (Teacher Panel) — 359px عرض:**
- فریم نام: "Teacher Panel"
- Fill: White
- Auto Layout عمودی, padding 24px, gap 24px

**محتویات:**
- عنوان H3: "Asetukset"
- Dropdown: "Teema"
- Radio buttons: Scenario mode
- Primary Button: "Aloita istunto"
- Firm Calm Button: "Firm Calm"
- Timer text (Small): "00:00"

---

## ✅ Checklist نهایی

- [ ] رنگ‌های اصلی (Sky, Warm, Neutral) ساخته شد
- [ ] Text Styles (H1, H2, Body) ساخته شد
- [ ] Shadow styles ساخته شد
- [ ] Primary Button component
- [ ] Feeling Button component (5 variants)
- [ ] Lumi Avatar component
- [ ] Teacher Dashboard layout
- [ ] همه چیز نام‌گذاری شده

---

## 🎯 نکات مهم

1. **همیشه Auto Layout استفاده کن** — responsive می‌شود
2. **همه چیز را Component کن** — تغییرات یکجا اعمال می‌شود
3. **نام‌گذاری واضح** — Lumi/Category/Item
4. **از Variants استفاده کن** — برای states مختلف
5. **8pt Grid** — همه spacing‌ها مضربی از 8: 8, 16, 24, 32, ...

---

## 🔄 مراحل بعدی

1. بقیه صفحات را بساز:
   - Feelings Check-in
   - Breath Sync
   - Scenario Flow
   - Closing Ritual

2. Prototyping اضافه کن:
   - دکمه‌ها → صفحه بعد
   - Transition: Smart Animate, 300ms

3. Export برای Developer:
   - Assets → PNG 2x, 3x
   - Design Tokens → JSON

---

## 📱 تست نهایی

- [ ] روی iPad باز کن و تست کن
- [ ] Touch target‌ها حداقل 56px
- [ ] رنگ‌ها ملایم و آرام
- [ ] متن‌های کودک minimal
- [ ] فضای کافی بین المان‌ها

---

## 💡 میانبرهای کلیدی Figma

```
⌘ + / یا Ctrl + /     → Search
A                    → Frame tool
R                    → Rectangle
T                    → Text
K                    → Scale
⌘ + D یا Ctrl + D     → Duplicate
⌘ + G یا Ctrl + G     → Group
⌥ + ⌘ + K             → Create Component
⌥ + ⌘ + C             → Copy Properties
⌥ + ⌘ + V             → Paste Properties
Shift + A            → Auto Layout
```

---

## 🎨 پالت رنگ سریع (Copy/Paste)

```
Sky 50:  #F0F9FF
Sky 300: #87CEEB  ← اصلی
Sky 400: #6BB6D9

Neutral 0:   #FFFFFF
Neutral 50:  #FAFBFC  ← پس‌زمینه
Neutral 200: #E5E9ED  ← Border

Warm 300: #FFB366  ← لهجه

Text Primary:   #2B3A4A
Text Secondary: #5F7082

Calm Coral: #F4A6A6  ← Firm mode
```

---

## 🚀 آماده برای شروع!

1. فایل Figma باز کن
2. این راهنما را کنارت بگذار
3. قدم به قدم جلو برو
4. در صورت سوال، به `FIGMA_DESIGN_GUIDE.md` مراجعه کن

**زمان تخمینی:** 30-45 دقیقه برای نسخه اولیه

---

**موفق باشید! 🌟**
