import React, { useState } from 'react';
import { Sun, Moon, Monitor, MoveHorizontal, Type, Volume2, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAccessibility } from '../context/AccessibilityContext';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { settings, setReducedMotion, setLargeText, setSpokenAudio } = useAccessibility();

  const [savedNotification, setSavedNotification] = useState<string | null>(null);

  const showSavedBadge = (msg: string) => {
    setSavedNotification(msg);
    setTimeout(() => setSavedNotification(null), 1800);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-text-primary tracking-tight mb-2">
          {t('settings_title')}
        </h1>
        <p className="text-sm text-text-secondary">
          Configure interface theme, active language, and accessibility preferences.
        </p>
      </div>

      {savedNotification && (
        <div className="mb-4 flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold animate-scale-in text-center">
          <Check size={14} className="shrink-0" />
          <span>{savedNotification}</span>
        </div>
      )}

      <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border shadow-xs space-y-8">
        {/* Appearance / Theme */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-text-secondary block mb-3">
            {t('settings_appearance')}
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'light', label: t('settings_theme_light'), icon: Sun },
              { id: 'dark', label: t('settings_theme_dark'), icon: Moon },
              { id: 'system', label: t('settings_theme_system'), icon: Monitor },
            ].map((item) => {
              const Icon = item.icon;
              const active = theme === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setTheme(item.id as any);
                    showSavedBadge(item.label);
                  }}
                  className={`flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl border text-xs font-bold transition-all duration-200 transform active:scale-95 cursor-pointer ${
                    active
                      ? 'bg-primary text-white border-primary shadow-sm scale-[1.02]'
                      : 'bg-surface-secondary text-text-secondary border-border hover:border-primary/40 hover:bg-surface-secondary/80'
                  }`}
                >
                  <Icon size={20} className="transition-transform duration-200" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Language Selection */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-text-secondary block mb-3">
            {t('settings_language')}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setLanguage('en');
                showSavedBadge('Language: English');
              }}
              className={`flex items-center justify-between p-4 rounded-2xl border text-xs font-bold transition-all duration-200 transform active:scale-95 cursor-pointer ${
                language === 'en'
                  ? 'bg-primary-soft text-primary border-primary shadow-xs'
                  : 'bg-surface-secondary text-text-secondary border-border hover:border-primary/30'
              }`}
            >
              <span>{t('settings_lang_en')}</span>
              {language === 'en' && (
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-scale-in" />
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setLanguage('hi');
                showSavedBadge('भाषा: हिन्दी');
              }}
              className={`flex items-center justify-between p-4 rounded-2xl border text-xs font-bold transition-all duration-200 transform active:scale-95 cursor-pointer ${
                language === 'hi'
                  ? 'bg-primary-soft text-primary border-primary shadow-xs'
                  : 'bg-surface-secondary text-text-secondary border-border hover:border-primary/30'
              }`}
            >
              <span>{t('settings_lang_hi')}</span>
              {language === 'hi' && (
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-scale-in" />
              )}
            </button>
          </div>
        </div>

        {/* Accessibility Options */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-text-secondary block mb-3">
            {t('settings_accessibility')}
          </label>

          <div className="space-y-3">
            {/* Reduced Motion */}
            <div
              onClick={() => {
                const next = !settings.reducedMotion;
                setReducedMotion(next);
                showSavedBadge(next ? 'Reduced Motion Enabled' : 'Reduced Motion Disabled');
              }}
              className="flex items-center justify-between p-4 rounded-2xl bg-surface-secondary border border-border hover:border-primary/30 active:scale-[0.99] transition-all duration-200 cursor-pointer select-none"
            >
              <div className="flex items-start gap-3.5 pr-4">
                <MoveHorizontal size={20} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-text-primary block">
                    {t('settings_reduced_motion')}
                  </span>
                  <span className="text-[11px] text-text-muted">
                    {t('settings_reduced_motion_sub')}
                  </span>
                </div>
              </div>
              <div
                className={`w-11 h-6 flex items-center rounded-full p-1 duration-300 cursor-pointer shrink-0 ${
                  settings.reducedMotion ? 'bg-primary' : 'bg-surface border border-border'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${
                    settings.reducedMotion ? 'translate-x-5' : 'translate-x-0 bg-text-muted'
                  }`}
                />
              </div>
            </div>

            {/* Large Text */}
            <div
              onClick={() => {
                const next = !settings.largeText;
                setLargeText(next);
                showSavedBadge(next ? 'Larger Text Enabled' : 'Larger Text Disabled');
              }}
              className="flex items-center justify-between p-4 rounded-2xl bg-surface-secondary border border-border hover:border-primary/30 active:scale-[0.99] transition-all duration-200 cursor-pointer select-none"
            >
              <div className="flex items-start gap-3.5 pr-4">
                <Type size={20} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-text-primary block">
                    {t('settings_large_text')}
                  </span>
                  <span className="text-[11px] text-text-muted">
                    {t('settings_large_text_sub')}
                  </span>
                </div>
              </div>
              <div
                className={`w-11 h-6 flex items-center rounded-full p-1 duration-300 cursor-pointer shrink-0 ${
                  settings.largeText ? 'bg-primary' : 'bg-surface border border-border'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${
                    settings.largeText ? 'translate-x-5' : 'translate-x-0 bg-text-muted'
                  }`}
                />
              </div>
            </div>

            {/* Spoken Results Audio */}
            <div
              onClick={() => {
                const next = !settings.spokenAudio;
                setSpokenAudio(next);
                showSavedBadge(next ? 'Voice Audio Enabled' : 'Voice Audio Disabled');
              }}
              className="flex items-center justify-between p-4 rounded-2xl bg-surface-secondary border border-border hover:border-primary/30 active:scale-[0.99] transition-all duration-200 cursor-pointer select-none"
            >
              <div className="flex items-start gap-3.5 pr-4">
                <Volume2 size={20} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-text-primary block">
                    {t('settings_spoken_results')}
                  </span>
                  <span className="text-[11px] text-text-muted">
                    {t('settings_spoken_results_sub')}
                  </span>
                </div>
              </div>
              <div
                className={`w-11 h-6 flex items-center rounded-full p-1 duration-300 cursor-pointer shrink-0 ${
                  settings.spokenAudio ? 'bg-primary' : 'bg-surface border border-border'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${
                    settings.spokenAudio ? 'translate-x-5' : 'translate-x-0 bg-text-muted'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
