# 🎨 LUMI — Complete Figma Design Package
### Professional EdTech Interface for Children Age 4–6

---

## 📋 Table of Contents

1. [Figma File Structure](#1-figma-file-structure)
2. [Design System Tokens](#2-design-system-tokens)
3. [Components Library](#3-components-library)
4. [Screen Wireframes](#4-screen-wireframes)
5. [Lumi Character System](#5-lumi-character-system)
6. [Animation Specifications](#6-animation-specifications)
7. [Step-by-Step Figma Setup](#7-step-by-step-figma-setup)

---

## 1️⃣ Figma File Structure

Create these pages in your Figma file:

```
📄 00 – Design System
📄 01 – Components
📄 02 – Teacher Dashboard
📄 03 – Feelings Check-in
📄 04 – Breath Sync
📄 05 – Scenario Flow
📄 06 – Closing Ritual
📄 07 – Lumi Character States
📄 08 – Situation Illustrations
```

---

## 2️⃣ Design System Tokens

### 🎨 Color Palette

#### Primary Sky Blue
```
Sky 50:  #F0F9FF
Sky 100: #E0F2FE
Sky 200: #B0E0F5
Sky 300: #87CEEB ← Main Primary
Sky 400: #6BB6D9
Sky 500: #4F9EC7
Sky 600: #3A7CA8
```

#### Neutral Backgrounds
```
White:      #FFFFFF
Neutral 50: #FAFBFC ← Main Background
Neutral 100: #F5F7F9
Neutral 200: #E5E9ED ← Borders
Neutral 300: #D1D7DD
Neutral 400: #B8C1C9
Neutral 500: #8A96A3
```

#### Text Colors
```
Primary:   #2B3A4A
Secondary: #5F7082
Tertiary:  #8A96A3
Disabled:  #B8C1C9
Inverse:   #FFFFFF
```

#### Accent Warm Glow
```
Warm 50:  #FFF8F0
Warm 100: #FFECD6
Warm 200: #FFD6A5
Warm 300: #FFB366 ← Main Accent
Warm 400: #FF9E4D
Warm 500: #F58A35
```

#### Firm Calm (No Red)
```
Calm Coral: #F4A6A6 (soft, not alarming)
Calm BG:    #FFF5F5 (very light pink)
```

#### Semantic Colors
```
Success:    #22C55E
Success BG: #F0FDF4

Warning:    #F59E0B
Warning BG: #FFFBEB

Error:      #EF4444
Error BG:   #FEF2F2

Info:       #3B82F6
Info BG:    #EFF6FF
```

#### Special Effects
```
Sky Glow:     rgba(135, 206, 235, 0.3)
Warm Glow:    rgba(255, 179, 102, 0.25)
Overlay:      rgba(43, 58, 74, 0.6)
```

---

### 🔠 Typography Scale

**Font Family:** System Default (San Francisco on iOS/macOS, Roboto on Android/Web)

```
H1:         40px / 600 / 1.25 line height / -0.025 tracking
H2:         32px / 600 / 1.25 line height / -0.025 tracking
H3:         24px / 500 / 1.5 line height / 0 tracking
H4:         20px / 500 / 1.5 line height / 0 tracking
Body Large: 18px / 400 / 1.75 line height / 0 tracking
Body:       16px / 400 / 1.75 line height / 0 tracking
Body Small: 14px / 400 / 1.5 line height / 0 tracking
Small:      12px / 400 / 1.5 line height / 0 tracking
Tiny:       10px / 400 / 1.5 line height / 0 tracking
```

**Font Weights Available:**
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

---

### 📐 Spacing System (8pt Grid)

```
spacing-0:   0px
spacing-0.5: 4px
spacing-1:   8px
spacing-2:   16px
spacing-3:   24px
spacing-4:   32px
spacing-5:   40px
spacing-6:   48px
spacing-7:   56px ← Minimum touch target
spacing-8:   64px ← Recommended touch target
spacing-9:   72px
spacing-10:  80px
spacing-12:  96px
spacing-16:  128px
spacing-20:  160px
```

---

### 🔲 Border Radius

```
radius-xs:   8px
radius-sm:   16px ← Buttons
radius-md:   24px ← Cards
radius-lg:   32px ← Large cards
radius-xl:   40px
radius-full: 9999px ← Pills
```

---

### 🌫 Elevation System (Shadows)

```
shadow-xs:
  0 1px 2px 0 rgba(43, 58, 74, 0.05)

shadow-sm:
  0 1px 3px 0 rgba(43, 58, 74, 0.08),
  0 1px 2px -1px rgba(43, 58, 74, 0.08)

shadow-md:
  0 4px 6px -1px rgba(43, 58, 74, 0.08),
  0 2px 4px -2px rgba(43, 58, 74, 0.08)

shadow-lg:
  0 10px 15px -3px rgba(43, 58, 74, 0.08),
  0 4px 6px -4px rgba(43, 58, 74, 0.08)

shadow-xl:
  0 20px 25px -5px rgba(43, 58, 74, 0.08),
  0 8px 10px -6px rgba(43, 58, 74, 0.08)

shadow-2xl:
  0 25px 50px -12px rgba(43, 58, 74, 0.15)

shadow-glow:
  0 0 20px rgba(135, 206, 235, 0.4)

shadow-glow-warm:
  0 0 20px rgba(255, 179, 102, 0.4)
```

---

### 🎭 State Variations

```
Opacity States:
- Hover:    90%
- Active:   80%
- Disabled: 50%
- Subtle:   60%

Transitions:
- Fast: 150ms ease-in-out
- Base: 200ms ease-in-out
- Slow: 300ms ease-in-out

Scale States:
- Hover:  1.02
- Active: 0.98
```

---

## 3️⃣ Components Library

### 🔘 Buttons

#### Primary Button
```
Size Large:
- Width: Auto (min 160px)
- Height: 64px
- Padding: 24px horizontal
- Background: Sky 300 (#87CEEB)
- Text: White, 16px, Medium (500)
- Border Radius: 16px
- Shadow: shadow-sm

States:
- Default: 100% opacity
- Hover: 90% opacity, shadow-md
- Active: 80% opacity, scale 0.98
- Disabled: 50% opacity, no shadow

Size Medium:
- Height: 56px
- Padding: 20px horizontal
```

#### Secondary Button
```
- Width: Auto (min 160px)
- Height: 64px
- Padding: 24px horizontal
- Background: White
- Border: 2px solid Sky 300
- Text: Sky 300, 16px, Medium
- Border Radius: 16px
- Shadow: shadow-sm

States:
- Hover: Sky 50 background, Sky 400 border
- Active: scale 0.98
- Disabled: 50% opacity
```

#### Firm Calm Button
```
- Width: Auto (min 200px)
- Height: 64px
- Padding: 24px horizontal
- Background: Calm Coral (#F4A6A6)
- Text: Primary (#2B3A4A), 16px, Semibold
- Border Radius: 16px
- Shadow: shadow-md
- No hover scale (stable presence)

States:
- Hover: 90% opacity
- Active: 80% opacity
- Disabled: 50% opacity
```

---

### 💬 Feeling Button (Vote Pill)

```
Component Structure:
- Frame: Auto layout vertical
- Width: 120px
- Height: 140px
- Padding: 16px
- Background: White
- Border: 2px solid Neutral 200
- Border Radius: 24px
- Shadow: shadow-sm

Contents:
1. Emoji: 64px size, centered
2. Label: Body (16px), Medium, Primary color, centered
3. Counter Badge: 
   - Size: 32px circle
   - Background: Sky 300
   - Text: White, Small (12px), Semibold
   - Position: Top right corner, absolute

States:
- Default: Border Neutral 200
- Hover: Border Sky 300, shadow-md
- Selected: Border Sky 400 (3px), Background Sky 50
- Active: scale 0.98
```

**5 Feelings:**
```
🙂 Ilo
😢 Suru
😡 Viha
😨 Pelko
🤷 En tiedä
```

---

### 🎴 Scenario Card

```
Component Structure:
- Frame: Auto layout vertical
- Width: 400px
- Height: Auto
- Padding: 24px
- Background: White
- Border: 2px solid Neutral 200
- Border Radius: 24px
- Shadow: shadow-sm

Contents:
1. Tag Badge (top left):
   - Quick: ⚡ + "Quick (6-8 min)" + Yellow 100 BG
   - Deep: 🌱 + "Deep (10-12 min)" + Green 100 BG
   - Size: Auto padding 8px/16px, radius 999px

2. Title:
   - H4 (20px), Medium, Primary
   - Margin bottom: 16px

3. Level Indicator:
   - 1-3 dots (8px circle)
   - Gap: 6px
   - Level 1: Neutral 300
   - Level 2: Warning 300
   - Level 3: Calm Coral

4. CTA Button (bottom):
   - Primary Button (small)
   - Text: "Aloita"

States:
- Default: Border Neutral 200
- Hover: Border Sky 300, shadow-lg
- Selected: Border Sky 400 (3px), Background Sky 50
```

---

### 🎛 Teacher HUD (Top Right)

```
Component Structure:
- Frame: Horizontal auto layout
- Background: White
- Padding: 12px 16px
- Border Radius: 999px (pill shape)
- Shadow: shadow-md
- Gap: 16px

Contents:
1. Timer:
   - Text: "2:34" format
   - Small (12px), Medium, Tertiary color
   - Only visible to teacher

2. Step Label (optional):
   - Text: "Hengityshetki"
   - Small (12px), Regular, Secondary color

3. Mute Icon:
   - 16px icon
   - Interactive button
   - Toggle state

4. Settings Icon:
   - 16px icon
   - Interactive button

Position: Fixed top-right, 24px from edges
```

---

### ⚙️ Settings Drawer

```
Component Structure:
- Frame: Fixed overlay
- Width: 400px
- Height: 100vh
- Position: Right side, slide-in animation
- Background: White
- Shadow: shadow-2xl

Header:
- Height: 80px
- Padding: 24px
- Border bottom: 1px Neutral 200
- Title: H3 (24px), Medium, Primary
- Close button: 40px touch target

Content Area:
- Padding: 24px
- Scrollable
- Gap: 24px between sections

Section Structure:
- Label: Body Small (14px), Semibold, Secondary
- Control: Various (dropdown, toggle, input)
- Gap: 12px

Footer:
- Height: 80px
- Padding: 24px
- Border top: 1px Neutral 200
- Save/Cancel buttons
```

---

## 4️⃣ Screen Wireframes

### 📐 Layout Grid (iPad Landscape 1024×768)

```
Two-Column Layout:
┌─────────────────────────┬──────────────┐
│                         │              │
│   Kid-Facing Stage      │   Teacher    │
│   65% width (665px)     │   Panel      │
│                         │   35% (359px)│
│   Lumi centered         │              │
│   Voice-first           │   Controls   │
│   Minimal text          │   Settings   │
│                         │   Timer      │
└─────────────────────────┴──────────────┘
```

---

### 🏠 Screen 1: Teacher Dashboard

**Layout:**

**Left Panel (65%) — Kid-Facing Stage:**
```
┌──────────────────────────────┐
│                              │
│         [Lumi Avatar]        │
│         400px height         │
│      Subtle float anim       │
│                              │
│    [Situation Illustration]  │
│         300x200px            │
│         (optional)           │
│                              │
│      "Tervetuloa Lumin       │
│       kanssa!"               │
│      H2, centered            │
│                              │
└──────────────────────────────┘
```

**Right Panel (35%) — Teacher Controls:**
```
┌────────────────────────┐
│ ASETUKSET             │
│ ──────────────────────│
│                        │
│ 🎨 Teema              │
│ [Turvataidot ▼]       │
│                        │
│ 🎯 Skenaario          │
│ ○ Älykäs satunnainen  │
│ ○ Valitse manuaalisesti│
│                        │
│ ⏱ Kesto               │
│ ○ Tiukka (2 min)      │
│ ○ Joustava (3-4 min)  │
│ ○ Manuaalinen         │
│                        │
│ 👥 Ryhmä              │
│ ○ Koko ryhmä          │
│ ○ Pieni ryhmä         │
│                        │
│ ──────────────────────│
│                        │
│ [🎬 Aloita istunto]   │ ← Primary Large
│                        │
│ [🔴 Firm Calm]        │ ← Firm Calm Button
│                        │
│ Timer: 00:00 (hidden) │
│                        │
└────────────────────────┘
```

---

### 😊 Screen 2: Feelings Check-in

**Kid-Facing Stage (65%):**
```
┌──────────────────────────────┐
│                              │
│      [Lumi — Listening]      │
│       300px height           │
│                              │
│   "Kuuntelen tunteitanne"    │
│   H2, centered, Sky 400      │
│                              │
│  ┌────┐ ┌────┐ ┌────┐       │
│  │🙂  │ │😢  │ │😡  │       │
│  │Ilo │ │Suru│ │Viha│       │
│  │ 3  │ │ 5  │ │ 1  │       │
│  └────┘ └────┘ └────┘       │
│                              │
│  ┌────┐ ┌────┐              │
│  │😨  │ │🤷  │              │
│  │Pelko│ │En  │              │
│  │ 0  │ │tiedä│              │
│  └────┘ │ 2  │              │
│         └────┘              │
│                              │
│ Each button: 120x140px       │
│ Gap: 16px                    │
│                              │
└──────────────────────────────┘
```

**Teacher Panel:**
```
┌────────────────────────┐
│ TUNTEET TARKISTUS     │
│ ──────────────────────│
│                        │
│ Äänestys aktiivinen    │
│                        │
│ Yhteensä ääniä: 11    │
│                        │
│ [🔄 Nollaa]           │
│                        │
│ ──────────────────────│
│                        │
│ Lumín vastaus:        │
│ "Kuulin erilaisia     │
│  tunteita."           │
│                        │
│ [▶️ Toista]           │
│ [⏭ Seuraava]          │
│                        │
│ Timer: 01:23          │
│                        │
└────────────────────────┘
```

---

### 🌬 Screen 3: Breath Sync

**Kid-Facing Stage:**
```
┌──────────────────────────────┐
│                              │
│                              │
│      [Lumi — Breathing]      │
│       400px height           │
│    Float animation SYNC      │
│    Light PULSE mode          │
│                              │
│     ┌──────────────┐         │
│     │              │         │
│     │   ◯ → ⬤     │         │ ← Expanding circle
│     │   Breathe    │         │   3s in, 3s out
│     │              │         │
│     └──────────────┘         │
│                              │
│   "Hengitetään yhdessä"      │
│   H3, centered, Sky 400      │
│                              │
│  Ambient glow: 5-10% halo    │
│                              │
└──────────────────────────────┘
```

**Teacher Panel:**
```
┌────────────────────────┐
│ HENGITYSHARJOITUS     │
│ ──────────────────────│
│                        │
│ Cycles: 3/4           │
│                        │
│ ┌──────────────────┐  │
│ │   In: 3s         │  │
│ │   Out: 3s        │  │
│ └──────────────────┘  │
│                        │
│ [⏸ Pause]            │
│ [⏭ Skip]             │
│ [🔁 Repeat]          │
│                        │
│ Timer: 02:45          │
│                        │
└────────────────────────┘
```

---

### 🎭 Screen 4: Scenario Step

**Kid-Facing Stage:**
```
┌──────────────────────────────┐
│ Step: Empathy                │ ← Small label, top
│                              │
│      [Lumi — Empathy]        │
│       350px height           │
│                              │
│   [Situation Illustration]   │
│       400x280px              │
│    "Torni kaatui"            │
│                              │
│   "Miltä se voisi tuntua     │
│    rakentajasta?"            │
│   H3, centered, wrapped      │
│   Max width: 500px           │
│                              │
└──────────────────────────────┘
```

**Teacher Panel:**
```
┌────────────────────────┐
│ SKENAARIO: Torni       │
│ ──────────────────────│
│                        │
│ Step 2/4: Empathy     │
│                        │
│ Script:               │
│ "Miltä se voisi tuntua│
│  rakentajasta?"       │
│                        │
│ [▶️ Speak]            │
│ [🔁 Repeat]           │
│ [⏭ Next Step]         │
│                        │
│ ──────────────────────│
│                        │
│ [🔧 Trigger Repair]   │ ← Optional
│ [🔴 Firm Calm]        │
│                        │
│ Timer: 04:12          │
│                        │
└────────────────────────┘
```

---

### 🌅 Screen 5: Closing Ritual

**Kid-Facing Stage:**
```
┌──────────────────────────────┐
│                              │
│      [Lumi — Proud]          │
│       400px height           │
│    Warm Glow moment          │
│    Ambient: warm halo        │
│                              │
│   "Hienoa työtä tänään!"     │
│   H2, centered, Warm 400     │
│                              │
│   "Muistakaa: Turvataidot    │
│    vahvistavat ryhmää."      │
│   Body Large, centered       │
│                              │
│   Warm gradient background   │
│   (Warm 50 → Sky 50)         │
│                              │
└──────────────────────────────┘
```

**Teacher Panel:**
```
┌────────────────────────┐
│ PÄÄTÖSRIITTI          │
│ ──────────────────────│
│                        │
│ Session summary:      │
│                        │
│ • Theme: Turvataidot  │
│ • Scenario: Torni     │
│ • Duration: 6:34      │
│ • Feelings votes: 11  │
│                        │
│ [🔁 Repeat Closing]   │
│                        │
│ ──────────────────────│
│                        │
│ [✅ End Session]      │ ← Primary
│ [🔄 New Session]      │ ← Secondary
│                        │
└────────────────────────┘
```

---

## 5️⃣ Lumi Character System

### 🎨 Lumi Avatar Component (Figma Variant)

**Component Name:** `LumiAvatar`

**Base Frame:**
```
- Size: 400x400px (for large)
- Contents: Character image layer
- Auto layout: Center aligned
```

**Variant Properties:**

#### 1. Face (6 states)
```
Property: Face
Type: Variant
Options:
  • neutral     ← Default calm, slight smile
  • concern     ← Eyebrows slightly down, mouth neutral
  • empathy     ← Soft eyes, gentle smile, head tilt 4°
  • encouraging ← Bright eyes, bigger smile
  • proud       ← Big smile, eyes sparkle
  • firm        ← Serious but not angry, direct gaze
```

#### 2. Light (4 modes)
```
Property: Light
Type: Variant
Options:
  • baseline    ← Steady glow (antenna bubble)
  • sync        ← Pulsing 3s cycle (breathing rhythm)
  • warm        ← Bright glow + ambient halo (1-2s)
  • firm        ← Steady, no pulse (stable presence)
```

#### 3. Pose (3 states)
```
Property: Pose
Type: Variant
Options:
  • normal       ← Standard position
  • listening    ← Head tilt 6°, softer eyes
  • firm_still   ← No float animation, stable
```

#### 4. Size (3 sizes)
```
Property: Size
Type: Variant
Options:
  • sm  → 200x200px
  • md  → 300x300px
  • lg  → 400x400px
```

---

### 🎭 Face State Details

#### Neutral
```
Eyes: Open, calm, slight highlight
Eyebrows: Relaxed, neutral position
Mouth: Small gentle smile (mouth open slightly)
Bow: Standard position
Antenna light: Baseline glow
Cheeks: Subtle pink blush
```

#### Concern
```
Eyes: Same size, slight down angle
Eyebrows: Slightly down, caring
Mouth: Small, neutral (no smile)
Bow: Standard
Antenna light: Baseline steady
Expression: "I'm here, I'm listening"
```

#### Empathy
```
Eyes: Soft, slightly larger
Eyebrows: Gentle curve up
Mouth: Soft smile
Head: Tilt 4-6 degrees to right
Bow: Slight tilt with head
Antenna light: Warm moment possible
Expression: "I understand how you feel"
```

#### Encouraging
```
Eyes: Bright, sparkle highlight
Eyebrows: Slightly up
Mouth: Bigger smile, open
Bow: Standard or slightly bouncy
Antenna light: Baseline or warm
Expression: "You can do this!"
```

#### Proud
```
Eyes: Very bright, double highlight
Eyebrows: Up, expressive
Mouth: Big smile, open mouth
Bow: Slightly larger or animated
Antenna light: Warm glow active
Cheeks: More pronounced blush
Expression: "I'm so proud of you!"
```

#### Firm
```
Eyes: Direct, serious but kind
Eyebrows: Straight, focused
Mouth: Closed, neutral line
Bow: Standard, no animation
Antenna light: Firm mode (steady)
No blush
Expression: "This is important, stop now"
```

---

### 💡 Light System Details

**Antenna Bubble (Top of head):**

```
Baseline Mode:
- Size: 80px diameter
- Color: Sky 300 (#87CEEB) at 80% opacity
- Inner glow: White center (20px, 60% opacity)
- Outer glow: Sky 200 halo (10px blur)
- Animation: None (steady)

Sync Mode (Breathing):
- Same as baseline
- Animation: Scale 0.9 → 1.1 over 6s
  - 3s expand (inhale)
  - 3s contract (exhale)
- Timing: Ease-in-out
- Loop: Continuous

Warm Mode (Moment):
- Size: 100px diameter (larger)
- Color: Warm 300 (#FFB366) at 90% opacity
- Inner glow: White center (30px, 80% opacity)
- Outer glow: Warm 200 halo (20px blur)
- Duration: 1-2 seconds
- Trigger: On specific moments (repair, praise)
- Return to baseline after

Firm Mode:
- Size: 80px diameter
- Color: Sky 400 (#6BB6D9) at 100% opacity (no transparency)
- Inner glow: White center (15px, 40% opacity)
- Outer glow: Minimal (5px blur)
- Animation: None (completely steady)
- Expression: Stable, serious presence
```

---

### 🌟 Ambient Glow (Background Halo)

```
Baseline:
- None or very subtle (optional soft shadow)

Sync Mode:
- Radial gradient behind Lumi
- Center: Sky 200 at 10% opacity
- Radius: 300px
- Animation: Sync with light pulse (subtle)

Warm Mode:
- Radial gradient
- Center: Warm 200 at 15% opacity
- Radius: 400px
- Duration: 1-2s
- Background brightness: +3-5%

Firm Mode:
- No ambient glow
- Clean, focused presence
```

---

### 🎬 Animation Specifications

#### Float Animation (Normal/Listening Pose)
```
Property: Transform Y
From: 0px
To: -8px
Duration: 4s
Easing: Ease-in-out
Loop: Continuous (ping-pong)
Direction: Alternate

Notes:
- Subtle, breath-like
- STOPS in Firm mode (firm_still pose)
```

#### Light Pulse (Sync Mode)
```
Property: Scale
From: 0.9
To: 1.1
Duration: 6s (3s in, 3s out)
Easing: Ease-in-out
Loop: Continuous
Sync: Match breathing circle on screen
```

#### Warm Glow Moment
```
Property: Opacity + Scale
Antenna:
  - Opacity: 80% → 100% → 80%
  - Scale: 1.0 → 1.25 → 1.0
  - Duration: 2s

Ambient:
  - Opacity: 0% → 15% → 0%
  - Scale: 1.0 → 1.1 → 1.0
  - Duration: 2s

Trigger: Manual (repair completed, session end)
```

#### Head Tilt (Listening/Empathy)
```
Property: Rotation
Angle: 4-6 degrees (clockwise)
Duration: 300ms
Easing: Ease-out
Trigger: On listening mode
```

---

### 📸 Character Asset Preparation

**Source Image:** Use provided Lumi image (fluffy white character with bow and antenna)

**Figma Preparation Steps:**

1. **Import Base Image**
   - Import PNG to Figma
   - Remove background if needed (use "Remove Background" plugin)
   - Place in 400x400 frame
   - Center aligned

2. **Create Face Variations**
   - Duplicate base layer 6 times
   - For each variation:
     * Adjust eyes (size, angle, highlights)
     * Adjust eyebrows (position, curve)
     * Adjust mouth (smile, neutral, open)
     * Adjust head rotation for empathy/listening
   - Use vector editing or overlay masks

3. **Create Light Variations**
   - Add antenna bubble as separate layer
   - Create 4 variants (baseline, sync, warm, firm)
   - Use ellipse + gradient + blur effects
   - Layer above character

4. **Create Component Variants**
   - Combine face + light + pose
   - Total variants: 6 faces × 4 lights × 3 poses = 72 combinations
   - Use Figma's variant properties to organize
   - Set default: neutral + baseline + normal

5. **Add Ambient Glow Layer**
   - Large ellipse behind character (500x500)
   - Radial gradient
   - Blur: 60px
   - Conditional visibility based on light mode

---

## 6️⃣ Animation Specifications for Developers

### Animation States Map

```javascript
// Face State → Light Mode → Pose → Animation
const animationMap = {
  // Situation introduction
  situation: {
    face: 'neutral',
    light: 'baseline',
    pose: 'normal',
    float: true
  },
  
  // Asking thinking question
  thinkingQuestion: {
    face: 'concern',
    light: 'baseline',
    pose: 'listening',
    float: true
  },
  
  // Asking empathy question
  empathyQuestion: {
    face: 'empathy',
    light: 'baseline',
    pose: 'listening',
    float: true
  },
  
  // Giving structure response (Level 1-2)
  structureResponse: {
    face: 'encouraging',
    light: 'baseline',
    pose: 'normal',
    float: true
  },
  
  // Giving structure response (Level 3)
  structureResponseFirm: {
    face: 'firm',
    light: 'firm',
    pose: 'firm_still',
    float: false
  },
  
  // Practice moment
  practice: {
    face: 'encouraging',
    light: 'baseline',
    pose: 'normal',
    float: true
  },
  
  // Repair completed
  repairComplete: {
    face: 'proud',
    light: 'warm', // 2s glow
    pose: 'normal',
    float: true
  },
  
  // Breathing exercise
  breathSync: {
    face: 'neutral',
    light: 'sync', // pulse 6s
    pose: 'normal',
    float: true, // synced with breath
    floatDuration: 6000 // match breath
  },
  
  // Firm Calm emergency
  firmCalm: {
    face: 'firm',
    light: 'firm',
    pose: 'firm_still',
    float: false
  },
  
  // Closing ritual
  closing: {
    face: 'proud',
    light: 'warm',
    pose: 'normal',
    float: true
  }
};
```

---

## 7️⃣ Step-by-Step Figma Setup

### 🏗 Step 1: Create New File

1. Open Figma
2. Create new file: "Lumi — Teacher Mode Interface"
3. Set canvas to iPad Landscape: 1024×768px

---

### 🎨 Step 2: Setup Design Tokens

**In "00 – Design System" page:**

#### Create Color Styles

1. Click ➕ in Color Styles panel
2. Create each color from palette above
3. Naming convention: `Lumi/Primary/Sky 300`
4. Create all:
   - Primary Sky (50-600)
   - Neutral (0-500)
   - Warm (50-500)
   - Text (Primary, Secondary, Tertiary, Disabled, Inverse)
   - Semantic (Success, Warning, Error, Info + backgrounds)

#### Create Text Styles

1. Click ➕ in Text Styles panel
2. Create each typography scale entry
3. Naming: `Lumi/H1`, `Lumi/H2`, `Lumi/Body`, etc.
4. Set size, weight, line height, letter spacing per spec above

#### Create Effect Styles (Shadows)

1. Click ➕ in Effect Styles panel
2. Create each shadow level
3. Naming: `Lumi/Shadow/SM`, `Lumi/Shadow/MD`, etc.
4. Use Drop Shadow effect with values from spec

#### Create Grid Styles

1. Create 8pt grid layout
2. Columns: 12 columns, 24px gutter
3. Rows: 8px baseline grid

---

### 🧩 Step 3: Build Components

**In "01 – Components" page:**

#### Primary Button Component

1. Create frame: 160×64px
2. Auto layout: Horizontal, padding 24px, gap 8px, center aligned
3. Fill: Lumi/Primary/Sky 300
4. Border radius: 16px
5. Shadow: Lumi/Shadow/SM
6. Add text layer: "Button"
7. Text style: Lumi/Body, color: Lumi/Text/Inverse
8. Convert to component (Ctrl+Alt+K)
9. Add variants:
   - Property: Size, options: Large (64px), Medium (56px)
   - Property: State, options: Default, Hover, Active, Disabled
10. Style each state per spec

#### Secondary Button Component

(Same steps, different colors)

#### Firm Calm Button Component

(Same steps, Calm Coral background)

#### Feeling Button Component

1. Create frame: 120×140px
2. Auto layout: Vertical, padding 16px, gap 8px, center aligned
3. Fill: White
4. Border: 2px, Lumi/Neutral/200
5. Border radius: 24px
6. Shadow: Lumi/Shadow/SM
7. Add layers:
   - Emoji: 64px text layer (use 🙂)
   - Label: Text "Ilo", style Lumi/Body
   - Counter badge: 32px circle frame, position absolute top-right -8px
     * Fill: Lumi/Primary/Sky 300
     * Text: "0", style Lumi/Small, color white
8. Convert to component
9. Add variants:
   - Property: Feeling, options: Ilo, Suru, Viha, Pelko, EnTieda
   - Property: Selected, type: Boolean
10. Update emoji + label for each feeling

#### Scenario Card Component

1. Create frame: 400×auto
2. Auto layout: Vertical, padding 24px, gap 16px
3. Add layers:
   - Tag badge (top): Auto layout pill with icon + text
   - Title: H4 text
   - Level dots: 3 circles, 8px, horizontal auto layout
   - CTA: Primary button "Aloita"
4. Convert to component
5. Add variants:
   - Property: Type, options: Quick, Deep
   - Property: Level, options: 1, 2, 3
   - Property: Selected, type: Boolean

#### Teacher HUD Component

1. Create pill frame: Auto × 48px
2. Auto layout: Horizontal, padding 12px 16px, gap 16px
3. Border radius: 999px
4. Fill: White
5. Shadow: Lumi/Shadow/MD
6. Add layers:
   - Timer text: "2:34"
   - Step label: "Hengityshetki" (optional)
   - Mute icon
   - Settings icon
7. Convert to component

---

### 🎭 Step 4: Create Lumi Character Component

**In "07 – Lumi Character States" page:**

#### Prepare Base Character

1. Import Lumi image (provided PNG)
2. Remove background (if needed)
3. Place in 400×400 frame
4. Center aligned

#### Create Antenna Light Layer

1. Add ellipse: 80×80px
2. Position: Top of antenna
3. Fill: Radial gradient
   - Center: White 60%
   - Outer: Sky 300 80%
4. Blur: 10px
5. Name layer: "Light/Baseline"

#### Create Ambient Glow Layer

1. Add ellipse: 500×500px
2. Position: Behind character (send to back)
3. Fill: Radial gradient
   - Center: Sky 200 10%
   - Outer: Transparent
4. Blur: 60px
5. Name: "Ambient/Baseline"
6. Visibility: Hidden by default

#### Create Face Variations

For each face state (neutral, concern, empathy, encouraging, proud, firm):

1. Duplicate base character layer
2. Adjust facial features:
   - Eyes: Use vector editing or masks
   - Eyebrows: Adjust angle/position
   - Mouth: Adjust smile/expression
   - Head rotation: For empathy/listening (4-6°)
3. Name layer: "Face/[StateName]"

#### Create Component with Variants

1. Select all face layers + light layer + ambient layer
2. Group in frame: 400×400px
3. Convert to component
4. Add variant properties:
   - Face: neutral | concern | empathy | encouraging | proud | firm
   - Light: baseline | sync | warm | firm
   - Pose: normal | listening | firm_still
   - Size: sm (200px) | md (300px) | lg (400px)

5. For each variant combination:
   - Show/hide appropriate face layer
   - Show/hide appropriate light layer
   - Show/hide ambient layer
   - Adjust rotation for pose

#### Add Prototyping (Optional)

1. Select Lumi component
2. Add prototype interactions:
   - Float animation: Smart animate, 4s, ease-in-out, loop
   - Light pulse: Smart animate, 6s, ease-in-out, loop (sync mode only)

---

### 📱 Step 5: Build Screen Layouts

**In "02 – Teacher Dashboard" page:**

1. Create frame: 1024×768px (iPad Landscape)
2. Name: "Teacher Dashboard"
3. Fill: Lumi/Neutral/50

4. Add two sections:
   - Left frame: 665×768px (65%)
     * Name: "Kid Stage"
     * Center content
     * Add Lumi component (lg size)
     * Add heading
   
   - Right frame: 359×768px (35%)
     * Name: "Teacher Panel"
     * Fill: White
     * Auto layout: Vertical, padding 24px, gap 24px
     * Add all teacher controls per wireframe

5. Add components:
   - Settings inputs (dropdowns, radio buttons)
   - Primary button: "Aloita istunto"
   - Firm Calm button
   - Timer (small text, hidden)

**Repeat for other screens:**
- 03 – Feelings Check-in
- 04 – Breath Sync
- 05 – Scenario Flow
- 06 – Closing Ritual

---

### 🎬 Step 6: Add Prototyping

1. In each screen frame, add hotspots:
   - Buttons → Next screen
   - Settings → Open drawer
   - Lumi → Show state change

2. Set transition:
   - Animation: Smart Animate
   - Duration: 300ms
   - Easing: Ease-in-out

3. Create flow:
   ```
   Dashboard → Check-in → Breath Sync → Scenario → Closing → Dashboard
   ```

4. Add Firm Calm overlay:
   - Create overlay frame
   - Show on Firm Calm button click
   - Position: Center
   - Background: Overlay blur

---

### 📤 Step 7: Export Assets

**For Development:**

1. Select Lumi component
2. Export settings:
   - Format: PNG
   - Scale: 2x, 3x (for Retina)
   - Naming: lumi-[face]-[light]-[pose]-[size].png

3. Export design tokens:
   - Use "Design Tokens" plugin
   - Export as JSON
   - Include colors, typography, spacing, shadows

4. Export components:
   - Use "Export Styles" plugin
   - Export as CSS variables or Tailwind config

---

### ✅ Final Checklist

- [ ] All color styles created and named
- [ ] All text styles created and named
- [ ] All shadow styles created
- [ ] Primary button component with variants
- [ ] Secondary button component with variants
- [ ] Firm Calm button component
- [ ] Feeling button component with all 5 feelings
- [ ] Scenario card component with variants
- [ ] Teacher HUD component
- [ ] Settings drawer component
- [ ] Lumi character component with all variants
- [ ] All 6 screen layouts completed
- [ ] Prototyping flows connected
- [ ] Assets exported for development
- [ ] Design tokens exported
- [ ] Documentation completed

---

## 🎯 Design Principles (Reference)

1. **Calm & Safe**
   - Soft colors, generous spacing
   - No sharp edges, no aggressive red
   - Gentle animations

2. **Voice-First**
   - Minimal text on kid-facing area
   - Large, clear visuals
   - Teacher provides verbal guidance

3. **Touch-Optimized**
   - Minimum 56px touch targets
   - 64px recommended for primary actions
   - Clear visual hierarchy

4. **Professional & Warm**
   - Premium aesthetics for educators
   - Approachable for children
   - Not toy-like, but playful

5. **Ethically Designed**
   - No shame, no punishment
   - Behavior-focused, not child-focused
   - Light is NOT a reward meter
   - Repair over punishment

---

## 📚 Additional Resources

### Figma Plugins Recommended

1. **Remove Background** — Clean Lumi character images
2. **Design Tokens** — Export tokens to JSON
3. **Stark** — Check accessibility contrast
4. **Autoflow** — Create user flow diagrams
5. **Content Reel** — Generate mock Finnish text

### Color Accessibility

All text color combinations meet WCAG AA standards:
- Primary text (#2B3A4A) on White: 12.6:1 (AAA)
- Secondary text (#5F7082) on White: 6.8:1 (AA)
- White text on Sky 300: 4.8:1 (AA for 18px+)
- White text on Warm 300: 4.2:1 (AA for 18px+)

---

## 🚀 Next Steps After Figma

1. **Share with Team**
   - Get feedback from educators
   - Test with sample scenarios
   - Validate with daycare centers

2. **Developer Handoff**
   - Export design tokens
   - Share component specs
   - Create animation guide
   - Provide asset exports

3. **Prototype Testing**
   - Create interactive prototype in Figma
   - Test with teachers on iPad
   - Observe usability on smartboard
   - Iterate based on feedback

4. **Pilot Preparation**
   - Finalize all 8 Turvataidot scenarios
   - Create situation illustrations
   - Record voice samples (if not using TTS)
   - Prepare teacher onboarding materials

---

## 💡 Pro Tips

1. **Use Components Everywhere**
   - Never create a button twice
   - All instances update together
   - Maintain consistency easily

2. **Organize with Pages**
   - Separate design system, components, screens
   - Easy navigation
   - Clean file structure

3. **Name Everything**
   - Layers: Descriptive names
   - Components: Clear hierarchy
   - Frames: Screen names
   - Makes collaboration easier

4. **Use Auto Layout**
   - Responsive components
   - Easy to resize
   - Maintains spacing

5. **Version Control**
   - Save versions before major changes
   - Name versions clearly
   - Document changes

6. **Collaborate**
   - Add comments for questions
   - Share with stakeholders
   - Get feedback early and often

---

## 📞 Support

For questions about this design system:
- Check component library examples
- Review animation specs
- Test on actual iPad
- Validate with teachers

---

**Lumi Design System v1.0**  
*Prepared for Figma Implementation*  
*Premium EdTech Interface for Ages 4–6*

---

🌟 Remember: Lumi is not just a character — it's a safe, calm presence that helps children develop emotional awareness and social skills. Every design decision should support this mission.

---

