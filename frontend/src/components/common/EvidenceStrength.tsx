import React from 'react';
import type { ConfidenceLevel } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { ShieldCheck } from 'lucide-react';

interface EvidenceStrengthProps {
  confidence?: ConfidenceLevel | string;
  authoritativeCount?: number;
  supportingCount?: number;
  conflictingCount?: number;
  className?: string;
}

export const EvidenceStrength: React.FC<EvidenceStrengthProps> = ({
  confidence = 'HIGH',
  authoritativeCount = 2,
  supportingCount = 1,
  conflictingCount = 0,
  className = '',
}) => {
  const { t } = useLanguage();

  const levelStr = String(confidence).toUpperCase();
  const isHigh = levelStr.includes('HIGH');
  const isModerate = levelStr.includes('MED') || levelStr.includes('MODERATE');
  
  const levelLabel = isHigh
    ? t('strength_high')
    : isModerate
    ? t('strength_moderate')
    : t('strength_limited');

  const levelDesc = isHigh
    ? t('strength_high_desc')
    : isModerate
    ? t('strength_moderate_desc')
    : t('strength_limited_desc');

  const activeBars = isHigh ? 3 : isModerate ? 2 : 1;

  const barColor = isHigh
    ? 'bg-emerald-600 dark:bg-emerald-400'
    : isModerate
    ? 'bg-amber-600 dark:bg-amber-400'
    : 'bg-rose-600 dark:bg-rose-400';

  return (
    <div className={`p-4 rounded-2xl bg-surface border border-border ${className}`}>
      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            {t('strength_label')}
          </span>
        </div>
        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-surface-secondary border border-border text-text-primary">
          {levelLabel}
        </span>
      </div>

      {/* 3-segment progress indicator */}
      <div className="grid grid-cols-3 gap-1.5 mb-2.5" role="meter" aria-valuenow={activeBars} aria-valuemin={1} aria-valuemax={3}>
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            className={`h-1.5 rounded-full transition-colors duration-200 ${
              step <= activeBars ? barColor : 'bg-surface-secondary'
            }`}
          />
        ))}
      </div>

      <p className="text-xs text-text-muted mb-3 leading-relaxed">
        {levelDesc}
      </p>

      {/* Authoritative breakdown */}
      <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-text-secondary font-medium pt-2 border-t border-border/60">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span><strong>{authoritativeCount}</strong> {t('strength_authoritative')}</span>
        </div>
        {supportingCount > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span><strong>{supportingCount}</strong> {t('strength_supporting')}</span>
          </div>
        )}
        {conflictingCount > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span><strong>{conflictingCount}</strong> {t('strength_conflicting')}</span>
          </div>
        )}
      </div>
    </div>
  );
};
