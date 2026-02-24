import { lumiEngine, type LumiSpeakMode } from "../engine/lumiEngine";

export class SpeechService {
  private onSpeakingChange?: (speaking: boolean) => void;

  constructor() {
    lumiEngine.subscribe((state) => {
      this.onSpeakingChange?.(state.isSpeaking);
    });
  }

  async speak(
    text: string,
    options?: {
      mode?: LumiSpeakMode;
      lang?: "fi-FI" | "en-US";
      voice?: string;
      onStart?: () => void;
      onEnd?: () => void;
    }
  ): Promise<void> {
    options?.onStart?.();
    await lumiEngine.speak(text, options?.mode ?? "normal", {
      lang: options?.lang,
      voice: options?.voice,
    });
    options?.onEnd?.();
  }

  async speakWithPauses(lines: string[], pauseDuration = 800): Promise<void> {
    await lumiEngine.speakLines(lines, "normal", pauseDuration);
  }

  cancel(): void {
    void lumiEngine.stop();
  }

  pause(): void {
    // Reserved for future pause support.
  }

  resume(): void {
    // Reserved for future resume support.
  }

  toggleMute(): boolean {
    return lumiEngine.toggleMute();
  }

  setMuted(muted: boolean): void {
    lumiEngine.setMuted(muted);
  }

  isSpeaking(): boolean {
    return lumiEngine.getState().isSpeaking;
  }

  onSpeakingStateChange(callback: (speaking: boolean) => void): void {
    this.onSpeakingChange = callback;
  }
}

export const speechService = new SpeechService();
