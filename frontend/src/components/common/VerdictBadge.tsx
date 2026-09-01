import React from 'react';
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import type { VerdictType } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { getLocalizedVerdict } from '../../locales/translations';

interface VerdictBadgeProps {
  verdict: VerdictType | string;
  size?: 'sm' | 'md' | 'lg';
  showDescription?: boolean;
  className?: string;
}

export const VerdictBadge: React.FC<VerdictBadgeProps> = ({
  verdict,
  size = 'md',
  showDescription = false,
  className = '',
}) => {
  const { language } = useLanguage();
  const vNorm = (typeof verdict === 'string' ? verdict : 'UNCERTAIN').toUpperCase();

  const isVerified = vNorm.includes('VERIFIED');
  const isContradicted = vNorm.includes('CONTRADICTED');

  const localized = getLocalizedVerdict(vNorm, language);

  const styleConfig = isVerified
    ? {
        icon: CheckCircle2,
        textColor: 'text-emerald-800 dark:text-emerald-300',
        bgColor: 'bg-emerald-50 dark:bg-emerald-950/60',
        borderColor: 'border-emerald-200 dark:border-emerald-800',
      }
    : isContradicted
    ? {
        icon: XCircle,
        textColor: 'text-rose-800 dark:text-rose-300',
        bgColor: 'bg-rose-50 dark:bg-rose-950/60',
        borderColor: 'border-rose-200 dark:border-rose-800',
      }
    : {
        icon: HelpCircle,
        textColor: 'text-amber-800 dark:text-amber-300',
        bgColor: 'bg-amber-50 dark:bg-amber-950/60',
        borderColor: 'border-amber-200 dark:border-amber-800',
      };

  const IconComponent = styleConfig.icon;

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1.5 font-semibold rounded-lg',
    md: 'px-3.5 py-1.5 text-sm gap-2 font-bold rounded-xl',
    lg: 'px-4 py-2 text-base gap-2.5 font-bold rounded-xl',
  }[size];

  const iconSizes = {
    sm: 14,
    md: 17,
    lg: 20,
  }[size];

  return (
    <div className={`flex flex-col ${className}`}>
      <div
        className={`inline-flex items-center border ${styleConfig.bgColor} ${styleConfig.borderColor} ${styleConfig.textColor} ${sizeClasses} select-none transition-colors duration-200`}
        role="status"
        aria-label={`Verdict: ${localized.label}`}
      >
        <IconComponent size={iconSizes} className="shrink-0 stroke-[2.2]" aria-hidden="true" />
        <span className="tracking-wide">{localized.label}</span>
      </div>

      {showDescription && (
        <p className="mt-2 text-xs sm:text-sm text-text-secondary leading-relaxed font-normal">
          {localized.desc}
        </p>
      )}
    </div>
  );
};
