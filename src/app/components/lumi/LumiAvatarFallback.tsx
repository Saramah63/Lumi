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
    const timer = window.setTimeout(() => setIsBlinking(false), 140);
    return () => window.clearTimeout(timer);
  }, [blinkTick]);

  const floatDuration = useMemo(() => {
    const normalized = Math.max(0.1, Math.min(1, floatAmount));
    return 3.8 - normalized * 1.4;
  }, [floatAmount]);

  const mouthScale = 0.2 + Math.max(0, Math.min(1, mouthOpen)) * 1.6;

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

      <div
        className="absolute z-20 left-[30%] top-[43%] w-[14%] h-[7%] rounded-full bg-white/85 origin-center transition-transform duration-100"
        style={{ transform: `scaleY(${isBlinking ? 1 : 0})` }}
      />
      <div
        className="absolute z-20 right-[30%] top-[43%] w-[14%] h-[7%] rounded-full bg-white/85 origin-center transition-transform duration-100"
        style={{ transform: `scaleY(${isBlinking ? 1 : 0})` }}
      />

      <div
        className="absolute z-20 left-1/2 top-[55%] w-[12%] h-[8%] -translate-x-1/2 rounded-[999px] bg-[#8c1323] origin-center transition-transform duration-75"
        style={{
          transform: `translateX(-50%) scaleY(${mouthScale})`,
          opacity: 0.35 + Math.max(0, Math.min(1, mouthOpen)) * 0.5,
          filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.22))",
        }}
      />
    </div>
  );
}
