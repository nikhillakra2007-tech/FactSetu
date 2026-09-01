import React, { useState, useEffect } from 'react';
import { Shield, Search, ExternalLink } from 'lucide-react';
import type { SourceInfo } from '../types';
import { ApiService } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export const SourcesPage: React.FC = () => {
  const { t } = useLanguage();
  const [sources, setSources] = useState<SourceInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSources = async () => {
      setLoading(true);
      try {
        const list = await ApiService.getSources();
        setSources(list);
      } finally {
        setLoading(false);
      }
    };
    fetchSources();
  }, []);

  const categories = [
    { id: 'ALL', label: t('sources_filter_all') },
    { id: 'government', label: t('sources_cat_gov') },
    { id: 'regulator', label: t('sources_cat_finance') },
    { id: 'intl_org', label: t('sources_cat_health') },
  ];

  const filteredSources = sources.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'ALL' ||
      s.source_type.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-soft text-primary text-xs font-bold border border-primary/20 mb-4">
          <Shield size={14} />
          <span>{t('nav_sources')}</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-text-primary tracking-tight mb-3">
          {t('sources_page_title')}
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
          {t('sources_page_subtitle')}
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
        <div className="relative w-full">
          <Search size={16} className="absolute left-3.5 top-3.5 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('sources_search_placeholder')}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-surface border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs font-medium text-text-primary outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sources Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-text-muted">Loading indexed sources...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 spotlight-group">
          {filteredSources.map((source) => (
            <div
              key={source.id}
              className="p-6 rounded-3xl bg-surface border border-border flex flex-col justify-between hover:border-primary/40 transition-colors shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-primary-soft text-primary flex items-center justify-center font-bold shrink-0 border border-primary/20">
                      <Shield size={17} />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-text-primary">
                        {source.name}
                      </h3>
                      <span className="text-xs text-text-muted font-mono">{source.domain}</span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                    Level {source.authority_level} Authority
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-4">
                  {source.description || 'Official public portal providing notifications, circulars, and gazettes for fact verification.'}
                </p>
              </div>

              <div className="pt-3 border-t border-border/80 flex items-center justify-between">
                <span className="text-xs text-text-muted capitalize">
                  {source.source_type} • {source.country || 'India'}
                </span>
                <a
                  href={source.base_url || `https://${source.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-primary hover:bg-primary-soft border border-primary/20 transition-colors"
                >
                  <span>{t('sources_col_action')}</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
