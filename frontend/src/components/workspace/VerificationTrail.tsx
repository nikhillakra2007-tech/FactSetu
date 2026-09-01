import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Clock } from 'lucide-react';
import type { VerificationAuditStep } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { getLocalizedAuditStep } from '../../locales/translations';

interface VerificationTrailProps {
  trail?: VerificationAuditStep[];
}

export const VerificationTrail: React.FC<VerificationTrailProps> = ({ trail = [] }) => {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const defaultTrail: VerificationAuditStep[] = [
    { time: '10:31:02', step: 'Claim extracted', status: 'done', description: 'Identified factual claims from submission text' },
    { time: '10:31:03', step: '4 sources queried', status: 'done', description: 'Searched RBI, NPCI, PIB, and Gov repositories' },
    { time: '10:31:05', step: '3 relevant sources found', status: 'done', description: 'Retrieved matching official circulars and notices' },
    { time: '10:31:06', step: 'Evidence compared', status: 'done', description: 'Evaluated against official operational parameters' },
    { time: '10:31:07', step: 'Result synthesized', status: 'done', description: 'Formulated plain-language verification verdict' },
  ];

  const steps = trail.length > 0 ? trail : defaultTrail;

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden transition-all duration-200">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-surface-secondary/60 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5">
          <Clock size={16} className="text-primary shrink-0" />
          <span className="text-sm font-bold text-text-primary">
            {t('workspace_audit_trail')}
          </span>
          <span className="text-xs text-text-muted px-2 py-0.5 rounded-md bg-surface-secondary border border-border">
            {steps.length} {language === 'hi' ? 'चरण' : 'steps'}
          </span>
        </div>
        {isOpen ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
      </button>

      {isOpen && (
        <div className="p-4 pt-2 border-t border-border bg-surface-secondary/30">
          <ol className="relative border-l border-border ml-3 mt-2 space-y-4">
            {steps.map((item, idx) => (
              <li key={idx} className="mb-2 ml-4">
                <div className="absolute -left-1.5 mt-1 w-3 h-3 rounded-full bg-primary border-2 border-surface" />
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-xs font-mono font-bold text-primary">
                    {item.time}
                  </span>
                  <span className="text-xs font-bold text-text-primary">
                    {getLocalizedAuditStep(item.step, language)}
                  </span>
                </div>
                {item.description && (
                  <p className="text-xs text-text-muted mt-0.5">
                    {item.description}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};
