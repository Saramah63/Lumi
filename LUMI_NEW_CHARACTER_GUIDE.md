# 🌟 Lumi Character — راهنمای کامل (نسخه جدید)

> کاراکتر Lumi با کیفیت بالا — آماده برای Figma و توسعه

---

## ✨ معرفی Lumi

**Lumi** یک موجود پشمالو سفید، مهربان و دوستانه است که به کودکان کمک می‌کند تا مهارت‌های عاطفی بیاموزند.

---

## 🎨 ویژگی‌های طراحی

### پشمالو سفید:
- **رنگ اصلی:** سفید خالص با سایه‌های ملایم
- **بافت:** Fluffy، نرم، پشمالو
- **شکل:** گرد، cute، دوست‌داشتنی
- **پاها:** کوچک و گرد (دیده نمی‌شوند تقریباً)

### پاپیون 🎀:
- **موقعیت:** بالای سر، روی موهای پشمالو
- **رنگ:** صورتی ملایم / سفید
- **شکل:** کلاسیک با دو لوپ و گره وسط
- **استایل:** ساده، مینیمال، شیک

### آنتن 📡:
- **موقعیت:** مرکز بالای سر
- **رنگ:** سفید/خاکستری ملایم
- **گوی نوری:** آبی آسمانی (#87CEEB) درخشان
- **افکت:** Glow, pulse animation

### چشم‌ها 👀:
- **اندازه:** بزرگ و گرد
- **رنگ:** Gradient آبی (تیره → روشن)
- **Highlight:** سفید، reflection نور
- **حالت:** مهربان، دوستانه، باز
- **موقعیت:** نزدیک هم، جلوی صورت

### دهان 😊:
- **شکل:** کوچک، باز، لبخند شاد
- **رنگ:** قرمز/صورتی ملایم
- **زبان:** کوچک و cute (قابل مشاهده)
- **حالت:** همیشه خوشحال و positive

### گونه‌ها 💗:
- **رنگ:** صورتی ملایم
- **محل:** دو طرف صورت
- **استایل:** Blush ملایم، cute
- **افکت:** اضافه می‌کند به cuteness

---

## 📐 ابعاد و سایزها

### در کد React:

```typescript
sm:  96×96px   (w-24)  — لیست، آیکون کوچک
md:  128×128px (w-32)  — کارت‌ها
lg:  192×192px (w-48)  — صفحات معمولی
xl:  256×256px (w-64)  — صفحه اصلی، تمرکز
```

### در Figma:

```
Component: Lumi
Variants: 4 sizes

Base (xl):     256×256px
Large (lg):    192×192px
Medium (md):   128×128px
Small (sm):    96×96px
```

**همه از یک master image استفاده می‌کنند، فقط scale می‌شوند!**

---

## 🎭 Emotions (حالات عاطفی)

Lumi 4 حالت عاطفی دارد که فقط **دهان** تغییر می‌کند:

### 1. Happy (شاد) 😊
```
دهان: باز، لبخند بزرگ
چشم‌ها: باز، درخشان
استفاده: خوش‌آمدگویی، موفقیت، تشویق
```

### 2. Calm (آرام) 😌
```
دهان: لبخند کوچک، آرام
چشم‌ها: نیمه‌باز (optional)
استفاده: تنفس، آرامش، تمرکز
```

### 3. Neutral (خنثی) 😐
```
دهان: لبخند خیلی کوچک
چشم‌ها: عادی
استفاده: گوش دادن، منتظر
```

### 4. Thinking (فکر) 🤔
```
دهان: کمی باز، کنجکاو
چشم‌ها: به بالا، فکر می‌کند
استفاده: سوال، کنجکاوی، یادگیری
```

---

## ✨ Animations

### 1. Float (شناور) — همیشه فعال
```typescript
y: [0, -8, 0]
duration: 3 seconds
ease: easeInOut
loop: infinite
```
**تأثیر:** Lumi به آرامی بالا و پایین می‌رود (شناور در هوا)

---

### 2. Speaking (صحبت) — وقتی حرف می‌زند
```typescript
scale: [1, 1.02, 1]
duration: 0.3 seconds
ease: easeInOut
loop: while speaking
```
**تأثیر:** Bounce ملایم همزمان با صحبت

---

### 3. Breathing (تنفس) — فقط در Breath Sync
```typescript
glow scale: [1, 1.1, 1]
glow opacity: [0.3, 0.6, 0.3]
duration: 4 seconds
ease: easeInOut
loop: infinite
```
**تأثیر:** Glow اطراف Lumi بزرگ و کوچک می‌شود (تنفس)

---

### 4. Antenna Pulse — همیشه فعال
```typescript
opacity: [0.6, 1, 0.6]
scale: [1, 1.1, 1]
duration: 2 seconds
ease: easeInOut
loop: infinite
```
**تأثیر:** گوی آبی روی آنتن pulse می‌کند

---

## 🌟 Glow Effect

### Glow Layer (پشت Lumi):

```css
Background: Radial gradient
  Center: rgba(135, 206, 235, 0.4)
  Edge: transparent

Size: 300×300px (بزرگتر از Lumi)
Blur: 80px
Opacity: 30%
Position: Behind Lumi (z-index: -1)
```

### در Figma:

```
1. Ellipse: 300×300px
2. پشت Lumi (Send to Back)
3. Fill: Radial Gradient
   - Center (0%): #87CEEB @ 40%
   - Edge (100%): #87CEEB @ 0%
4. Effects: Layer Blur 80px
5. Opacity: 30%
```

---

## 💧 Drop Shadow

### برای Lumi:

```css
Normal state:
  drop-shadow(0 0 10px rgba(135, 206, 235, 0.3))

Breathing state:
  drop-shadow(0 0 20px rgba(135, 206, 235, 0.6))
```

### در Figma:

```
Effect: Drop Shadow
X: 0
Y: 0
Blur: 10px (normal) / 20px (breathing)
Color: #87CEEB @ 30% (normal) / 60% (breathing)
```

---

## 🎨 در Figma چگونه بسازیم؟

### ساخت Component:

#### قدم 1: Setup
```
1. فایل Figma باز کنید
2. Frame جدید: 256×256px
3. نام: "Lumi Character"
```

#### قدم 2: Glow Layer
```
1. Ellipse: 300×300px
2. Center در frame (overflow visible)
3. Radial gradient: #87CEEB 40% → transparent
4. Layer Blur: 80px
5. Opacity: 30%
6. نام: "Glow"
```

#### قدم 3: Character
```
1. Import تصویر Lumi
2. Scale: Fit in frame
3. Center aligned
4. Object-fit: Contain
5. نام: "Character"
```

#### قدم 4: Component
```
1. Select all (Glow + Character)
2. Create Component (Cmd/Ctrl + Alt + K)
3. نام: "Lumi"
```

#### قدم 5: Variants
```
Property 1: Size
  - xl (256×256)
  - lg (192×192)
  - md (128×128)
  - sm (96×96)

Property 2: Emotion
  - happy
  - calm
  - neutral
  - thinking

Property 3: State
  - normal
  - speaking
  - breathing
```

---

## 🎬 Prototype Animations در Figma

### Float Animation:
```
Interaction: After Delay (0ms)
Action: Animate to → Copy of same frame
Animation: Smart Animate
Easing: Ease In and Out
Duration: 1500ms

در copy frame:
  - Y position: -8px (نسبت به اصلی)
  
سپس دوباره:
  - Back to original position
  - Duration: 1500ms
```

### Speaking Animation:
```
Variant: speaking=true

Interaction: After Delay (0ms)
Action: Animate
Property: Scale
From: 1.0
To: 1.02
Duration: 150ms
Easing: Ease In and Out
Loop: Yes
```

### Breathing Glow:
```
Variant: breathing=true

Glow layer:
Interaction: After Delay (0ms)
Action: Animate
Property: Scale
From: 1.0
To: 1.1
Duration: 2000ms
Easing: Ease In and Out
Loop: Yes

Property: Opacity
From: 30%
To: 60%
Duration: 2000ms
```

---

## 🎯 استفاده در صفحات

### Teacher Dashboard:
```
Size: xl (256×256)
Emotion: happy
State: normal
Position: Center
```

### Feelings Check-in:
```
Size: lg (192×192)
Emotion: calm
State: speaking (when talking)
Position: Top center
```

### Breath Sync:
```
Size: xl (256×256)
Emotion: calm
State: breathing
Position: Center
```

### Scenario:
```
Size: xl (256×256)
Emotion: thinking → happy
State: speaking (when talking)
Position: Top center
```

### Closing:
```
Size: xl (256×256)
Emotion: happy
State: speaking
Position: Center
```

---

## 📊 Color Palette

### Lumi Character:
```
Body: #FFFFFF (white)
Shadow: #E5E9ED (light gray)
Eyes: Gradient
  - Inner: #1E3A5F (dark blue)
  - Outer: #87CEEB (sky blue)
  - Highlight: #FFFFFF (white)
Mouth: #D8727D (soft pink/red)
Blush: #FFB8C1 (light pink)
Bow: #F0E6F0 (light pink/white)
Antenna: #D0D5DD (light gray)
Antenna Ball: #87CEEB (sky blue)
```

### Glow & Effects:
```
Primary Glow: #87CEEB @ 30-60%
Shadow: #87CEEB @ 30%
Background: #FAFBFC (neutral bg)
```

---

## 💡 نکات طراحی

### DO ✅:
- حفظ نسبت ابعاد (aspect ratio)
- استفاده از Glow ملایم
- Float animation همیشه فعال
- Emotions ساده (فقط دهان)
- پس‌زمینه minimal

### DON'T ❌:
- تغییر رنگ اصلی (سفید)
- حذف پاپیون یا آنتن
- افکت‌های بیش از حد
- Animation‌های سریع/تند
- پس‌زمینه شلوغ

---

## 🎨 Export Settings

### برای Web:
```
Format: PNG
Scale: 2x (512×512 for xl)
Background: Transparent
Compression: Medium
```

### برای React:
```
تصویر قبلاً import شده:
figma:asset/608ec6824dd9df09bb150c494f7d3c93224e8d44.png

استفاده در کد:
import lumiImage from "figma:asset/...";
<img src={lumiImage} alt="Lumi" />
```

---

## 📱 Responsive Behavior

### Mobile (< 768px):
```
Size: md یا lg (کوچکتر از desktop)
Glow: کمتر (performance)
Animations: ساده‌تر
```

### Tablet (768px - 1024px):
```
Size: lg
همه animations فعال
```

### Desktop (> 1024px):
```
Size: xl (256×256)
همه animations و effects فعال
```

---

## 🔊 با Speech Integration

Lumi وقتی صحبت می‌کند:

```typescript
<LumiAvatar 
  size="xl" 
  emotion="happy" 
  speaking={isSpeaking}  // ← از hook می‌آید
/>
```

**Animation:**
- Scale: 1.0 → 1.02 (bounce)
- Duration: 300ms
- Loop: while speaking
- Sync: با Web Speech API

---

## ✅ Checklist

### Setup:
- [ ] تصویر Lumi import شد
- [ ] Glow layer ساخته شد
- [ ] Component با variants

### Variants:
- [ ] 4 sizes: sm, md, lg, xl
- [ ] 4 emotions: happy, calm, neutral, thinking
- [ ] 3 states: normal, speaking, breathing

### Animations:
- [ ] Float (همیشه)
- [ ] Speaking (conditional)
- [ ] Breathing (conditional)
- [ ] Antenna pulse (همیشه)

### Effects:
- [ ] Glow radial gradient
- [ ] Drop shadow
- [ ] Blur 80px

### Integration:
- [ ] Web Speech API
- [ ] useSpeech hook
- [ ] همه صفحات

---

## 🚀 Next Steps

1. **Figma:**
   - Component را با تمام variants بسازید
   - Prototype animations اضافه کنید
   - Export برای مستندسازی

2. **Code:**
   - ✅ Already integrated!
   - Test در تمام صفحات
   - بررسی performance

3. **Design System:**
   - به design tokens اضافه کنید
   - راهنمای استفاده بنویسید
   - مثال‌های استفاده

---

**Lumi آماده است برای جادو! ✨**

موفق باشید! 💙
