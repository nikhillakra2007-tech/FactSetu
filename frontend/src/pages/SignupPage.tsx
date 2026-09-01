import React, { useState } from 'react';
import { ArrowRight, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { FactSetuLogo } from '../components/common/FactSetuLogo';
import { GoogleOAuthModal } from '../components/common/GoogleOAuthModal';

interface SignupPageProps {
  onNavigate: (route: string) => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onNavigate }) => {
  const { signupWithEmail } = useAuth();
  const { t, isHindi } = useLanguage();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const cleanEmail = email.trim().toLowerCase();

    // 1. Enforce @gmail.com only
    if (!cleanEmail.endsWith('@gmail.com')) {
      setValidationError(
        isHindi
          ? 'कृपया केवल @gmail.com ईमेल दर्ज करें (जैसे nikhil@gmail.com)'
          : 'Please enter a valid @gmail.com email (e.g. yourname@gmail.com)'
      );
      return;
    }

    // 2. Enforce password length limit (min 6 chars, max 32)
    if (password.length < 6) {
      setValidationError(
        isHindi
          ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए'
          : 'Password must be at least 6 characters in length'
      );
      return;
    }

    if (password.length > 32) {
      setValidationError(
        isHindi
          ? 'पासवर्ड अधिकतम 32 अक्षरों का हो सकता है'
          : 'Password must not exceed 32 characters in length'
      );
      return;
    }

    setLoading(true);
    try {
      const success = await signupWithEmail(cleanEmail, password, name.trim());
      if (success) {
        onNavigate('/home');
      }
    } catch {
      setValidationError(
        isHindi ? 'खाता निर्माण विफल रहा, पुनः प्रयास करें' : 'Account creation failed, please try again'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-16">
      <div className="p-8 sm:p-9 rounded-3xl bg-surface border border-border shadow-md focus-card">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <FactSetuLogo size={44} />
          </div>
          <h1 className="text-xl font-bold font-display text-text-primary">
            {t('auth_signup_title')}
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            {t('auth_signup_subtitle')}
          </p>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="p-3.5 mb-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-800 dark:text-rose-300 flex items-center gap-2 animate-scale-in">
            <AlertCircle size={16} className="shrink-0 text-rose-600" />
            <span>{validationError}</span>
          </div>
        )}

        {/* 1-Click Google OAuth */}
        <div className="space-y-3 mb-6">
          <button
            type="button"
            onClick={() => setIsGoogleModalOpen(true)}
            disabled={loading}
            className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl bg-surface-secondary hover:bg-surface border border-border font-bold text-xs sm:text-sm text-text-primary transition-all duration-200 transform active:scale-95 shadow-2xs group cursor-pointer"
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
              <span>{isHindi ? 'Google से साइन अप करें' : 'Sign up with Google'}</span>
            </div>
            <ArrowRight size={15} className="text-text-muted group-hover:text-primary transition-colors" />
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex py-2 items-center mb-5">
          <div className="grow border-t border-border" />
          <span className="shrink mx-3 text-[10px] uppercase tracking-wider font-bold text-text-muted">
            {t('auth_or_divider')}
          </span>
          <div className="grow border-t border-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-text-secondary block mb-1.5">
              {t('auth_name_label')}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setValidationError('');
                }}
                placeholder={t('auth_name_placeholder')}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-surface-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs font-medium text-text-primary outline-none transition-all"
              />
              <User size={16} className="absolute left-3.5 top-3 text-text-muted" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-text-secondary">
                {t('auth_email_label')}
              </label>
              <span className="text-[10px] font-mono font-bold text-primary">@gmail.com</span>
            </div>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setValidationError('');
                }}
                placeholder="yourname@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-surface-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs font-medium text-text-primary outline-none transition-all"
              />
              <Mail size={16} className="absolute left-3.5 top-3 text-text-muted" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-text-secondary">
                {t('auth_password_label')}
              </label>
              <span className="text-[10px] text-text-muted font-mono">
                {password.length > 0 ? `${password.length}/32 chars (min 6)` : 'min 6 chars'}
              </span>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                maxLength={32}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setValidationError('');
                }}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-surface-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs font-medium text-text-primary outline-none transition-all"
              />
              <Lock size={16} className="absolute left-3.5 top-3 text-text-muted" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-primary text-white font-bold text-xs shadow-xs hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{loading ? 'Creating account...' : t('auth_btn_signup')}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-text-secondary">
          <span>{t('auth_has_account')} </span>
          <button
            type="button"
            onClick={() => onNavigate('/login')}
            className="font-bold text-primary hover:underline focus:outline-none cursor-pointer"
          >
            {t('auth_link_login')}
          </button>
        </div>
      </div>

      {/* Google OAuth Selector Modal */}
      <GoogleOAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSuccess={() => {
          setIsGoogleModalOpen(false);
          onNavigate('/home');
        }}
      />
    </div>
  );
};
