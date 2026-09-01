import React from 'react';
import { ExternalLink, Shield, CheckCircle, AlertTriangle, FileText, Calendar } from 'lucide-react';
import type { EvidenceItem } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface EvidenceCardProps {
  evidence: EvidenceItem;
  index: number;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({ evidence }) => {
  const { t } = useLanguage();

  const isContradicting = evidence.support_type === 'contradicting';
  const isSupporting = evidence.support_type === 'supporting';

  const badgeConfig = isContradicting
    ? {
        label: t('workspace_support_conflicts'),
        icon: AlertTriangle,
        classes: 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      }
    : isSupporting
    ? {
        label: t('workspace_support_supports'),
        icon: CheckCircle,
        classes: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      }
    : {
        label: t('workspace_support_contextual'),
        icon: FileText,
        classes: 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      };

  const SupportIcon = badgeConfig.icon;

  let hostname = 'gov.in';
  try {
    hostname = new URL(evidence.url || 'https://india.gov.in').hostname;
  } catch {
    hostname = evidence.url || 'Official Record';
  }

  return (
    <article className="p-5 rounded-2xl bg-surface border border-border hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200">
      {/* Source header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/20">
            <Shield size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-text-primary">
                {evidence.source_name}
              </h4>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {t('workspace_authority_level')} {evidence.authority || 5}
              </span>
            </div>
            <span className="text-xs text-text-muted font-mono">{hostname}</span>
          </div>
        </div>

        {/* Support status badge */}
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${badgeConfig.classes} flex items-center gap-1.5`}>
          <SupportIcon size={13} className="shrink-0" />
          <span>{badgeConfig.label}</span>
        </span>
      </div>

      {/* Direct evidence quote */}
      <div className="p-4 rounded-xl bg-surface-secondary border border-border/80 text-xs sm:text-sm text-text-primary leading-relaxed font-normal mb-3.5">
        <p className="italic">
          "{evidence.chunk_text}"
        </p>
      </div>

      {/* Card footer metadata & External Link */}
      <div className="flex items-center justify-between gap-3 text-xs text-text-muted pt-1">
        <div className="flex items-center gap-3">
          {evidence.published_at && (
            <span className="flex items-center gap-1.5">
              <Calendar size={13} />
              <span>{t('workspace_published_on')} {evidence.published_at}</span>
            </span>
          )}
          <span className="text-text-muted">•</span>
          <span>{t('workspace_relevance')}: {(evidence.relevance_score * 100).toFixed(0)}%</span>
        </div>

        <a
          href={evidence.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-primary hover:bg-primary-soft border border-primary/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label={`${t('workspace_open_source')}: ${evidence.source_name}`}
        >
          <span>{t('workspace_open_source')}</span>
          <ExternalLink size={13} />
        </a>
      </div>
    </article>
  );
};
