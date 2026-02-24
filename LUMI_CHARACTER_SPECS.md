# 🌟 Lumi Character — Complete Specification
### دقیق‌ترین راهنما برای ساخت کاراکتر Lumi در Figma

---

## 📋 فهرست

1. [مشخصات پایه کاراکتر](#مشخصات-پایه)
2. [6 حالت چهره (Face States)](#حالات-چهره)
3. [4 حالت نور (Light Modes)](#حالات-نور)
4. [3 حالت وضعیت بدن (Poses)](#حالات-وضعیت)
5. [انیمیشن‌ها](#انیمیشن‌ها)
6. [راهنمای ساخت در Figma](#راهنمای-ساخت)

---

## 🎨 مشخصات پایه

### ابعاد و نسبت‌ها

```
Canvas Size: 400×400px (Large)
Character Height: ~350px
Character Width: ~320px

Antenna Height: 80px از بالای سر
Light Bubble: 80×80px دایره

Bow Size: ~100×60px
Eye Size: ~40×50px هر چشم
Pupil Size: ~30×40px
Highlight Size: ~12×16px (سفید)

Mouth: ~20px عرض (بسته به حالت)
Blush: دو دایره 20×15px روی گونه‌ها
```

---

### رنگ‌های پایه

```
Body/Fur: #F8F8FF (سفید کمی آبی)
Bow: #E8E8F0 (خاکستری خیلی روشن)
Bow Shadow: #D0D0E0

Eyes (White part): #FFFFFF
Pupil: #2B5876 (آبی تیره)
Highlight: #FFFFFF با opacity 90%

Blush: #FFB3C1 با opacity 30%

Antenna Stick: #D0D0E0 (همرنگ سایه Bow)

Outline/Shadow: #E0E0E8 (برای عمق)
```

---

## 😊 حالات چهره (6 Face States)

### 1️⃣ Neutral — حالت پیش‌فرض

**استفاده:** شروع صحبت، حالت عادی، منتظر

```
چشم‌ها:
- اندازه: عادی (40×50px)
- موقعیت: مرکز صورت
- زاویه: صاف (0°)
- Pupil: مرکز چشم
- Highlight: بالا-راست pupil
- می‌شود دو دایره (white + pupil) + یک highlight کوچک

ابرو:
- موقعیت: 10px بالای چشم
- شکل: خط ملایم افقی
- رنگ: #D0D0E0
- ضخامت: 3px

دهان:
- شکل: لبخند کوچک (یک قوس ملایم)
- عرض: 20px
- ارتفاع: 8px
- رنگ: #E85B78 (صورتی تیره)
- زبان (optional): visible, 12×8px, #FFB3C1

گونه‌ها:
- Blush: دو دایره 20×15px
- رنگ: #FFB3C1, opacity 30%
- موقعیت: کنار دهان

سر:
- زاویه: 0° (صاف)
- Bow: عادی، بالای سر
```

**Animation:**
- Float: ✅ Active (4s cycle, 8px vertical)
- Light: Baseline (steady glow)

---

### 2️⃣ Concern — نگران/دلواپس

**استفاده:** سوال جدی، تفکر، شنیدن مشکل

```
چشم‌ها:
- اندازه: همان (40×50px)
- موقعیت: کمی پایین (2px)
- Pupil: مرکز یا کمی پایین
- Highlight: کوچک‌تر (10×12px)

ابرو:
- شکل: کمی پایین از وسط (قوس ملایم رو به پایین)
- زاویه: داخلی پایین، بیرونی بالا (caring expression)
- ضخامت: 3px

دهان:
- شکل: خط صاف یا خیلی کم خمیده
- عرض: 18px
- بدون لبخند
- رنگ: #D0A0A8 (ملایم‌تر)
- زبان: مخفی

گونه‌ها:
- Blush: کمتر (opacity 20%)

سر:
- زاویه: 0°
- Bow: عادی
```

**Expression Goal:** "I'm listening and I care"

**Animation:**
- Float: ✅ Active
- Light: Baseline

---

### 3️⃣ Empathy — همدلی

**استفاده:** سوال empathy، درک احساس دیگران

```
چشم‌ها:
- اندازه: کمی بزرگ‌تر (45×55px)
- شکل: ملایم‌تر، گرد‌تر
- Pupil: کمی بزرگ‌تر
- Highlight: بزرگ‌تر و درخشان‌تر (14×18px)
- حالت: نرم، مهربان

ابرو:
- شکل: قوس ملایم رو به بالا
- موقعیت: کمی بالاتر
- حالت: caring, gentle curve

دهان:
- شکل: لبخند ملایم
- عرض: 22px
- ارتفاع: 10px
- حالت: نرم، صمیمی

گونه‌ها:
- Blush: متوسط (opacity 35%)
- کمی بزرگ‌تر

سر:
- زاویه: 4-6° کج به راست (head tilt)
- Bow: کج با سر
- حالت: کمی به طرف مخاطب خم
```

**Expression Goal:** "I understand how you feel"

**Animation:**
- Float: ✅ Active
- Light: Baseline or Warm (optional)
- Head Tilt: 6° rotation

---

### 4️⃣ Encouraging — دلگرم‌کننده

**استفاده:** تشویق، امیدوارکردن، قبل از practice

```
چشم‌ها:
- اندازه: عادی اما روشن
- Pupil: مرکز، واضح
- Highlight: بزرگ و درخشان (16×20px)
- حالت: پرانرژی، روشن
- می‌توانید دو highlight بگذارید (sparkle)

ابرو:
- شکل: کمی بالا
- حالت: expressive, uplifted
- موقعیت: بالای حالت عادی

دهان:
- شکل: لبخند بزرگ‌تر
- عرض: 26px
- ارتفاع: 12px
- زبان: visible (12×10px)
- حالت: باز، شاد

گونه‌ها:
- Blush: قوی‌تر (opacity 40%)
- اندازه: بزرگ‌تر (25×18px)

سر:
- زاویه: 0° یا کمی جلو
- Bow: کمی بزرگ‌تر یا bouncy (optional)
```

**Expression Goal:** "You can do this!"

**Animation:**
- Float: ✅ Active (maybe slightly faster or higher)
- Light: Baseline
- Optional: Slight bounce on bow

---

### 5️⃣ Proud — مفتخر/غرورآمیز

**استفاده:** پایان repair، تمام session، موفقیت

```
چشم‌ها:
- اندازه: عادی
- Pupil: مرکز، بزرگ
- Highlight: دو تا! (double sparkle)
  - اصلی: 16×20px
  - ثانویه: 8×10px
- حالت: خیلی روشن، sparkly

ابرو:
- شکل: بالا، expressive
- حالت: جشن، شادی

دهان:
- شکل: لبخند خیلی بزرگ
- عرض: 28px
- ارتفاع: 14px
- زبان: visible و بزرگ‌تر
- حالت: باز، شاد

گونه‌ها:
- Blush: خیلی واضح (opacity 45%)
- اندازه: بزرگ (26×20px)
- رنگ: کمی قرمزتر

سر:
- زاویه: 0°
- Bow: کمی بزرگ‌تر یا animated

جلوه اضافی:
- Sparkles اطراف سر (optional)
- Background glow قوی‌تر
```

**Expression Goal:** "I'm so proud of you!"

**Animation:**
- Float: ✅ Active
- Light: ✨ Warm Glow (1-2s bright moment)
- Ambient: Warm halo

---

### 6️⃣ Firm — جدی/محکم

**استفاده:** Firm Calm mode، boundary واضح، stop signal

```
چشم‌ها:
- اندازه: عادی
- موقعیت: مستقیم به جلو
- Pupil: مرکز، focused
- Highlight: کوچک‌تر (10×14px)
- حالت: جدی اما مهربان، نه ترسناک

ابرو:
- شکل: صاف، افقی
- موقعیت: طبیعی
- حالت: focused، جدی

دهان:
- شکل: خط صاف (neutral line)
- عرض: 20px
- بدون لبخند
- زبان: مخفی
- رنگ: #B0A0A8 (neutral)

گونه‌ها:
- Blush: خیلی کم یا نداره (opacity 10%)
- حالت: جدی

سر:
- زاویه: 0° (کاملاً صاف)
- Bow: ثابت، بدون حرکت
- حالت: stable presence
```

**Expression Goal:** "This is important. Stop now." (اما نه ترسناک)

**Animation:**
- Float: ❌ DISABLED (stable, no movement)
- Light: Firm mode (steady, no pulse)
- Pose: firm_still

**رنگ‌بندی:**
- نور: Sky 400 (#6BB6D9) با opacity 100%
- هیچ pulse نداره
- پس‌زمینه: بدون glow

---

## 💡 حالات نور (4 Light Modes)

### ⚪ Baseline — نور پایه

**استفاده:** اکثر مواقع، حالت عادی

```
Antenna Light:
- سایز: 80×80px دایره
- موقعیت: بالای antenna stick
- Fill: Radial Gradient
  - مرکز: #FFFFFF, opacity 60%
  - میانی: #87CEEB, opacity 80%
  - بیرون: #B0E0F5, opacity 40%
- Effect: Blur 10px
- Animation: هیچ (steady)

Ambient Glow:
- هیچ یا خیلی کم
- اختیاری: سایه ملایم پشت کاراکتر
```

**حالت:** آرام، ثابت، حضور همیشگی

---

### 🌊 Sync — هماهنگ با نفس

**استفاده:** Breath Sync screen، تمرین تنفس

```
Antenna Light:
- همان Baseline
- Animation: Scale Pulse
  - از: 0.9
  - به: 1.1
  - مدت: 6 ثانیه (3s in, 3s out)
  - Easing: ease-in-out
  - Loop: continuous

Ambient Glow:
- رادیوس: 300px
- Fill: Radial Gradient
  - مرکز: #B0E0F5, opacity 10%
  - بیرون: transparent
- Blur: 60px
- Animation: Sync با light (subtle)

دایره تنفس روی صفحه:
- همزمان با نور Lumi
- 3 ثانیه بزرگ (inhale)
- 3 ثانیه کوچک (exhale)
```

**حالت:** آرام، rhythmic، تنفس جمعی

---

### ✨ Warm — لحظه گرم

**استفاده:** Repair تمام شد، پایان session، لحظه افتخار

```
Antenna Light:
- سایز: 100×100px (بزرگ‌تر)
- Fill: Radial Gradient
  - مرکز: #FFFFFF, opacity 80%
  - میانی: #FFB366, opacity 90%
  - بیرون: #FFD6A5, opacity 50%
- Blur: 20px (بیشتر)
- Animation: Glow Moment
  - Opacity: 80% → 100% → 80%
  - Scale: 1.0 → 1.25 → 1.0
  - مدت: 2 ثانیه
  - یک‌بار (not loop)

Ambient Glow:
- رادیوس: 400px (بزرگ‌تر)
- Fill: Radial Gradient
  - مرکز: #FFD6A5, opacity 15%
  - بیرون: transparent
- Blur: 80px
- Animation: 2s glow
- Background: کل صفحه کمی روشن‌تر (+3-5% brightness)

Duration: 1-2 ثانیه
Return: بعد از Warm به Baseline برمی‌گرده
```

**حالت:** احساس گرم، پاداش، جشن کوچک

---

### 🔵 Firm — حالت محکم

**استفاده:** Firm Calm emergency، boundary جدی

```
Antenna Light:
- سایز: 80×80px
- Fill: Solid (نه gradient!)
  - رنگ: #6BB6D9 (Sky 400), opacity 100%
  - مرکز: #FFFFFF, opacity 40% (کوچک)
- Blur: 5px (کمتر)
- Animation: هیچ (completely steady)

Ambient Glow:
- هیچ (no glow at all)
- پس‌زمینه: تمیز، focused

Float Animation:
- ❌ DISABLED
- کاراکتر کاملاً ثابت
```

**حالت:** حضور پایدار، جدی، واضح

**Trigger:**
- دکمه "Firm Calm"
- Level 3 scenarios
- Emergency stop

---

## 🎭 حالات وضعیت (3 Poses)

### 🧍 Normal — عادی

```
Body Position: صاف، مرکز
Head: 0° rotation
Bow: مستقیم بالای سر
Antenna: عمود

Float Animation: ✅ Active
```

---

### 👂 Listening — شنیدن

```
Body Position: صاف
Head: 4-6° tilt به راست
Bow: tilt با سر
Eyes: کمی نرم‌تر

Float Animation: ✅ Active
Light: کمی کم‌تر (opacity 70%)
```

**استفاده:** سوال‌ها، شنیدن احساسات کودکان

---

### 🛑 Firm Still — ثابت

```
Body Position: صاف، ثابت
Head: 0° (no tilt)
Bow: ثابت
Antenna: عمود

Float Animation: ❌ DISABLED
Light: Firm mode
Expression: Firm face
```

**استفاده:** فقط Firm Calm mode

---

## 🎬 انیمیشن‌ها

### 1. Float (شناوری)

```
Property: Transform Y
From: 0px
To: -8px
Duration: 4000ms
Easing: ease-in-out
Direction: alternate
Loop: infinite

Trigger: همیشه (except Firm mode)
```

**شبیه تنفس ملایم**

---

### 2. Light Pulse (تپش نور)

```
Property: Scale
From: 0.9
To: 1.1
Duration: 6000ms (3s in, 3s out)
Easing: ease-in-out
Loop: infinite

Trigger: فقط Sync mode
```

**همزمان با breathing circle**

---

### 3. Warm Glow Moment

```
Antenna Light:
  Opacity: 80% → 100% → 80%
  Scale: 1.0 → 1.25 → 1.0
  Duration: 2000ms

Ambient Glow:
  Opacity: 0% → 15% → 0%
  Scale: 1.0 → 1.1 → 1.0
  Duration: 2000ms

Background:
  Brightness: 0% → +5% → 0%
  Duration: 2000ms

Trigger: Manual (repair, closing)
Loop: Once
```

---

### 4. Head Tilt (listening)

```
Property: Rotation
Angle: 6°
Duration: 300ms
Easing: ease-out
Trigger: Listening mode
```

---

### 5. Blinking (چشمک زدن)

```
Property: Eye height
From: 50px → 5px → 50px
Duration: 150ms
Frequency: هر 3-5 ثانیه (random)
Trigger: Automatic (subtle)

Optional در MVP
```

---

### 6. Mouth Movement (حرکت دهان)

```
Property: Mouth scale
From: 1.0 → 1.1 → 0.9 → 1.0
Duration: sync با voice
Trigger: هنگام speech

Optional در MVP
```

---

## 🛠 راهنمای ساخت در Figma

### مرحله 1: لایه‌های پایه

1. **Body/Fur:**
   - شکل اصلی بدن
   - رنگ: #F8F8FF
   - سایه ملایم برای عمق

2. **Bow (پاپیون):**
   - دو ellipse برای دو طرف
   - یک دایره کوچک وسط
   - رنگ: #E8E8F0

3. **Antenna Stick:**
   - خط 3px, ارتفاع 80px
   - رنگ: #D0D0E0

4. **Eyes (هر چشم جدا):**
   - White base: دایره/ellipse 40×50px
   - Pupil: ellipse 30×40px, رنگ #2B5876
   - Highlight: دایره 12×16px, سفید

5. **Eyebrows:**
   - دو خط 3px
   - stroke یا shape

6. **Mouth:**
   - path یا arc
   - ضخامت 2-3px

7. **Blush:**
   - دو ellipse 20×15px
   - رنگ #FFB3C1, opacity 30%

---

### مرحله 2: ساخت Variants

#### Face Variants (6 تا)

برای هر حالت:
1. لایه‌های چشم را duplicate کن
2. تغییرات مورد نیاز:
   - اندازه چشم
   - موقعیت pupil
   - اندازه highlight
   - شکل ابرو
   - شکل دهان
   - opacity blush
   - rotation سر (empathy)

3. هر face را یک لایه جدا بساز
4. نام‌گذاری: `Face/Neutral`, `Face/Concern`, ...

---

#### Light Variants (4 تا)

1. **Baseline:**
   - دایره 80×80px
   - Radial gradient: White center → Sky 300 → Sky 200
   - Blur 10px

2. **Sync:**
   - همان Baseline
   - در Prototype: Smart Animate با scale

3. **Warm:**
   - دایره 100×100px
   - Radial gradient: White → Warm 300 → Warm 200
   - Blur 20px

4. **Firm:**
   - دایره 80×80px
   - Fill: Sky 400 solid
   - Blur 5px

نام‌گذاری: `Light/Baseline`, `Light/Sync`, ...

---

### مرحله 3: Component با Variant Properties

1. تمام لایه‌ها را در یک Frame گروه کن (400×400px)
2. **Create Component** (⌘+⌥+K)
3. **Add Variant Properties:**

```
Property: Face
Type: Variant
Options: neutral, concern, empathy, encouraging, proud, firm

Property: Light
Type: Variant
Options: baseline, sync, warm, firm

Property: Pose
Type: Variant  
Options: normal, listening, firm_still

Property: Size
Type: Variant
Options: sm (200px), md (300px), lg (400px)
```

4. برای هر ترکیب:
   - Face layer مناسب را show کن
   - Light layer مناسب را show کن
   - اگر listening: rotation = 6°
   - اگر firm_still: rotation = 0°

**تعداد کل Variants:** 6 × 4 × 3 × 3 = 216 ترکیب!

**راه حل ساده:** فقط ترکیب‌های پرکاربرد را بساز:
- neutral + baseline + normal + lg
- concern + baseline + listening + lg
- empathy + baseline + listening + lg
- encouraging + baseline + normal + lg
- proud + warm + normal + lg
- firm + firm + firm_still + lg

---

### مرحله 4: Ambient Glow (اختیاری)

1. ellipse بزرگ 500×500px
2. پشت کاراکتر (Send to Back)
3. Radial gradient: Sky/Warm center → transparent
4. Blur 60px
5. Conditional visibility:
   - Baseline: hidden
   - Sync: visible (Sky 200, 10%)
   - Warm: visible (Warm 200, 15%)
   - Firm: hidden

---

### مرحله 5: Prototyping

1. صفحه جدید برای تست بساز
2. چند instance از Lumi component بگذار
3. دکمه‌هایی برای تغییر state
4. Interaction:
   - On Click → Change to [Variant]
   - Animation: Smart Animate
   - Duration: 300ms

**تست کن:**
- Float animation
- Light pulse (Sync)
- Warm glow moment
- State transitions

---

## ✅ Checklist نهایی

### Face States
- [ ] Neutral — لبخند ملایم، چشم‌های عادی
- [ ] Concern — ابروی پایین، دهان neutral
- [ ] Empathy — سر کج، چشم‌های نرم
- [ ] Encouraging — لبخند بزرگ، چشم‌های روشن
- [ ] Proud — لبخند خیلی ��زرگ، double highlight
- [ ] Firm — دهان صاف، نگاه مستقیم

### Light Modes
- [ ] Baseline — steady glow
- [ ] Sync — pulse 6s
- [ ] Warm — bright moment 2s
- [ ] Firm — solid, no animation

### Poses
- [ ] Normal — صاف
- [ ] Listening — tilt 6°
- [ ] Firm Still — no float

### Animations
- [ ] Float — 4s, 8px, ease-in-out
- [ ] Light Pulse — 6s, scale 0.9-1.1
- [ ] Warm Glow — 2s, scale 1.25
- [ ] Head Tilt — 6°, 300ms

### Component
- [ ] تمام variants ساخته شد
- [ ] نام‌گذاری واضح
- [ ] Properties تعریف شد
- [ ] Prototyping تست شد

---

## 🎯 نکات مهم

1. **ملایم باش:** همه تغییرات باید subtle باشد
2. **نه ترسناک:** حتی Firm mode باید مهربان باشد
3. **Readable:** روی iPad از فاصله باید واضح باشد
4. **Accessible:** کنتراست رنگی کافی
5. **Consistent:** همه state‌ها یک سبک

---

## 🚀 آماده برای استفاده!

Lumi حالا یک کاراکتر کامل با:
- ✅ 6 حالت احساسی
- ✅ 4 حالت نوری
- ✅ 3 وضعیت بدن
- ✅ انیمیشن‌های ملایم
- ✅ آماده برای توسعه

---

**موفق باشید! 🌟**
