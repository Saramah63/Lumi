// Speech Service for Lumi
// Uses Web Speech API for Finnish (fi-FI) text-to-speech

export class SpeechService {
  private synth: SpeechSynthesis;
  private isMuted: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private onSpeakingChange?: (speaking: boolean) => void;

  constructor() {
    this.synth = window.speechSynthesis;
  }

  /**
   * Speak text in Finnish
   */
  speak(text: string, options?: {
    rate?: number;
    pitch?: number;
    volume?: number;
    onStart?: () => void;
    onEnd?: () => void;
  }): void {
    if (this.isMuted) return;

    // Cancel any ongoing speech
    this.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set Finnish voice
    utterance.lang = 'fi-FI';
    utterance.rate = options?.rate ?? 0.9; // Slightly slower for kids
    utterance.pitch = options?.pitch ?? 1.1; // Slightly higher, friendly
    utterance.volume = options?.volume ?? 1.0;

    // Try to find a Finnish voice
    const voices = this.synth.getVoices();
    const finnishVoice = voices.find(voice => voice.lang.startsWith('fi'));
    if (finnishVoice) {
      utterance.voice = finnishVoice;
    }

    // Event handlers
    utterance.onstart = () => {
      this.onSpeakingChange?.(true);
      options?.onStart?.();
    };

    utterance.onend = () => {
      this.onSpeakingChange?.(false);
      options?.onEnd?.();
      this.currentUtterance = null;
    };

    utterance.onerror = (event) => {
      console.error('Speech error:', event);
      this.onSpeakingChange?.(false);
      this.currentUtterance = null;
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  /**
   * Speak with pauses between sentences
   */
  async speakWithPauses(lines: string[], pauseDuration: number = 800): Promise<void> {
    for (const line of lines) {
      await new Promise<void>((resolve) => {
        this.speak(line, {
          onEnd: () => {
            setTimeout(resolve, pauseDuration);
          }
        });
      });
    }
  }

  /**
   * Cancel current speech
   */
  cancel(): void {
    this.synth.cancel();
    this.currentUtterance = null;
    this.onSpeakingChange?.(false);
  }

  /**
   * Pause speech
   */
  pause(): void {
    this.synth.pause();
  }

  /**
   * Resume speech
   */
  resume(): void {
    this.synth.resume();
  }

  /**
   * Toggle mute
   */
  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.cancel();
    }
    return this.isMuted;
  }

  /**
   * Set mute state
   */
  setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.isMuted) {
      this.cancel();
    }
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.synth.speaking;
  }

  /**
   * Register callback for speaking state changes
   */
  onSpeakingStateChange(callback: (speaking: boolean) => void): void {
    this.onSpeakingChange = callback;
  }

  /**
   * Get available voices
   */
  getVoices(): SpeechSynthesisVoice[] {
    return this.synth.getVoices();
  }

  /**
   * Get Finnish voices specifically
   */
  getFinnishVoices(): SpeechSynthesisVoice[] {
    return this.synth.getVoices().filter(voice => voice.lang.startsWith('fi'));
  }
}

// Singleton instance
export const speechService = new SpeechService();

// Load voices when they become available
if (typeof window !== 'undefined') {
  window.speechSynthesis.onvoiceschanged = () => {
    const voices = speechService.getFinnishVoices();
    console.log('Finnish voices available:', voices.length);
  };
}
