# 🎨 Lumi Figma Design — طبق نسخه اول (کد واقعی)

> راهنمای ساخت دقیق Figma design مطابق با UI که الان کار می‌کند

---

## 📋 این راهنما چیست؟

این راهنما **دقیقاً مطابق با کد React** که الان اجرا می‌شود نوشته شده.  
تمام رنگ‌ها، سایزها، spacing‌ها، و components از کد واقعی گرفته شده‌اند.

---

## 🎨 Design Tokens (از کد واقعی)

### رنگ‌ها (دقیقاً از theme.css)

```css
/* Primary Sky Blue */
--lumi-sky-300: #87CEEB;    ← اصلی‌ترین (در کد: --lumi-sky-blue)

/* Backgrounds */
--lumi-neutral-0: #FFFFFF;
--lumi-neutral-50: #FAFBFC;  ← پس‌زمینه اصلی (--lumi-neutral-bg)
--lumi-neutral-200: #E5E9ED; ← Border (--lumi-border)

/* Text */
--lumi-text-primary: #2B3A4A;
--lumi-text-secondary: #5F7082;

/* Warm Accent */
--lumi-warm-300: #FFB366;    ← --lumi-calm-orange
```

**در Figma این‌ها را بسازید:**
- Color Style نام: `Lumi/Sky/300` → #87CEEB
- Color Style نام: `Lumi/Neutral/50` → #FAFBFC
- Color Style نام: `Lumi/Text/Primary` → #2B3A4A

---

## 📱 Layout — Teacher Dashboard (از کد واقعی)

### ساختار اصلی:

```jsx
// از TeacherDashboard.tsx
<div className="min-h-screen bg-[--lumi-neutral-bg] flex">
  
  {/* Kid Stage - 65% */}
  <div className="w-[65%] flex items-center justify-center p-12">
    <LumiAvatar size="xl" emotion="happy" />
  </div>
  
  {/* Teacher Panel - 35% */}
  <div className="w-[35%] bg-white border-l p-8">
    {/* Controls */}
  </div>
  
</div>
```

### در Figma:

**1. Frame اصلی:**
```
نام: "Teacher Dashboard"
سایز: 1440×900px (Desktop) یا 1024×768px (iPad)
Fill: #FAFBFC (lumi-neutral-50)
```

**2. دو بخش:**

**Kid Stage (چپ):**
```
عرض: 65% از کل (یا 936px از 1440px)
Padding: 48px همه طرف
Items: Center aligned, Vertical
Fill: Transparent (همان پس‌زمینه)
```

**Teacher Panel (راست):**
```
عرض: 35% از کل (یا 504px از 1440px)
Padding: 32px
Fill: #FFFFFF (White)
Border Left: 1px, #E5E9ED
Auto Layout: Vertical, Gap 24px
Overflow: Scroll
```

---

## 🧩 Components (از کد واقعی)

### 1. Primary Button

از `PrimaryButton.tsx`:

```tsx
// Large variant (default)
className="
  min-w-[10rem]        → 160px
  h-16                 → 64px
  px-6                 → 24px
  bg-[--lumi-sky-blue] → #87CEEB
  text-white
  rounded-[1rem]       → 16px
  shadow-sm
"
```

**در Figma:**
```
نام: PrimaryButton
سایز: 160×64px (Auto width)
Padding: 24px horizontal
Fill: #87CEEB
Text: White, 16px, Medium (500)
Border Radius: 16px
Shadow: 0 1px 3px rgba(43, 58, 74, 0.08)

Variants:
- Size: large (64px), medium (56px)
- State: default, hover, disabled
```

---

### 2. Feeling Button

از `FeelingButton.tsx`:

```tsx
className="
  w-[7.5rem]           → 120px
  h-auto
  flex flex-col
  items-center
  gap-2                → 8px
  p-4                  → 16px
  bg-white
  border-2 border-[--lumi-border] → #E5E9ED
  rounded-[1.5rem]     → 24px
  hover:border-[--lumi-sky-blue]
"
```

**در Figma:**
```
نام: FeelingButton
Frame: 120×auto (min 140px)
Auto Layout: Vertical
Gap: 8px
Padding: 16px
Fill: White
Border: 2px, #E5E9ED
Border Radius: 24px

Contents:
  1. Emoji Text: 48px
  2. Label: 16px, Medium
  3. Counter Badge: 28px circle, #87CEEB

Variants:
- Feeling: Ilo, Suru, Viha, Pelko, EnTieda
- Selected: Boolean (border #87CEEB 3px)
```

---

### 3. Scenario Card

از `ScenarioCard.tsx`:

```tsx
className="
  p-6                  → 24px
  bg-white
  border-2
  rounded-[1.5rem]     → 24px
  space-y-4            → 16px gap
  hover:border-[--lumi-sky-blue]
"
```

**در Figma:**
```
نام: ScenarioCard
Frame: Auto×Auto
Padding: 24px
Fill: White
Border: 2px, #E5E9ED
Border Radius: 24px
Auto Layout: Vertical, Gap 16px

Contents:
  1. Badge: "Quick" / "Deep"
  2. Title: H4 (20px)
  3. Level dots
  4. Start button (optional)

Variants:
- Type: quick, deep
- Selected: Boolean
```

---

### 4. Teacher HUD

از `TeacherHUD.tsx`:

```tsx
className="
  flex items-center
  gap-4
  px-4 py-2            → 16px/8px
  bg-white/80
  backdrop-blur-sm
  rounded-full
  shadow-md
"
```

**در Figma:**
```
نام: TeacherHUD
Frame: Auto×40px
Auto Layout: Horizontal
Gap: 16px
Padding: 16px horizontal, 8px vertical
Fill: White 80% + Blur 10px
Border Radius: 9999px (pill)
Shadow: 0 4px 6px rgba(43, 58, 74, 0.08)

Contents:
  - Timer: "2:34" (12px, Medium)
  - Icons: 16px
```

---

### 5. Lumi Avatar

از `LumiAvatar.tsx`:

```tsx
// Size xl
className="w-64 h-64"  → 256px

// با float animation
animate={{
  y: [0, -8, 0],
  transition: { duration: 3, repeat: Infinity }
}}

// با glow
backgroundColor: "rgba(135, 206, 235, 0.3)"
blur: 2xl
```

**در Figma:**
```
نام: LumiAvatar
Frame: 256×256px (xl size)

Sizes:
- sm: 96×96px (w-24)
- md: 128×128px (w-32)
- lg: 192×192px (w-48)
- xl: 256×256px (w-64)

Glow Layer:
- Ellipse: 300×300px
- Fill: Radial gradient, #87CEEB 30%
- Blur: 80px
- Behind character

Character:
- SVG یا Image
- Centered
```

---

## 📱 صفحه Teacher Dashboard — دقیق

### Layout کامل:

```
┌────────────────────────────────────────────────┐
│                                        HUD ○   │
│              Kid Stage (65%)                   │
│                                                │
│                                                │
│              [Lumi Avatar XL]                  │
│                256×256px                       │
│              emotion: happy                    │
│                                                │
│                                                │
│                                                │
└────────────────────────────────────────────────┘
                    │
┌───────────────────┴────────────────────────────┐
│ Teacher Panel (35%)     │                      │
│ ─────────────────────   │   Settings ⚙        │
│ Opettajan ohjaus        │                      │
│                         │                      │
│ Teema                   │                      │
│ ┌──────────┬──────────┐│                      │
│ │Turvataidot│Toveritaidot│                     │
│ └──────────┴──────────┘│                      │
│                         │                      │
│ Skenaario               │                      │
│ ○ Älykäs satunnainen   │                      │
│ ○ Valitse lista        │                      │
│                         │                      │
│ [Scenario Cards...]     │                      │
│                         │                      │
│ ─────────────────────   │                      │
│ [▶ Aloita istunto]     │                      │
│ [Firm Calm]             │                      │
└─────────────────────────┴──────────────────────┘
```

---

## 🎨 Spacing (8pt Grid از کد)

کد استفاده می‌کند از Tailwind classes:

```
gap-2  → 8px   (--spacing-1)
gap-3  → 12px  (بین 1 و 2)
gap-4  → 16px  (--spacing-2)
gap-6  → 24px  (--spacing-3)
gap-8  → 32px  (--spacing-4)

p-4   → 16px
p-6   → 24px
p-8   → 32px
p-12  → 48px  (--spacing-6)
```

**در Figma همین مقادیر را استفاده کنید:**
- 8px, 16px, 24px, 32px, 48px

---

## 🔲 Border Radius (از کد)

```
rounded-[1rem]   → 16px (دکمه‌ها)
rounded-[1.5rem] → 24px (کارت‌ها)
rounded-full     → 9999px (pills)
```

**در Figma:**
- Buttons: 16px
- Cards: 24px
- Pills/Badges: 9999px

---

## 🌫 Shadows (از کد)

```
shadow-sm → 0 1px 3px rgba(43, 58, 74, 0.08)
shadow-md → 0 4px 6px rgba(43, 58, 74, 0.08)
shadow-lg → 0 10px 15px rgba(43, 58, 74, 0.08)
```

**در Figma Effect Styles:**
- Shadow/SM: Y:1, Blur:3, #2B3A4A 8%
- Shadow/MD: Y:4, Blur:6, #2B3A4A 8%
- Shadow/LG: Y:10, Blur:15, #2B3A4A 8%

---

## 📐 صفحات دیگر (از کد واقعی)

### Feelings Check-in

```jsx
// از FeelingsCheckIn.tsx
<div className="flex">
  {/* Kid Stage 65% */}
  <div className="w-[65%]">
    <LumiAvatar size="lg" emotion="calm" />
    
    {/* 5 Feeling Buttons */}
    <div className="grid grid-cols-3 gap-4">
      {feelings.map(f => <FeelingButton />)}
    </div>
  </div>
  
  {/* Teacher Panel 35% */}
  <div className="w-[35%]">
    {/* Vote results, controls */}
  </div>
</div>
```

**در Figma:**
- همان layout دو ستونه
- Lumi size lg (192px)
- 5 Feeling Buttons in grid (3 columns)
- Gap: 16px

---

### Breath Sync

```jsx
// از BreathSync.tsx
<div className="w-[65%]">
  <LumiAvatar size="xl" emotion="calm" breathing={true} />
  
  {/* Breathing circle */}
  <div className="w-32 h-32 rounded-full border-4 border-[--lumi-sky-blue]">
    {/* Animated scale */}
  </div>
</div>
```

**در Figma:**
- Lumi xl (256px) با glow animation
- دایره تنفس: 128×128px, border 4px, #87CEEB
- Animation: Smart Animate scale

---

### Scenario Flow

```jsx
<div className="w-[65%]">
  <div className="text-sm">Step: Empathy</div>
  <LumiAvatar size="xl" />
  {/* Situation illustration */}
  <p className="text-2xl">Question text...</p>
</div>
```

**در Figma:**
- Step label: 14px, top
- Lumi xl
- Question: 32px, centered, max-width 600px

---

## ✅ Checklist ساخت در Figma

### Setup اولیه:
- [ ] فایل Figma: 1440×900px canvas
- [ ] Color Styles از theme.css
- [ ] Text Styles: H1-H4, Body, Small
- [ ] Shadow Styles: sm, md, lg

### Components:
- [ ] PrimaryButton (160×64px, #87CEEB)
- [ ] SecondaryButton (border variant)
- [ ] FirmCalmButton (#FFB366)
- [ ] FeelingButton (120×140px, 5 variants)
- [ ] ScenarioCard (auto, 24px padding)
- [ ] TeacherHUD (pill, 40px height)
- [ ] LumiAvatar (4 sizes: sm/md/lg/xl)

### Screens:
- [ ] Teacher Dashboard (65/35 split)
- [ ] Feelings Check-in
- [ ] Breath Sync
- [ ] Scenario Flow
- [ ] Closing Ritual

### Details:
- [ ] همه spacing 8pt grid
- [ ] Border radius: 16px/24px/9999px
- [ ] همه رنگ‌ها از theme.css
- [ ] Touch targets minimum 56px

---

## 🎯 تفاوت‌های کلیدی با راهنمای قبلی

| مورد | راهنمای قبلی | این (کد واقعی) |
|------|--------------|-----------------|
| Canvas Size | 1024×768 iPad | 1440×900 Desktop |
| Lumi XL | 400×400px | 256×256px (w-64) |
| Button Height | 64px همه | Large:64, Medium:56 |
| Feeling Button | 120×140 | 120×auto (min 140) |
| Panel Border | 2px | 1px |
| Theme selector | Dropdown | Grid buttons 2 cols |

---

## 💡 نکته مهم

کد React استفاده می‌کند از:
- **Tailwind classes** (w-64, p-6, gap-4, etc.)
- **CSS Variables** (var(--lumi-sky-blue))
- **Auto layout** concepts

در Figma:
- همان مقادیر را استفاده کنید
- Auto Layout فعال کنید
- همه spacing را دقیق بگیرید

---

## 🚀 شروع سریع

```
1. فایل Figma بساز: 1440×900
2. Color Styles: #87CEEB, #FAFBFC, #2B3A4A
3. Primary Button: 160×64, #87CEEB, radius 16
4. Teacher Dashboard layout: 65% + 35%
5. Lumi Avatar: 256×256 (xl)
6. Test و adjust
```

---

**این design دقیقاً مطابق با کد React است که الان کار می‌کند! ✅**

موفق باشید! 🌟
