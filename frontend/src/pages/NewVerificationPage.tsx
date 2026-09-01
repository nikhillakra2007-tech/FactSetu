import React, { useState, useRef, useEffect } from 'react';
import { Upload, Mic, Type, ArrowRight, Image as ImageIcon, CheckCircle, RefreshCw, X, Square, Sparkles, Shield, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import type { InputMode, VerificationResultData } from '../types';
import { ApiService, SAMPLE_CLAIMS_DATA } from '../services/api';
import { OcrService } from '../services/ocr';
import { SpeechService } from '../services/speech';
import type { SpeechState } from '../services/speech';
import { VoiceGuideHelper } from '../components/common/VoiceGuideHelper';

interface NewVerificationPageProps {
  initialInput?: string;
  initialMode?: InputMode;
  onVerificationComplete: (result: VerificationResultData) => void;
  onNavigate?: (route: string) => void;
}

export const NewVerificationPage: React.FC<NewVerificationPageProps> = ({
  initialInput = '',
  initialMode = 'text',
  onVerificationComplete,
}) => {
  const { t, language, isHindi } = useLanguage();

  const [activeTab, setActiveTab] = useState<InputMode>(initialMode);
  const [inputText, setInputText] = useState(initialInput);

  // Image Upload / OCR State
  const [uploadedImageName, setUploadedImageName] = useState<string | null>(null);
  const [ocrDetectedText, setOcrDetectedText] = useState<string | null>(null);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Voice State
  const [speechState, setSpeechState] = useState<SpeechState>('IDLE');
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Verification Pipeline Progress State
  const [isVerifying, setIsVerifying] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);

  // Initialize with initialInput if provided
  useEffect(() => {
    if (initialInput) {
      setInputText(initialInput);
    }
  }, [initialInput]);

  useEffect(() => {
    if (initialMode) {
      setActiveTab(initialMode);
    }
  }, [initialMode]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      SpeechService.stopListening();
    };
  }, []);

  const handleTabSwitch = (mode: InputMode) => {
    setActiveTab(mode);
    if (mode === 'text' && ocrDetectedText && !inputText) {
      setInputText(ocrDetectedText);
    }
    if (mode === 'text' && voiceTranscript && !inputText) {
      setInputText(voiceTranscript);
    }
  };

  // OCR Processing
  const handleImageSelect = async (file: File) => {
    setUploadedImageName(file.name);
    setIsOcrProcessing(true);
    setOcrError(null);

    try {
      const result = await OcrService.extractTextFromImage(file);
      setOcrDetectedText(result.text);
    } catch {
      setOcrError(t('ocr_error_unreadable'));
    } finally {
      setIsOcrProcessing(false);
    }
  };

  // Voice Recording
  const handleStartVoice = () => {
    setSpeechError(null);
    setVoiceTranscript('');

    const started = SpeechService.startListening(language, {
      onStart: () => {
        setSpeechState('LISTENING');
      },
      onResult: (transcript, isFinal) => {
        setVoiceTranscript(transcript);
        if (isFinal) {
          setSpeechState('TRANSCRIPT_READY');
        }
      },
      onError: (err) => {
        console.warn('Voice recognition error:', err);
        setSpeechState('ERROR');
        if (err.includes('not-allowed') || err.includes('permission')) {
          setSpeechError(t('voice_permission_denied'));
        } else {
          setSpeechError(t('voice_unsupported'));
        }
      },
      onEnd: () => {
        setSpeechState((prev) => (prev === 'LISTENING' ? 'TRANSCRIPT_READY' : prev));
      },
    });

    if (!started) {
      setSpeechState('UNSUPPORTED');
      setSpeechError(t('voice_unsupported'));
    }
  };

  const handleStopVoice = () => {
    SpeechService.stopListening();
    setSpeechState('TRANSCRIPT_READY');
  };

  // Execute Verification
  const handleRunVerification = async (textToVerify: string) => {
    const cleanText = textToVerify.trim();
    if (!cleanText) return;

    setIsVerifying(true);
    setPipelineStep(1);

    const stepInterval = setInterval(() => {
      setPipelineStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 400);

    try {
      const result = await ApiService.verifyText(cleanText, activeTab, language);
      clearInterval(stepInterval);
      setPipelineStep(5);

      setTimeout(() => {
        setIsVerifying(false);
        onVerificationComplete(result);
      }, 450);
    } catch (err) {
      clearInterval(stepInterval);
      setIsVerifying(false);
      console.error(err);
    }
  };

  const handleVoiceTranscriptReceived = (transcript: string) => {
    setInputText(transcript);
    setActiveTab('text');
    handleRunVerification(transcript);
  };

  const pipelineSteps = [
    { num: 1, label: t('progress_step_1') },
    { num: 2, label: t('progress_step_2') },
    { num: 3, label: t('progress_step_3') },
    { num: 4, label: t('progress_step_4') },
    { num: 5, label: t('progress_step_5') },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-soft text-primary text-xs font-bold border border-primary/20 mb-4">
          <Shield size={14} />
          <span>{t('app_title')}</span>
        </div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl text-text-primary tracking-tight mb-2">
          {t('app_composer_title')}
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary">
          {t('app_subtitle')}
        </p>
      </div>

      {/* Voice-First Low-Literacy Helper Banner */}
      <div className="mb-6">
        <VoiceGuideHelper onTranscriptReady={handleVoiceTranscriptReceived} />
      </div>

      {/* Input Mode Tabs */}
      <div className="grid grid-cols-3 gap-2.5 max-w-md mx-auto mb-6">
        <button
          type="button"
          onClick={() => handleTabSwitch('text')}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-2xl font-bold text-xs transition-all duration-200 transform active:scale-95 cursor-pointer border ${
            activeTab === 'text'
              ? 'bg-primary text-white border-primary shadow-xs scale-[1.02]'
              : 'bg-surface text-text-secondary border-border hover:border-primary/40 hover:bg-surface-secondary'
          }`}
        >
          <Type size={16} />
          <span>{t('app_tab_text')}</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabSwitch('image')}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-2xl font-bold text-xs transition-all duration-200 transform active:scale-95 cursor-pointer border ${
            activeTab === 'image'
              ? 'bg-primary text-white border-primary shadow-xs scale-[1.02]'
              : 'bg-surface text-text-secondary border-border hover:border-primary/40 hover:bg-surface-secondary'
          }`}
        >
          <ImageIcon size={16} />
          <span>{t('app_tab_image')}</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabSwitch('voice')}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-2xl font-bold text-xs transition-all duration-200 transform active:scale-95 cursor-pointer border ${
            activeTab === 'voice'
              ? 'bg-primary text-white border-primary shadow-xs scale-[1.02]'
              : 'bg-surface text-text-secondary border-border hover:border-primary/40 hover:bg-surface-secondary'
          }`}
        >
          <Mic size={16} />
          <span>{t('app_tab_voice')}</span>
        </button>
      </div>

      {/* Main Interactive Composer Box */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border shadow-xs relative overflow-hidden">
        {/* Progress Overlay during Verification */}
        {isVerifying && (
          <div className="absolute inset-0 z-30 bg-surface/95 backdrop-blur-xs p-6 sm:p-8 flex flex-col items-center justify-center text-center animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-primary-soft text-primary flex items-center justify-center mb-4">
              <RefreshCw size={24} className="animate-spin text-primary" />
            </div>

            <h3 className="text-base sm:text-lg font-bold text-text-primary font-display mb-1">
              {t('progress_title')}
            </h3>
            <p className="text-xs text-text-secondary mb-6 max-w-sm">
              {t('progress_subtitle')}
            </p>

            <div className="w-full max-w-sm space-y-2 text-left text-xs font-semibold">
              {pipelineSteps.map((step) => {
                const isComplete = pipelineStep >= step.num;
                const isActive = pipelineStep === step.num - 1;

                return (
                  <div
                    key={step.num}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-all ${
                      isComplete
                        ? 'text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800'
                        : isActive
                        ? 'text-primary bg-primary-soft border border-primary/30'
                        : 'text-text-muted border border-transparent'
                    }`}
                  >
                    <span className="w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0">
                      {isComplete ? '✓' : step.num}
                    </span>
                    <span>{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 1: TEXT COMPOSER */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            <div className="relative">
              <textarea
                rows={5}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t('app_placeholder_text')}
                className="w-full p-4 rounded-2xl bg-surface-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium text-text-primary outline-none transition-all resize-none leading-relaxed"
                aria-label="Claim text"
              />
              {inputText && (
                <button
                  type="button"
                  onClick={() => setInputText('')}
                  className="absolute top-3 right-3 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
                  aria-label={t('app_btn_clear')}
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <span className="text-xs text-text-muted">
                {inputText.length} {t('app_char_count')}
              </span>

              <div className="flex items-center gap-2">
                {inputText && (
                  <button
                    type="button"
                    onClick={() => setInputText('')}
                    className="px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-secondary border border-border text-xs font-bold text-text-secondary transition-colors"
                  >
                    {t('app_btn_clear')}
                  </button>
                )}
                <button
                  type="button"
                  disabled={!inputText.trim()}
                  onClick={() => handleRunVerification(inputText)}
                  className="px-6 py-2.5 rounded-xl bg-primary disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs shadow-xs hover:bg-primary-hover active:scale-[0.98] flex items-center gap-2 transition-all"
                >
                  <Sparkles size={14} />
                  <span>{t('app_btn_verify')}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: IMAGE UPLOAD / OCR */}
        {activeTab === 'image' && (
          <div className="space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageSelect(file);
              }}
            />

            {!uploadedImageName ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border hover:border-primary/60 rounded-3xl p-8 sm:p-12 text-center cursor-pointer bg-surface-secondary/40 hover:bg-surface-secondary transition-colors group"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary-soft text-primary flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                  <Upload size={22} />
                </div>
                <h4 className="text-sm font-bold text-text-primary mb-1">
                  {t('ocr_drag_drop')}
                </h4>
                <p className="text-xs text-text-muted">
                  {t('ocr_supported_formats')}
                </p>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-surface-secondary border border-border space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon size={18} className="text-primary" />
                    <span className="text-xs font-bold text-text-primary truncate max-w-xs">
                      {uploadedImageName}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedImageName(null);
                      setOcrDetectedText(null);
                    }}
                    className="text-xs text-rose-600 font-bold hover:underline"
                  >
                    {t('ocr_btn_remove')}
                  </button>
                </div>

                {isOcrProcessing ? (
                  <div className="flex items-center gap-2 text-xs text-text-muted py-3">
                    <RefreshCw size={14} className="animate-spin text-primary" />
                    <span>{t('ocr_processing')}</span>
                  </div>
                ) : ocrError ? (
                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 text-xs border border-rose-200 dark:border-rose-800 flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{ocrError}</span>
                  </div>
                ) : ocrDetectedText ? (
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle size={14} />
                      <span>{t('ocr_detected_heading')}</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-surface border border-border text-xs font-medium text-text-primary leading-relaxed">
                      "{ocrDetectedText}"
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setInputText(ocrDetectedText);
                          setActiveTab('text');
                        }}
                        className="px-4 py-2 rounded-xl bg-surface hover:bg-surface-secondary border border-border text-xs font-bold text-text-secondary"
                      >
                        {t('ocr_btn_edit')}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRunVerification(ocrDetectedText)}
                        className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-xs hover:bg-primary-hover flex items-center gap-1.5"
                      >
                        <span>{t('ocr_btn_verify_extracted')}</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: VOICE VERIFICATION */}
        {activeTab === 'voice' && (
          <div className="text-center py-6 space-y-6">
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={speechState === 'LISTENING' ? handleStopVoice : handleStartVoice}
                className={`w-18 h-18 rounded-3xl flex items-center justify-center transition-all ${
                  speechState === 'LISTENING'
                    ? 'bg-rose-600 text-white shadow-md animate-pulse-subtle scale-105'
                    : 'bg-primary text-white shadow-xs hover:bg-primary-hover'
                }`}
                aria-label={speechState === 'LISTENING' ? t('voice_btn_stop') : t('voice_btn_speak')}
              >
                {speechState === 'LISTENING' ? <Square size={26} /> : <Mic size={26} />}
              </button>

              <h4 className="text-sm font-bold text-text-primary mt-4">
                {speechState === 'LISTENING' ? t('voice_listening') : t('voice_prompt_idle')}
              </h4>
              <p className="text-xs text-text-muted mt-1">
                {isHindi ? 'भाषा: हिन्दी (भारत) - hi-IN' : 'Language: English (India) - en-IN'}
              </p>
            </div>

            {speechError && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 text-xs border border-rose-200 dark:border-rose-800 flex items-center justify-center gap-2 max-w-md mx-auto">
                <AlertCircle size={15} className="shrink-0" />
                <span>{speechError}</span>
              </div>
            )}

            {voiceTranscript && (
              <div className="p-4 rounded-2xl bg-surface-secondary border border-border text-left space-y-3">
                <span className="text-xs font-bold text-primary">
                  {t('voice_transcript_ready')}
                </span>
                <p className="text-xs sm:text-sm font-semibold text-text-primary">
                  "{voiceTranscript}"
                </p>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setInputText(voiceTranscript);
                      setActiveTab('text');
                    }}
                    className="px-4 py-2 rounded-xl bg-surface border border-border text-xs font-bold text-text-secondary"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRunVerification(voiceTranscript)}
                    className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-xs hover:bg-primary-hover flex items-center gap-1.5"
                  >
                    <span>{t('app_btn_verify')}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Common Viral Samples */}
      <div className="mt-8">
        <span className="text-xs font-bold uppercase tracking-wider text-text-secondary block mb-3 flex items-center gap-2">
          <Sparkles size={13} className="text-primary" />
          {t('app_quick_samples')}
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 spotlight-group">
          {SAMPLE_CLAIMS_DATA.slice(0, 4).map((sample) => {
            const title = isHindi ? sample.title_hi : sample.title;
            const text = isHindi ? sample.text_hi : sample.text;

            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => {
                  setInputText(text);
                  setActiveTab('text');
                }}
                className="p-4 rounded-2xl bg-surface border border-border hover:border-primary/40 text-left transition-colors group focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors">
                    {title}
                  </span>
                  <ArrowRight size={13} className="text-text-muted group-hover:text-primary transition-colors" />
                </div>
                <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                  "{text}"
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
