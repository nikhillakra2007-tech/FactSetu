import React from 'react';
import { Shield, Sparkles, Users, Globe, Scale } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface AboutPageProps {
  onNavigate: (route: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-soft text-primary text-xs font-bold border border-primary/20 mb-4">
          <Users size={14} />
          <span>{t('nav_about')}</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-text-primary tracking-tight mb-3">
          {t('about_page_title')}
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
          {t('about_page_subtitle')}
        </p>
      </div>

      {/* Mission Section */}
      <div className="p-8 rounded-3xl bg-surface border border-border mb-8 shadow-xs">
        <h2 className="text-lg sm:text-xl font-bold font-display text-text-primary mb-3">
          {t('about_mission_title')}
        </h2>
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
          {t('about_mission_desc')}
        </p>
      </div>

      {/* 3 Pillars */}
      <div className="p-8 rounded-3xl bg-surface border border-border mb-12 shadow-xs space-y-6">
        <h2 className="text-lg sm:text-xl font-bold font-display text-text-primary">
          {t('about_pillars_title')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-surface-secondary border border-border">
            <div className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center font-bold mb-3">
              <Scale size={16} />
            </div>
            <h3 className="font-bold text-sm text-text-primary mb-1">
              {t('about_p1_title')}
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              {t('about_p1_desc')}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-surface-secondary border border-border">
            <div className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center font-bold mb-3">
              <Globe size={16} />
            </div>
            <h3 className="font-bold text-sm text-text-primary mb-1">
              {t('about_p2_title')}
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              {t('about_p2_desc')}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-surface-secondary border border-border">
            <div className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center font-bold mb-3">
              <Shield size={16} />
            </div>
            <h3 className="font-bold text-sm text-text-primary mb-1">
              {t('about_p3_title')}
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              {t('about_p3_desc')}
            </p>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => onNavigate('/app')}
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-primary text-white font-bold text-sm shadow-xs hover:bg-primary-hover transition-all"
        >
          <Sparkles size={16} />
          <span>{t('hero_cta_check')}</span>
        </button>
      </div>
    </div>
  );
};
