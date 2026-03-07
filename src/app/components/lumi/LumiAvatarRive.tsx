import { useEffect, useRef, useState } from "react";
import { useRive, useStateMachineInput } from "@rive-app/react-canvas";
import { LumiAvatarFallback } from "./LumiAvatarFallback";

export type MouthState = 0 | 1 | 2 | 3 | 4;

interface LumiAvatarRiveProps {
  className?: string;
  isSpeaking?: boolean;
  mouthState?: MouthState;
  mouthOpen?: number;
  lightIntensity?: number;
  floatAmount?: number;
  blinkTick?: number;
}

const STATE_MACHINE = "LumiMachine";

export function LumiAvatarRive({
  className,
  isSpeaking = false,
  mouthState = 0,
  mouthOpen = 0,
  lightIntensity = 0.3,
  floatAmount = 0.35,
  blinkTick = 0,
}: LumiAvatarRiveProps) {
  const [loadError, setLoadError] = useState(false);
  const lastBlink = useRef(0);

  const { rive, RiveComponent } = useRive({
    src: "/rive/LumiMouth.riv",
    stateMachines: STATE_MACHINE,
    autoplay: true,
    onLoadError: () => {
      setLoadError(true);
    },
  });

  useEffect(() => {
    if (rive) {
      return;
    }
    const timer = window.setTimeout(() => {
      setLoadError(true);
    }, 1400);
    return () => window.clearTimeout(timer);
  }, [rive]);

  const speakingInput = useStateMachineInput(rive, STATE_MACHINE, "isSpeaking");
  const mouthInput = useStateMachineInput(rive, STATE_MACHINE, "mouthState");
  const blinkTrigger = useStateMachineInput(rive, STATE_MACHINE, "blink");

  useEffect(() => {
    if (!rive) return;
    if (speakingInput) speakingInput.value = isSpeaking;
    if (mouthInput) mouthInput.value = mouthState;

    if (blinkTrigger && blinkTick !== lastBlink.current) {
      lastBlink.current = blinkTick;
      blinkTrigger.fire();
    }
  }, [rive, isSpeaking, mouthState, blinkTick, speakingInput, mouthInput, blinkTrigger]);

  if (loadError) {
    return (
      <LumiAvatarFallback
        className={className}
        mouthOpen={mouthOpen}
        blinkTick={blinkTick}
        floatAmount={floatAmount}
        lightIntensity={lightIntensity}
      />
    );
  }

  return <RiveComponent className={className} />;
}
