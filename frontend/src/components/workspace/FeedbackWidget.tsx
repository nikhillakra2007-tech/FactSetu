import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const FeedbackWidget: React.FC = () => {
  const { t } = useLanguage();
  const [feedbackGiven, setFeedbackGiven] = useState<'yes' | 'no' | null>(null);

  const handleFeedback = (type: 'yes' | 'no') => {
    setFeedbackGiven(type);
    try {
      // Optional report endpoint
      fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: type, timestamp: new Date().toISOString() }),
      }).catch(() => {});
    } catch {
      // ignore
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-surface border border-border flex flex-wrap items-center justify-between gap-3 shadow-xs">
      <div className="text-xs font-semibold text-text-secondary">
        {feedbackGiven ? t('workspace_feedback_thanks') : t('workspace_feedback_title')}
      </div>

      <div className="flex items-center gap-2">
        {feedbackGiven ? (
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <Check size={14} />
            <span>{t('workspace_feedback_thanks')}</span>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => handleFeedback('yes')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-text-primary bg-surface-secondary hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 border border-border transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label={t('workspace_feedback_yes')}
            >
              <ThumbsUp size={13} />
              <span>{t('workspace_feedback_yes')}</span>
            </button>
            <button
              type="button"
              onClick={() => handleFeedback('no')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-text-primary bg-surface-secondary hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 border border-border transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label={t('workspace_feedback_no')}
            >
              <ThumbsDown size={13} />
              <span>{t('workspace_feedback_no')}</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
