import React from 'react';
import type { ClaimItem } from '../../types';
import { VerdictBadge } from '../common/VerdictBadge';
import { ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface ClaimCardProps {
  claim: ClaimItem;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}

export const ClaimCard: React.FC<ClaimCardProps> = ({
  claim,
  index,
  isSelected,
  onSelect,
}) => {
  const { language, t } = useLanguage();
  const verdict = claim.verification?.verdict || 'UNCERTAIN';
  const claimText = (language === 'hi' && claim.claim_text_hi) ? claim.claim_text_hi : claim.claim_text;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 transform active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer ${
        isSelected
          ? 'bg-surface-secondary border-primary shadow-sm scale-[1.01]'
          : 'bg-surface border-border hover:border-primary/40 hover:bg-surface-secondary/60 hover:-translate-y-0.5'
      }`}
      aria-selected={isSelected}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              {t('workspace_claim_heading')} #{String(index + 1).padStart(2, '0')}
            </span>
            <span className="text-text-muted text-[10px]">•</span>
            <span className="text-[11px] font-medium text-text-muted capitalize">
              {claim.claim_type || 'Factual'}
            </span>
          </div>

          <p className="text-sm font-semibold text-text-primary line-clamp-2 leading-snug mb-3">
            "{claimText}"
          </p>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40">
            <VerdictBadge verdict={verdict} size="sm" />
            <div className="flex items-center gap-1 text-xs text-text-muted font-medium">
              <span>{claim.evidence?.length || 0} sources</span>
              <ChevronRight
                size={14}
                className={`transition-transform duration-200 ${
                  isSelected ? 'text-primary translate-x-0.5' : 'text-text-muted'
                }`}
              />
            </div>
          </div>
        </div>
      </div>
    </button>
  );
};
