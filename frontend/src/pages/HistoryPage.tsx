import React, { useState, useEffect } from 'react';
import { Search, History as HistoryIcon, ArrowRight, Sparkles, Clock } from 'lucide-react';
import type { HistoryItem } from '../types';
import { ApiService } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { VerdictBadge } from '../components/common/VerdictBadge';

interface HistoryPageProps {
  onSelectVerification: (id: string) => void;
  onNewCheck: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onSelectVerification, onNewCheck }) => {
  const { t } = useLanguage();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVerdict, setFilterVerdict] = useState<string>('ALL');

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const list = await ApiService.getHistory();
        setItems(list);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.original_input.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterVerdict === 'ALL' ||
      (item.primary_verdict && item.primary_verdict.toUpperCase().includes(filterVerdict));
    return matchesSearch && matchesFilter;
  });

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return t('history_date_recent');
    }
  };

  const filterButtons = [
    { value: 'ALL', label: t('history_filter_all') },
    { value: 'VERIFIED', label: t('history_filter_verified') },
    { value: 'CONTRADICTED', label: t('history_filter_contradicted') },
    { value: 'UNCERTAIN', label: t('history_filter_uncertain') },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-soft text-primary text-xs font-bold border border-primary/20 mb-3">
            <Clock size={13} />
            <span>{t('nav_history')}</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-text-primary tracking-tight mb-1">
            {t('history_title')}
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary">
            {t('history_subtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={onNewCheck}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-white font-bold text-xs shadow-xs hover:bg-primary-hover transition-colors"
        >
          <Sparkles size={14} />
          <span>{t('nav_new_check')}</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <div className="relative w-full">
          <Search size={16} className="absolute left-3.5 top-3 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('history_search_placeholder')}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-surface border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs font-medium text-text-primary outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {filterButtons.map((v) => (
            <button
              key={v.value}
              type="button"
              onClick={() => setFilterVerdict(v.value)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                filterVerdict === v.value
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* History Items List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-text-muted">Loading audit history...</div>
      ) : filteredItems.length > 0 ? (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectVerification(item.id)}
              className="w-full text-left p-5 rounded-3xl bg-surface border border-border hover:border-primary/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group focus:outline-none focus:ring-2 focus:ring-primary transition-colors shadow-xs"
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <VerdictBadge verdict={item.primary_verdict || 'CONTRADICTED'} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-text-primary group-hover:text-primary transition-colors line-clamp-2 leading-relaxed">
                    "{item.original_input}"
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-text-muted font-medium">
                    <span>{formatDate(item.created_at)}</span>
                    {item.claims_count && (
                      <>
                        <span>•</span>
                        <span>
                          {item.claims_count}{' '}
                          {item.claims_count === 1 ? t('history_single_claim') : t('history_claims_count')}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-primary shrink-0 sm:self-center">
                <span>{t('history_btn_view')}</span>
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 sm:p-16 rounded-3xl bg-surface border border-dashed border-border text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-surface-secondary text-text-muted flex items-center justify-center mx-auto">
            <HistoryIcon size={22} />
          </div>
          <h3 className="font-display font-bold text-base text-text-primary">
            {t('history_empty_title')}
          </h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
            {t('history_empty_desc')}
          </p>
          <button
            type="button"
            onClick={onNewCheck}
            className="px-6 py-2.5 rounded-2xl bg-primary text-white text-xs font-bold shadow-xs hover:bg-primary-hover transition-colors"
          >
            {t('history_empty_cta')}
          </button>
        </div>
      )}
    </div>
  );
};
