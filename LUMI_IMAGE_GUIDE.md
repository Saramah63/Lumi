# 🖼 راهنمای استفاده از تصویر Lumi در Figma

> چگونه تصویر کاراکتر Lumi را در Figma آماده و استفاده کنیم

---

## 📸 تصویر موجود

در این پروژه یک تصویر زیبا و حرفه‌ای از Lumi موجود است:

**مسیر در کد:**
```javascript
import lumiImage from 'figma:asset/bb16188844a6f8632d6b6bdf0b3a9e4798c78be2.png';
```

**مشخصات تصویر:**
- کاراکتر: موجود سفید پشمالو با پاپیون
- آنتن: با حباب آبی نورانی
- چشم‌ها: بزرگ و مهربان
- رنگ: سفید/خاکستری روشن
- پس‌زمینه: شفاف یا ملایم

---

## 🎨 گام 1: آماده‌سازی تصویر برای Figma

### روش A: استفاده از تصویر موجود (ساده‌ترین)

1. **Export تصویر از پروژه:**
   - تصویر Lumi را از مسیر پروژه پیدا کنید
   - یا از screenshot کاراکتر در برنامه استفاده کنید

2. **Import به Figma:**
   ```
   1. Figma باز کنید
   2. فایل طراحی را باز کنید
   3. Drag & Drop تصویر به Canvas
   یا
   File → Place Image (Shift + Ctrl/Cmd + K)
   ```

3. **پاک‌سازی پس‌زمینه (اگر نیاز باشد):**
   ```
   1. تصویر را انتخاب کنید
   2. Plugins → Remove Background
   یا
   دستی با ابزار Vector masking
   ```

---

### روش B: ایجاد Lumi در Figma (از صفر)

اگر تصویر در دسترس نیست، می‌توانید در Figma بسازید:

#### مواد لازم:
```
✅ Figma Desktop/Web
✅ مشخصات کاراکتر (LUMI_CHARACTER_SPECS.md)
✅ رنگ‌های پایه
```

#### مراحل ساخت:

**1. بدن (Body):**
```
- Ellipse Tool (O)
- سایز: 140×160px
- Fill: #F8F8FF (سفید کمی آبی)
- Effect: Inner Shadow برای عمق
```

**2. پاپیون (Bow):**
```
- دو Ellipse: 40×30px
- یک Circle: 16px (وسط)
- Fill: #E8E8F0
- Position: بالای بدن
```

**3. آنتن (Antenna):**
```
- Line Tool: 3px ضخامت, 80px ارتفاع
- Color: #D0D0E0
- Position: از بالای سر
```

**4. حباب نور (Light Bubble):**
```
- Circle: 80×80px
- Fill: Radial Gradient
  - Center: #FFFFFF 60%
  - Outer: #87CEEB 80%
- Effect: Blur 10px
- Position: بالای آنتن
```

**5. چشم‌ها:**
```
چشم چپ و راست (هر کدام):
- White: Ellipse 40×50px
- Pupil: Ellipse 30×40px, #2B5876
- Highlight: Circle 12px, #FFFFFF
- Position: وسط صورت
```

**6. دهان:**
```
- Pen Tool (P)
- لبخند ملایم: قوس رو به بالا
- Stroke: 2.5px, #2B3A4A
```

**7. گونه (Blush):**
```
- دو Ellipse: 20×15px
- Fill: #FFB3C1, Opacity 30%
- Position: کنار دهان
```

---

## 🧩 گام 2: ایجاد Component در Figma

### ساختار پایه:

```
1. همه لایه‌ها را در یک Frame قرار دهید:
   - نام Frame: "Lumi Avatar"
   - سایز: 400×400px
   - Center aligned

2. لایه‌های جداگانه:
   ├── Background Glow (optional)
   ├── Body
   ├── Antenna
   ├── Light Bubble
   ├── Bow
   ├── Eyes (Group)
   │   ├── Left Eye
   │   └── Right Eye
   ├── Mouth
   └── Blush (Group)
```

### تبدیل به Component:

```
1. Frame را انتخاب کنید
2. Create Component (⌘+⌥+K یا Ctrl+Alt+K)
3. نام: "LumiAvatar"
```

---

## 🎭 گام 3: اضافه کردن Variants

### Variant Property 1: Face

```
1. Component را انتخاب کنید
2. بالا راست: Add Variant
3. Property Name: "Face"
4. Options:
   - neutral
   - concern
   - empathy
   - encouraging
   - proud
   - firm
```

### برای هر Face State:

**Neutral:**
```
- Mouth: لبخند کوچک
- Eyes: عادی
- Eyebrows: افقی
```

**Concern:**
```
- Mouth: خط صاف
- Eyes: کمی پایین
- Eyebrows: کمی پایین
```

**Empathy:**
```
- Rotation: سر 6° به راست
- Eyes: کمی بزرگ‌تر
- Mouth: لبخند ملایم
```

**Encouraging:**
```
- Mouth: لبخند بزرگ
- Eyes: highlight بزرگ‌تر
- Blush: قوی‌تر
```

**Proud:**
```
- Mouth: لبخند خیلی بزرگ
- Eyes: دو highlight (sparkle)
- Blush: خیلی واضح
```

**Firm:**
```
- Mouth: خط صاف
- Eyes: مستقیم
- Blush: خیلی کم یا نداره
```

---

### Variant Property 2: Light

```
Property Name: "Light"
Options:
- baseline
- sync
- warm
- firm
```

**Baseline:**
```
Light Bubble:
- Size: 80×80px
- Color: Sky 300 (#87CEEB)
- Opacity: 80%
- Blur: 10px
```

**Sync:**
```
همان Baseline +
در Prototype: Smart Animate با Scale animation
```

**Warm:**
```
Light Bubble:
- Size: 100×100px
- Color: Warm 300 (#FFB366)
- Opacity: 90%
- Blur: 20px
```

**Firm:**
```
Light Bubble:
- Size: 80×80px
- Color: Sky 400 (#6BB6D9)
- Opacity: 100% (solid)
- Blur: 5px (کمتر)
```

---

### Variant Property 3: Size

```
Property Name: "Size"
Options:
- sm (200×200px)
- md (300×300px)
- lg (400×400px)
```

**تغییر سایز:**
```
1. Frame را resize کنید
2. Constraints: Scale را انتخاب کنید
3. همه المان‌ها باید proportional scale شوند
```

---

## 🎬 گام 4: اضافه کردن Animations

### Float Animation (شناوری):

```
1. دو Frame بسازید:
   - Frame 1: Position Y = 0
   - Frame 2: Position Y = -8px

2. Prototype:
   - On Click → Change to Frame 2
   - Animation: Smart Animate
   - Duration: 2000ms
   - Easing: Ease In-Out

3. Loop:
   - Frame 2 → Frame 1
   - همان تنظیمات
```

### Light Pulse (تپش نور - Sync mode):

```
1. دو variant بسازید:
   - Light Small: Scale 90%
   - Light Large: Scale 110%

2. Prototype:
   - Sync variant → animate between states
   - Duration: 3000ms (in), 3000ms (out)
   - Loop: Continuous
```

### Warm Glow:

```
1. Warm variant:
   - Light scale: 1.0 → 1.25
   - Ambient glow: 0% → 15% opacity
   - Duration: 2000ms

2. Trigger: Manual (button click)
3. Return to Baseline after 2s
```

---

## 💡 گام 5: استفاده در Screens

### در صفحه Teacher Dashboard:

```
1. Kid Stage frame (65% عرض)
2. Instance از LumiAvatar component
3. Size: lg
4. Face: neutral
5. Light: baseline
6. Center aligned
```

### در صفحه Breath Sync:

```
1. Instance جدید
2. Size: lg
3. Face: neutral یا calm
4. Light: sync (با animation)
5. Ambient glow: visible
```

### در Scenario Flow:

```
1. Instance بر اساس مرحله:
   - Situation: neutral + baseline
   - Question: concern/empathy + baseline
   - Response: encouraging + baseline
   - Firm Calm: firm + firm
```

---

## 🎨 گام 6: افکت‌های اضافی

### Ambient Glow (هاله محیطی):

```
1. Ellipse بزرگ: 500×500px
2. پشت Lumi (Send to Back)
3. Fill: Radial Gradient
   - Center: Sky 200 (#B0E0F5) 10%
   - Outer: Transparent
4. Blur: 60px
5. Visibility: فقط در حالت Sync/Warm
```

### Shadow (سایه):

```
1. Effect → Drop Shadow
2. Y: 20px
3. Blur: 40px
4. Color: #2B3A4A, Opacity 8%
5. Subtle presence
```

---

## ✅ Checklist تکمیل

### تصویر پایه
- [ ] تصویر Lumi import شد
- [ ] پس‌زمینه پاک شد (اگر نیاز بود)
- [ ] سایز 400×400px
- [ ] در Frame قرار گرفت

### Component
- [ ] Component ساخته شد
- [ ] نام: "LumiAvatar"
- [ ] Organized layers

### Variants
- [ ] Face property (6 options)
- [ ] Light property (4 options)
- [ ] Size property (3 options)
- [ ] همه ترکیبات کار می‌کنند

### Animations
- [ ] Float animation تست شد
- [ ] Light pulse (Sync) کار می‌کند
- [ ] Warm glow trigger می‌شود
- [ ] Transitions smooth هستند

### استفاده در Screens
- [ ] در Teacher Dashboard قرار گرفت
- [ ] در Breath Sync با animation
- [ ] در Scenario با states مناسب
- [ ] همه جا responsive است

---

## 🚨 اشتباهات رایج و راه‌حل

### ❌ Problem: تصویر خیلی بزرگ/کوچک

**✅ راه‌حل:**
```
1. تصویر را انتخاب کن
2. Constraints → Scale
3. در Frame 400×400px قرار بده
4. Center align
```

---

### ❌ Problem: Variants کار نمی‌کند

**✅ راه‌حل:**
```
1. اطمینان از Component بودن
2. Properties درست تعریف شده
3. هر variant یک نام unique دارد
4. لایه‌های مشابه در همه variants
```

---

### ❌ Problem: Animation اجرا نمی‌شود

**✅ راه‌حل:**
```
1. Prototype mode فعال است
2. Smart Animate انتخاب شده
3. دو state با نام یکسان layers
4. Duration مناسب (2000-4000ms)
```

---

### ❌ Problem: رنگ نور درست نیست

**✅ راه‌حل:**
```
Baseline: #87CEEB (Sky 300)
Sync: همان Sky 300
Warm: #FFB366 (Warm 300)
Firm: #6BB6D9 (Sky 400)

همه با Radial Gradient
```

---

## 🎯 نکات حرفه‌ای

### 1. استفاده از Symbols

```
لایه‌هایی که در همه variants یکسان هستند:
→ تبدیل به Symbol کنید
→ در همه جا reuse کنید
→ تغییر یک‌جا، اعمال همه‌جا
```

### 2. Layer Organization

```
نام‌گذاری واضح:
✅ "Eye/Left/Pupil"
✅ "Light/Glow/Outer"
✅ "Bow/Left/Loop"

❌ "Ellipse 1"
❌ "Layer 23"
```

### 3. Constraints

```
برای responsive بودن:
- Center constraints برای Lumi
- Scale constraints برای resize
- Fixed constraints برای نور
```

### 4. Performance

```
برای Prototype سریع‌تر:
- تصاویر را Optimize کنید
- Blur effect کم استفاده کنید
- Layers غیرضروری را حذف کنید
```

---

## 📦 Export برای Development

### Export Settings:

```
1. Lumi را انتخاب کنید
2. Export panel → Add Export Setting

PNG:
- Scale: 2x, 3x (Retina)
- Suffix: @2x, @3x

SVG (برای آیکون‌ها):
- Outline stroke
- Flatten transforms
```

### Naming Convention:

```
lumi-neutral-baseline-lg.png
lumi-empathy-baseline-md.png
lumi-firm-firm-lg.png

Pattern: lumi-[face]-[light]-[size].png
```

---

## 🚀 آماده برای استفاده!

شما الان یک Lumi Avatar کامل دارید با:

✅ 6 Face States  
✅ 4 Light Modes  
✅ 3 Sizes  
✅ Smooth Animations  
✅ آماده برای Prototype  
✅ Export-Ready  

---

## 📚 منابع مرتبط

- مشخصات کامل: `LUMI_CHARACTER_SPECS.md`
- راهنمای Figma: `FIGMA_DESIGN_GUIDE.md`
- Design Tokens: `design-tokens.json`

---

**موفق باشید! 🌟**

*Lumi Character — Safe, Calm, Emotional Awareness*
