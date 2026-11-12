import React from 'react';

export default function CampusLogo({ size = 'md', showText = false, textVariant = 'light', className = '' }) {
  // Dimensions based on size
  const sizeMap = {
    sm: { box: 32, svg: 32, textSize: 'text-xs', subSize: 'text-[9px]' },
    md: { box: 40, svg: 40, textSize: 'text-sm', subSize: 'text-[11px]' },
    lg: { box: 48, svg: 48, textSize: 'text-base', subSize: 'text-xs' },
    xl: { box: 64, svg: 64, textSize: 'text-xl', subSize: 'text-sm' },
  };

  const config = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Official Vector Shield Emblem */}
      <div 
        style={{ width: config.box, height: config.box }} 
        className="relative shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-1 border border-blue-400/40 shadow-lg shadow-blue-900/30 group-hover:border-blue-400 transition-all duration-300"
      >
        <svg 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow"
        >
          <defs>
            <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="50%" stopColor="#1D4ED8" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>

            <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>

            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Exterior Shield Contour */}
          <path 
            d="M50 8 L84 20 C84 56 68 80 50 92 C32 80 16 56 16 20 Z" 
            fill="url(#shieldGrad)" 
            stroke="url(#accentGrad)" 
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Inner Accent Crest Lines */}
          <path 
            d="M50 15 L78 25 C78 54 64 74 50 84 C36 74 22 54 22 25 Z" 
            fill="#0F2537" 
            fillOpacity="0.45"
            stroke="#60A5FA" 
            strokeWidth="1.2" 
            strokeOpacity="0.5" 
          />

          {/* Stylized Campus Gateway / Pillars (Institutional Base) */}
          <path 
            d="M34 68 L34 52 L42 52 L42 68 M46 68 L46 47 L54 47 L54 68 M58 68 L58 52 L66 52 L66 68" 
            stroke="#93C5FD" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeOpacity="0.75"
          />
          <path 
            d="M30 68 L70 68" 
            stroke="#93C5FD" 
            strokeWidth="3" 
            strokeLinecap="round"
          />

          {/* Central Radiant Resolution Checkmark (Primary Action) */}
          <path 
            d="M32 42 L45 56 L72 26" 
            stroke="url(#accentGrad)" 
            strokeWidth="7" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            filter="url(#glow)"
          />

          {/* Institutional Star/Torch Accent at Shield Apex */}
          <circle cx="50" cy="22" r="3" fill="#F8FAFC" />
          <path d="M50 17 L50 27 M45 22 L55 22" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="leading-tight">
          <span className={`font-bold tracking-tight block ${config.textSize} ${textVariant === 'light' ? 'text-white' : 'text-slate-900'}`}>
            CAMPUS COMPLAINT TRACKER
          </span>
          <span className={`font-medium block ${config.subSize} ${textVariant === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
            Grievance &amp; Maintenance Management
          </span>
        </div>
      )}
    </div>
  );
}
