import { useRef } from "react";
import { LumiAvatarRive, type MouthState } from "./LumiAvatarRive";
import { useLumiEngineState } from "../../engine/useLumiEngine";
import { mouthStateFromRms, stabilizeMouthState } from "../../../../lib/lumi/mouthState";

interface LumiAvatarProps {
  size?: "sm" | "md" | "lg" | "xl" | "xxl";
  emotion?: "neutral" | "happy" | "calm" | "thinking";
  breathing?: boolean;
  speaking?: boolean;
  className?: string;
}

export function LumiAvatar({
  size = "lg",
  emotion = "neutral",
  breathing = false,
  speaking,
  className = "",
}: LumiAvatarProps) {
  const engine = useLumiEngineState();
  const prevMouthStateRef = useRef<MouthState>(0);

  const sizeMap = {
    sm: "w-36 h-36",
    md: "w-52 h-52",
    lg: "w-72 h-72",
    xl: "w-96 h-96",
    xxl: "w-[30rem] h-[30rem]",
  };

  const isSpeaking = speaking ?? engine.isSpeaking;

  const emotionLight = {
    neutral: 0.28,
    happy: 0.42,
    calm: 0.38,
    thinking: 0.33,
  }[emotion];

  const floatAmount = breathing ? 0.8 : engine.floatAmount;
  const lightIntensity = isSpeaking ? engine.lightIntensity : emotionLight;
  const nextMouthState = isSpeaking ? mouthStateFromRms(engine.mouthOpen) : 0;
  const mouthState = stabilizeMouthState(prevMouthStateRef.current, nextMouthState);
  prevMouthStateRef.current = mouthState;

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div
        className="absolute rounded-full blur-3xl"
        style={{
          width: "120%",
          height: "120%",
          backgroundColor: "var(--lumi-glow)",
          opacity: 0.16 + lightIntensity * 0.55,
        }}
      />

      <LumiAvatarRive
        className={`relative ${sizeMap[size]}`}
        isSpeaking={isSpeaking}
        mouthState={mouthState}
        mouthOpen={engine.mouthOpen}
        lightIntensity={lightIntensity}
        floatAmount={floatAmount}
        blinkTick={engine.blinkTick}
      />
    </div>
  );
}
