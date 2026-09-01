import React, { useState, useEffect } from 'react';
import { Volume2, Square } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { SpeechService } from '../../services/speech';

interface AudioPlayerProps {
  textToSpeakEn: string;
  textToSpeakHi?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  textToSpeakEn,
  textToSpeakHi,
}) => {
  const { t, language, isHindi } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      SpeechService.stop();
    };
  }, []);

  const handleTogglePlay = () => {
    if (isPlaying) {
      SpeechService.stop();
      setIsPlaying(false);
      return;
    }

    const textToSpeak = isHindi && textToSpeakHi ? textToSpeakHi : textToSpeakEn;

    SpeechService.speak(
      textToSpeak,
      language,
      () => setIsPlaying(true),
      () => setIsPlaying(false),
      () => setIsPlaying(false)
    );
  };

  return (
    <button
      type="button"
      onClick={handleTogglePlay}
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
        isPlaying
          ? 'bg-primary text-white shadow-sm animate-pulse-subtle'
          : 'bg-primary-soft text-primary hover:bg-primary/15 border border-primary/25'
      }`}
      aria-label={isPlaying ? t('workspace_listening_active') : t('workspace_listen_result')}
    >
      {isPlaying ? (
        <>
          <Square size={13} className="fill-current" />
          <span>{t('workspace_listening_active')}</span>
        </>
      ) : (
        <>
          <Volume2 size={15} />
          <span>{t('workspace_listen_result')}</span>
        </>
      )}
    </button>
  );
};
