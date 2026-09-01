import React from 'react';
import { ShieldCheck, Check, X, Sparkles, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface WhyFactSetuPageProps {
  onNavigate: (route: string) => void;
}

export const WhyFactSetuPage: React.FC<WhyFactSetuPageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-soft text-primary text-xs font-bold border border-primary/20 mb-4">
          <ShieldCheck size={14} />
          <span>{t('nav_why_factsetu')}</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-text-primary tracking-tight mb-3">
          {t('why_page_title')}
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
          {t('why_page_subtitle')}
        </p>
      </div>

      {/* Comparison Grid */}
      <div className="p-8 rounded-3xl bg-surface border border-border mb-12 shadow-xs">
        <h2 className="text-lg sm:text-xl font-bold font-display text-text-primary mb-6 text-center">
          {t('why_comparison_title')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Chatbots Column */}
          <div className="p-6 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 space-y-4">
            <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-sm">
              <AlertCircle size={16} />
              <span>{t('why_chatbot_heading')}</span>
            </div>

            <ul className="space-y-3 text-xs sm:text-sm text-text-secondary">
              <li className="flex items-start gap-2.5">
                <X size={15} className="text-rose-600 shrink-0 mt-0.5" />
                <span>{t('why_chatbot_point1')}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <X size={15} className="text-rose-600 shrink-0 mt-0.5" />
                <span>{t('why_chatbot_point2')}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <X size={15} className="text-rose-600 shrink-0 mt-0.5" />
                <span>{t('why_chatbot_point3')}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <X size={15} className="text-rose-600 shrink-0 mt-0.5" />
                <span>{t('why_chatbot_point4')}</span>
              </li>
            </ul>
          </div>

          {/* FACTSETU Column */}
          <div className="p-6 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 space-y-4">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
              <ShieldCheck size={16} />
              <span>{t('why_factsetu_heading')}</span>
            </div>

            <ul className="space-y-3 text-xs sm:text-sm text-text-secondary">
              <li className="flex items-start gap-2.5">
                <Check size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>{t('why_factsetu_point1')}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>{t('why_factsetu_point2')}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>{t('why_factsetu_point3')}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>{t('why_factsetu_point4')}</span>
              </li>
            </ul>
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
