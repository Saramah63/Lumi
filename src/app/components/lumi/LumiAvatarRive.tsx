import { useEffect } from "react";
import { Alignment, Fit, Layout, useRive, useStateMachineInput } from "@rive-app/react-canvas";

interface LumiAvatarRiveProps {
  className?: string;
  isSpeaking?: boolean;
  isListening?: boolean;
  isFirm?: boolean;
  mouthOpen?: number;
  lightIntensity?: number;
  floatAmount?: number;
  blinkTick?: number;
  warmGlowTick?: number;
  syncBreathTick?: number;
}

const STATE_MACHINE = "LumiSM";

export function LumiAvatarRive({
  className,
  isSpeaking = false,
  isListening = false,
  isFirm = false,
  mouthOpen = 0,
  lightIntensity = 0.3,
  floatAmount = 0.35,
  blinkTick = 0,
  warmGlowTick = 0,
  syncBreathTick = 0,
}: LumiAvatarRiveProps) {
  const { rive, RiveComponent } = useRive({
    src: "/rive/Lumi.riv",
    stateMachines: STATE_MACHINE,
    autoplay: true,
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
  });

  const speakingInput = useStateMachineInput(rive, STATE_MACHINE, "isSpeaking");
  const listeningInput = useStateMachineInput(rive, STATE_MACHINE, "isListening");
  const firmInput = useStateMachineInput(rive, STATE_MACHINE, "isFirm");
  const mouthOpenInput = useStateMachineInput(rive, STATE_MACHINE, "mouthOpen");
  const lightIntensityInput = useStateMachineInput(rive, STATE_MACHINE, "lightIntensity");
  const floatAmountInput = useStateMachineInput(rive, STATE_MACHINE, "floatAmount");
  const blinkInput = useStateMachineInput(rive, STATE_MACHINE, "blink");
  const warmGlowInput = useStateMachineInput(rive, STATE_MACHINE, "warmGlow");
  const syncBreathInput = useStateMachineInput(rive, STATE_MACHINE, "syncBreath");

  useEffect(() => {
    if (speakingInput) {
      speakingInput.value = isSpeaking;
    }
  }, [isSpeaking, speakingInput]);

  useEffect(() => {
    if (listeningInput) {
      listeningInput.value = isListening;
    }
  }, [isListening, listeningInput]);

  useEffect(() => {
    if (firmInput) {
      firmInput.value = isFirm;
    }
  }, [isFirm, firmInput]);

  useEffect(() => {
    if (mouthOpenInput) {
      mouthOpenInput.value = Math.max(0, Math.min(1, mouthOpen));
    }
  }, [mouthOpen, mouthOpenInput]);

  useEffect(() => {
    if (lightIntensityInput) {
      lightIntensityInput.value = Math.max(0, Math.min(1, lightIntensity));
    }
  }, [lightIntensity, lightIntensityInput]);

  useEffect(() => {
    if (floatAmountInput) {
      floatAmountInput.value = Math.max(0, Math.min(1, floatAmount));
    }
  }, [floatAmount, floatAmountInput]);

  useEffect(() => {
    if (blinkInput && blinkTick > 0) {
      blinkInput.fire();
    }
  }, [blinkTick, blinkInput]);

  useEffect(() => {
    if (warmGlowInput && warmGlowTick > 0) {
      warmGlowInput.fire();
    }
  }, [warmGlowTick, warmGlowInput]);

  useEffect(() => {
    if (syncBreathInput && syncBreathTick > 0) {
      syncBreathInput.fire();
    }
  }, [syncBreathTick, syncBreathInput]);

  return <RiveComponent className={className} />;
}
