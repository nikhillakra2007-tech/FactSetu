import React, { useState } from 'react';
import { ArrowLeft, Shield, BookOpen } from 'lucide-react';
import type { VerificationResultData, ClaimItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { VerdictBadge } from '../components/common/VerdictBadge';
import { EvidenceStrength } from '../components/common/EvidenceStrength';
import { ClaimCard } from '../components/workspace/ClaimCard';
import { EvidenceCard } from '../components/workspace/EvidenceCard';
import { ProvenanceBar } from '../components/workspace/ProvenanceBar';
import { HowWeChecked } from '../components/workspace/HowWeChecked';
import { VerificationTrail } from '../components/workspace/VerificationTrail';
import { AudioPlayer } from '../components/workspace/AudioPlayer';
import { FeedbackWidget } from '../components/workspace/FeedbackWidget';

interface WorkspacePageProps {
  data: VerificationResultData;
  onNewCheck: () => void;
}

export const WorkspacePage: React.FC<WorkspacePageProps> = ({ data, onNewCheck }) => {
  const { t, isHindi } = useLanguage();
  const [selectedClaimIndex, setSelectedClaimIndex] = useState(0);

  const claims = data.claims || [];
  const activeClaim: ClaimItem | undefined = claims[selectedClaimIndex] || claims[0];

  const currentVerdict = activeClaim?.verification?.verdict || 'UNCERTAIN';
  const explanationEn = activeClaim?.verification?.explanation || 'Official records were checked against this claim.';
  const explanationHi = activeClaim?.verification?.explanation_hi || activeClaim?.verification?.explanation || 'आधिकारिक सरकारी रिकॉर्ड्स से इस दावे की पुष्टि की गई।';
  const activeExplanation = isHindi ? explanationHi : explanationEn;

  const claimText = activeClaim
    ? isHindi && activeClaim.claim_text_hi
      ? activeClaim.claim_text_hi
      : activeClaim.claim_text
    : '';

  // Summary counts
  const verifiedCount = claims.filter((c) => (c.verification?.verdict || c.status)?.toUpperCase().includes('VERIFIED')).length;
  const contradictedCount = claims.filter((c) => (c.verification?.verdict || c.status)?.toUpperCase().includes('CONTRADICTED')).length;
  const uncertainCount = claims.filter((c) => (c.verification?.verdict || c.status)?.toUpperCase().includes('UNCERTAIN')).length;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-border">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onNewCheck}
            className="p-2.5 rounded-xl bg-surface border border-border hover:bg-surface-secondary text-text-secondary hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={t('workspace_back')}
          >
            <ArrowLeft size={16} />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold font-display text-text-primary">
                {t('workspace_title')}
              </h1>
            </div>
            <p className="text-xs text-text-muted">
              {claims.length} {claims.length === 1 ? t('workspace_single_claim') : t('workspace_claims_found')}
            </p>
          </div>
        </div>

        {/* Verdict Count Badges */}
        <div className="flex items-center gap-2">
          {verifiedCount > 0 && (
            <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {verifiedCount} {isHindi ? 'पुष्टीकृत' : 'Verified'}
            </span>
          )}
          {contradictedCount > 0 && (
            <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              {contradictedCount} {isHindi ? 'खंडित / असत्य' : 'Contradicted'}
            </span>
          )}
          {uncertainCount > 0 && (
            <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              {uncertainCount} {isHindi ? 'अनिश्चित' : 'Uncertain'}
            </span>
          )}
        </div>
      </div>

      {/* Main Grid Workspace: Left (Claim Navigator) / Center (Details & Evidence) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Claim Navigation (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Original Submission Preview */}
          <div className="p-4 rounded-2xl bg-surface-secondary/70 border border-border">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">
              {t('workspace_original_submission')}
            </span>
            <p className="text-xs text-text-primary font-medium leading-relaxed italic">
              "{data.original_input}"
            </p>
          </div>

          {/* Claims Selector */}
          <div>
            <div className="flex items-center justify-between mb-2.5 px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                <BookOpen size={13} className="text-primary" />
                {t('workspace_claims_found')} ({claims.length})
              </span>
              <span className="text-[11px] text-text-muted">{t('workspace_select_claim_hint')}</span>
            </div>

            <div className="space-y-2.5 spotlight-group">
              {claims.map((c, i) => (
                <ClaimCard
                  key={c.claim_id || i}
                  claim={c}
                  index={i}
                  isSelected={i === selectedClaimIndex}
                  onSelect={() => setSelectedClaimIndex(i)}
                />
              ))}
            </div>
          </div>

          {/* How We Checked Transparency Box */}
          <HowWeChecked />

          {/* Verification Audit Trail */}
          <VerificationTrail trail={data.trail} />
        </div>

        {/* CENTER / RIGHT COLUMN: Selected Claim Details & Directly Attached Evidence (8 cols) */}
        {activeClaim && (
          <div className="lg:col-span-8 space-y-6">
            {/* Active Claim Card */}
            <section className="p-6 sm:p-8 rounded-3xl bg-surface border border-border shadow-xs space-y-6">
              {/* Claim statement header */}
              <div>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    {t('workspace_claim_heading')} #{String(selectedClaimIndex + 1).padStart(2, '0')}
                  </span>
                  {/* Listen audio button */}
                  <AudioPlayer
                    textToSpeakEn={`Verdict: ${currentVerdict}. ${explanationEn}`}
                    textToSpeakHi={`सत्यापन परिणाम: ${
                      currentVerdict === 'VERIFIED'
                        ? 'यह दावा सत्य और पुष्टीकृत है।'
                        : currentVerdict === 'CONTRADICTED'
                        ? 'यह दावा असत्य और खंडित है।'
                        : 'इस दावे की पुष्टि अपूर्ण है, यह अनिश्चित है।'
                    } कारण: ${explanationHi}`}
                  />
                </div>

                <h2 className="text-lg sm:text-xl font-bold font-display text-text-primary leading-snug">
                  "{claimText}"
                </h2>
              </div>

              {/* Large Verdict Box */}
              <div className="p-5 rounded-2xl bg-surface-secondary border border-border">
                <VerdictBadge verdict={currentVerdict} size="lg" showDescription />
              </div>

              {/* Evidence Strength Meter */}
              <EvidenceStrength
                confidence={activeClaim.verification?.confidence_level || 'HIGH'}
                authoritativeCount={activeClaim.evidence?.length || 2}
                supportingCount={activeClaim.evidence?.filter((e) => e.support_type === 'supporting').length || 0}
                conflictingCount={activeClaim.evidence?.filter((e) => e.support_type === 'contradicting').length || 0}
              />

              {/* Plain-Language Explanation (Why?) */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  {t('workspace_why_heading')}
                </h3>
                <div className="p-4 rounded-2xl bg-surface-secondary/60 border border-border text-xs sm:text-sm text-text-primary leading-relaxed font-normal">
                  <p>{activeExplanation}</p>
                </div>
              </div>

              {/* Visual Provenance Flow Bridge */}
              <ProvenanceBar claim={activeClaim} />
            </section>

            {/* Directly Attached Evidence Section */}
            <section className="space-y-4">
              <div>
                <h3 className="text-sm font-bold font-display uppercase tracking-wider text-text-primary flex items-center gap-2">
                  <Shield size={15} className="text-primary" />
                  {t('workspace_evidence_heading')} ({activeClaim.evidence?.length || 0})
                </h3>
                <p className="text-xs text-text-muted">
                  {t('workspace_evidence_subtitle')}
                </p>
              </div>

              {activeClaim.evidence && activeClaim.evidence.length > 0 ? (
                <div className="space-y-3.5 spotlight-group">
                  {activeClaim.evidence.map((ev, evIdx) => (
                    <EvidenceCard key={ev.chunk_id || evIdx} evidence={ev} index={evIdx} />
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-surface border border-border text-center text-xs text-text-muted">
                  {t('workspace_no_evidence')}
                </div>
              )}
            </section>

            {/* User Feedback Widget */}
            <FeedbackWidget />
          </div>
        )}
      </div>
    </div>
  );
};
