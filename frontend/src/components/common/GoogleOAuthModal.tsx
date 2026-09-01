import React, { useState } from 'react';
import { X, ArrowRight, UserPlus, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface GoogleOAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const GoogleOAuthModal: React.FC<GoogleOAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { loginWithOAuth } = useAuth();
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const defaultAccounts = [
    {
      name: 'Nikhil',
      email: 'nikhil@gmail.com',
      avatarColor: 'bg-blue-600',
    },
    {
      name: 'Nikhil Citizen',
      email: 'nikhil.factsetu@gmail.com',
      avatarColor: 'bg-emerald-600',
    },
  ];

  const handleSelectAccount = async (name: string, email: string) => {
    setSelectedAccount(email);
    setLoading(true);
    setError('');

    // Realistic Google OAuth simulated authentication handshake
    setTimeout(async () => {
      try {
        await loginWithOAuth('google');
        // Update user profile with the chosen Google account details in localStorage
        const userObj = {
          id: 'usr_g_' + Math.random().toString(36).substring(2, 9),
          email,
          display_name: name,
          provider: 'google' as const,
        };
        localStorage.setItem('factsetu_user', JSON.stringify(userObj));
        // Trigger page update
        window.dispatchEvent(new Event('storage'));
        setLoading(false);
        onSuccess();
      } catch {
        setLoading(false);
        setError('Google sign-in failed. Please try again.');
      }
    }, 700);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim().endsWith('@gmail.com')) {
      setError('Email must end with @gmail.com');
      return;
    }
    const derivedName = customName.trim() || customEmail.split('@')[0];
    handleSelectAccount(derivedName, customEmail.trim());
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      data-lenis-prevent
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 animate-scale-in text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Google Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            <span className="font-semibold text-sm">Sign in with Google</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="py-5">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Choose an account
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
            to continue to <span className="font-semibold text-primary">FACTSETU</span>
          </p>

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-800">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-10 text-center space-y-3">
              <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Signing in with {selectedAccount}...
              </p>
            </div>
          ) : !isCustomMode ? (
            <div className="space-y-2">
              {defaultAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleSelectAccount(acc.name, acc.email)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 transition-all text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full ${acc.avatarColor} text-white flex items-center justify-center text-sm font-bold shadow-2xs`}
                    >
                      {acc.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {acc.name}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">{acc.email}</div>
                    </div>
                  </div>
                  <ArrowRight
                    size={14}
                    className="text-slate-400 group-hover:text-blue-600 transition-colors"
                  />
                </button>
              ))}

              <button
                type="button"
                onClick={() => setIsCustomMode(true)}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-dashed border-slate-300 dark:border-slate-700 text-left transition-all cursor-pointer mt-3"
              >
                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                  <UserPlus size={16} />
                </div>
                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  Use another @gmail.com account
                </div>
              </button>
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Nikhil"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Google Email (@gmail.com only)
                </label>
                <input
                  type="email"
                  required
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="nikhil@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 cursor-pointer shadow-xs"
                >
                  Continue
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Security footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1">
            <ShieldCheck size={13} className="text-emerald-600" />
            <span>Google Secure OAuth</span>
          </div>
          <span>FACTSETU Auth</span>
        </div>
      </div>
    </div>
  );
};
