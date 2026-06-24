import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from './authStore';
import { apiService } from '../../services/api';
import { toast } from '../../components/Toast';
import { useTranslation } from 'react-i18next';
import { GraduationCap, Lock, Mail, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const { t, i18n } = useTranslation();
  const [emailInput, setEmailInput] = useState('admin@trainingcenter.com'); // default mock/seed helper
  const [passwordInput, setPasswordInput] = useState('Admin123!'); // default helper
  const [isLoading, setIsLoading] = useState(false);
  const isRtl = i18n.language === 'ar';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
      toast.error(t('common.validationError'), t('login.validationEmpty'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.auth.login({
        email: emailInput,
        password: passwordInput,
      });

      if (response.accessToken && response.refreshToken) {
        login(
          response.accessToken,
          response.refreshToken,
          response.email || emailInput,
          response.role || 'Administrator',
          response.expiresAt
        );
        toast.success(t('nav.welcomeBack'), t('nav.signedInSuccess'));
        navigate('/');
      } else {
        toast.error(t('login.failedTitle'), t('login.failedToken'));
      }
    } catch (err: any) {
      console.error(err);
      const serverMessage = err.response?.data?.message || t('login.failedGeneric');
      toast.error(t('login.failedTitle'), serverMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4 transition-colors duration-200">
      <div className="w-full max-w-md space-y-8 p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl relative overflow-hidden">
        {/* Floating Language Switcher for Guest */}
        <div className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} z-10`}>
          <button
            onClick={() => {
              const nextLang = i18n.language === 'en' ? 'ar' : 'en';
              i18n.changeLanguage(nextLang);
            }}
            className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[10px] font-bold font-mono tracking-wider transition-colors cursor-pointer"
            title={i18n.language === 'en' ? 'تغيير اللغة إلى العربية' : 'Switch language to English'}
          >
            {i18n.language === 'en' ? 'العربية' : 'EN'}
          </button>
        </div>

        {/* Decorative subtle background mesh */}
        <div className={`absolute top-0 ${isRtl ? 'left-0 -ml-16' : 'right-0 -mr-16'} -mt-16 w-36 h-36 bg-zinc-100 dark:bg-zinc-800 rounded-full blur-3xl opacity-50`} />
        <div className={`absolute bottom-0 ${isRtl ? 'right-0 -mr-16' : 'left-0 -ml-16'} -mb-16 w-36 h-36 bg-zinc-100 dark:bg-zinc-800 rounded-full blur-3xl opacity-50`} />

        <div className="text-center relative">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-zinc-950 dark:bg-zinc-50 flex items-center justify-center shadow-lg mb-4">
            <GraduationCap className="w-6 h-6 text-white dark:text-zinc-950" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {t('login.signInTitle')}
          </h2>
          <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            {t('login.systemSubtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative">
          {/* Email field */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-2">
              {t('login.emailLabel')}
            </label>
            <div className="relative">
              <span className={`absolute inset-y-0 ${isRtl ? 'right-0 pr-3.5' : 'left-0 pl-3.5'} flex items-center pointer-events-none text-zinc-400`}>
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="admin@trainingcenter.com"
                className={`w-full ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-50 focus:border-transparent transition-all`}
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                {t('login.passwordLabel')}
              </label>
            </div>
            <div className="relative">
              <span className={`absolute inset-y-0 ${isRtl ? 'right-0 pr-3.5' : 'left-0 pl-3.5'} flex items-center pointer-events-none text-zinc-400`}>
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className={`w-full ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-50 focus:border-transparent transition-all`}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 py-3 px-4 rounded-xl text-sm font-semibold text-white dark:text-zinc-950 bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('login.signingInButton')}</span>
              </>
            ) : (
              <>
                <span>{t('login.signInButton')}</span>
                {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-zinc-100 dark:border-zinc-800/60">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
            {t('login.connectedStatus')}
          </span>
        </div>
      </div>
    </div>
  );
}
