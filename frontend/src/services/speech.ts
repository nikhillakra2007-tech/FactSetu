import type { Language } from '../locales/translations';

export type SpeechState = 'IDLE' | 'LISTENING' | 'TRANSCRIPT_READY' | 'ERROR' | 'UNSUPPORTED';

export interface SpeechRecognitionHandlers {
  onStart?: () => void;
  onResult: (transcript: string, isFinal: boolean) => void;
  onError: (error: string) => void;
  onEnd: () => void;
}

class SpeechServiceImpl {
  private recognition: any = null;
  public currentUtterance: SpeechSynthesisUtterance | null = null;
  private cachedVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.cachedVoices = window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.cachedVoices = window.speechSynthesis.getVoices();
      };
    }
  }

  public isSynthesisSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public isRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.isSynthesisSupported()) return [];
    const current = window.speechSynthesis.getVoices();
    if (current && current.length > 0) {
      this.cachedVoices = current;
      return current;
    }
    return this.cachedVoices;
  }

  /**
   * Cleans Hindi keywords to ensure 100% Hindi vocabulary without English verdict acronyms
   */
  private cleanHindiSpokenText(text: string): string {
    return text
      .replace(/VERIFIED/gi, 'सत्य और पुष्टीकृत')
      .replace(/CONTRADICTED/gi, 'असत्य और खंडित')
      .replace(/UNCERTAIN/gi, 'अनिश्चित और असत्यापित')
      .replace(/Verdict:/gi, 'सत्यापन परिणाम:')
      .replace(/Official Ref:/gi, 'आधिकारिक स्रोत:')
      .replace(/Explanation:/gi, 'कारण:');
  }

  /**
   * Find a genuine Hindi voice installed on the operating system / browser
   */
  private getGenuineHindiVoice(): SpeechSynthesisVoice | null {
    const voices = this.getAvailableVoices();
    if (!voices || voices.length === 0) return null;

    // 1. Exact hi-IN or hi_IN match
    const exact = voices.find(
      (v) =>
        v.lang === 'hi-IN' ||
        v.lang === 'hi_IN' ||
        v.lang.toLowerCase() === 'hi-in' ||
        v.lang.toLowerCase().startsWith('hi')
    );
    if (exact) return exact;

    // 2. Name contains Hindi keywords (Windows Hemant, Kalpana, Google हिन्दी, etc.)
    const byName = voices.find((v) => {
      const name = v.name.toLowerCase();
      return (
        name.includes('hindi') ||
        name.includes('हिन्दी') ||
        name.includes('hemant') ||
        name.includes('kalpana') ||
        name.includes('swara') ||
        name.includes('madhav') ||
        name.includes('neerja')
      );
    });
    if (byName) return byName;

    return null;
  }

  /**
   * Speak a text string in the chosen language (hi / en)
   */
  public speak(
    text: string,
    language: Language = 'en',
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ): void {
    if (!this.isSynthesisSupported()) {
      console.warn('Speech synthesis is not supported in this browser.');
      return;
    }

    // Stop any ongoing speech
    this.stop();

    if (!text || !text.trim()) return;

    const voices = this.getAvailableVoices();
    let finalText = text;
    let targetLang = 'en-IN';
    let chosenVoice: SpeechSynthesisVoice | null = null;

    if (language === 'hi') {
      finalText = this.cleanHindiSpokenText(text);
      const hindiVoice = this.getGenuineHindiVoice();

      if (hindiVoice) {
        // Native Hindi Voice Available
        chosenVoice = hindiVoice;
        targetLang = 'hi-IN';
      } else {
        // Fallback for devices without Hindi TTS voice:
        // Use Indian English accent voice if available so pronunciation is natural
        const indianEn = voices.find(
          (v) =>
            v.lang.toLowerCase().includes('in') ||
            v.name.toLowerCase().includes('india') ||
            v.name.toLowerCase().includes('ravi') ||
            v.name.toLowerCase().includes('heera')
        );
        chosenVoice = indianEn || voices[0] || null;
        targetLang = 'hi-IN';
      }
    } else {
      // English Voice
      targetLang = 'en-IN';
      const indianEnVoice = voices.find(
        (v) =>
          v.lang.toLowerCase() === 'en-in' ||
          v.name.toLowerCase().includes('india') ||
          v.name.toLowerCase().includes('ravi')
      );
      chosenVoice = indianEnVoice || voices.find((v) => v.lang.startsWith('en')) || null;
    }

    const utterance = new SpeechSynthesisUtterance(finalText);
    this.currentUtterance = utterance;
    utterance.lang = targetLang;
    utterance.rate = language === 'hi' ? 0.88 : 0.95; // Calm, clear cadence for rural citizens
    utterance.pitch = 1.0;

    if (chosenVoice) {
      utterance.voice = chosenVoice;
    }

    utterance.onstart = () => {
      onStart?.();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      onEnd?.();
    };

    utterance.onerror = (e) => {
      this.currentUtterance = null;
      onError?.(e);
    };

    window.speechSynthesis.speak(utterance);
  }

  /**
   * Stop current speech playback
   */
  public stop(): void {
    if (this.isSynthesisSupported()) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }

  /**
   * Pause speech
   */
  public pause(): void {
    if (this.isSynthesisSupported() && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
    }
  }

  /**
   * Resume paused speech
   */
  public resume(): void {
    if (this.isSynthesisSupported() && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }

  /**
   * Start microphone voice recognition
   */
  public startListening(
    language: Language = 'en',
    handlers: SpeechRecognitionHandlers
  ): boolean {
    if (!this.isRecognitionSupported()) {
      handlers.onError('Speech recognition not supported in this browser.');
      return false;
    }

    this.stopListening();

    try {
      const SpeechRecognitionConstructor =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      const recognition = new SpeechRecognitionConstructor();
      this.recognition = recognition;

      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        handlers.onStart?.();
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptPiece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPiece;
          } else {
            interimTranscript += transcriptPiece;
          }
        }

        const fullText = finalTranscript || interimTranscript;
        handlers.onResult(fullText, !!finalTranscript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error event:', event.error);
        handlers.onError(event.error || 'Speech recognition error');
      };

      recognition.onend = () => {
        this.recognition = null;
        handlers.onEnd();
      };

      recognition.start();
      return true;
    } catch (err: any) {
      handlers.onError(err?.message || 'Failed to start microphone');
      return false;
    }
  }

  /**
   * Stop speech recognition
   */
  public stopListening(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
      this.recognition = null;
    }
  }
}

export const SpeechService = new SpeechServiceImpl();
