import { create } from 'zustand';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
}

interface ToastState {
  toasts: Toast[];
  addToast: (title: string, type: ToastType, message?: string) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (title, type, message) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, title, message, type }],
    }));

    // Auto remove after 4 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

export const toast = {
  success: (title: string, message?: string) => useToastStore.getState().addToast(title, 'success', message),
  error: (title: string, message?: string) => useToastStore.getState().addToast(title, 'error', message),
  info: (title: string, message?: string) => useToastStore.getState().addToast(title, 'info', message),
  warning: (title: string, message?: string) => useToastStore.getState().addToast(title, 'warning', message),
};

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((t) => {
          let Icon = Info;
          let bgColor = 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800';
          let iconColor = 'text-blue-500';

          switch (t.type) {
            case 'success':
              Icon = CheckCircle;
              bgColor = 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50';
              iconColor = 'text-emerald-500';
              break;
            case 'error':
              Icon = AlertCircle;
              bgColor = 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/50';
              iconColor = 'text-rose-500';
              break;
            case 'warning':
              Icon = AlertTriangle;
              bgColor = 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50';
              iconColor = 'text-amber-500';
              break;
          }

          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
              className={`p-4 rounded-xl border shadow-lg flex items-start gap-3 backdrop-blur-sm ${bgColor}`}
            >
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{t.title}</p>
                {t.message && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    {t.message}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
