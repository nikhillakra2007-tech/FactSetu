import { en } from './en';
import { hi } from './hi';

export type Language = 'en' | 'hi';
export type TranslationKey = keyof typeof en;

export const translations: Record<Language, Record<TranslationKey, string>> = {
  en,
  hi,
};

/**
 * Helper to translate verdict labels into the active language
 */
export function getLocalizedVerdict(verdict: string | undefined, lang: Language): { label: string; desc: string } {
  const v = (verdict || 'UNCERTAIN').toUpperCase();
  if (v.includes('VERIFIED')) {
    return {
      label: translations[lang].verdict_verified,
      desc: translations[lang].verdict_verified_desc,
    };
  }
  if (v.includes('CONTRADICTED')) {
    return {
      label: translations[lang].verdict_contradicted,
      desc: translations[lang].verdict_contradicted_desc,
    };
  }
  return {
    label: translations[lang].verdict_uncertain,
    desc: translations[lang].verdict_uncertain_desc,
  };
}

/**
 * Helper to translate audit step labels
 */
export function getLocalizedAuditStep(step: string, lang: Language): string {
  const dict = translations[lang];
  const s = step.toLowerCase();
  if (s.includes('extract') || s.includes('claim')) return dict.progress_step_2;
  if (s.includes('queried') || s.includes('sources')) return dict.progress_step_3;
  if (s.includes('evidence') || s.includes('compared')) return dict.progress_step_4;
  if (s.includes('verdict') || s.includes('synthes') || s.includes('formulat')) return dict.progress_step_5;
  return step;
}
