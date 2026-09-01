import React, { useState } from 'react';
import { ArrowRight, Shield, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Modal } from '../components/common/Modal';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, loginWithEmail, signupWithEmail, loginWithOAuth } = useAuth();
  const { t } = useLanguage();

  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      if (isSignUp) {
        await signupWithEmail(email, password, name);
      } else {
        await loginWithEmail(email, password);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'x') => {
    setLoading(true);
    try {
      await loginWithOAuth(provider);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isAuthModalOpen}
      onClose={closeAuthModal}
      title={isSignUp ? t('auth_signup_title') : t('auth_login_title')}
    >
      <div className="space-y-4">
        {/* Brand logo in modal */}
        <div className="text-center pb-2">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white mx-auto mb-2 shadow-xs">
            <Shield size={20} />
          </div>
          <p className="text-xs text-text-secondary">
            {isSignUp ? t('auth_signup_subtitle') : t('auth_login_subtitle')}
          </p>
        </div>

        {/* OAuth Button */}
        <button
          type="button"
          onClick={() => handleOAuth('google')}
          disabled={loading}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-surface-secondary hover:bg-surface border border-border font-bold text-xs text-text-primary transition-all group"
        >
          <div className="flex items-center gap-3">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
              />
              <path
                fill="#FBBC05"
                d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7 0-1.1.2-2 .4-2.7L1.6 6.4C.6 8.3 0 10.4 0 12s.6 3.7 1.6 5.6l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z"
              />
            </svg>
            <span>{t('auth_google')}</span>
          </div>
          <ArrowRight size={14} className="text-text-muted group-hover:text-primary transition-colors" />
        </button>

        {/* Divider */}
        <div className="relative flex py-1 items-center">
          <div className="grow border-t border-border" />
          <span className="shrink mx-3 text-[10px] uppercase tracking-wider font-bold text-text-muted">
            {t('auth_or_divider')}
          </span>
          <div className="grow border-t border-border" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {isSignUp && (
            <div>
              <label className="text-xs font-bold text-text-secondary block mb-1">
                {t('auth_name_label')}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('auth_name_placeholder')}
                className="w-full px-3.5 py-2 rounded-xl bg-surface-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs font-medium text-text-primary outline-none"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-text-secondary block mb-1">
              {t('auth_email_label')}
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth_email_placeholder')}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs font-medium text-text-primary outline-none"
              />
              <Mail size={15} className="absolute left-3 top-2.5 text-text-muted" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-text-secondary block mb-1">
              {t('auth_password_label')}
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs font-medium text-text-primary outline-none"
              />
              <Lock size={15} className="absolute left-3 top-2.5 text-text-muted" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-primary text-white font-bold text-xs shadow-xs hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 mt-2"
          >
            <span>{isSignUp ? t('auth_btn_signup') : t('auth_btn_login')}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        {/* Toggle Sign in / Sign up */}
        <div className="pt-2 text-center text-xs text-text-secondary">
          <span>{isSignUp ? t('auth_has_account') : t('auth_no_account')} </span>
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-bold text-primary hover:underline focus:outline-none"
          >
            {isSignUp ? t('auth_link_login') : t('auth_link_signup')}
          </button>
        </div>
      </div>
    </Modal>
  );
};
