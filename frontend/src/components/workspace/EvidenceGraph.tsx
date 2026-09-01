import React from 'react';
import type { ClaimItem } from '../../types';
import { Shield, ArrowDown, Zap } from 'lucide-react';
import { VerdictBadge } from '../common/VerdictBadge';

interface EvidenceGraphProps {
  claim: ClaimItem;
}

export const EvidenceGraph: React.FC<EvidenceGraphProps> = ({ claim }) => {
  const sources = Array.from(
    new Set(claim.evidence?.map((e) => e.source_name) || ['Official Source'])
  ).slice(0, 3);

  const verdict = claim.verification?.verdict || 'UNCERTAIN';

  return (
    <div className="p-5 rounded-2xl bg-surface-secondary/80 border border-border relative overflow-hidden">
      {/* Subtle shimmer */}
      <div className="absolute inset-0 animate-shimmer pointer-events-none opacity-50" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
            <Zap size={12} className="text-accent" />
            Evidence Flow Bridge
          </h4>
          <span className="text-[11px] text-text-muted px-2 py-0.5 rounded-lg bg-surface border border-border">
            Multi-Source Provenance
          </span>
        </div>

        <div className="flex flex-col items-center gap-2 py-2">
          {/* Top: Claim Node */}
          <div className="w-full max-w-md p-3 rounded-xl bg-surface border border-border shadow-xs text-center animate-slide-down">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-0.5">
              Analyzed Claim
            </span>
            <p className="text-xs font-semibold text-text-primary line-clamp-1">
              "{claim.claim_text}"
            </p>
          </div>

          {/* Down Arrow connector */}
          <div className="flex items-center justify-center text-accent">
            <div className="w-px h-4 bg-gradient-to-b from-accent/40 to-accent/10" />
          </div>
          <ArrowDown size={14} className="text-accent -mt-1.5" />

          {/* Middle: Trusted Sources Grid */}
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
                className={`p-3 rounded-xl bg-surface border border-accent/20 text-center flex flex-col items-center justify-center shadow-2xs hover:glow-accent hover:border-accent/40 transition-all duration-300 animate-scale-in ${
                  sources.length === 1 ? 'w-full max-w-xs' : ''
                }`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-7 h-7 rounded-lg bg-accent-soft text-accent flex items-center justify-center mb-1.5 border border-accent/20">
                  <Shield size={12} />
                </div>
                <span className="text-xs font-bold text-text-primary line-clamp-1">
                  {src}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Verified Source
                </span>
              </div>
            ))}
          </div>

          {/* Down Arrow connector */}
          <div className="flex items-center justify-center">
            <div className="w-px h-4 bg-gradient-to-b from-accent/40 to-accent/10" />
          </div>
          <ArrowDown size={14} className="text-accent -mt-1.5" />

          {/* Bottom: Final Verdict Node */}
          <div className="w-full max-w-md flex items-center justify-center animate-scale-in delay-300">
            <VerdictBadge verdict={verdict} size="md" />
          </div>
        </div>
      </div>
    </div>
  );
};
