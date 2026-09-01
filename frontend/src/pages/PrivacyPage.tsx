import React from 'react';
import { Lock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const PrivacyPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-soft text-primary text-xs font-bold border border-primary/20 mb-4">
          <Lock size={14} />
          <span>{t('nav_privacy')}</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-text-primary tracking-tight mb-3">
          {t('privacy_page_title')}
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
          {t('privacy_page_subtitle')}
        </p>
      </div>

      <div className="space-y-6">
        <div className="p-8 rounded-3xl bg-surface border border-border shadow-xs">
          <h2 className="text-lg font-bold font-display text-text-primary mb-3">
            {t('privacy_sec1_title')}
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            {t('privacy_sec1_desc')}
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-surface border border-border shadow-xs">
          <h2 className="text-lg font-bold font-display text-text-primary mb-3">
            {t('privacy_sec2_title')}
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            {t('privacy_sec2_desc')}
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-surface border border-border shadow-xs">
          <h2 className="text-lg font-bold font-display text-text-primary mb-3">
            {t('privacy_sec3_title')}
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            {t('privacy_sec3_desc')}
          </p>
        </div>
      </div>
    </div>
  );
};
