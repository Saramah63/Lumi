import { useState, useEffect, useCallback } from 'react';
import { speechService } from '../services/speechService';

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // Register speaking state change callback
    speechService.onSpeakingStateChange(setIsSpeaking);

    return () => {
      speechService.cancel();
    };
  }, []);

  const speak = useCallback((text: string, options?: {
    rate?: number;
    pitch?: number;
    volume?: number;
    onStart?: () => void;
    onEnd?: () => void;
  }) => {
    speechService.speak(text, options);
  }, []);

  const speakLines = useCallback(async (lines: string[], pauseDuration?: number) => {
    await speechService.speakWithPauses(lines, pauseDuration);
  }, []);

  const cancel = useCallback(() => {
    speechService.cancel();
  }, []);

  const pause = useCallback(() => {
    speechService.pause();
  }, []);

  const resume = useCallback(() => {
    speechService.resume();
  }, []);

  const toggleMute = useCallback(() => {
    const newMutedState = speechService.toggleMute();
    setIsMuted(newMutedState);
    return newMutedState;
  }, []);

  const setMute = useCallback((muted: boolean) => {
    speechService.setMuted(muted);
    setIsMuted(muted);
  }, []);

  return {
    speak,
    speakLines,
    cancel,
    pause,
    resume,
    toggleMute,
    setMute,
    isSpeaking,
    isMuted,
  };
}
