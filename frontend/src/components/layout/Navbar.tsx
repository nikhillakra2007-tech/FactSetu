import React, { useState } from 'react';
import { Sparkles, History, Settings, Sun, Moon, Globe, Menu, X, User, LogOut, CheckCircle2, Zap } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useLowBandwidth } from '../../context/LowBandwidthContext';
import { FactSetuLogo } from '../common/FactSetuLogo';

interface NavbarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenSettings?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, onNavigate, onOpenSettings }) => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const { language, setLanguage, t, isHindi } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const { isLowBandwidth, toggleLowBandwidth } = useLowBandwidth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthPage = currentRoute === '/' || currentRoute === '/login' || currentRoute === '/signup';
  const isAppRoute = currentRoute.startsWith('/app') || currentRoute === '/workspace' || currentRoute === '/history';

  // Public links (curated, clean)
  const publicNav = [
    { route: '/home', label: t('nav_home') },
    { route: '/how-it-works', label: t('nav_how_it_works') },
    { route: '/why-factsetu', label: t('nav_why_factsetu') },
    { route: '/sources', label: t('nav_sources') },
    { route: '/examples', label: t('nav_examples') },
  ];

  // App suite links
  const appNav = [
    { route: '/app', label: t('nav_new_check'), icon: Sparkles },
    { route: '/app/workspace', label: t('nav_workspace'), icon: CheckCircle2 },
    { route: '/app/history', label: t('nav_history'), icon: History },
  ];

  const handleNavClick = (route: string) => {
    onNavigate(route);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-border transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 sm:gap-6">
        {/* Brand Wordmark & Emblem */}
        <button
          type="button"
          onClick={() => handleNavClick(isAuthenticated ? '/home' : '/login')}
          className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-primary rounded-xl p-1 text-left cursor-pointer shrink-0"
        >
          <FactSetuLogo size={34} />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold text-lg sm:text-xl tracking-tight text-text-primary">
                FACTSETU
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
            </div>
            <span className="hidden sm:block text-[10px] font-medium text-text-muted tracking-wide">
              {t('brand_tagline')}
            </span>
          </div>
        </button>

        {/* ── Center Navigation (Hidden on Auth Pages) ── */}
        {!isAuthPage && (
          <nav className="hidden lg:flex items-center gap-1.5 bg-surface-secondary/50 px-2 py-1 rounded-2xl border border-border/80">
            {isAppRoute
              ? appNav.map((item) => {
                  const Icon = item.icon;
                  const active = currentRoute === item.route;
                  return (
                    <button
                      key={item.route}
                      type="button"
                      onClick={() => handleNavClick(item.route)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        active
                          ? 'bg-primary text-white shadow-xs'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                      }`}
                    >
                      <Icon size={13} />
                      <span>{item.label}</span>
                    </button>
                  );
                })
              : publicNav.map((item) => {
                  const active = currentRoute === item.route;
                  return (
                    <button
                      key={item.route}
                      type="button"
                      onClick={() => handleNavClick(item.route)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        active
                          ? 'bg-surface text-primary border border-border shadow-xs'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface/50'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
          </nav>
        )}

        {/* ── Right Controls & Utility Cluster ── */}
        <div className="hidden md:flex items-center gap-2 sm:gap-2.5">
          {/* Main Action CTA (Only when logged in or on public site) */}
          {!isAuthPage && !isAppRoute && (
            <button
              type="button"
              onClick={() => handleNavClick('/app')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary-hover shadow-xs transition-all cursor-pointer mr-1"
            >
              <Sparkles size={13} />
              <span>{t('nav_app')}</span>
            </button>
          )}

          {/* 2G Data Saver Mode Toggle Button */}
          <button
            type="button"
            onClick={toggleLowBandwidth}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isLowBandwidth
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
            }`}
            title={isLowBandwidth ? '2G Data Saver is ON (~14 KB payload)' : 'Enable 2G Data Saver Mode'}
          >
            <Zap size={13} className={isLowBandwidth ? 'fill-current text-white' : 'text-amber-500'} />
            <span>{isLowBandwidth ? '2G ON' : '2G'}</span>
          </button>

          {/* Language Switcher Button */}
          <button
            type="button"
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-text-primary bg-surface border border-border hover:bg-surface-secondary transition-colors cursor-pointer"
            title="Toggle English / हिन्दी"
          >
            <Globe size={13} className="text-primary" />
            <span>{isHindi ? 'EN' : 'हिन्दी'}</span>
          </button>

          {/* Light / Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-text-secondary hover:text-text-primary bg-surface border border-border hover:bg-surface-secondary transition-colors cursor-pointer"
            title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {resolvedTheme === 'dark' ? (
              <Sun size={15} className="text-amber-400" />
            ) : (
              <Moon size={15} className="text-indigo-600" />
            )}
          </button>

          {/* Settings button */}
          {!isAuthPage && (
            <button
              type="button"
              onClick={() => onOpenSettings ? onOpenSettings() : handleNavClick('/app/settings')}
              className="p-2 rounded-xl text-text-secondary hover:text-text-primary bg-surface border border-border hover:bg-surface-secondary transition-colors cursor-pointer"
              title={t('nav_settings')}
            >
              <Settings size={15} />
            </button>
          )}

          {/* User Profile / Sign In Status */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-1.5 pl-2 border-l border-border">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-primary-soft border border-primary/20">
                <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold">
                  {user.display_name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-bold text-primary max-w-[80px] truncate">
                  {user.display_name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  handleNavClick('/login');
                }}
                className="p-1.5 rounded-xl text-text-muted hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                title={t('nav_sign_out')}
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : !isAuthPage ? (
            <button
              type="button"
              onClick={() => handleNavClick('/login')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-text-primary hover:text-primary bg-surface border border-border transition-colors cursor-pointer"
            >
              <User size={13} />
              <span>{t('nav_sign_in')}</span>
            </button>
          ) : null}
        </div>

        {/* Mobile Controls (Clean & Compact) */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            type="button"
            onClick={toggleLowBandwidth}
            className={`px-2 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 ${
              isLowBandwidth ? 'bg-emerald-600 text-white' : 'bg-surface border border-border text-text-secondary'
            }`}
          >
            <Zap size={11} className={isLowBandwidth ? 'fill-current' : 'text-amber-500'} />
            <span>{isLowBandwidth ? '2G' : '2G'}</span>
          </button>

          <button
            type="button"
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="px-2.5 py-1 rounded-xl text-xs font-bold text-text-primary bg-surface border border-border"
          >
            {isHindi ? 'EN' : 'हिन्दी'}
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-text-secondary bg-surface border border-border"
          >
            {resolvedTheme === 'dark' ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
          </button>

          {!isAuthPage && (
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-text-primary bg-surface border border-border cursor-pointer"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer (Only for authenticated/public routes) */}
      {mobileMenuOpen && !isAuthPage && (
        <div className="lg:hidden p-4 border-b border-border bg-surface shadow-xl animate-fade-in">
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => handleNavClick('/app')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold bg-primary text-white shadow-xs mb-2 cursor-pointer"
            >
              <Sparkles size={15} />
              <span>{t('nav_app')}</span>
            </button>

            {publicNav.map((item) => (
              <button
                key={item.route}
                type="button"
                onClick={() => handleNavClick(item.route)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-left transition-colors cursor-pointer ${
                  currentRoute === item.route
                    ? 'bg-primary-soft text-primary'
                    : 'text-text-primary hover:bg-surface-secondary'
                }`}
              >
                <span>{item.label}</span>
              </button>
            ))}

            <hr className="border-border my-2" />

            <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted px-2 mb-1">
              Workspace & Tools
            </div>
            {appNav.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.route}
                  type="button"
                  onClick={() => handleNavClick(item.route)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-left transition-colors cursor-pointer ${
                    currentRoute === item.route
                      ? 'bg-primary text-white'
                      : 'text-text-primary hover:bg-surface-secondary'
                  }`}
                >
                  <Icon size={15} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <hr className="border-border my-2" />

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  if (onOpenSettings) onOpenSettings();
                  else handleNavClick('/app/settings');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-text-primary bg-surface-secondary border border-border cursor-pointer"
              >
                <Settings size={14} />
                <span>{t('nav_settings')}</span>
              </button>

              {isAuthenticated && user ? (
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    handleNavClick('/login');
                  }}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>{t('nav_sign_out')}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleNavClick('/login')}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-primary bg-primary-soft border border-primary/20 cursor-pointer"
                >
                  <User size={14} />
                  <span>{t('nav_sign_in')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2G Low Bandwidth Status Notification Pill Bar */}
      {isLowBandwidth && (
        <div className="w-full bg-emerald-700 dark:bg-emerald-900 text-white py-1 px-4 text-center text-[11px] font-semibold flex items-center justify-center gap-2 border-t border-emerald-600 dark:border-emerald-800">
          <Zap size={12} className="text-amber-300 fill-amber-300 animate-pulse" />
          <span>
            {isHindi
              ? '⚡ 2G डेटा सेवर सक्रिय है (~14 KB डेटा, फोन पर त्वरित छवि संपीड़न)'
              : '⚡ 2G Data Saver Mode Active (~14 KB data, on-device image compression enabled)'}
          </span>
        </div>
      )}
    </header>
  );
};
