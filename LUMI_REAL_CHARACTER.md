# 🌟 Lumi — کاراکتر واقعی و صحبت کردن

> Lumi حالا دقیقاً مثل تصویر است و می‌تواند صحبت کند!

---

## ✅ چه چیزی تغییر کرد؟

### 1. **تصویر واقعی Lumi**
- ✅ SVG placeholder حذف شد
- ✅ تصویر واقعی Lumi (پشمالو سفید با پاپیون و آنتن) اضافه شد
- ✅ Glow effect اطراف Lumi
- ✅ Drop shadow برای عمق

### 2. **قابلیت صحبت کردن**
- ✅ Web Speech API برای Finnish (fi-FI)
- ✅ Lumi در هر صفحه صحبت می‌کند
- ✅ انیمیشن وقتی صحبت می‌کند (bounce کوچک)
- ✅ دکمه Mute/Unmute
- ✅ دکمه Repeat برای تکرار

---

## 📸 Lumi واقعی

### قبل (SVG):
```
• ساده
• نه واقعی
• خیلی basic
```

### الان (Real Image):
```
✨ موجود پشمالو سفید حرفه‌ای
🎀 پاپیون صورتی روی سر
📡 آنتن با گوی آبی نورانی
👀 چشم‌های بزرگ آبی gradient
😊 دهان باز و خوشحال
🌟 Glow effect زیبا
💎 Drop shadow برای عمق
🎨 Fluffy texture واقعی
```

---

## 🎤 قابلیت صحبت کردن

### در هر صفحه:

**Teacher Dashboard:**
```typescript
speak("Tervetuloa Lumin kanssa! Aloitetaan yhdessä.");
```

**Feelings Check-in:**
```typescript
speak("Miltä sinusta tuntuu tänään? Valitse tunne.");
```

**Breath Sync:**
```typescript
speak("Hengitetään yhdessä rauhallisesti. Seuraa ympyrää.");
```

**Scenario:**
```typescript
speak("Kaksi lasta haluaa samaa lelua. Mitä voimme tehdä?");
```

**Closing:**
```typescript
speakLines([
  "Hienoa työtä tänään!",
  "Muistakaa harjoitella näitä taitoja.",
  "Nähdään pian taas!"
], 1000);
```

---

## 🎬 Animations

### Float (همیشه فعال):
```typescript
y: [0, -8, 0]
duration: 3s
continuous loop
```

### Speaking (وقتی صحبت می‌کند):
```typescript
scale: [1, 1.02, 1]
duration: 0.3s
continuous while speaking
```

### Breathing (فقط در Breath Sync):
```typescript
glow scale: [1, 1.1, 1]
duration: 4s
continuous loop
```

---

## 🎨 برای Figma

### تصویر Lumi:

**Import این تصویر را در Figma:**
- تصویر: موجود سفید پشمالو
- پاپیون: بالای سر
- آنتن: با حباب آبی نورانی
- چشم‌ها: بزرگ، آبی، مهربان
- دهان: لبخند کوچک یا باز (بسته به emotion)

**Glow Effect:**
```
Layer پشت Lumi:
- Ellipse: 300×300px
- Radial gradient: Sky blue (#87CEEB) 30%
- Blur: 80px
- Opacity: 30%
```

**Drop Shadow:**
```
Effect:
- Y offset: 10px
- Blur: 20px
- Color: #87CEEB 30%
```

---

## 📐 Sizes د�� کد:

```typescript
sm: 96×96px   (w-24)
md: 128×128px (w-32)
lg: 192×192px (w-48)
xl: 256×256px (w-64)
```

**در Figma همین sizes را استفاده کنید!**

---

## 🎯 Props جدید LumiAvatar:

```typescript
interface LumiAvatarProps {
  size?: "sm" | "md" | "lg" | "xl";
  emotion?: "neutral" | "happy" | "calm" | "thinking";
  breathing?: boolean;    // NEW!
  speaking?: boolean;     // NEW!
  className?: string;
}
```

### استفاده:

```tsx
{/* Normal */}
<LumiAvatar size="xl" emotion="happy" />

{/* Speaking */}
<LumiAvatar size="xl" emotion="happy" speaking={isSpeaking} />

{/* Breathing */}
<LumiAvatar size="xl" emotion="calm" breathing />

{/* Both */}
<LumiAvatar size="xl" emotion="calm" breathing speaking={isSpeaking} />
```

---

## 🎙 Speech Service

### useSpeech hook:

```typescript
const { 
  speak,        // صحبت کردن
  speakLines,   // چند خط با pause
  cancel,       // توقف
  pause,        // مکث
  resume,       // ادامه
  toggleMute,   // mute/unmute
  isSpeaking,   // آیا الان صحبت می‌کند؟
  isMuted       // آیا mute است؟
} = useSpeech();
```

### مثال:

```typescript
// یک جمله
speak("Tervetuloa!");

// چند جمله با pause
await speakLines([
  "Hienoa työtä!",
  "Muistakaa harjoitella.",
  "Nähdään!"
], 1000); // 1 second pause

// با options
speak("Hei!", {
  rate: 0.9,    // سرعت
  pitch: 1.1,   // pitch (بالاتر = دوستانه‌تر)
  volume: 1.0,  // volume
  onStart: () => console.log("Started"),
  onEnd: () => console.log("Finished")
});
```

---

## 🔊 Mute/Unmute

### در Teacher Dashboard:

```tsx
<button onClick={handleMuteToggle}>
  {isMuted ? (
    <VolumeX />
  ) : (
    <Volume2 />
  )}
</button>
```

**State با useSpeech sync می‌شود!**

---

## ✨ Emotions

در کد 4 emotion داریم:

```typescript
"neutral"   → حالت عادی
"happy"     → شاد (لبخند بزرگ)
"calm"      → آرام (لبخند کوچک)
"thinking"  → فکر می‌کند (نگاه کنجکاو)
```

**در Figma:**
- همان چهره Lumi
- فقط دهان تغییر می‌کند:
  - neutral: لبخند کوچک
  - happy: لبخند بزرگ
  - calm: لبخند ملایم
  - thinking: دهان کمی باز (تعجب)

---

## 🎨 در Figma چگونه بسازیم؟

### قدم 1: Import تصویر

```
1. تصویر Lumi را import کنید
2. در Frame 256×256px قرار دهید
3. Object-fit: Contain
```

### قدم 2: Glow Layer

```
1. Ellipse 300×300px
2. پشت تصویر (Send to Back)
3. Radial gradient:
   - Center: #87CEEB 30%
   - Outer: Transparent
4. Blur: 80px
```

### قدم 3: Component

```
1. گروه کنید
2. Create Component
3. Variants:
   - Size: sm, md, lg, xl
   - Emotion: neutral, happy, calm, thinking
   - State: normal, speaking, breathing
```

### قدم 4: Animations (Prototype)

```
Speaking state:
- Scale: 1.0 → 1.02
- Duration: 300ms
- Loop

Breathing state:
- Glow scale: 1.0 → 1.1
- Duration: 4000ms
- Loop
```

---

## 📊 مقایسه

| Feature | قبل | الان |
|---------|-----|------|
| Character | SVG basic | تصویر واقعی ✅ |
| Glow | CSS basic | Radial gradient + blur ✅ |
| Speech | ❌ | Web Speech API ✅ |
| Speaking animation | ❌ | Bounce ✅ |
| Mute/Unmute | ❌ | ✅ |
| Repeat | ❌ | ✅ |
| Emotions | 4 simple | 4 با جزئیات ✅ |
| Finnish voice | ❌ | fi-FI ✅ |

---

## ✅ Checklist

### تصویر:
- [x] تصویر واقعی Lumi import شد
- [x] Glow effect اضافه شد
- [x] Drop shadow برای عمق
- [x] 4 size: sm/md/lg/xl

### Speech:
- [x] Web Speech API setup
- [x] Finnish (fi-FI) voice
- [x] useSpeech hook
- [x] Mute/Unmute button
- [x] Repeat button
- [x] Speaking animation

### Screens:
- [x] Teacher Dashboard — speaks welcome
- [x] Feelings Check-in — asks about feelings
- [x] Breath Sync — guides breathing
- [x] Scenario — teaches skills
- [x] Closing — celebrates success

---

## 🚀 Test کنید

1. **صفحه اصلی باز کنید**
2. **دکمه "Aloita istunto" کلیک کنید**
3. **Lumi باید بگوید:** "Tervetuloa Lumin kanssa! Aloitetaan yhdessä."
4. **به Feelings Check-in برو**
5. **Lumi باید بگوید:** "Miltä sinusta tuntuu tänään?"

✅ **اگر Lumi صحبت کرد → موفق!**  
❌ **اگر صحبت نکرد → browser settings را check کنید**

---

## 🎯 نکات مهم

### برای Browser:
- ✅ Chrome: عالی
- ✅ Edge: عالی
- ⚠️ Safari: ممکن است نیاز به permission باشد
- ⚠️ Firefox: ممکن است voice ضعیف باشد

### برای Production:
- Voice ممکن است متفاوت باشد بسته به browser
- Finnish voices ممکن است محدود باشند
- برای production: voice files record کنید

---

**Lumi حالا زنده است و صحبت می‌کند! 🌟**

موفق باشید! 💙
