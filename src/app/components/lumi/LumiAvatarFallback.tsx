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
        src="/lumi-face-optimized.png"
        alt="Lumi"
        className="relative z-10 w-full h-full object-contain select-none"
        draggable={false}
      />

      <div
        className="absolute z-20 left-[27.8%] top-[42.2%] w-[14.4%] h-[9.2%] rounded-full bg-[#f4f0f7] pointer-events-none"
        style={{
          transform: `scaleY(${isBlinking ? 1 : 0})`,
          transformOrigin: "center",
          opacity: 0.9,
          transition: "transform 80ms linear",
        }}
      />
      <div
        className="absolute z-20 right-[27.8%] top-[42.2%] w-[14.4%] h-[9.2%] rounded-full bg-[#f4f0f7] pointer-events-none"
        style={{
          transform: `scaleY(${isBlinking ? 1 : 0})`,
          transformOrigin: "center",
          opacity: 0.9,
          transition: "transform 80ms linear",
        }}
      />

      <div
        className="absolute z-20 left-1/2 top-[56.5%] -translate-x-1/2 w-[11%] rounded-full bg-[#7f1020] pointer-events-none"
        style={{
          height: `${2 + mouthAmount * 9}%`,
          opacity: 0.25 + mouthAmount * 0.6,
          filter: "blur(0.2px)",
          transition: "height 65ms linear, opacity 65ms linear",
        }}
      />
    </div>
  );
}
