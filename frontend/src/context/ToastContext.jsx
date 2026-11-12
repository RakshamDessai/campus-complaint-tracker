import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message, title = '') => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    const newToast = { id, type, message, title, duration: 4000 };

    setToasts(prev => [...prev, newToast]);

    // Auto-remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, newToast.duration);

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg, title = 'Success') => addToast('success', msg, title),
    info: (msg, title = 'Notice') => addToast('info', msg, title),
    warning: (msg, title = 'Attention') => addToast('warning', msg, title),
    error: (msg, title = 'Error') => addToast('error', msg, title),
  };

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      
      {/* Toast Notification Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.92, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className={`pointer-events-auto rounded-xl p-3.5 shadow-xl border backdrop-blur-md flex items-start gap-3 relative overflow-hidden ${
                t.type === 'success' 
                  ? 'bg-slate-900/95 border-emerald-500/50 text-white' :
                t.type === 'warning' 
                  ? 'bg-slate-900/95 border-amber-500/50 text-white' :
                t.type === 'error' 
                  ? 'bg-slate-900/95 border-rose-500/50 text-white' :
                  'bg-slate-900/95 border-blue-500/50 text-white'
              }`}
            >
              {/* Type Icon */}
              <div className="shrink-0 mt-0.5">
                {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                {t.type === 'error' && <XCircle className="w-5 h-5 text-rose-400" />}
                {t.type === 'info' && <Info className="w-5 h-5 text-blue-400" />}
              </div>

              {/* Text Body */}
              <div className="flex-1 min-w-0 pr-2">
                {t.title && (
                  <h4 className="text-xs font-bold tracking-tight text-white mb-0.5">
                    {t.title}
                  </h4>
                )}
                <p className="text-xs text-slate-300 leading-relaxed break-words">
                  {t.message}
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Bottom Progress Bar Auto-Dismiss Indicator */}
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: t.duration / 1000, ease: 'linear' }}
                className={`absolute bottom-0 left-0 h-1 ${
                  t.type === 'success' ? 'bg-emerald-500' :
                  t.type === 'warning' ? 'bg-amber-500' :
                  t.type === 'error' ? 'bg-rose-500' :
                  'bg-blue-500'
                }`}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Graceful fallback if used outside provider
    return {
      toast: {
        success: (m) => console.log('Toast success:', m),
        info: (m) => console.log('Toast info:', m),
        warning: (m) => console.log('Toast warning:', m),
        error: (m) => console.log('Toast error:', m),
      }
    };
  }
  return context;
}
