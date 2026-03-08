"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { GlowState, MouthState } from "../lib/lumi/types";

export type { MouthState, GlowState } from "../lib/lumi/types";

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

export function LumiAvatar({
  mouthState,
  audioIntensity,
  isSpeaking,
  glowState,
  animationSource = "audio",
  breathGlow = 0,
  forceBlink = false,
  blinkNowTick = 0,
  debugOverlay = false,
  glowDisabled = false,
  regulationActive = false,
}: {
  mouthState: MouthState;
  audioIntensity: number;
  isSpeaking: boolean;
  glowState: GlowState;
  animationSource?: "audio" | "breath";
  breathGlow?: number;
  forceBlink?: boolean;
  blinkNowTick?: number;
  debugOverlay?: boolean;
  glowDisabled?: boolean;
  regulationActive?: boolean;
}) {
  const baseSrc = useMemo(() => {
    switch (mouthState) {
      case 1:
        return "/lumi_full/Lumi_OPEN.svg";
      case 2:
        return "/lumi_full/Lumi_WIDE.svg";
      case 3:
        return "/lumi_full/Lumi_ROUND.svg";
      case 4:
        return "/lumi_full/Lumi_CLOSED.svg";
      default:
        return "/lumi_full/Lumi_REST.svg";
    }
  }, [mouthState]);

  const glowSrc = useMemo(() => {
    if (glowState === "strong") return "/lumi_fx/Glow_Strong.svg";
    if (glowState === "alert") return "/lumi_fx/Glow_Alert.svg";
    return "/lumi_fx/Glow_Calm.svg";
  }, [glowState]);

  const [blinkOn, setBlinkOn] = useState(false);
  const blinkTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);
  const lastBlinkTick = useRef(0);
  const blinkFailsafe = useRef<number | null>(null);

  useEffect(() => {
    if (!blinkOn) return;
    if (blinkFailsafe.current) window.clearTimeout(blinkFailsafe.current);
    blinkFailsafe.current = window.setTimeout(() => setBlinkOn(false), 260);
    return () => {
      if (blinkFailsafe.current) window.clearTimeout(blinkFailsafe.current);
    };
  }, [blinkOn]);

  useEffect(() => {
    let cancelled = false;
    let speakingInterval: number | null = null;

    const triggerBlink = () => {
      setBlinkOn(true);
      closeTimer.current = window.setTimeout(() => setBlinkOn(false), 140);
    };

    const schedule = () => {
      if (cancelled || forceBlink) return;
      const min = isSpeaking ? 2600 : 4000;
      const max = isSpeaking ? 4300 : 6200;
      const wait = Math.floor(min + Math.random() * (max - min));

      blinkTimer.current = window.setTimeout(() => {
        triggerBlink();
        if (Math.random() < 0.05) {
          window.setTimeout(triggerBlink, 220);
        }
        schedule();
      }, wait);
    };

    schedule();
    if (!forceBlink && isSpeaking) {
      speakingInterval = window.setInterval(() => {
        if (!cancelled) triggerBlink();
      }, 3200);
    }
    return () => {
      cancelled = true;
      if (speakingInterval) window.clearInterval(speakingInterval);
      if (blinkTimer.current) window.clearTimeout(blinkTimer.current);
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    };
  }, [isSpeaking, forceBlink]);

  useEffect(() => {
    if (forceBlink) {
      setBlinkOn(true);
    } else {
      setBlinkOn(false);
    }
  }, [forceBlink]);

  useEffect(() => {
    if (blinkNowTick === lastBlinkTick.current) return;
    lastBlinkTick.current = blinkNowTick;
    setBlinkOn(true);
    const id = window.setTimeout(() => setBlinkOn(false), 140);
    return () => window.clearTimeout(id);
  }, [blinkNowTick]);

  const [breath, setBreath] = useState(0);
  const [lifePhase, setLifePhase] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (rafRef.current) return undefined;
    const start = performance.now();
    const lastBreath = { v: breath };
    const lastLife = { v: lifePhase };
    const tick = (now: number) => {
      const sec = (now - start) / 1000;
      const cycle = 4.6;
      const phase = (sec % cycle) / cycle;
      const easeInOutSine = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * t);
      const inhaleRatio = 0.42;
      const inhaleT = Math.min(1, phase / inhaleRatio);
      const exhaleT = phase <= inhaleRatio ? 0 : Math.min(1, (phase - inhaleRatio) / (1 - inhaleRatio));
      const inhale = easeInOutSine(inhaleT);
      const exhale = easeInOutSine(1 - exhaleT);
      const primary = phase <= inhaleRatio ? inhale : exhale;
      const secondary = 0.08 * Math.sin(sec * (Math.PI * 2) / 9.2 + 1.1);
      const b = clamp01(0.18 + primary * 0.72 + secondary);
      if (Math.abs(b - lastBreath.v) > 0.0005) {
        lastBreath.v = b;
        setBreath(b);
      }
      if (Math.abs(sec - lastLife.v) > 0.0005) {
        lastLife.v = sec;
        setLifePhase(sec);
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, []);

  const breathAmp = isSpeaking ? 0.42 : 0.8;
  const translateY = (((breath - 0.5) * 2.4) + Math.sin(lifePhase * 0.7) * 0.2) * breathAmp;
  const scale = 1 + (((breath - 0.5) * 0.007) + Math.sin(lifePhase * 1.05) * 0.0012) * breathAmp;
  const swayX = Math.sin(lifePhase * 1.35) * (isSpeaking ? 0.65 : 1.0);
  const tiltDeg = Math.sin(lifePhase * 0.9 + 0.5) * (isSpeaking ? 0.22 : 0.45);

  const handWave = Math.sin(lifePhase * 2.1 + 0.5);
  const legWave = Math.sin(lifePhase * 1.7 + 1.1);
  const baseHover = 5;
  const finalTranslateY = -baseHover + translateY;
  const shadowScale = Math.max(0.92, Math.min(1.05, 1 - translateY * 0.06));

  const baseMap = glowState === "strong" ? 0.78 : glowState === "alert" ? 0.5 : 0.28;
  const calmBase = 0.28;
  const regulationStartRef = useRef<number | null>(null);
  const [smoothedBase, setSmoothedBase] = useState(baseMap);
  const [pulsePhase, setPulsePhase] = useState(0);
  const glowRafRef = useRef<number | null>(null);

  useEffect(() => {
    if (regulationActive && regulationStartRef.current == null) {
      regulationStartRef.current = performance.now();
    }
    if (!regulationActive) {
      regulationStartRef.current = null;
    }
  }, [regulationActive]);

  useEffect(() => {
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.max(16, now - last);
      last = now;
      const regulationElapsed = regulationStartRef.current ? now - regulationStartRef.current : 0;
      const regulationProgress = regulationActive ? Math.min(1, regulationElapsed / 8000) : 0;
      const targetBase = baseMap + (calmBase - baseMap) * regulationProgress;
      const alpha = 0.08;
      setSmoothedBase((prev) => prev + (targetBase - prev) * alpha);
      setPulsePhase((prev) => prev + (dt / 1000) * (Math.PI * 2) / 4.5);
      glowRafRef.current = requestAnimationFrame(tick);
    };
    glowRafRef.current = requestAnimationFrame(tick);
    return () => {
      if (glowRafRef.current) cancelAnimationFrame(glowRafRef.current);
    };
  }, [baseMap, regulationActive]);

  useEffect(() => {
    setSmoothedBase(baseMap);
  }, [baseMap]);

  const awarenessPulse = 0.04 * Math.sin(pulsePhase);
  const voicePulse = clamp01(audioIntensity) * 0.06;
  const breathPulse = breath * 0.06;
  let glowOpacity = Math.max(0.22, clamp01(smoothedBase + awarenessPulse + breathPulse + voicePulse));
  if (glowDisabled) {
    glowOpacity = 0;
  }
  const glowMask = "radial-gradient(34% 20% at 50% 11%, #000 0%, #000 56%, rgba(0,0,0,0.62) 76%, transparent 100%)";
  const chestGlow = glowDisabled
    ? 0
    : clamp01(0.06 + breath * 0.1 + clamp01(audioIntensity) * 0.12);

  return (
    <div className="relative h-full w-full select-none pointer-events-none">
      <div
        className="absolute left-1/2 bottom-[6%] h-[10%] w-[58%] rounded-[999px] bg-black/40 blur-[18px]"
        style={{ opacity: 0.22, transform: `translateX(-50%) scale(${shadowScale})` }}
      />
      <div
        className="absolute left-1/2 bottom-[7.4%] h-[4%] w-[38%] rounded-[999px] bg-black/55 blur-[6px]"
        style={{ opacity: 0.3, transform: `translateX(-50%) scale(${shadowScale})` }}
      />
      <div
        className="absolute left-1/2 bottom-[2%] h-[14%] w-[64%] -translate-x-1/2"
        style={{
          opacity: 0.08,
          background: "radial-gradient(50% 60% at 50% 50%, rgba(120,200,255,0.35) 0%, transparent 70%)",
          filter: "blur(12px)",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          transform: `translateX(${swayX}px) translateY(${finalTranslateY}px) rotate(${tiltDeg}deg) scale(${scale})`,
          transformOrigin: "50% 55%",
          willChange: "transform",
        }}
      >
        <img
          src={baseSrc}
          alt="Lumi"
          draggable={false}
          className="absolute inset-0 h-full w-full object-contain"
        />

        <div
          className="absolute left-1/2 top-[36%] h-[16%] w-[26%] -translate-x-1/2"
          style={{
            opacity: chestGlow,
            background: "radial-gradient(55% 65% at 50% 50%, rgba(140,233,255,0.55) 0%, rgba(140,233,255,0.18) 40%, transparent 70%)",
            mixBlendMode: "screen",
            filter: "blur(0.5px)",
          }}
        />

        <img
          src={glowSrc}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-contain"
          style={{
            opacity: glowOpacity * 0.95,
            mixBlendMode: "screen",
            filter: "blur(12px) saturate(1.5)",
            WebkitMaskImage: glowMask,
            maskImage: glowMask,
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
          }}
        />
        <img
          src={glowSrc}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-contain"
          style={{
            opacity: glowOpacity,
            mixBlendMode: "screen",
            filter: "blur(0.5px)",
            WebkitMaskImage: glowMask,
            maskImage: glowMask,
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
          }}
        />

        {blinkOn ? (
          <img
            src="/lumi_fx/Eyelids.svg"
            alt=""
            draggable={false}
            className="absolute inset-0 h-full w-full object-contain"
            style={{ opacity: 0.8 }}
          />
        ) : null}

        <img
          src="/lumi/Hands/Hand-L.svg"
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-contain"
          style={{
            opacity: 0.12,
            mixBlendMode: "multiply",
            transform: `translate(${0.6 + handWave * 0.9}px, ${0.5 + handWave * 0.5}px) rotate(${0.6 + handWave * 0.55}deg)`,
            transformOrigin: "50% 62%",
          }}
        />
        <img
          src="/lumi/Hands/Hand-R.svg"
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-contain"
          style={{
            opacity: 0.12,
            mixBlendMode: "multiply",
            transform: `translate(${-0.6 - handWave * 0.9}px, ${0.5 - handWave * 0.5}px) rotate(${-0.6 - handWave * 0.55}deg)`,
            transformOrigin: "50% 62%",
          }}
        />

        <img
          src="/lumi/Legs/Left-Leg.svg"
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-contain"
          style={{
            opacity: 0.1,
            mixBlendMode: "multiply",
            transform: `translate(${0.4 + legWave * 0.45}px, ${0.5 + legWave * 0.35}px) rotate(${0.45 + legWave * 0.35}deg)`,
            transformOrigin: "50% 68%",
          }}
        />
        <img
          src="/lumi/Legs/Right-Leg.svg"
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-contain"
          style={{
            opacity: 0.1,
            mixBlendMode: "multiply",
            transform: `translate(${-0.4 - legWave * 0.45}px, ${0.5 - legWave * 0.35}px) rotate(${-0.45 - legWave * 0.35}deg)`,
            transformOrigin: "50% 68%",
          }}
        />

        {blinkOn ? (
          <img
            src="/lumi_fx/Eyelids.svg"
            alt=""
            draggable={false}
            className="absolute inset-0 h-full w-full object-contain"
            style={{ opacity: 0.8 }}
          />
        ) : null}

        {debugOverlay ? (
          <div className="absolute inset-[6%] border border-rose-400/70" />
        ) : null}
      </div>
    </div>
  );
}
