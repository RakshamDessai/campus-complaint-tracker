import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  XCircle, 
  X, 
  Sparkles, 
  Bell, 
  ShieldCheck, 
  ExternalLink,
  Clock
} from 'lucide-react';

const ToastContext = createContext(null);

// Elegant Web Audio synthesizer for subtle tactile feedback
function playSubtleChime(type) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      // Gentle two-tone positive chime (587.33Hz D5 -> 880Hz A5)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'warning' || type === 'error') {
      // Soft attention tone
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(370, now + 0.15);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else {
      // Subtle pleasant info pop
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  } catch (e) {
    // Audio autoplay restrictions or headless browsers fail silently
  }
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message, options = {}) => {
    // Handle both addToast(type, message, 'Title String') and addToast(type, message, { title, badge, action })
    const config = typeof options === 'string' 
      ? { title: options } 
      : (options || {});

    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    const newToast = {
      id,
      type,
      message,
      title: config.title || (type === 'success' ? 'Action Completed' : type === 'warning' ? 'System Advisory' : type === 'error' ? 'Action Required' : 'Campus Notice'),
      badge: config.badge || (type === 'success' ? 'Success' : type === 'warning' ? 'Attention' : type === 'error' ? 'Notice' : 'Update'),
      action: config.action || null,
      timestamp: config.timestamp || 'Just now',
      duration: config.duration || 4500,
    };

    // Play tactile sound
    playSubtleChime(type);

    setToasts(prev => [newToast, ...prev].slice(0, 5)); // Keep max 5 visible to avoid clutter

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
    success: (msg, opts) => addToast('success', msg, opts),
    info: (msg, opts) => addToast('info', msg, opts),
    warning: (msg, opts) => addToast('warning', msg, opts),
    error: (msg, opts) => addToast('error', msg, opts),
  };

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      
      {/* Toast Notification Stack - Ergonomically positioned at top-right */}
      <div 
        aria-live="polite" 
        className="fixed top-4 sm:top-5 right-4 sm:right-6 z-[9999] flex flex-col gap-3 max-w-sm sm:max-w-md w-full pointer-events-none"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map(t => {
            const isSuccess = t.type === 'success';
            const isWarning = t.type === 'warning';
            const isError = t.type === 'error';

            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.92, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -15, scale: 0.9, filter: 'blur(4px)', transition: { duration: 0.2 } }}
                transition={{ type: 'spring', damping: 24, stiffness: 320 }}
                className="pointer-events-auto group relative w-full bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl shadow-slate-900/10 rounded-2xl p-4 overflow-hidden transition-all duration-200 hover:shadow-slate-900/15"
              >
                {/* Left Vibrant Accent Strip */}
                <div 
                  className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                    isSuccess ? 'bg-gradient-to-b from-emerald-500 to-teal-500' :
                    isWarning ? 'bg-gradient-to-b from-amber-500 to-orange-500' :
                    isError ? 'bg-gradient-to-b from-rose-500 to-red-500' :
                    'bg-gradient-to-b from-blue-500 to-indigo-500'
                  }`}
                />

                <div className="flex items-start gap-3.5 pl-1.5">
                  
                  {/* Glowing Icon Container */}
                  <div className="shrink-0 mt-0.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ring-4 transition-transform group-hover:scale-105 ${
                      isSuccess ? 'bg-emerald-50 text-emerald-600 ring-emerald-500/10' :
                      isWarning ? 'bg-amber-50 text-amber-600 ring-amber-500/10' :
                      isError ? 'bg-rose-50 text-rose-600 ring-rose-500/10' :
                      'bg-blue-50 text-blue-600 ring-blue-500/10'
                    }`}>
                      {isSuccess && <CheckCircle2 className="w-5 h-5 stroke-[2.25]" />}
                      {isWarning && <AlertTriangle className="w-5 h-5 stroke-[2.25]" />}
                      {isError && <XCircle className="w-5 h-5 stroke-[2.25]" />}
                      {!isSuccess && !isWarning && !isError && <Info className="w-5 h-5 stroke-[2.25]" />}
                    </div>
                  </div>

                  {/* Body Text */}
                  <div className="flex-1 min-w-0 pr-1">
                    
                    {/* Top Meta Line: Badge & Timestamp */}
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        isSuccess ? 'bg-emerald-100/70 text-emerald-800' :
                        isWarning ? 'bg-amber-100/70 text-amber-800' :
                        isError ? 'bg-rose-100/70 text-rose-800' :
                        'bg-blue-100/70 text-blue-800'
                      }`}>
                        {isSuccess && <ShieldCheck className="w-2.5 h-2.5" />}
                        {isWarning && <AlertTriangle className="w-2.5 h-2.5" />}
                        {!isSuccess && !isWarning && <Sparkles className="w-2.5 h-2.5" />}
                        {t.badge}
                      </span>

                      <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400 shrink-0">
                        <Clock className="w-3 h-3" />
                        {t.timestamp}
                      </span>
                    </div>

                    {/* Headline Title */}
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight leading-snug">
                      {t.title}
                    </h4>

                    {/* Detail Description */}
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed break-words font-normal">
                      {t.message}
                    </p>

                    {/* Optional Action Button */}
                    {t.action && (
                      <div className="mt-2.5">
                        <button
                          onClick={() => {
                            t.action.onClick?.();
                            removeToast(t.id);
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          {t.action.label}
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Tactile Close Button */}
                  <button
                    onClick={() => removeToast(t.id)}
                    className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Dismiss"
                    aria-label="Dismiss notification"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Subtly Animated Linear Countdown Progress Bar */}
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: t.duration / 1000, ease: 'linear' }}
                  className={`absolute bottom-0 left-0 h-[2.5px] ${
                    isSuccess ? 'bg-emerald-500' :
                    isWarning ? 'bg-amber-500' :
                    isError ? 'bg-rose-500' :
                    'bg-blue-500'
                  }`}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
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
