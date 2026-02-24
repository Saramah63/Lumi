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

  return (
    <div
      className={`relative rounded-full bg-[#dff3ff] border-2 border-[#9dcced] overflow-hidden shadow-lg ${className}`}
      style={{
        animation: `lumi-float ${floatDuration}s ease-in-out infinite`,
        boxShadow: `0 0 ${20 + lightIntensity * 22}px rgba(111, 187, 224, ${0.22 + lightIntensity * 0.2})`,
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_28%,rgba(255,255,255,0.8),rgba(255,255,255,0.1)_52%,transparent_70%)]" />

      <div className="absolute left-[23%] top-[33%] w-[18%] h-[10%] rounded-full bg-[#2d5676]" />
      <div className="absolute right-[23%] top-[33%] w-[18%] h-[10%] rounded-full bg-[#2d5676]" />

      <div
        className="absolute left-[23%] top-[33%] w-[18%] h-[10%] rounded-full bg-[#bfe6ff] origin-center transition-transform duration-100"
        style={{ transform: `scaleY(${isBlinking ? 1 : 0})` }}
      />
      <div
        className="absolute right-[23%] top-[33%] w-[18%] h-[10%] rounded-full bg-[#bfe6ff] origin-center transition-transform duration-100"
        style={{ transform: `scaleY(${isBlinking ? 1 : 0})` }}
      />

      <div
        className="absolute left-1/2 top-[60%] w-[22%] h-[9%] -translate-x-1/2 rounded-full bg-[#1f4562] origin-center transition-transform duration-75"
        style={{
          transform: `translateX(-50%) scaleY(${0.15 + Math.max(0, Math.min(1, mouthOpen)) * 1.5})`,
        }}
      />
    </div>
  );
}
