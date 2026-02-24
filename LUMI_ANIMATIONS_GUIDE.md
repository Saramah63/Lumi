# 🎬 Lumi Animations — راهنمای کامل

> چشم‌ها پلک می‌زنند، دهان حرکت می‌کند، Lumi بزرگتر شد!

---

## ✨ تغییرات جدید

### 1. **Lumi بزرگتر شد!** 📏

**سایزهای قدیمی:**
```typescript
sm:  96px   (w-24)
md:  128px  (w-32)
lg:  192px  (w-48)
xl:  256px  (w-64)
```

**سایزهای جدید (30-50% بزرگتر):**
```typescript
sm:   128px  (w-32)  ← +32px
md:   192px  (w-48)  ← +64px
lg:   256px  (w-64)  ← +64px
xl:   320px  (w-80)  ← +64px
xxl:  384px  (w-96)  ← جدید! ⭐
```

---

### 2. **Eye Blink Animation** 👁️

Lumi حالا پلک می‌زند!

**فرکانس:**
- هر 3-5 ثانیه (تصادفی)
- مدت زمان: 150ms
- طبیعی و واقع‌گرایانه

**پیاده‌سازی:**
```typescript
const [isBlinking, setIsBlinking] = useState(false);

useEffect(() => {
  const blinkInterval = setInterval(() => {
    setIsBlinking(true);
    setTimeout(() => setIsBlinking(false), 150);
  }, Math.random() * 2000 + 3000); // 3-5 sec

  return () => clearInterval(blinkInterval);
}, []);
```

**Visual Effect:**
```typescript
{isBlinking && (
  <motion.div
    className="absolute inset-0"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <div style={{
      background: "linear-gradient(
        to bottom, 
        transparent 35%, 
        rgba(255,255,255,0.3) 40%, 
        rgba(255,255,255,0.3) 45%, 
        transparent 50%
      )"
    }} />
  </motion.div>
)}
```

**تأثیر:**
- Overlay نیمه‌شفاف روی چشم‌ها
- Gradient از بالا به پایین
- محل چشم‌ها: 35-50% از بالا
- رنگ: سفید با 30% opacity

---

### 3. **Lip Sync Animation** 💋

دهان Lumi با صحبت sync می‌شود!

**وقتی فعال است:**
```typescript
<LumiAvatar speaking={isSpeaking} />
```

**Animation:**
```typescript
// Body bounce (قبلی بهبود یافته)
const speakingAnimation = speaking ? {
  scale: [1, 1.03, 0.98, 1.02, 1],
  transition: {
    duration: 0.4,
    repeat: Infinity,
    ease: "easeInOut"
  }
} : {};

// Mouth glow (جدید!)
{speaking && (
  <motion.div
    style={{
      bottom: "35%",
      left: "50%",
      width: "15%",
      height: "8%",
      background: "radial-gradient(
        circle, 
        rgba(255, 182, 193, 0.6) 0%, 
        transparent 70%
      )"
    }}
    animate={{
      opacity: [0.3, 0.8, 0.4, 0.9, 0.3],
      scale: [1, 1.2, 0.9, 1.15, 1],
    }}
    transition={{
      duration: 0.4,
      repeat: Infinity,
    }}
  />
)}
```

**Visual Effect:**
- Glow صورتی روی دهان
- Pulse و scale همزمان
- 4 مرحله animation (varied)
- Sync با body bounce

---

## 🎨 تمام Animations

### 1. Float (شناور) — همیشه فعال ✅
```typescript
animate: {
  y: [0, -12, 0],  // ← افزایش یافته (قبلاً -8)
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut"
  }
}
```

**تأثیر:** Lumi آرام بالا و پایین می‌رود  
**مدت:** 3 ثانیه (1.5s بالا، 1.5s پایین)  
**مقدار:** 12px (افزایش یافته برای visibility بهتر)

---

### 2. Blink (پلک زدن) — همیشه فعال ⭐ جدید!
```typescript
// Random interval: 3-5 seconds
setInterval(() => {
  setIsBlinking(true);
  setTimeout(() => setIsBlinking(false), 150);
}, Math.random() * 2000 + 3000);
```

**تأثیر:** پلک می‌زند مثل انسان  
**فرکانس:** 3-5 ثانیه (تصادفی)  
**مدت:** 150ms  
**محل:** روی چشم‌ها (35-50% از بالا)

---

### 3. Speaking (صحبت کردن) — وقتی حرف می‌زند ⭐ بهبود یافته!
```typescript
// Body Animation
scale: [1, 1.03, 0.98, 1.02, 1]
duration: 0.4s (سریعتر از قبل)
4 stages (پیچیده‌تر)

// Mouth Glow Animation (NEW!)
opacity: [0.3, 0.8, 0.4, 0.9, 0.3]
scale: [1, 1.2, 0.9, 1.15, 1]
duration: 0.4s
```

**تأثیر:** 
- Body: bounce ملایم
- Mouth: glow و pulse
- Sync: با Web Speech API

---

### 4. Breathing (تنفس) — فقط در Breath Sync ✅
```typescript
// Glow Animation
scale: [1, 1.1, 1]
opacity: [0.3, 0.6, 0.3]
duration: 4s

// Shadow Animation
filter: drop-shadow(0 0 30px rgba(135, 206, 235, 0.7))
// (قبلاً 20px)
```

**تأثیر:**
- Glow بزرگتر و روشن‌تر می‌شود
- Drop shadow قوی‌تر
- 4 ثانیه (3s in + 1s out)

---

### 5. Antenna Pulse — همیشه فعال ✅
```typescript
// گوی آبی روی آنتن
opacity: [0.6, 1, 0.6]
scale: [1, 1.1, 1]
duration: 2s
```

**تأثیر:** گوی آبی pulse می‌کند  
**رنگ:** Sky blue (#87CEEB)  
**مدت:** 2 ثانیه

---

## 📊 مقایسه قبل/بعد

### سایز:
| Size | قبل | الان | افزایش |
|------|-----|------|---------|
| sm | 96px | 128px | +33% |
| md | 128px | 192px | +50% |
| lg | 192px | 256px | +33% |
| xl | 256px | 320px | +25% |
| xxl | — | 384px | ⭐ جدید |

### Animations:
| Animation | قبل | الان |
|-----------|-----|------|
| Float | 8px | 12px ✅ |
| Blink | ❌ | ✅ هر 3-5s |
| Speaking | Simple bounce | Body + Mouth glow ✅ |
| Breathing | 20px shadow | 30px shadow ✅ |
| Glow | 100% | 120% ✅ |

---

## 🎯 استفاده در صفحات

### Teacher Dashboard:
```tsx
<LumiAvatar 
  size="xxl"        // ← بزرگترین!
  emotion="happy" 
  speaking={isSpeaking} 
/>
```
**انیمیشن‌ها:**
- ✅ Float
- ✅ Blink
- ✅ Speaking (body + mouth)
- ✅ Antenna pulse

---

### Feelings Check-in:
```tsx
<LumiAvatar 
  size="xl"         // ← بزرگ
  emotion="calm" 
  speaking={isSpeaking} 
/>
```
**انیمیشن‌ها:**
- ✅ Float
- ✅ Blink
- ✅ Speaking
- ✅ Antenna pulse

---

### Breath Sync:
```tsx
<LumiAvatar 
  size="xxl"        // ← بزرگترین
  emotion="calm" 
  breathing         // ← اضافه!
  speaking={isSpeaking}
/>
```
**انیمیشن‌ها:**
- ✅ Float
- ✅ Blink
- ✅ Speaking
- ✅ **Breathing** (glow + shadow)
- ✅ Antenna pulse

---

### Scenario:
```tsx
<LumiAvatar 
  size="xxl" 
  emotion="thinking" 
  speaking={isSpeaking} 
/>
```
**انیمیشن‌ها:**
- ✅ Float
- ✅ Blink
- ✅ Speaking
- ✅ Antenna pulse

---

### Closing:
```tsx
<LumiAvatar 
  size="xxl" 
  emotion="happy" 
  speaking={isSpeaking} 
/>
```
**انیمیشن‌ها:**
- ✅ Float
- ✅ Blink
- ✅ Speaking
- ✅ Antenna pulse
- ✅ Extra glow (custom wrapper)

---

## 🎨 در Figma چگونه بسازیم?

### Eye Blink:

**قدم 1: Layer Setup**
```
1. Lumi base layer
2. Eye overlay layer (بالای همه)
3. نام: "Eye Blink"
```

**قدم 2: Design**
```
Rectangle:
  - Width: 100%
  - Height: 15% (محل چشم‌ها)
  - Position: 35% از بالا
  
Gradient Fill:
  - Top (0%): Transparent
  - Eye area (35-50%): White @ 30%
  - Bottom (100%): Transparent
```

**قدم 3: Prototype**
```
Trigger: After Delay
Delay: 3000ms (random 3-5s)
Action: Show/Hide
Duration: 150ms
Loop: Yes
```

---

### Lip Sync:

**قدم 1: Mouth Glow Layer**
```
Ellipse:
  - Width: 15% of Lumi
  - Height: 8% of Lumi
  - Position: Bottom 35%, Center X
  
Fill: Radial Gradient
  - Center: rgba(255, 182, 193, 0.6)
  - Edge: Transparent
  
Blur: 10px
```

**قدم 2: Variant**
```
Property: Speaking
  - false: Hidden
  - true: Visible + Animated
```

**قدم 3: Prototype (Speaking=true)**
```
Animation 1: Opacity
  - Keyframe 1: 0.3
  - Keyframe 2: 0.8
  - Keyframe 3: 0.4
  - Keyframe 4: 0.9
  - Duration: 400ms
  - Loop: Yes

Animation 2: Scale
  - Keyframe 1: 1.0
  - Keyframe 2: 1.2
  - Keyframe 3: 0.9
  - Keyframe 4: 1.15
  - Duration: 400ms
  - Loop: Yes
```

---

### Size Variants:

**Component Structure:**
```
Lumi Component
├── Size Property
│   ├── sm (128×128)
│   ├── md (192×192)
│   ├── lg (256×256)
│   ├── xl (320×320)
│   └── xxl (384×384) ⭐ NEW
├── Emotion Property
│   ├── happy
│   ├── calm
│   ├── neutral
│   └── thinking
└── State Property
    ├── normal
    ├── speaking
    └── breathing
```

**Auto Layout:**
```
Resize: Scale proportionally
Constraints: Center
Padding: 0
Gap: 0
```

---

## 💡 Performance Tips

### 1. **Blink Optimization:**
```typescript
// ✅ Good: Cleanup interval
useEffect(() => {
  const interval = setInterval(...);
  return () => clearInterval(interval);
}, []);

// ❌ Bad: Memory leak
useEffect(() => {
  setInterval(...); // No cleanup!
}, []);
```

---

### 2. **Animation Layering:**
```typescript
// ✅ Good: Separate layers
<div>                      {/* Float */}
  <div>                    {/* Glow */}
    <div>                  {/* Speaking */}
      <img />              {/* Lumi */}
      {blink && <div />}   {/* Blink */}
      {speaking && <div />} {/* Lip */}
    </div>
  </div>
</div>

// ❌ Bad: All in one
<motion.img animate={allAnimations} />
```

---

### 3. **Conditional Rendering:**
```typescript
// ✅ Good: Only when needed
{speaking && <LipSyncGlow />}
{isBlinking && <BlinkOverlay />}

// ❌ Bad: Always rendered
<LipSyncGlow opacity={speaking ? 1 : 0} />
<BlinkOverlay opacity={isBlinking ? 1 : 0} />
```

---

## 📐 Technical Specs

### Blink Overlay:
```css
Position: Absolute
Width: 100%
Height: 100%
Background: linear-gradient(
  to bottom,
  transparent 35%,
  rgba(255,255,255,0.3) 40%,
  rgba(255,255,255,0.3) 45%,
  transparent 50%
)
Z-index: 10
Pointer-events: none
```

### Lip Sync Glow:
```css
Position: Absolute
Bottom: 35%
Left: 50%
Transform: translateX(-50%)
Width: 15%
Height: 8%
Background: radial-gradient(
  circle,
  rgba(255, 182, 193, 0.6) 0%,
  transparent 70%
)
Border-radius: 50%
Z-index: 5
Pointer-events: none
```

### Glow (Enhanced):
```css
Position: Absolute
Inset: 0
Width: 120%  /* ← بزرگتر */
Height: 120% /* ← بزرگتر */
Background: var(--lumi-glow)
Blur: 3xl (80px)
Z-index: -1
```

---

## ✅ Checklist

### Implementation:
- [x] سایزها افزایش یافتند (+30-50%)
- [x] Size "xxl" اضافه شد (384px)
- [x] Eye blink animation
- [x] Lip sync glow
- [x] Speaking animation بهبود یافت
- [x] Float افزایش یافت (12px)
- [x] Glow بزرگتر شد (120%)
- [x] Shadow قوی‌تر شد (30px)

### All Pages Updated:
- [x] Teacher Dashboard (xxl)
- [x] Feelings Check-in (xl)
- [x] Breath Sync (xxl + breathing)
- [x] Scenario (xxl)
- [x] Closing (xxl)

### Figma Guide:
- [x] Eye blink راهنما
- [x] Lip sync راهنما
- [x] Size variants
- [x] Prototype animations
- [x] Performance tips

---

## 🚀 Next Steps

### برای توسعه‌دهندگان:
1. ✅ همه animations implemented
2. ✅ همه صفحات updated
3. Test در browsers مختلف
4. بررسی performance

### برای طراحان:
1. Figma components بسازید
2. Prototype animations اضافه کنید
3. Export برای مستندسازی
4. Share با تیم

---

**Lumi حالا زنده‌تر، بزرگتر، و جذاب‌تر است! 🌟**

موفق باشید! 💙
