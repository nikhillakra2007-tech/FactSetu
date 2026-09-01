import React from 'react';
import type { ClaimItem } from '../../types';
import { Shield, ArrowDown } from 'lucide-react';
import { VerdictBadge } from '../common/VerdictBadge';
import { useLanguage } from '../../context/LanguageContext';

interface ProvenanceBarProps {
  claim: ClaimItem;
}

export const ProvenanceBar: React.FC<ProvenanceBarProps> = ({ claim }) => {
  const { t, language } = useLanguage();

  const sources = Array.from(
    new Set(claim.evidence?.map((e) => e.source_name) || ['Official Source'])
  ).slice(0, 3);

  const verdict = claim.verification?.verdict || 'UNCERTAIN';
  const claimText = (language === 'hi' && claim.claim_text_hi) ? claim.claim_text_hi : claim.claim_text;

  return (
    <div className="p-5 rounded-2xl bg-surface-secondary/70 border border-border">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary" />
          {t('workspace_provenance_title')}
        </h4>
        <span className="text-[11px] text-text-muted px-2 py-0.5 rounded-md bg-surface border border-border">
          {t('workspace_provenance_sources')} ({sources.length})
        </span>
      </div>

      <div className="flex flex-col items-center gap-2 py-2">
        {/* Top: Claim Node */}
        <div className="w-full max-w-md p-3 rounded-xl bg-surface border border-border shadow-xs text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-0.5">
            {t('workspace_provenance_claim')}
          </span>
          <p className="text-xs font-semibold text-text-primary line-clamp-1">
            "{claimText}"
          </p>
        </div>

        {/* Down Arrow connector */}
        <div className="flex items-center justify-center text-text-muted py-0.5">
          <ArrowDown size={15} />
        </div>

        {/* Middle: Sources Row */}
        <div
          className={`w-full max-w-md ${
            sources.length === 1
              ? 'flex justify-center'
              : sources.length === 2
              ? 'grid grid-cols-1 sm:grid-cols-2 gap-2.5'
              : 'grid grid-cols-1 sm:grid-cols-3 gap-2'
          }`}
        >
          {sources.map((src, i) => (
            <div
              key={i}
              className={`p-2.5 rounded-xl bg-surface border border-border text-center flex flex-col items-center justify-center ${
                sources.length === 1 ? 'w-full max-w-xs' : ''
              }`}
            >
              <div className="w-6 h-6 rounded-lg bg-primary-soft text-primary flex items-center justify-center mb-1">
                <Shield size={12} />
              </div>
              <span className="text-xs font-bold text-text-primary line-clamp-1">
                {src}
              </span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
                Official Registry
              </span>
            </div>
          ))}
        </div>

        {/* Down Arrow connector */}
        <div className="flex items-center justify-center text-text-muted py-0.5">
          <ArrowDown size={15} />
        </div>

        {/* Bottom: Final Verdict */}
        <div className="w-full max-w-md flex items-center justify-center">
          <VerdictBadge verdict={verdict} size="md" />
        </div>
      </div>
    </div>
  );
};
