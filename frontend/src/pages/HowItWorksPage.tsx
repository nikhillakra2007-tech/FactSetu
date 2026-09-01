import React from 'react';
import { Scale, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { VerdictBadge } from '../components/common/VerdictBadge';

interface HowItWorksPageProps {
  onNavigate: (route: string) => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ onNavigate }) => {
  const { t, isHindi } = useLanguage();

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-soft text-primary text-xs font-bold border border-primary/20 mb-4">
          <Scale size={14} />
          <span>{t('nav_how_it_works')}</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-text-primary tracking-tight mb-3">
          {t('hiw_page_title')}
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
          {t('hiw_page_subtitle')}
        </p>
      </div>

      {/* Section 1: Ingestion & Parsing */}
      <div className="p-8 rounded-3xl bg-surface border border-border mb-8 shadow-xs">
        <h2 className="text-lg sm:text-xl font-bold font-display text-text-primary mb-3">
          {t('hiw_section1_title')}
        </h2>
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-4">
          {t('hiw_section1_p1')}
        </p>
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
          {t('hiw_section1_p2')}
        </p>
      </div>

      {/* Section 2: Understanding 3 Verdicts */}
      <div className="p-8 rounded-3xl bg-surface border border-border mb-8 shadow-xs space-y-6">
        <h2 className="text-lg sm:text-xl font-bold font-display text-text-primary">
          {t('hiw_section2_title')}
        </h2>

        {/* Verdict 1: Verified */}
        <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60">
          <div className="flex items-center gap-3 mb-2">
            <VerdictBadge verdict="VERIFIED" size="sm" />
            <span className="font-bold text-sm text-text-primary">{t('hiw_v_verified_title')}</span>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            {t('hiw_v_verified_desc')}
          </p>
        </div>

        {/* Verdict 2: Contradicted */}
        <div className="p-5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60">
          <div className="flex items-center gap-3 mb-2">
            <VerdictBadge verdict="CONTRADICTED" size="sm" />
            <span className="font-bold text-sm text-text-primary">{t('hiw_v_contradicted_title')}</span>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            {t('hiw_v_contradicted_desc')}
          </p>
        </div>

        {/* Verdict 3: Uncertain */}
        <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60">
          <div className="flex items-center gap-3 mb-2">
            <VerdictBadge verdict="UNCERTAIN" size="sm" />
            <span className="font-bold text-sm text-text-primary">{t('hiw_v_uncertain_title')}</span>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            {t('hiw_v_uncertain_desc')}
          </p>
        </div>
      </div>

      {/* Section 3: Why Evidence Matters */}
      <div className="p-8 rounded-3xl bg-surface border border-border mb-12 shadow-xs">
        <h2 className="text-lg sm:text-xl font-bold font-display text-text-primary mb-3">
          {t('hiw_section3_title')}
        </h2>
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
          {t('hiw_section3_desc')}
        </p>
      </div>

      {/* CTA Box */}
      <div className="p-8 rounded-3xl bg-primary-soft border border-primary/20 text-center">
        <h3 className="font-bold text-base text-primary mb-2">
          {isHindi ? 'क्या आप किसी दावे की पुष्टि करना चाहते हैं?' : 'Ready to verify a suspicious message?'}
        </h3>
        <button
          type="button"
          onClick={() => onNavigate('/app')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold text-xs shadow-xs hover:bg-primary-hover transition-all"
        >
          <Sparkles size={14} />
          <span>{t('hero_cta_check')}</span>
        </button>
      </div>
    </div>
  );
};
