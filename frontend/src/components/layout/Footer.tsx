import React from 'react';
import { Globe, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { FactSetuLogo } from '../common/FactSetuLogo';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { t, language, setLanguage, isHindi } = useLanguage();

  return (
    <footer className="w-full bg-surface border-t border-border mt-auto transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-10">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <FactSetuLogo size={32} />
              <span className="font-display font-extrabold text-xl tracking-tight text-text-primary">
                FACTSETU
              </span>
            </div>

            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-sm">
              {t('footer_disclaimer')}
            </p>

            <div className="flex items-center gap-2 text-xs text-text-muted font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{t('brand_motto')}</span>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigate('/app')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-soft text-primary font-bold text-xs hover:bg-primary/20 border border-primary/20 transition-colors"
              >
                <Sparkles size={13} />
                <span>{t('nav_app')}</span>
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">
              {t('footer_quick_links')}
            </h4>
            <ul className="space-y-2 text-xs text-text-secondary">
              <li>
                <button type="button" onClick={() => onNavigate('/')} className="hover:text-primary transition-colors">
                  {t('nav_home')}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('/how-it-works')} className="hover:text-primary transition-colors">
                  {t('nav_how_it_works')}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('/why-factsetu')} className="hover:text-primary transition-colors">
                  {t('nav_why_factsetu')}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('/sources')} className="hover:text-primary transition-colors">
                  {t('nav_sources')}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('/examples')} className="hover:text-primary transition-colors">
                  {t('nav_examples')}
                </button>
              </li>
            </ul>
          </div>

          {/* About & Transparency */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">
              {t('nav_about')} & Legal
            </h4>
            <ul className="space-y-2 text-xs text-text-secondary">
              <li>
                <button type="button" onClick={() => onNavigate('/about')} className="hover:text-primary transition-colors">
                  {t('nav_about')}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('/privacy')} className="hover:text-primary transition-colors">
                  {t('nav_privacy')}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('/app/history')} className="hover:text-primary transition-colors">
                  {t('nav_history')}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('/app/settings')} className="hover:text-primary transition-colors">
                  {t('nav_settings')}
                </button>
              </li>
            </ul>
          </div>

          {/* Indexed Sources & Language Toggle */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">
              {t('footer_trusted_sources')}
            </h4>
            <ul className="space-y-1.5 text-xs text-text-muted">
              <li>Reserve Bank of India (rbi.org.in)</li>
              <li>PIB Fact Check (pib.gov.in)</li>
              <li>National Payments Corp (npci.org.in)</li>
              <li>National Portal (india.gov.in)</li>
              <li>World Health Org (who.int)</li>
            </ul>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-text-primary bg-surface-secondary hover:bg-surface border border-border transition-colors"
              >
                <Globe size={13} className="text-primary" />
                <span>{isHindi ? 'Switch to English' : 'हिन्दी में देखें (Hindi)'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <p>© 2026 FACTSETU. {t('footer_rights')}</p>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => onNavigate('/privacy')} className="hover:text-primary transition-colors">
              {t('nav_privacy')}
            </button>
            <span>•</span>
            <button type="button" onClick={() => onNavigate('/about')} className="hover:text-primary transition-colors">
              {t('nav_about')}
            </button>
            <span>•</span>
            <button type="button" onClick={() => onNavigate('/sources')} className="hover:text-primary transition-colors">
              {t('nav_sources')}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
