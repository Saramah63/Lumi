# 🎯 Figma Design — دقیقاً مثل نسخه اول

> ساخت Figma design که **100% مطابق با UI کد React** باشد

---

## ⚡ شروع فوری (10 دقیقه)

### قدم 1: Setup پایه (2 دقیقه)

```
1. فایل Figma جدید → "Lumi - Match Code"
2. Frame بساز: 1440×900px
3. نام: "Teacher Dashboard"
4. Fill: #FAFBFC
```

---

### قدم 2: رنگ‌ها (دقیقاً از کد) (1 دقیقه)

فقط **3 رنگ اصلی** را بساز:

```
Color Style 1: "Primary"     → #87CEEB
Color Style 2: "Background"  → #FAFBFC  
Color Style 3: "Text"        → #2B3A4A
```

---

### قدم 3: Layout اصلی (3 دقیقه)

**دو Frame:**

```
Frame 1 — Kid Stage:
  عرض: 936px (65% از 1440)
  ارتفاع: 900px
  Padding: 48px
  Fill: Transparent
  Position: چپ
  
Frame 2 — Teacher Panel:
  عرض: 504px (35% از 1440)
  ارتفاع: 900px
  Padding: 32px
  Fill: #FFFFFF
  Border Left: 1px, #E5E9ED
  Position: راست
  Auto Layout: ✅ Vertical, Gap 24px
```

---

### قدم 4: Primary Button (2 دقیقه)

```
1. Rectangle → 160×64px
2. Auto Layout: Horizontal, Padding 24px
3. Fill: #87CEEB
4. Border Radius: 16px
5. متن: "Button" / 16px / White / Medium (500)
6. Shadow: Y:1, Blur:3, #2B3A4A 8%
7. Convert to Component (⌘+Alt+K)
```

---

### قدم 5: Lumi Avatar (2 دقیقه)

**نسخه ساده:**

```
1. Circle → 256×256px (#FAFBFC)
2. متن emoji بزرگ: "✨" (120px)
3. Glow:
   - Ellipse 300×300 پشت کاراکتر
   - Radial gradient: #87CEEB 30%
   - Blur: 80px
4. Convert to Component
```

**یا:**

Import تصویر Lumi از پروژه → در Frame 256×256 قرار بده

---

## ✅ تمام! Layout اصلی آماده است

حالا شما دارید:
- ✅ Canvas صحیح (1440×900)
- ✅ Layout دو ستونه (65/35)
- ✅ رنگ‌های درست
- ✅ Button component
- ✅ Lumi avatar

---

## 📐 مقادیر دقیق (از کد React)

### Sizes (Tailwind → Pixels)

```javascript
// از کد:
w-64  → 256px  (Lumi xl)
w-48  → 192px  (Lumi lg)
w-32  → 128px  (Lumi md)
w-24  → 96px   (Lumi sm)

h-16  → 64px   (Button large)
h-14  → 56px   (Button medium)

p-12  → 48px   (Kid stage padding)
p-8   → 32px   (Teacher panel padding)
p-6   → 24px   (Card padding)
p-4   → 16px   (Small padding)

gap-6 → 24px   (Teacher panel gap)
gap-4 → 16px   (Medium gap)
gap-2 → 8px    (Small gap)
```

---

### Colors (دقیق از theme.css)

```css
Primary Sky:     #87CEEB
Background:      #FAFBFC
White:           #FFFFFF
Border:          #E5E9ED
Text Primary:    #2B3A4A
Text Secondary:  #5F7082
Warm Accent:     #FFB366
```

---

### Radius (از کد)

```
16px  → دکمه‌ها (rounded-[1rem])
24px  → کارت‌ها (rounded-[1.5rem])
9999px → pills (rounded-full)
```

---

### Shadows

```
shadow-sm → 0 1px 3px rgba(43,58,74,0.08)
shadow-md → 0 4px 6px rgba(43,58,74,0.08)
```

---

## 🧩 Components از کد

### Feeling Button (FeelingButton.tsx)

```
Width: 120px
Height: Auto (min 140px)
Padding: 16px
Gap: 8px (vertical)
Border: 2px, #E5E9ED
Radius: 24px
Fill: White

محتوا:
  - Emoji: 48px
  - Label: 16px Medium
  - Counter: 28px circle, #87CEEB
```

---

### Scenario Card (ScenarioCard.tsx)

```
Width: Auto
Padding: 24px
Gap: 16px (vertical)
Border: 2px, #E5E9ED
Radius: 24px
Fill: White

محتوا:
  - Badge: Quick/Deep
  - Title: 20px Medium
  - Dots: Level indicator
```

---

### Teacher HUD (TeacherHUD.tsx)

```
Height: 40px
Padding: 16px horizontal, 8px vertical
Gap: 16px
Border Radius: 9999px (pill)
Fill: White 80% opacity
Blur: Backdrop 10px
Shadow: shadow-md

محتوا:
  - Timer: "2:34" (12px)
  - Icons: 16px
```

---

## 📱 صفحات دیگر

### Feelings Check-in

```
Kid Stage (65%):
  - Lumi lg (192px)
  - 5 Feeling Buttons
  - Grid: 3 columns, Gap 16px
  
Teacher Panel (35%):
  - Vote results
  - Controls
```

---

### Breath Sync

```
Kid Stage:
  - Lumi xl (256px) with glow
  - Breathing circle: 128×128, border 4px #87CEEB
  
Teacher Panel:
  - Breath controls
  - Timer
```

---

### Scenario Step

```
Kid Stage:
  - Label top: "Step: Empathy" (14px)
  - Lumi xl (256px)
  - Question: 32px, centered, max-width 600px
  
Teacher Panel:
  - Script
  - Controls (Next, Repeat, Firm Calm)
```

---

## 🎨 Theme Selector (دقیق از کد)

از `TeacherDashboard.tsx`:

```
Grid: 2 columns
Gap: 12px
Button height: 48px
Padding: 16px
Border: 2px
Radius: 16px

State:
  Default: Border #E5E9ED, Fill White
  Selected: Border #87CEEB, Fill #87CEEB/10
```

**در Figma:**

```
1. دو Rectangle: 48px height
2. Auto Layout: 16px padding
3. Border: 2px
4. Radius: 16px
5. Variant: Default | Selected
```

---

## ⚙️ Settings Drawer (SettingsDrawer.tsx)

```
Width: 400px
Height: Full viewport
Position: Right, slide-in
Fill: White
Shadow: shadow-2xl

Header:
  Height: 80px
  Padding: 24px
  Border bottom: 1px #E5E9ED
  
Content:
  Padding: 24px
  Gap: 24px
```

---

## 🎯 Exact Match Checklist

### Canvas:
- [ ] Size: 1440×900px ✅
- [ ] Background: #FAFBFC ✅

### Layout:
- [ ] Kid Stage: 936px (65%) ✅
- [ ] Teacher Panel: 504px (35%) ✅
- [ ] Border between: 1px #E5E9ED ✅

### Colors:
- [ ] Primary: #87CEEB ✅
- [ ] Background: #FAFBFC ✅
- [ ] Text: #2B3A4A ✅
- [ ] Border: #E5E9ED ✅

### Components:
- [ ] Primary Button: 160×64, radius 16 ✅
- [ ] Feeling Button: 120×140, radius 24 ✅
- [ ] Scenario Card: padding 24, radius 24 ✅
- [ ] Teacher HUD: pill, 40px height ✅
- [ ] Lumi Avatar: 256×256 (xl) ✅

### Spacing:
- [ ] همه 8pt grid (8, 16, 24, 32, 48) ✅
- [ ] Kid Stage padding: 48px ✅
- [ ] Teacher Panel padding: 32px ✅
- [ ] Panel gap: 24px ✅

### Details:
- [ ] همه border radius صحیح ✅
- [ ] همه shadows صحیح ✅
- [ ] همه font sizes صحیح ✅

---

## 🚀 مقایسه با کد

### آیا Figma مطابق است؟

**تست کنید:**

1. **رنگ Primary:**
   - کد: `#87CEEB`
   - Figma: باید دقیقاً `#87CEEB` باشد ✅

2. **Button height:**
   - کد: `h-16` = 64px
   - Figma: باید 64px باشد ✅

3. **Layout split:**
   - کد: `w-[65%]` / `w-[35%]`
   - Figma: 936px / 504px = 65/35 ✅

4. **Lumi XL size:**
   - کد: `w-64` = 256px
   - Figma: باید 256×256 باشد ✅

5. **Panel padding:**
   - کد: `p-8` = 32px
   - Figma: باید 32px باشد ✅

---

## 💡 اگر کد تغییر کرد

**workflow:**

```
1. کد تغییر کرد (مثلاً رنگ جدید)
2. در theme.css بررسی کنید
3. در Figma همان مقدار را بگذارید
4. Component را update کنید
5. Export دوباره
```

---

## 📊 مقایسه دو روش

| روش | زمان | دقت | مناسب برای |
|-----|------|-----|-----------|
| **این راهنما (From Code)** | 10-30 min | 100% | Match با کد موجود |
| **راهنمای قبلی (Full Design)** | 2-3 hours | Custom | طراحی جدید |

---

## ✅ نتیجه

با این راهنما شما یک Figma design دارید که:

✅ **دقیقاً مثل کد React** است  
✅ **تمام مقادیر از کد واقعی** گرفته شده  
✅ **آماده برای sync** با تغییرات کد  
✅ **سریع ساخته می‌شود** (10-30 دقیقه)  

---

**این همان UI است که الان کار می‌کند! 🎯**

---

## 🔗 فایل‌های مرتبط

- کد واقعی: `/src/app/pages/TeacherDashboard.tsx`
- Theme: `/src/styles/theme.css`
- Components: `/src/app/components/lumi/`

موفق باشید! 🌟
