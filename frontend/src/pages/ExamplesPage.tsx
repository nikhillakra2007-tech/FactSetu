import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { SAMPLE_CLAIMS_DATA } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

interface ExamplesPageProps {
  onStartCheck: (text: string) => void;
}

export const ExamplesPage: React.FC<ExamplesPageProps> = ({ onStartCheck }) => {
  const { t, isHindi } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = ['ALL', 'Finance', 'Government Schemes', 'Public Information', 'Health'];

  const filteredExamples = SAMPLE_CLAIMS_DATA.filter((item) => {
    if (selectedCategory === 'ALL') return true;
    return item.category === selectedCategory;
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-soft text-primary text-xs font-bold border border-primary/20 mb-4">
          <Sparkles size={14} />
          <span>{t('nav_examples')}</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-text-primary tracking-tight mb-3">
          {t('examples_page_title')}
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
          {t('examples_page_subtitle')}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-primary text-white shadow-xs'
                : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
            }`}
          >
            {cat === 'ALL' ? t('examples_filter_all') : cat}
          </button>
        ))}
      </div>

      {/* Examples Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 spotlight-group">
        {filteredExamples.map((item) => {
          const title = isHindi ? item.title_hi : item.title;
          const text = isHindi ? item.text_hi : item.text;

          return (
            <div
              key={item.id}
              className="p-6 rounded-3xl bg-surface border border-border flex flex-col justify-between hover:border-primary/40 transition-colors shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary-soft text-primary">
                    {item.category}
                  </span>
                </div>

                <h3 className="text-base font-bold text-text-primary mb-2">
                  {title}
                </h3>

                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed italic mb-6">
                  "{text}"
                </p>
              </div>

              <button
                type="button"
                onClick={() => onStartCheck(text)}
                className="w-full py-3 rounded-xl bg-surface-secondary hover:bg-primary hover:text-white border border-border text-xs font-bold text-text-primary flex items-center justify-center gap-2 transition-all"
              >
                <span>{t('examples_btn_try')}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
