export type LumiMode = "baseline" | "listening" | "firm" | "warm";
export type LumiLang = "fi-FI";

export type LumiSpeakHooks = {
  onStart?: () => void;
  onFrame?: (mouthOpen: number, lightIntensity: number) => void;
  onEnd?: () => void;
  onError?: (error: unknown) => void;
};

type ActivePlayback = {
  stop: () => void;
};

let activePlayback: ActivePlayback | null = null;

export function cancelLumiSpeak(): void {
  activePlayback?.stop();
  activePlayback = null;
}

function getLightIntensity(mode: LumiMode, mouthOpen: number, elapsedSeconds: number): number {
  const pulse = Math.sin(elapsedSeconds * 3.2) * 0.04;

  if (mode === "firm") {
    return 0.54;
  }

  if (mode === "listening") {
    return Math.max(0, Math.min(1, 0.28 + mouthOpen * 0.14));
  }

  if (mode === "warm") {
    return Math.max(0, Math.min(1, 0.44 + mouthOpen * 0.2 + pulse));
  }

  return Math.max(0, Math.min(1, 0.4 + mouthOpen * 0.24 + pulse));
}

async function fetchAudioUrl(text: string, mode: LumiMode): Promise<string> {
  const response = await fetch("/api/tts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text, mode, lang: "fi-FI" as LumiLang }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`TTS request failed (${response.status}): ${detail}`);
  }

  const payload = (await response.json()) as { audioUrl?: string };
  if (!payload.audioUrl) {
    throw new Error("Missing audioUrl in /api/tts response");
  }

  return payload.audioUrl;
}

async function playWithAudioElement(audioUrl: string, mode: LumiMode, hooks: LumiSpeakHooks): Promise<void> {
  const audio = new Audio(audioUrl);
  audio.preload = "auto";
  audio.crossOrigin = "anonymous";

  const AudioContextCtor =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  let rafId: number | null = null;
  let stopped = false;
  let context: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let source: MediaElementAudioSourceNode | null = null;
  let amplitudeData: Float32Array | null = null;
  let smoothedMouth = 0;
  const startedAt = performance.now();

  const cleanup = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    audio.pause();
    audio.currentTime = 0;
    audio.src = "";

    if (source) {
      source.disconnect();
    }

    if (analyser) {
      analyser.disconnect();
    }

    if (context && context.state !== "closed") {
      void context.close();
    }

    hooks.onFrame?.(0, 0.25);
  };

  const stop = () => {
    if (stopped) {
      return;
    }
    stopped = true;
    cleanup();
    hooks.onEnd?.();
  };

  activePlayback = { stop };

  try {
    if (!AudioContextCtor) {
      hooks.onStart?.();
      await audio.play();
      await new Promise<void>((resolve, reject) => {
        audio.onended = () => resolve();
        audio.onerror = () => reject(new Error("Audio playback failed"));
      });
      stop();
      return;
    }

    context = new AudioContextCtor();
    source = context.createMediaElementSource(audio);
    analyser = context.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.78;
    amplitudeData = new Float32Array(analyser.fftSize);

    source.connect(analyser);
    analyser.connect(context.destination);

    if (context.state === "suspended") {
      await context.resume();
    }

    hooks.onStart?.();
    await audio.play();

    const frame = () => {
      if (stopped || !analyser || !amplitudeData) {
        return;
      }

      analyser.getFloatTimeDomainData(amplitudeData);
      let sumSquares = 0;

      for (let i = 0; i < amplitudeData.length; i += 1) {
        const sample = amplitudeData[i];
        sumSquares += sample * sample;
      }

      const rms = Math.sqrt(sumSquares / amplitudeData.length);
      const gained = Math.min(1, rms * 4.6);
      smoothedMouth = smoothedMouth * 0.7 + gained * 0.3;

      const elapsed = (performance.now() - startedAt) / 1000;
      const lightIntensity = getLightIntensity(mode, smoothedMouth, elapsed);

      hooks.onFrame?.(Math.max(0, Math.min(1, smoothedMouth)), lightIntensity);
      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);

    await new Promise<void>((resolve, reject) => {
      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error("Audio playback failed"));
    });

    stop();
  } catch (error) {
    if (!stopped) {
      stopped = true;
      cleanup();
      hooks.onEnd?.();
    }
    throw error;
  } finally {
    if (activePlayback?.stop === stop) {
      activePlayback = null;
    }
  }
}

async function playWithBrowserSpeech(text: string, mode: LumiMode, hooks: LumiSpeakHooks): Promise<void> {
  if (!("speechSynthesis" in window)) {
    throw new Error("No available speech synthesis fallback");
  }

  const synth = window.speechSynthesis;
  synth.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "fi-FI";
  utter.rate = mode === "listening" ? 0.85 : mode === "firm" ? 0.82 : 0.92;
  utter.pitch = mode === "firm" ? 0.9 : mode === "warm" ? 1.06 : 1.0;

  const fiVoice = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith("fi"));
  if (fiVoice) {
    utter.voice = fiVoice;
  }

  let rafId: number | null = null;
  let stopped = false;
  let energy = 0;
  const startedAt = performance.now();

  const animate = () => {
    if (stopped) {
      return;
    }
    energy *= 0.88;
    const noise = (Math.sin(performance.now() / 58) + 1) * 0.08;
    const mouthOpen = Math.max(0, Math.min(1, energy + noise));
    const elapsed = (performance.now() - startedAt) / 1000;
    const lightIntensity = getLightIntensity(mode, mouthOpen, elapsed);
    hooks.onFrame?.(mouthOpen, lightIntensity);
    rafId = requestAnimationFrame(animate);
  };

  const cleanup = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    hooks.onFrame?.(0, 0.25);
  };

  const stop = () => {
    if (stopped) {
      return;
    }
    stopped = true;
    synth.cancel();
    cleanup();
    hooks.onEnd?.();
  };

  activePlayback = { stop };

  await new Promise<void>((resolve, reject) => {
    utter.onstart = () => {
      hooks.onStart?.();
      rafId = requestAnimationFrame(animate);
    };

    utter.onboundary = () => {
      energy = 0.95;
    };

    utter.onend = () => {
      if (!stopped) {
        stopped = true;
        cleanup();
        hooks.onEnd?.();
      }
      resolve();
    };

    utter.onerror = (event) => {
      if (!stopped) {
        stopped = true;
        cleanup();
        hooks.onEnd?.();
      }
      reject(new Error(`SpeechSynthesis failed: ${event.error}`));
    };

    synth.speak(utter);
  }).finally(() => {
    if (activePlayback?.stop === stop) {
      activePlayback = null;
    }
  });
}

export async function lumiSpeak(
  text: string,
  mode: LumiMode,
  hooks: LumiSpeakHooks = {}
): Promise<void> {
  cancelLumiSpeak();

  try {
    const audioUrl = await fetchAudioUrl(text, mode);
    await playWithAudioElement(audioUrl, mode, hooks);
  } catch (apiError) {
    console.warn("TTS API unavailable, using browser fallback speech.", apiError);
    hooks.onError?.(apiError);
    await playWithBrowserSpeech(text, mode, hooks);
  }
}
