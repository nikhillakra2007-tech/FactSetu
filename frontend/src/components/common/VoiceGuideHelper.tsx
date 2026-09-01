import React, { useState } from 'react';
import { Mic, Volume2, Sparkles, X, Radio } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { SpeechService } from '../../services/speech';

interface VoiceGuideHelperProps {
  onTranscriptReady: (transcript: string) => void;
}

export const VoiceGuideHelper: React.FC<VoiceGuideHelperProps> = ({ onTranscriptReady }) => {
  const { isHindi } = useLanguage();
  const [isSpeakingGuide, setIsSpeakingGuide] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const guideTextHi =
    'नमस्ते! आप फैक्टसेतु से बोलकर कोई भी सरकारी योजना, समाचार या व्हाट्सएप संदेश की सत्यता जांच सकते हैं। माइक चालू है, अपना संदेश बोलें।';
  const guideTextEn =
    'Welcome! You can speak any government scheme, news, or WhatsApp message to verify against official records. The microphone is on, please speak now.';

  const handleStartVoiceFlow = () => {
    setIsOpen(true);
    setIsSpeakingGuide(true);

    const spokenText = isHindi ? guideTextHi : guideTextEn;

    SpeechService.speak(
      spokenText,
      isHindi ? 'hi' : 'en',
      () => setIsSpeakingGuide(true),
      () => {
        setIsSpeakingGuide(false);
        // Automatically start listening after guidance prompt finishes
        startMicrophone();
      },
      () => {
        setIsSpeakingGuide(false);
        startMicrophone();
      }
    );
  };

  const startMicrophone = () => {
    setIsListening(true);
    setLiveTranscript('');

    SpeechService.startListening(isHindi ? 'hi' : 'en', {
      onStart: () => setIsListening(true),
      onResult: (text, isFinal) => {
        setLiveTranscript(text);
        if (isFinal && text.trim()) {
          onTranscriptReady(text.trim());
          setTimeout(() => {
            setIsListening(false);
            setIsOpen(false);
          }, 600);
        }
      },
      onError: () => {
        setIsListening(false);
      },
      onEnd: () => {
        setIsListening(false);
      },
    });
  };

  const handleClose = () => {
    SpeechService.stop();
    SpeechService.stopListening();
    setIsSpeakingGuide(false);
    setIsListening(false);
    setIsOpen(false);
  };

  return (
    <div>
      {/* Trigger Button on Composer */}
      <button
        type="button"
        onClick={handleStartVoiceFlow}
        className="w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-emerald-600/10 hover:from-blue-600/15 hover:to-emerald-600/15 border border-primary/30 transition-all text-left cursor-pointer group shadow-xs"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <Mic size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-text-primary">
                {isHindi ? '🎙️ बोलकर पूछें (आवाज़ सहायक गाइड)' : '🎙️ Ask by Speaking (Voice Guide)'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-white">
                {isHindi ? 'सरल मोड' : 'Easy Voice'}
              </span>
            </div>
            <p className="text-[11px] text-text-muted">
              {isHindi
                ? 'टाइप करने की ज़रूरत नहीं — बस माइक दबाएं और हिन्दी में बोलें'
                : 'No typing needed — speak naturally in Hindi or English'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-primary font-bold text-xs shrink-0">
          <span>{isHindi ? 'शुरू करें' : 'Start Voice'}</span>
          <Sparkles size={14} />
        </div>
      </button>

      {/* Voice Assistant Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
          data-lenis-prevent
        >
          <div className="w-full max-w-md bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-2xl animate-scale-in text-center space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Radio size={14} className="animate-pulse text-emerald-500" />
                {isHindi ? 'फैक्टसेतु आवाज़ सहायक' : 'FactSetu Voice Assistant'}
              </span>
              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 rounded-full hover:bg-surface-secondary text-text-muted transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Pulsing Visual Wave */}
            <div className="py-6">
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                <div
                  className={`absolute inset-0 rounded-full bg-primary/20 animate-ping ${
                    isListening ? 'duration-1000' : 'hidden'
                  }`}
                />
                <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center shadow-lg">
                  {isSpeakingGuide ? (
                    <Volume2 size={36} className="animate-pulse" />
                  ) : (
                    <Mic size={36} className="animate-pulse text-white" />
                  )}
                </div>
              </div>

              <div className="mt-5">
                <h3 className="text-base font-bold text-text-primary">
                  {isSpeakingGuide
                    ? isHindi
                      ? 'सहायक बोल रहा है...'
                      : 'Voice Assistant Speaking...'
                    : isListening
                    ? isHindi
                      ? 'सुन रहे हैं... अपना संदेश बोलें'
                      : 'Listening... Please speak your claim'
                    : isHindi
                    ? 'तैयार'
                    : 'Ready'}
                </h3>
                <p className="text-xs text-text-secondary mt-1 max-w-xs mx-auto">
                  {isSpeakingGuide
                    ? isHindi
                      ? guideTextHi
                      : guideTextEn
                    : isHindi
                    ? 'जैसे: क्या 100 रुपये के नोट बंद हो गए हैं?'
                    : 'Example: Is 100 rupee note banned in India?'}
                </p>
              </div>
            </div>

            {/* Live Transcript Display */}
            {liveTranscript && (
              <div className="p-4 rounded-2xl bg-surface-secondary border border-border text-xs sm:text-sm font-semibold text-text-primary italic animate-fade-in">
                "{liveTranscript}"
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-3 rounded-xl bg-surface-secondary hover:bg-surface border border-border text-xs font-bold text-text-secondary cursor-pointer"
              >
                {isHindi ? 'रद्द करें' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (liveTranscript.trim()) {
                    onTranscriptReady(liveTranscript.trim());
                    handleClose();
                  } else {
                    startMicrophone();
                  }
                }}
                className="flex-1 py-3 rounded-xl bg-primary text-white hover:bg-primary-hover text-xs font-bold shadow-xs cursor-pointer"
              >
                {liveTranscript.trim()
                  ? isHindi
                    ? 'इसकी जांच करें →'
                    : 'Verify This →'
                  : isHindi
                    ? 'फिर से बोलें'
                    : 'Speak Again'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
