import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../features/auth/authStore';
import { toast } from './Toast';
import { useTheme } from './ThemeProvider';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  LogOut,
  Menu,
  X,
  User,
  Shield,
  Search,
  Bell,
  Sun,
  Moon
} from 'lucide-react';

interface SidebarItem {
  key: string;
  name: string;
  path: string;
  icon: React.ComponentType<any>;
  roles?: string[];
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { key: 'dashboard', name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { key: 'instructors', name: 'Instructors', path: '/instructors', icon: Users },
  { key: 'students', name: 'Students', path: '/students', icon: GraduationCap },
  { key: 'courses', name: 'Courses', path: '/courses', icon: BookOpen },
  { key: 'enrollments', name: 'Enrollments', path: '/enrollments', icon: ClipboardList },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, role, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const handleLogout = () => {
    logout();
    toast.success(t('nav.signOut'), t('nav.signOut'));
    navigate('/login');
  };

  const getPageTitle = () => {
    const activeItem = SIDEBAR_ITEMS.find((item) => item.path === location.pathname);
    return activeItem ? t(`nav.${activeItem.key}`) : t('common.appName');
  };

  return (
    <div className={`min-h-screen flex bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors duration-200`}>
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 ${
          isRtl ? 'right-0 border-l' : 'left-0 border-r'
        } z-50 w-64 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen ${
          sidebarOpen ? 'translate-x-0' : (isRtl ? 'translate-x-full' : '-translate-x-full')
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 px-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-zinc-50 flex items-center justify-center shadow-md">
              <GraduationCap className="w-5 h-5 text-white dark:text-zinc-950" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-none">EduCenter</h1>
              <span className="text-[10px] font-medium text-zinc-500 tracking-wider uppercase">{t('common.portalVersion')}</span>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <X className="w-4 h-4 text-zinc-500" />
          </button>
        </div>

        {/* Sidebar Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <button
                key={item.key}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-950 shadow-sm font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white dark:text-zinc-950' : 'text-zinc-500 dark:text-zinc-400'}`} />
                <span>{t(`nav.${item.key}`)}</span>
              </button>
            );
          })}
        </nav>

        {/* User Info & Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
          <div className="flex items-center gap-3 p-2 rounded-lg">
            <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate text-zinc-800 dark:text-zinc-200 leading-tight">
                {email || 'admin@trainingcenter.com'}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <Shield className="w-3 h-3 text-zinc-400 shrink-0" />
                <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 truncate uppercase tracking-wider">
                  {role || 'Administrator'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 border border-rose-200/50 dark:border-rose-900/30 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('nav.signOut')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Desktop Header */}
        <header className="h-16 px-6 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="hidden sm:flex items-center gap-2.5 text-xs text-zinc-500 font-medium">
              <span>{t('common.appName')}</span>
              <span className="text-zinc-300 dark:text-zinc-700">/</span>
              <span className="text-zinc-800 dark:text-zinc-200 font-semibold">{getPageTitle()}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick search input */}
            <div className="relative max-w-xs hidden md:block">
              <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-2.5 w-4 h-4 text-zinc-400`} />
              <input
                type="text"
                placeholder={t('common.searchPlaceholder')}
                className={`w-48 xl:w-64 ${isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-50 transition-all`}
              />
            </div>

            {/* Language Switcher */}
            <button
              id="language-switcher"
              onClick={() => {
                const nextLang = i18n.language === 'en' ? 'ar' : 'en';
                i18n.changeLanguage(nextLang);
              }}
              className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold font-mono tracking-wider transition-colors cursor-pointer"
              title={i18n.language === 'en' ? 'تغيير اللغة إلى العربية' : 'Switch language to English'}
            >
              {i18n.language === 'en' ? 'العربية' : 'EN'}
            </button>

            {/* Light/Dark Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors cursor-pointer"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notification placeholder */}
            <button className="relative p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors cursor-pointer">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Children scroll container */}
        <main id="main-content-scroll" className="flex-1 overflow-y-auto p-6 md:p-8 bg-zinc-50/50 dark:bg-zinc-950/20">
          <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
            {children}
          </div>
        </main>

        {/* Global Persistent Sticky Footer */}
        <footer id="app-footer" className="h-12 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-3 px-6 flex items-center justify-between text-xs text-zinc-500 shrink-0 z-10 select-none">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-wider uppercase text-[10px] text-zinc-400">{t('common.appName')} {t('common.portalVersion')}</span>
            <span className="text-zinc-300 dark:text-zinc-700">|</span>
            <span>&copy; {new Date().getFullYear()} {t('common.copyright', { defaultValue: 'EduCenter. All rights reserved.' })}</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {t('common.systemOnline')}
          </div>
        </footer>
      </div>
    </div>
  );
}
