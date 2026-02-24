import { useEffect, useMemo, useState } from "react";

interface LumiAvatarFallbackProps {
  className?: string;
  mouthOpen?: number;
  blinkTick?: number;
  floatAmount?: number;
  lightIntensity?: number;
}

export function LumiAvatarFallback({
  className,
  mouthOpen = 0,
  blinkTick = 0,
  floatAmount = 0.35,
  lightIntensity = 0.35,
}: LumiAvatarFallbackProps) {
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    if (blinkTick <= 0) {
      return;
    }
    setIsBlinking(true);
    const timer = window.setTimeout(() => setIsBlinking(false), 110);
    return () => window.clearTimeout(timer);
  }, [blinkTick]);

  const floatDuration = useMemo(() => {
    const normalized = Math.max(0.1, Math.min(1, floatAmount));
    return 3.8 - normalized * 1.4;
  }, [floatAmount]);

  const mouthAmount = Math.max(0, Math.min(1, mouthOpen));
  const mouthScale = 1 + mouthAmount * 0.55;
  const blinkScale = isBlinking ? 1 : 0;

  return (
    <div
      className={`relative overflow-visible ${className}`}
      style={{
        animation: `lumi-float ${floatDuration}s ease-in-out infinite`,
      }}
    >
      <div
        className="absolute inset-0 rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(111, 197, 236, 0.38) 0%, rgba(111, 197, 236, 0) 70%)",
          opacity: 0.24 + lightIntensity * 0.44,
          transform: "scale(1.08)",
          pointerEvents: "none",
        }}
      />

      <img
        src="/lumi-face.png"
        alt="Lumi"
        className="relative z-10 w-full h-full object-contain select-none"
        draggable={false}
      />

      {/* Mouth motion from original texture (not synthetic mouth drawing) */}
      <img
        src="/lumi-face.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 z-20 w-full h-full object-contain pointer-events-none"
        style={{
          clipPath: "ellipse(9% 7% at 50% 58%)",
          transform: `scaleY(${mouthScale})`,
          transformOrigin: "50% 58%",
          opacity: 0.9,
          filter: "saturate(1.04)",
        }}
      />

      {/* Eyelid blink overlays (subtle, matching Lumi fur tone) */}
      <div
        className="absolute z-20 left-[27.5%] top-[41.8%] w-[15%] h-[9.5%] rounded-full bg-[#f4f0f7] pointer-events-none"
        style={{
          transform: `scaleY(${blinkScale})`,
          transformOrigin: "center",
          opacity: 0.92,
          transition: "transform 80ms linear",
        }}
      />
      <div
        className="absolute z-20 right-[27.5%] top-[41.8%] w-[15%] h-[9.5%] rounded-full bg-[#f4f0f7] pointer-events-none"
        style={{
          transform: `scaleY(${blinkScale})`,
          transformOrigin: "center",
          opacity: 0.92,
          transition: "transform 80ms linear",
        }}
      />
    </div>
  );
}
