import { useMemo } from "react";

interface LumiAvatarFallbackProps {
  className?: string;
  mouthOpen?: number;
  blinkTick?: number;
  floatAmount?: number;
  lightIntensity?: number;
}

export function LumiAvatarFallback({
  className,
  floatAmount = 0.35,
  lightIntensity = 0.35,
}: LumiAvatarFallbackProps) {
  const floatDuration = useMemo(() => {
    const normalized = Math.max(0.1, Math.min(1, floatAmount));
    return 3.8 - normalized * 1.4;
  }, [floatAmount]);

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
    </div>
  );
}
